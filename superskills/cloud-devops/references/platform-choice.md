# Choosing where to host

> Distilled from: cloudflare (cloudflare/skills, Apache-2.0), cloud-run-basics and gke-basics (google/skills, Apache-2.0), firebase-app-hosting-basics (firebase/agent-skills, Apache-2.0), aws-lambda (awslabs/agent-plugins, Apache-2.0), aws-containers (aws/agent-toolkit-for-aws, Apache-2.0), azure-app-onboard (microsoft/azure-skills, MIT), docker-patterns (affaan-m/ECC, MIT)

Pick the simplest platform that meets the requirement. Each step up the list adds operations work you have to own.

## 1. Start from the workload, not the vendor

Answer these first (ask the user if unknown):

| Question | Why it matters |
|---|---|
| Static files only, SPA, or server-rendered (SSR/ISR)? | Static = CDN host; SSR needs a runtime |
| HTTP requests, background jobs, scheduled tasks, or long-running consumers? | Decides service vs job vs worker |
| Request duration? (< 30 s, < 15 min, hours) | Functions cap out (Lambda 15 min) |
| Needs a full Linux container, native binaries, GPUs? | Rules out edge isolates |
| Shared state / coordination (chat rooms, bookings, games)? | Needs a stateful primitive (Durable Objects, a DB) |
| Existing cloud, account, credits, compliance region? | Respect the existing stack |
| Traffic pattern: spiky / idle most of the day / steady? | Scale-to-zero vs always-on cost |
| Team size and who is on call? | Kubernetes needs someone who owns it |

## 2. Decision table

| Need | Good default | Alternatives |
|---|---|---|
| Static site or SPA | Cloudflare Workers + Static Assets, Vercel, Netlify, Firebase Hosting | S3 + CloudFront, Azure Static Web Apps |
| Next.js / Angular with SSR | Vercel, Firebase App Hosting (Blaze plan), Cloudflare (vinext/OpenNext) | Cloud Run container, Azure Container Apps |
| Small HTTP API / webhook | Cloudflare Workers, Lambda + API Gateway, Cloud Run | Azure Functions |
| Any container that serves HTTP | Cloud Run, Azure Container Apps, ECS on Fargate (ECS Express Mode) | App Service, Beanstalk |
| Batch / cron / run-to-completion | Cloud Run jobs, ECS scheduled tasks, Lambda + EventBridge, Workers Cron Triggers | k8s CronJob |
| Queue consumer always on | Cloud Run worker pools, ECS service, Lambda event source mapping (SQS/Kafka) | k8s Deployment |
| Many services, custom networking, platform team exists | GKE Autopilot, EKS (Auto Mode), AKS | Nomad |
| Stateful coordination per entity | Cloudflare Durable Objects | Redis + app logic, actors |
| Local multi-service dev | Docker Compose | — (don't run Compose as prod orchestration) |

Notes:
- AWS App Runner is closed to new customers (sunset 30 Apr 2026); use ECS Express Mode instead.
- Cloudflare recommends Workers + Static Assets for all new sites; keep existing Pages projects unless asked to migrate.
- GKE: default to **Autopilot**; choose Standard only for custom `sysctl`, custom node taints / special hardware pools, or DaemonSets needing `hostPath`.
- Firebase: **Hosting** for static/SPA, **App Hosting** for SSR frameworks with git-push deploys (needs the Blaze plan).

## 3. Cost sanity checks

- Scale-to-zero platforms (Cloud Run, Lambda, Workers, Container Apps with `min-replicas=0`) cost almost nothing idle but have cold starts. Set min instances = 1 only for latency-sensitive user paths.
- Co-locate compute with the database and buckets: same-region traffic is usually free; cross-region egress is not.
- Put a CDN in front of static and cacheable content; edge serving is cheaper than origin egress.
- Lambda on arm64 is ~20% cheaper per GB-second; Lambda CPU scales with memory (1 vCPU at 1,769 MB).
- Kubernetes has a floor cost (control plane + nodes) even with zero traffic.
- Before provisioning anything paid, state the expected monthly cost range and get a yes.

## 4. Safety rules for any first deploy

1. Confirm account/subscription, project and region with the user. Show the actual name and ID.
2. Check whether the target resource group / project / stack already exists before creating one with the same name.
3. Prefer a non-prod environment first; promote to prod after verification.
4. Keep secrets in the platform's secret store from day one.
5. After deploy: hit the health endpoint, read the last 50 log lines, open the URL. Report the full `https://` URL.
6. Write down how to roll back and how to tear down (and ask before tearing down).

## 5. Vercel (quick notes)

Vercel's own agent skill is link-only here (no license file). General practice: `vercel` for a preview deploy, `vercel --prod` for production, `vercel rollback` to revert, env vars via `vercel env`, and token auth via `VERCEL_TOKEN` in CI secrets. Check the current Vercel CLI docs for flags.
