# Kubernetes

> Distilled from: kubernetes-specialist (Jeffallan/claude-skills, MIT), k8s-security-policies (wshobson/agents, MIT), gke-basics (google/skills, Apache-2.0), aws-containers (aws/agent-toolkit-for-aws, Apache-2.0), azure-diagnostics (microsoft/azure-skills, MIT), plus the official Argo CD docs (written in our own words)

Template: `templates/k8s-security-policies/network-policy-template.yaml` (default-deny, allow-DNS, and common allow rules).

## Rules for every workload

Must:
- Declarative YAML in git; `kubectl apply -f`, not imperative `kubectl run/create` for real workloads.
- `resources.requests` and `limits` on every container. Start around `cpu: 100m, memory: 128Mi` requests and `memory: 512Mi` limit, then right-size from `kubectl top`.
- `readinessProbe` (gates traffic) and `livenessProbe` (restarts). Liveness must not depend on downstream services, or one DB blip restarts everything. Add a `startupProbe` for slow starters instead of a huge `initialDelaySeconds`.
- Dedicated `ServiceAccount` per app, with only the RBAC it needs; `automountServiceAccountToken: false` if it doesn't call the API.
- Pod security: `runAsNonRoot: true`, numeric `runAsUser`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, `capabilities.drop: ["ALL"]`, `seccompProfile: RuntimeDefault`.
- Image tags pinned to a version (or digest), never `latest`.
- Secrets from `Secret` objects (ideally synced from a cloud secret manager / sealed secrets), never ConfigMaps or literal env values.
- Namespaces per app/team/env, consistent labels (`app`, `version`, `team`), a `PodDisruptionBudget` for anything with > 1 replica.
- Default-deny NetworkPolicy per namespace, then explicit allows (remember DNS egress to kube-system on UDP/TCP 53).

Must not: run as root without a written reason, use the `default` ServiceAccount for apps, expose ports you don't need, deploy to prod without limits.

## Minimal production Deployment skeleton

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: shop, labels: { app: api, version: "1.4.2" } }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api, version: "1.4.2" } }
    spec:
      serviceAccountName: api
      securityContext: { runAsNonRoot: true, runAsUser: 1001, fsGroup: 1001, seccompProfile: { type: RuntimeDefault } }
      containers:
        - name: api
          image: registry.example.com/shop/api:1.4.2
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits: { memory: 512Mi }
          readinessProbe: { httpGet: { path: /ready, port: 8080 }, periodSeconds: 10 }
          livenessProbe: { httpGet: { path: /healthz, port: 8080 }, initialDelaySeconds: 15, periodSeconds: 20 }
          securityContext: { allowPrivilegeEscalation: false, readOnlyRootFilesystem: true, capabilities: { drop: ["ALL"] } }
          envFrom: [{ secretRef: { name: api-secrets } }]
```

## Pod Security Standards

Label namespaces instead of the removed PodSecurityPolicy:

```yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted   # or baseline / privileged
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

Use `restricted` for app namespaces, `baseline` when a workload genuinely needs it, `privileged` only for system components.

## RBAC

- `Role` + `RoleBinding` (namespaced) by default; `ClusterRole` only for truly cluster-wide needs.
- List exact `resources` and `verbs` (`get`, `list`, `watch`); avoid `*`. Secrets read access is effectively admin for that namespace.
- Audit: `kubectl auth can-i --list --as=system:serviceaccount:<ns>:<sa>`.

## Workload type cheat sheet

| Need | Kind |
|---|---|
| Stateless web/API | Deployment + Service (+ Ingress / Gateway HTTPRoute) |
| Stable identity / per-pod storage (DBs, brokers) | StatefulSet + headless Service + PVC templates |
| One per node (log agents) | DaemonSet |
| Run to completion / scheduled | Job / CronJob (`concurrencyPolicy: Forbid` for non-overlapping) |
| Autoscale | HPA on CPU or custom metric; VPA in recommend mode to size requests |

## Rollout and rollback

```bash
kubectl apply -f k8s/ && kubectl rollout status deployment/api -n shop --timeout=5m
kubectl rollout history deployment/api -n shop
kubectl rollout undo deployment/api -n shop [--to-revision=N]
```

