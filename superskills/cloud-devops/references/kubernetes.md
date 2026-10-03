# Kubernetes

> Distilled from: kubernetes-specialist (Jeffallan/claude-skills, MIT), k8s-security-policies (wshobson/agents, MIT), gke-basics (google/skills, Apache-2.0), aws-containers (aws/agent-toolkit-for-aws, Apache-2.0), azure-diagnostics (microsoft/azure-skills, MIT)

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

## GitOps and packaging (brief)

- Helm for packaging: values per env, `helm lint`, `helm template | kubeconform` in CI.
- Argo CD or Flux for pull-based deploys; secrets via Sealed Secrets / External Secrets Operator.
- Progressive delivery (canary %) via Argo Rollouts or a service mesh, only once basic rollouts are solid.
