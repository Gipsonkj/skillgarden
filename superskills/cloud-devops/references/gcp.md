# Google Cloud: Cloud Run, Next.js behind Firebase Hosting, Firebase App Hosting, GKE

> Distilled from: cloud-run-basics and gke-basics (google/skills, Apache-2.0), firebase-app-hosting-basics (firebase/agent-skills, Apache-2.0), gcloud-app-deploy (Gipsonkj/skillgarden, MIT)

Add `--quiet` to gcloud commands run by an agent (no interactive prompts), and always pass `--region` (or set `gcloud config set run/region REGION`). Confirm the project with `gcloud config get-value project` before deploying.

**gcloud fails with `No module named grpc`, or seems to hang** (seen on macOS on `run` and IAM commands): `export CLOUDSDK_PYTHON_SITEPACKAGES=1` in the same shell first. The install isn't broken; don't reinstall gcloud.

## Cloud Run: which resource?

| Workload | Resource |
|---|---|
| HTTP requests / events, autoscaling, HTTPS URL | **Service** |
| Run to completion, manual or scheduled, parallel tasks | **Job** |
| Always-on pull consumers (Pub/Sub pull, Kafka, RabbitMQ), no HTTP | **Worker pool** |

Each service deploy creates an immutable **revision**; traffic can be split between revisions.

## Prerequisites

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --quiet
```

Deployer roles: `roles/run.admin` (or `run.developer`), `roles/run.sourceDeveloper` for source deploys, `roles/iam.serviceAccountUser` on the runtime service account, `roles/logging.viewer`. The Cloud Build service account needs `roles/run.builder` for source builds.

## Container contract (most common failure)

- Listen on `0.0.0.0` and the `$PORT` env var (default 8080). `127.0.0.1` = crash on boot / failed health check.
- Linux x86_64 binaries; multi-arch manifests must include `linux/amd64`. Build with `--platform linux/amd64` on Apple Silicon.
- Stateless: local disk is in-memory and per instance. Use Cloud Storage/Cloud SQL/Firestore for state.

## Deploy

```bash
# From an image (Artifact Registry recommended: LOCATION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG)
gcloud run deploy api --image europe-west1-docker.pkg.dev/my-proj/apps/api:1a2b3c \
  --region europe-west1 --service-account api-sa@my-proj.iam.gserviceaccount.com \
  --no-allow-unauthenticated --quiet

# From source (Dockerfile if present, otherwise buildpacks via Cloud Build)
gcloud run deploy api --source . --region europe-west1 --quiet
```

- Public endpoint: `--allow-unauthenticated`. Ask before making something public; org policies may block it (then test with an identity token: `curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" URL`).
- Docker Hub images are cached up to 1 hour; prefer Artifact Registry (remote repos can proxy Docker Hub/GHCR).
- Secrets: `--set-secrets=API_KEY=api-key:latest` from Secret Manager (grant the runtime SA `roles/secretmanager.secretAccessor`). Plain config: `--set-env-vars`.
- Useful flags: `--min-instances 1` (no cold start on user paths), `--max-instances N` (cost cap), `--concurrency 80`, `--cpu 1 --memory 512Mi`, `--timeout 300`, `--ingress internal|internal-and-cloud-load-balancing|all`.

## Jobs and worker pools

```bash
gcloud run jobs deploy nightly-export --image IMAGE --tasks 10 --parallelism 5 \
  --max-retries 3 --task-timeout 30m --region REGION --quiet
gcloud run jobs execute nightly-export --wait --region REGION --quiet
gcloud run worker-pools deploy consumer --image IMAGE --instances 2 --region REGION --quiet
```

Job tasks get `CLOUD_RUN_TASK_INDEX` (0..n-1) and `CLOUD_RUN_TASK_COUNT` to shard work. Defaults: 1 task, 3 retries (max 10), 10 min timeout (max 168 h; 1 h with GPU). Schedule with Cloud Scheduler.

## Traffic, rollback, logs

```bash
gcloud run deploy api --image NEW --no-traffic --tag canary --quiet      # deploy dark, get a tagged URL
gcloud run services update-traffic api --to-tags canary=10 --quiet       # 10% canary
gcloud run services update-traffic api --to-revisions api-00041-abc=100 --quiet   # roll back
gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=api' --limit 50 --quiet
gcloud run services describe api --region REGION
```

## When a deploy fails

1. Permission error → check the roles above, and that the deployer can `actAs` the runtime SA.
2. Container failed to start / health check → read logs immediately (`gcloud logging read ... --limit=20`); usually wrong port/bind, missing env var or secret access.
3. Native dependency errors with `--no-build` → use `--source .` (buildpacks compile for Linux).
4. Image pull errors → wrong Artifact Registry path or the repo is in another project without reader access.

## Security and cost

- One user-managed service account per service with minimal roles. Don't run as the Compute Engine default SA (it may hold Editor).
- `--ingress internal-and-cloud-load-balancing` + IAP/load balancer for internal apps; Binary Authorization for trusted images.
- Co-locate with Cloud SQL/buckets in the same region (same-region transfer is free). Prefer Direct VPC egress over Serverless VPC Access connectors (scales to zero, no idle cost). Cloud CDN in front for static content.
- Reuse connections / pool DB connections to avoid port exhaustion; use the 2nd-gen execution environment for network-heavy work.

## Terraform

Use `google_cloud_run_v2_service` / `google_cloud_run_v2_job` with an explicit `service_account`, `google_cloud_run_v2_service_iam_member` for `roles/run.invoker`, and secrets via `value_source.secret_key_ref`. Remote state in a `gcs` backend. See [terraform.md](terraform.md).