Use `maxUnavailable: 0, maxSurge: 25%` for zero-downtime. Helm: `helm upgrade --install --atomic --wait` rolls back automatically on failure.

## Debugging by symptom

| Symptom | First commands | Usual causes |
|---|---|---|
| `Pending` | `kubectl describe pod` (Events) | Requests exceed node capacity, no matching node selector/taint toleration, unbound PVC, quota |
| `ImagePullBackOff` / `ErrImagePull` | describe pod | Wrong tag, private registry without pull secret / node IAM, arch mismatch |
| `CrashLoopBackOff` | `kubectl logs <pod> --previous` | App error on boot, missing env/secret, wrong command, liveness probe too aggressive |
| `OOMKilled` (exit 137) | `kubectl describe pod`, `kubectl top pod` | Memory limit too low or leak |
| Running but no traffic | `kubectl get endpoints <svc>` | Service selector ≠ pod labels, readiness failing, wrong `targetPort` |
| 502/503 at ingress | `kubectl describe ingress`, controller logs | Backend port mismatch, no ready endpoints, health check path |
| DNS failures | `kubectl exec -it <pod> -- nslookup <svc>` | CoreDNS down, NetworkPolicy blocking port 53 |
| Connection refused between pods | `kubectl get networkpolicy -n <ns>` | Default-deny without an allow rule |

General sequence: `kubectl get pods -o wide` → `describe` → `logs [--previous] [-c container]` → `get events --sort-by=.lastTimestamp` → ephemeral debug container: `kubectl debug -it <pod> --image=busybox --target=<container>` (or `nicolaka/netshoot` for network tools).

## Managed clusters

**GKE**
- Default to Autopilot. Standard only for custom sysctls, custom node taints/hardware pools, or hostPath DaemonSets; state which restriction applies.
- Autopilot CPU requests come in 250m steps (round 300m up to 500m); limits are set equal to requests, so omit `limits`.
- Private cluster flags: `--enable-private-nodes --enable-private-endpoint --enable-master-authorized-networks --master-authorized-networks=CIDR`.
- Always pass `--region` or `--zone` to `gcloud container clusters get-credentials`.
- Use Workload Identity; never mount service-account JSON keys in pods.

**EKS**
- Consider EKS Auto Mode for managed compute; Karpenter for node autoscaling; AWS Load Balancer Controller for ALB/NLB ingress.
- Pods get AWS access through EKS Pod Identity or IRSA, scoped per ServiceAccount.
- Verify current versions and add-on compatibility in AWS docs before upgrades.

**AKS**
- Triage order: cluster reachable (`kubectl` auth) → node health → `kube-system` (CoreDNS, CNI) → workload. Azure resource health and activity log for platform-side issues (see [azure.md](azure.md)).

## GitOps and packaging

### Pick a deploy tool

| Situation | Use | Why |
|---|---|---|
| The cluster already runs Argo CD or Flux, or the team uses one | That one | Two controllers fighting over the same objects undo each other |
| One cluster, small team, CI already deploys | `helm upgrade --install --atomic --wait` from CI (above) | Fewest moving parts; rollback is `helm rollback` or `kubectl rollout undo` |
| Several clusters or environments, want git as the source of truth, drift fixed automatically, a UI showing what runs where | Argo CD (below) | Pulls from git, shows diffs, syncs per app, manual sync for prod |
| Unsure who owns the cluster or whether a GitOps tool is installed | Ask the user (`kubectl get ns argocd flux-system`) | Installing a controller into someone's cluster is their decision |

Helm packages either way: values per env, `helm lint`, `helm template | kubeconform` in CI. Progressive delivery (canary %) via Argo Rollouts or a service mesh, only once basic rollouts are solid.

### Argo CD

Argo CD runs in the cluster, watches git and makes each `Application` match it.

**Install and access** (only with the cluster owner's yes): `kubectl create namespace argocd`, then apply the install manifest from the Argo CD release you pin (read it first; the docs' `stable` URL moves). Get the first admin password with `argocd admin initial-password -n argocd`, change it, then delete the `argocd-initial-admin-secret`. `argocd login <server>` for the CLI. `argocd cluster add <kube-context>` registers another cluster by creating an `argocd-manager` ServiceAccount with admin-level rights in its `kube-system`; name the context and get a yes before running it. Declaratively, clusters are Secrets labelled `argocd.argoproj.io/secret-type: cluster`; keep their tokens out of git.

