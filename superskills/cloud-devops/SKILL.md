---
name: cloud-devops
description: Deploy, run and operate apps in the cloud. Covers choosing a host, Dockerfiles and Compose, Kubernetes manifests and debugging (incl. GKE/EKS), Terraform/OpenTofu (style, state, modules, tests, safe apply/destroy), CI/CD with GitHub Actions (quality gates, OIDC, previews, rollbacks), Cloudflare Workers/Wrangler/Durable Objects, Google Cloud Run/Firebase App Hosting, AWS (IAM policies and roles, Lambda, ECS/EKS/ECR, CDK), Azure (azd deploy, Container Apps/App Service diagnostics, KQL), and observability (OpenTelemetry, Grafana dashboards, RED/USE, alerts). Use when asked to deploy or ship an app, "put this live", write a Dockerfile or compose.yaml, shrink or harden an image, write k8s YAML or debug CrashLoopBackOff/Pending pods, write or review Terraform, set up a CI pipeline or GitHub Actions workflow, configure wrangler.jsonc, deploy to Cloud Run, write an IAM policy, build a Lambda, run azd up, instrument with OpenTelemetry, build a Grafana dashboard, or debug a production outage.
---

# Cloud and DevOps

Getting code from a repo to a running, observable, reversible deployment. This skill covers picking the platform, packaging (containers), describing infrastructure (Terraform, CDK, Kubernetes YAML), automating delivery (CI/CD), and keeping it healthy (logs, metrics, traces, diagnosis). Vendor-specific depth lives in its own reference file; the rules below hold everywhere.

## Core principles

1. **Confirm the target before you touch it.** Name the account/subscription/project, region, environment and resource out loud before any command that changes cloud state. Never assume a subscription or region (Azure, AWS and GCP guides all agree).
2. **Destructive or costly actions need explicit consent, one at a time.** Deletes, `destroy`, `azd down`, purges, RBAC changes and big scale-ups get a separate yes from the user. "Deploy" never implies "delete the old one".
3. **Plan, review, then apply the reviewed plan.** `terraform plan -out=tfplan` then `apply tfplan`; `cdk synth`/`diff` before `deploy`; `wrangler deploy --dry-run` before deploy. Never re-plan inside the apply job, never `-auto-approve` a destroy.
4. **No secrets in code, images, config or logs.** Use the platform's secret store (Secret Manager, Key Vault, AWS Secrets Manager/SSM, `wrangler secret`, GitHub Secrets). Not `ENV`/`ARG`, not `.tfvars`, not compose files. `sensitive = true` in Terraform only hides output; the value is still in state.
5. **Keyless CI.** CI authenticates to clouds with OIDC / workload identity federation, `sub` pinned to one repo + branch or environment. Static cloud keys only when OIDC is impossible.
6. **Least privilege everywhere.** Dedicated service account / execution role per workload, scoped to specific resource ARNs. Never `Action: "*"` with `Resource: "*"`; never the default compute service account or default k8s ServiceAccount for apps.
7. **Pin versions.** Base images by tag or digest (never `latest` in prod), Terraform runtime `~> 1.x`, providers `~> major`, prod modules exact, GitHub Actions `@v4` (or SHA). Commit lock files (`.terraform.lock.hcl`, package locks).
8. **Containers: small, non-root, listen on `0.0.0.0:$PORT`.** Multi-stage builds, `.dockerignore`, numeric non-root UID, health endpoint. Wrong bind address or port is the #1 cause of "deployed but 502".
9. **Every deploy is reversible.** Know the rollback command before you ship (`kubectl rollout undo`, Cloud Run traffic split, Workers versions rollback, `vercel rollback`, previous image tag). Code rollback does not roll back data or migrations.
10. **Small, frequent releases behind gates.** Lint, types, tests, build, security scan on every PR; staging before prod; manual approval on the production environment.
11. **Observability before launch.** Structured JSON logs, `service.name` and `deployment.environment` on every signal, RED metrics for services, an alert on error rate and latency. If you can't see it, you can't debug it.
12. **Diagnose before you change.** Symptoms, platform health, logs, metrics, recent changes, in that order. Gather evidence once; don't fire random fixes.
13. **Prefer retrieval over memory for vendor details.** Limits, flags, prices, CLI syntax and compatibility dates change. Check the project's installed tool version and current docs; say when you couldn't verify.
14. **Report deploys as full `https://` URLs**, with the target environment and the checks you actually ran.