## Next.js on Cloud Run behind Firebase Hosting (custom domain, keyless CI)

A proven shape when Firestore, Auth and Storage already live in a Firebase project: Next.js → Docker image → Cloud Run → Firebase Hosting in front for the CDN and the custom domain via a rewrite. (Firebase App Hosting, below, is the managed alternative.)

1. **App config.** `output: 'standalone'` in `next.config.mjs`; start with `node server.js` (the standalone server) on `$PORT`. The `NEXT_PUBLIC_*` Firebase web config goes in a committed `.env.production` (it's public by design). Every secret stays in Cloud Run runtime env or Secret Manager, never in the repo.
2. **Dockerfile**, two stages on `node:20-alpine`: builder runs `npm ci` and `npm run build`; the runner copies `public/`, `.next/standalone` and `.next/static`, runs as a non-root user, `ENV PORT=8080`, `EXPOSE 8080`. **Trap:** never declare empty `ARG`/`ENV NEXT_PUBLIC_*` in the Dockerfile; an empty env value beats `.env.production` and blanks the client config.
3. **Deploy:**
   ```bash
   export CLOUDSDK_PYTHON_SITEPACKAGES=1
   gcloud run deploy web --source . --region REGION --no-allow-unauthenticated \
     --min-instances=0 --max-instances=2 --memory=1Gi --cpu=1 --quiet
   ```
   `--allow-unauthenticated` only after the owner confirms the site is public (Hosting's rewrite needs the service to be invocable). `--min-instances=1` costs money around the clock: ask first. A code-only redeploy keeps the runtime env vars and service account.
4. **Hosting in front.** `firebase.json`:
   ```json
   { "hosting": { "public": "public",
       "rewrites": [{ "source": "**", "run": { "serviceId": "web", "region": "REGION" } }] } }
   ```
   `firebase deploy --only hosting` (and `--only firestore:rules,storage:rules` for rules). Custom domain: the user adds it in Firebase console → Hosting and sets the DNS records it shows. Then update `NEXT_PUBLIC_SITE_URL` in `.env.production` and redeploy so canonicals, sitemap and OG tags use the real domain.
5. **The 60-second trap.** Firebase Hosting returns 502 for any request slower than 60 s. Call slow endpoints (AI generation, big imports) on the service's direct `*.run.app` URL, kept as a client config value such as `longRunUrl`.
6. **Keyless CI/CD.** GitHub Actions on push to `main` → Workload Identity Federation (a pool and provider, attribute condition pinned to the repo and branch) impersonates a deployer service account → build → Artifact Registry (`cloud-run-source-deploy` repo in the region) → deploy. The deployer needs `roles/run.admin`, Artifact Registry writer and `roles/iam.serviceAccountUser` on the runtime SA. No JSON keys anywhere (see [ci-cd.md](ci-cd.md)).
7. **Env vars.** Runtime secrets/config: `gcloud run services update web --region REGION --set-env-vars KEY=value` (or `--set-secrets`), no rebuild. `NEXT_PUBLIC_*` values are baked at build time: edit `.env.production`, rebuild, redeploy.
8. **Buckets.** Two, always: a public one for listing media (`allUsers:objectViewer` also lets anyone *list* the bucket) and a private one for documents. Never put documents in the public bucket.
9. **Quota.** Regional Cloud Run CPU and memory quota can be small on a new project (one project was capped near 20 vCPU / 40 GiB per region across all services). Keep services small; a heavy render service at most 4 vCPU / 8 Gi with `max-instances=1`.

Debugging:
- "Fix not visible on the live site": `curl -s https://<domain>/ | grep <marker>` on the served HTML and its JS chunks before touching code again. A stale CDN shell looks exactly like a broken fix.
- Logs: `gcloud run services logs read web --region REGION --limit 50`.
- Batch the work: finish the features locally, then one production deploy, not one per change.
- Local scripts against Firestore: `gcloud auth application-default login` (the user runs it).

## Firebase App Hosting (SSR Next.js / Angular)

- Requires the **Blaze** (pay-as-you-go) plan. Static sites and plain SPAs belong on classic Firebase Hosting instead.
- `firebase.json`: `{"apphosting": {"backendId": "my-app", "rootDir": "/", "ignore": ["node_modules", ".git", "functions"]}}`.
- `apphosting.yaml` in the app root:

```yaml
runConfig:
  cpu: 1
  memoryMiB: 512        # 128–32768
  minInstances: 0       # >= 1 to avoid cold starts
  maxInstances: 100
  concurrency: 80       # must be 1 if cpu < 1
env:
  - variable: NEXT_PUBLIC_API_URL
    value: https://api.example.com
    availability: [BUILD, RUNTIME]
  - variable: API_KEY
    secret: apiKeySecret          # Secret Manager
```

- Memory > 4 GiB needs ≥ 2 vCPU; > 8 GiB needs ≥ 4 vCPU.
- Secrets: `npx -y firebase-tools@latest apphosting:secrets:set NAME` (grants backend access).
- Deploy: `npx -y firebase-tools@latest deploy`. Git-push deploys via a GitHub-connected backend are optional.
- Test locally with the Firebase Local Emulator Suite.

## GKE

See [kubernetes.md](kubernetes.md) → "Managed clusters → GKE" (Autopilot by default, 250m CPU steps, private cluster flags, Workload Identity, explicit `--region` on `get-credentials`).
