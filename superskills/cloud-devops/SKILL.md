---
name: cloud-devops
description: Deploy, run and operate apps in the cloud. Covers choosing a host, Dockerfiles and Compose, Kubernetes manifests and debugging (GKE/EKS), Terraform/OpenTofu (style, state, modules, tests, safe destroy), GitHub Actions CI/CD (quality gates, OIDC, previews, rollbacks), Cloudflare Workers/Wrangler/Durable Objects, Google Cloud Run (incl. Next.js behind Firebase Hosting) and Firebase App Hosting, AWS (IAM, Lambda, ECS/EKS/ECR, CDK), Azure (azd, Container Apps/App Service diagnostics, KQL), and observability (OpenTelemetry, Grafana, RED/USE, alerts). Use when asked to deploy or ship an app, "put this live", write a Dockerfile or compose.yaml, shrink or harden an image, write k8s YAML or debug CrashLoopBackOff/Pending pods, write or review Terraform, set up a GitHub Actions pipeline, configure wrangler.jsonc, deploy to Cloud Run, fix gcloud "No module named grpc", write an IAM policy, build a Lambda, run azd up, add OpenTelemetry, build a Grafana dashboard, or debug a production outage.
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

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "API to AWS with Terraform and CI: `references/platform-choice.md` → `references/docker.md` → `references/terraform.md` → `references/aws.md` → `references/ci-cd.md`; database cutover from `backend-databases` → `references/postgres-schema.md`; secrets from `security` → `references/secrets.md`, `references/github-actions.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Choose where to host (static, SSR, API, container, function, k8s) and estimate cost | [references/platform-choice.md](references/platform-choice.md) |
| Write or review a Dockerfile, shrink or harden an image, compose.yaml for local dev | [references/docker.md](references/docker.md); templates in `templates/docker-build-strategies/`; verify with `scripts/docker-build-strategies/verify-build.sh` |
| Kubernetes manifests, RBAC, NetworkPolicy, Helm, debugging pods; GKE Autopilot / EKS notes | [references/kubernetes.md](references/kubernetes.md); `templates/k8s-security-policies/network-policy-template.yaml` |
| Terraform/OpenTofu: style, modules, state, `moved`/`import`, tests, safe destroy | [references/terraform.md](references/terraform.md) |
| CI/CD: GitHub Actions workflows, quality gates, OIDC to clouds, previews, rollbacks, Dependabot | [references/ci-cd.md](references/ci-cd.md) |
| Cloudflare: product choice, Workers, Wrangler, bindings, secrets, Durable Objects | [references/cloudflare.md](references/cloudflare.md) |
| Google Cloud: Cloud Run services/jobs/worker pools; Next.js on Cloud Run behind Firebase Hosting (custom domain, 60 s limit, keyless GitHub deploys, stale-bundle checks); Firebase App Hosting; GKE basics; gcloud "No module named grpc" | [references/gcp.md](references/gcp.md) |
| AWS: IAM policies and roles, Lambda/serverless, ECS/EKS/ECR, CDK | [references/aws.md](references/aws.md) |
| Azure: azd deploy flow, Container Apps / App Service / Functions diagnostics, KQL | [references/azure.md](references/azure.md); collectors in `scripts/azure-diagnostics/` |
| Logs, metrics, traces, OpenTelemetry, Grafana dashboards, alerts, incident triage | [references/observability.md](references/observability.md) |

Call a sub-capability by naming the task, or say "use cloud-devops: terraform", "use cloud-devops: kubernetes", etc.

## Other crafts

| When the request also needs | Use |
|---|---|
| Workflow hardening, secret scanning, dependency and supply-chain checks | `security` → `references/github-actions.md`, `references/secrets.md`, `references/supply-chain.md` |
| The database behind the deploy: migrations, pooled vs direct URLs, slow queries | `backend-databases` → `references/postgres-schema.md`, `references/query-performance.md`, `references/neon.md` |
| A website on Vercel or Netlify, or its Core Web Vitals after the deploy | `website-building` → `references/deploy-vercel.md`, `references/deploy-netlify-cloudflare.md`, `references/performance-cwv.md` |
| The tests CI runs: what to test where, Playwright in CI, flaky failures | `testing-qa` → `references/test-strategy.md`, `references/playwright-e2e.md`, `references/flaky-tests.md` |
| Root cause in the app's own code once an incident is mitigated | `coding-practices` → `references/debugging.md` |
| Mobile builds and store releases (EAS, TestFlight, Play tracks) | `app-building` → `references/release-app-stores.md` |
| Hosting an MCP server: transport, auth and deployment model | `ai-agents` → `references/mcp-servers.md` |
| Serving an open-weight model on GPUs: vLLM, SGLang, RunPod or Modal | `open-models` → `references/serving-endpoints.md`, `references/gpu-hosting-runpod-modal.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Bringing a whole app to Azure: service detection, IaC scaffold, cost estimate, approval gates | [azure-app-onboard](https://github.com/microsoft/azure-skills/tree/main/skills/azure-app-onboard) (MIT; needs azd and an Azure subscription) |
| Choosing among Cloudflare's KV, D1, R2, AI, networking and security products, with routes to their docs | [cloudflare](https://github.com/cloudflare/skills/tree/main/skills/cloudflare) (Apache-2.0) |
| Native Terraform tests (.tftest.hcl) with provider mocking and module tests | [terraform-test](https://github.com/hashicorp/agent-skills/tree/main/plugins/terraform/skills/terraform-test) (MPL-2.0) |
| EKS with Karpenter and the AWS Load Balancer Controller, plus ECS, Fargate and ECR | [aws-containers](https://github.com/aws/agent-toolkit-for-aws/tree/main/skills/core-skills/aws-containers) (Apache-2.0) |
| Lambda event sources with API Gateway, EventBridge and Step Functions | [aws-lambda](https://github.com/awslabs/agent-plugins/tree/main/plugins/aws-serverless/skills/aws-lambda) (Apache-2.0; needs SAM or CDK tooling) |
| OpenTelemetry per language, shipped to Grafana Cloud or self-hosted Mimir, Loki and Tempo | [opentelemetry](https://github.com/grafana/skills/tree/main/skills/grafana-core/opentelemetry) (Apache-2.0) |
| Ready-made GitHub Actions workflows: matrix builds, reusable workflows, deploys | [github-actions-templates](https://github.com/wshobson/agents/tree/main/plugins/cicd-automation/skills/github-actions-templates) (MIT) |

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
