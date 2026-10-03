# Credits

This super skill is distilled from the open-source skills below. Text was rewritten and merged in our own words; only the files listed under "copied as-is" were copied verbatim, with each source's license beside them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| azure-deploy | https://github.com/microsoft/azure-skills/tree/main/skills/azure-deploy | MIT | Destructive-action and never-assume-subscription rules, azd environment sequence, pre-deploy checks, ACR pull RBAC propagation, azd/SWA error fixes, https URL reporting |
| azure-diagnostics | https://github.com/microsoft/azure-skills/tree/main/skills/azure-diagnostics | MIT | Diagnosis flow, Container Apps / App Service / Functions symptom tables, KQL starters; copied as-is: `scripts/azure-diagnostics/containerapp-diagnostics.sh`, `appservice-diagnostics.sh` |
| azure-app-onboard | https://github.com/microsoft/azure-skills/tree/main/skills/azure-app-onboard | MIT | Discover → architect → approval gates → scaffold → deploy → handoff flow, 403 scope fallback, RG delete/recreate antipattern, URL-safe secrets |
| cloudflare | https://github.com/cloudflare/skills/tree/main/skills/cloudflare | Apache-2.0 | Need-to-product map, Workers + Static Assets default, caching guidance, working principles |
| wrangler | https://github.com/cloudflare/skills/tree/main/skills/wrangler | Apache-2.0 | Config, environments inheritance, secrets as deployments, Previews, dry-run limits, rollback limits, token scoping |
| workers-best-practices | https://github.com/cloudflare/skills/tree/main/skills/workers-best-practices | Apache-2.0 | Anti-pattern table, compatibility date, nodejs_compat, `wrangler types`, logs + traces flags |
| durable-objects | https://github.com/cloudflare/skills/tree/main/skills/durable-objects | Apache-2.0 | When to use DOs, critical rules, SQLite pattern, alarms, anti-patterns |
| terraform-skill | https://github.com/antonbabenko/terraform-skill/tree/main/skills/terraform-skill | Apache-2.0 | Response contract, failure-mode diagnosis, count vs for_each, version pinning, feature floors, state organisation, safe destroy, testing matrix, CI shape, OIDC trust table, drift detection, LLM-mistake checklists |
| terraform-style-guide | https://github.com/hashicorp/agent-skills/tree/main/plugins/terraform/skills/terraform-style-guide | MPL-2.0 | File organisation, formatting, naming, variable/output contracts, version-control rules, review checklist |
| terraform-test | https://github.com/hashicorp/agent-skills/tree/main/plugins/terraform/skills/terraform-test | MPL-2.0 | Test file naming, run block options, expect_failures, plan vs apply modes |
| cloud-run-basics | https://github.com/google/skills/tree/main/skills/cloud/cloud-run-basics | Apache-2.0 | Services vs jobs vs worker pools, container contract, deploy commands, job flags, failure triage, IAM and networking/cost practices |
| firebase-app-hosting-basics | https://github.com/firebase/agent-skills/tree/main/skills/firebase-app-hosting-basics | Apache-2.0 | Hosting vs App Hosting, firebase.json and apphosting.yaml settings, CPU/memory constraints, secrets |
| gke-basics | https://github.com/google/skills/tree/main/skills/cloud/gke-basics | Apache-2.0 | Autopilot vs Standard rules, 250m CPU steps, private cluster flags, credentials gotcha |
| github-actions-templates | https://github.com/wshobson/agents/tree/main/plugins/cicd-automation/skills/github-actions-templates | MIT | Workflow patterns (test, build/push image, matrix, reusable workflows, security scan, approvals) and best practices |
| ci-cd-and-automation | https://github.com/addyosmani/agent-skills/tree/main/skills/ci-cd-and-automation | MIT | Quality-gate pipeline, deployment strategies, feature flags, environment/secret management, CI speed ladder, verification checklist |
| kubernetes-specialist | https://github.com/Jeffallan/claude-skills/tree/main/skills/kubernetes-specialist | MIT | Must/must-not rules, Deployment/RBAC/NetworkPolicy patterns, validation and troubleshooting commands |
| k8s-security-policies | https://github.com/wshobson/agents/tree/main/plugins/kubernetes-operations/skills/k8s-security-policies | MIT | Pod Security Standards labels, network policy and RBAC patterns; copied as-is: `templates/k8s-security-policies/network-policy-template.yaml` |
| docker-patterns | https://github.com/affaan-m/ECC/tree/main/skills/docker-patterns | MIT | Compose dev stack, override files, networks, volumes, compose hardening, debugging commands, anti-patterns |
| docker-build-strategies | https://github.com/docker/skills/tree/main/skills/docker-build-strategies | Apache-2.0 | Multi-stage, cache mounts, build secrets/SSH, non-root, .dockerignore, size rules; copied as-is: `scripts/docker-build-strategies/verify-build.sh`, `templates/docker-build-strategies/Dockerfile.{go,nodejs,python}`, `dockerignore-example` |
| grafana-dashboards | https://github.com/wshobson/agents/tree/main/plugins/observability-monitoring/skills/grafana-dashboards | MIT | Information hierarchy, RED/USE, dashboard best practices |
| opentelemetry | https://github.com/grafana/skills/tree/main/skills/grafana-core/opentelemetry | Apache-2.0 | OTLP env vars, auto-instrumentation per language, Operator injection, head vs tail sampling, troubleshooting |
| aws-iam | https://github.com/aws/agent-toolkit-for-aws/tree/main/skills/core-skills/aws-iam | Apache-2.0 | Role identification, trust/permission policy rules, verified IAM edge cases |
| aws-containers | https://github.com/aws/agent-toolkit-for-aws/tree/main/skills/core-skills/aws-containers | Apache-2.0 | ECS/EKS/ECR/Beanstalk scope, App Runner sunset, Action Logs recommendation |
| aws-lambda | https://github.com/awslabs/agent-plugins/tree/main/plugins/aws-serverless/skills/aws-lambda | Apache-2.0 | Limits table, idempotency/security rules, right-sizing and cold starts, async/throttling facts, troubleshooting tables |
| aws-cdk-development | https://github.com/zxkane/aws-skills/tree/main/plugins/aws-iac/skills/aws-cdk-development | MIT | No explicit resource names, account-per-env, NodejsFunction/PythonFunction, cdk-nag validation layers, workflow |

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| deploy-to-vercel | https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel | No LICENSE file in the repo (link-only); mentioned by name only |