**Project first.** The `default` project allows any repo, any cluster and every kind. Give each app its own `AppProject`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata: { name: api, namespace: argocd }
spec:
  sourceRepos: [https://github.com/acme/api.git]
  destinations:
    - { server: https://staging-api.example.com, namespace: api }
    - { server: https://prod-api.example.com, namespace: api }
```

`destinations` limits where it can deploy; `clusterResourceWhitelist` (group + kind) lists the cluster-scoped kinds it may create, and `namespaceResourceBlacklist` denies namespaced kinds.

**One Application per environment**, Helm values per env, staging auto, prod manual:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-staging
  namespace: argocd
  finalizers: [resources-finalizer.argocd.argoproj.io]   # deleting the app deletes its resources
spec:
  project: api
  source:
    repoURL: https://github.com/acme/api.git
    targetRevision: main
    path: charts/api
    helm:
      releaseName: api
      valueFiles: [values-staging.yaml]
  destination: { server: https://staging-api.example.com, namespace: api }
  syncPolicy:
    automated: { prune: true, selfHeal: true }
---
# api-prod: same, but targetRevision pinned to a release tag (e.g. v1.4.2),
# valueFiles [values-prod.yaml], the prod server as destination, and NO syncPolicy.automated.
```

Keep these manifests in git (e.g. `apps/`) and apply them with `kubectl apply -n argocd -f apps/`, or let one parent Application manage them (app of apps).

How sync behaves:
- Auto sync tries once per commit SHA plus parameters; a failed sync of the same commit is not retried unless `selfHeal` is on (retried after 5 s by default). The auto-sync interval is `timeout.reconciliation` in the `argocd-cm` ConfigMap: 120 s plus up to 60 s jitter, so up to 3 minutes.
- `prune: true` deletes objects removed from git; `selfHeal: true` reverts hand edits in the cluster.
- Create the `api` namespace beforehand, or add `syncOptions: [CreateNamespace=true]` so Argo CD creates it.
- Values files can live in another repo with multiple `sources` and `ref: values`, referenced as `$values/path/values-prod.yaml` (only at the start of the path).
- Argo CD renders charts with `helm template` and applies them itself, so `helm ls` shows nothing and `helm upgrade` / `helm rollback` must not be used on Argo-managed releases. Helm hooks map to Argo hooks (`pre-install` → `PreSync`, `post-install` → `PostSync`); if the chart has any Argo CD hook, all Helm hooks are ignored.
- Freeze windows: `syncWindows` on the AppProject (`kind: allow|deny`, cron `schedule`, `duration`, `applications`, `manualSync`, `timeZone`).

**Secrets.** Argo CD recommends creating secrets on the destination cluster (External Secrets Operator, Sealed Secrets, Secrets Store CSI Driver, Vault Secrets Operator) over injecting them while rendering manifests, because rendered manifests sit in plaintext in its Redis cache. So the chart references an existing Secret by name; no password in values files, templates or the Application.

**Release to prod** (show the diff and wait for a yes):
1. Before pushing: `helm lint charts/api` and `helm template api charts/api -f charts/api/values-prod.yaml | kubeconform`.
2. Raise `targetRevision` in `apps/api-prod.yaml` to the new tag (PR, review, merge), then apply it (or let the parent app pick it up).
3. `argocd app diff api-prod` (exit code 0 = no diff, 1 = diff, 2 = error) and show it.
4. On yes: `argocd app sync api-prod`, then `argocd app get api-prod` until it reports synced and healthy.

**Roll back prod:**
- Durable: revert the `targetRevision` change in git, apply it, then `argocd app sync api-prod`. Git stays the truth.
- Fast, during an incident: `argocd app history api-prod` (ID, date, revision), then `argocd app rollback api-prod <ID>`. Rollback is refused on apps with automated sync, so it works for prod here, not staging. The app now runs something git doesn't say, so revert git straight after or the next sync redeploys the bad version.
- Either way only the manifests go back: database migrations and data do not.
