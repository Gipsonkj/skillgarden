---
name: gcloud-app-deploy
description: Deploy a Next.js (or any Node) app to Google Cloud Run behind Firebase Hosting — Docker standalone build, europe-west3, Firebase Hosting rewrite for the domain, GitHub Actions CI/CD via Workload Identity Federation (no key files). Use when creating a new app deployment, wiring a custom domain, setting env vars, debugging 502s/stale bundles, or when gcloud commands fail with "No module named grpc".
---

# Google Cloud app deployment

The proven architecture: **Next.js app → Docker image → Cloud Run (europe-west3) → Firebase Hosting in front** (CDN + custom domain via a rewrite). Firestore/Auth/Storage come from the same Firebase project.

## 0. Environment fix (always, before any gcloud run/IAM command)

```bash
export CLOUDSDK_PYTHON_SITEPACKAGES=1
```

Without it gcloud can fail with "No module named grpc" or appear to hang (seen on macOS). It is NOT a broken install — never reinstall gcloud for this.

## 1. Next.js config

- `next.config.mjs`: `output: 'standalone'`
- `package.json` start script: `node server.js` (the standalone server), port from `$PORT`
- `NEXT_PUBLIC_*` Firebase web config goes in `.env.production` and is **committed** (Firebase web config is public by design). Everything secret stays in Cloud Run runtime env vars, never in the repo.

## 2. Dockerfile (2-stage, node:20-alpine)

Stage 1 (builder): `npm ci`, copy all, `npm run build`. Stage 2 (runner): copy `public/`, `.next/standalone`, `.next/static`; non-root user; `ENV PORT=8080`; `EXPOSE 8080`.

**Trap:** do NOT declare empty `ARG/ENV NEXT_PUBLIC_*` in the Dockerfile — an empty env value beats `.env.production` and blanks the client Firebase config.

## 3. Deploy

```bash
export CLOUDSDK_PYTHON_SITEPACKAGES=1
gcloud run deploy <service> \
  --source . \
  --region europe-west3 \
  --allow-unauthenticated \
  --min-instances=0 --max-instances=2 \
  --memory=1Gi --cpu=1
```

- **Never** deploy public before the owner confirms access policy. Default to `--no-allow-unauthenticated` for internal tools.
- **Never** set `min-instances=1` without asking — it costs money 24/7.
- Regional quota is hard-capped (~20 vCPU / 40 GiB per region across all services). Keep services small; heavy render services max 4 vCPU / 8 Gi, max-instances=1.
- A code-only redeploy **preserves** runtime env vars and the runtime service account.

## 4. Firebase Hosting in front (domain + CDN)

`firebase.json`:

```json
{ "hosting": { "public": "public",
  "rewrites": [{ "source": "**", "run": { "serviceId": "<service>", "region": "europe-west3" } }] } }
```

```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage:rules
```

Custom domain: Firebase console → Hosting → add domain → set the DNS records it shows. Then update `NEXT_PUBLIC_SITE_URL` in `.env.production` and redeploy so canonicals/sitemap/OG use the real domain.

**60-second trap:** Firebase Hosting 502s any request that takes longer than 60s. Slow endpoints (AI generation, big imports) must be called on the direct `*.run.app` URL (pattern: a `longRunUrl` config value in the client), bypassing Hosting.

## 5. CI/CD (no key files)

GitHub Actions on push to `main` → Workload Identity Federation (`github-pool`/`github-provider`) impersonates a `github-deployer` service account → builds image → Artifact Registry (`cloud-run-source-deploy`, europe-west3) → deploys. SA needs `roles/run.admin`, Artifact Registry writer, and SA-user on the runtime SA. No JSON keys anywhere.

## 6. Env vars

- Runtime (server-side secrets): `gcloud run services update <service> --region europe-west3 --set-env-vars KEY=value` — no rebuild needed.
- `NEXT_PUBLIC_*` (baked at build time): change `.env.production`, rebuild + redeploy.

## 7. Storage buckets

Two buckets, always: a **public** one for listing/media photos (`allUsers:objectViewer` — note this lets anyone LIST it) and a **private** one for documents. Never put documents in the public bucket.

## 8. Verifying and debugging

- Fix "not visible on live site": `curl -s https://site/ | grep <marker>` on the served HTML and the JS chunks BEFORE re-fixing code — a stale CDN shell mimics a broken fix.
- Logs: `gcloud run services logs read <service> --region europe-west3 --limit 50`
- Batch deploys: finish all features locally, then ONE production deploy — not one per change.
- Local Firestore access for scripts: `gcloud auth application-default login`.