Conflict resolved: Terraform naming. HashiCorp's guide allows `main` for a lone resource; terraform-skill prefers descriptive names and reserves `this` for true singletons. Rule here: descriptive name first, `main` only when there is exactly one and no better noun.

## Pick the right guide

| Task | Read |
|---|---|
| Choose where to host (static, SSR, API, container, function, k8s) and estimate cost | [references/platform-choice.md](references/platform-choice.md) |
| Write or review a Dockerfile, shrink or harden an image, compose.yaml for local dev | [references/docker.md](references/docker.md); templates in `templates/docker-build-strategies/`; verify with `scripts/docker-build-strategies/verify-build.sh` |
| Kubernetes manifests, RBAC, NetworkPolicy, Helm, debugging pods; GKE Autopilot / EKS notes | [references/kubernetes.md](references/kubernetes.md); `templates/k8s-security-policies/network-policy-template.yaml` |
| Terraform/OpenTofu: style, modules, state, `moved`/`import`, tests, safe destroy | [references/terraform.md](references/terraform.md) |
| CI/CD: GitHub Actions workflows, quality gates, OIDC to clouds, previews, rollbacks, Dependabot | [references/ci-cd.md](references/ci-cd.md) |
| Cloudflare: product choice, Workers, Wrangler, bindings, secrets, Durable Objects | [references/cloudflare.md](references/cloudflare.md) |
| Google Cloud: Cloud Run services/jobs/worker pools, Firebase App Hosting, GKE basics | [references/gcp.md](references/gcp.md) |
| AWS: IAM policies and roles, Lambda/serverless, ECS/EKS/ECR, CDK | [references/aws.md](references/aws.md) |
| Azure: azd deploy flow, Container Apps / App Service / Functions diagnostics, KQL | [references/azure.md](references/azure.md); collectors in `scripts/azure-diagnostics/` |
| Logs, metrics, traces, OpenTelemetry, Grafana dashboards, alerts, incident triage | [references/observability.md](references/observability.md) |

Call a sub-capability by naming the task, or say "use cloud-devops: terraform", "use cloud-devops: kubernetes", etc.

## Default workflow

1. **Inspect** the repo: language, framework, existing Dockerfile/IaC/CI, pinned tool versions (`wrangler`, `terraform`, `cdk`), lock files, current deploy target.
2. **Clarify** the target: provider, account/project/subscription, region, environment (dev/staging/prod), budget, and who approves prod. Ask if missing; don't guess.
3. **Choose** the platform and shape using [platform-choice.md](references/platform-choice.md). Keep the user's existing stack unless there's a concrete reason.
4. **Package**: Dockerfile + `.dockerignore` (or the platform's native build). Build locally and check size and user.
5. **Describe infra as code** (Terraform, CDK, wrangler.jsonc, apphosting.yaml, k8s YAML). Secrets via secret store. Run format/validate/lint/security scan.
6. **Plan / dry-run** and show the user what will be created, changed and destroyed. Get approval for anything destructive or costly.
7. **Deploy** through CI where it exists; otherwise the platform CLI with explicit `--region`/`--env`.
8. **Verify**: health endpoint returns 200, logs clean, key user path works, metrics flowing. Report URLs with `https://`.
9. **Leave a rollback note and observability**: rollback command, where logs/dashboards live, what alerts exist.

## Done means

- [ ] Target account/region/environment stated and confirmed; no destructive step ran without a yes
- [ ] Image builds, runs as non-root, binds `0.0.0.0:$PORT`, has a health check; no secrets in layers
- [ ] IaC formatted and validated; versions pinned; lock files committed; plan reviewed before apply
- [ ] CI runs lint, types, tests, build and a security scan on PRs; prod deploy behind an approval; cloud auth via OIDC
- [ ] Least-privilege identity for the workload; secrets in a secret manager
- [ ] Deployed URL(s) reported as `https://...`, health verified, rollback command written down
- [ ] Logs, metrics (RED) and at least error-rate and latency alerts in place, or the gap stated plainly
