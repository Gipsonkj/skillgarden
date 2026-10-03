# CI/CD pipelines

> Distilled from: ci-cd-and-automation (addyosmani/agent-skills, MIT), github-actions-templates (wshobson/agents, MIT), terraform-skill (antonbabenko/terraform-skill, Apache-2.0), wrangler (cloudflare/skills, Apache-2.0)

CI is the enforcement layer: every change passes the same gates, every time. Shift checks left (cheap and fast first) and ship small batches often.

## Quality gates (in order, on every PR and push to main)

1. Lint (eslint/ruff/etc.) and format check
2. Type check (`tsc --noEmit`, mypy)
3. Unit tests with coverage
4. Build
5. Integration tests (real DB via service containers)
6. E2E (Playwright) for user-critical paths, optional per PR
7. Security: dependency audit (`npm audit --audit-level=high`), filesystem/IaC scan (Trivy), secret scan
8. Optional budget checks: bundle size, image size, Lighthouse

No gate is skipped. A failing lint is fixed, not disabled; a flaky test is fixed or quarantined with an owner, not re-run until green.

## Baseline GitHub Actions workflow

```yaml
name: CI
on:
  pull_request: { branches: [main] }
  push: { branches: [main] }
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test -- --coverage
      - run: npm run build
      - run: npm audit --audit-level=high
```

Integration tests with a database: add a `services: postgres: image: postgres:16` block with `--health-cmd pg_isready --health-interval 10s --health-retries 5`, pass credentials from `secrets.*` (even for CI-only DBs), run migrations, then tests.

## Workflow rules

- Pin actions to a major (`@v4`) at minimum; pin to a full commit SHA for third-party actions in sensitive repos. Never `@latest`/`@main`.
- Top-level `permissions: contents: read`; widen per job only (`packages: write` to push to GHCR, `id-token: write` for OIDC).
- Cache dependencies (`setup-node` `cache:`, `setup-python` `cache:`; Docker `cache-from/to: type=gha`).
- `concurrency` with `cancel-in-progress` for PR builds; never cancel in-progress production deploys.
- `timeout-minutes` on every job.
- Matrix only for what you actually support (OS × runtime versions).
- Reusable workflows (`on: workflow_call`) for shared pipelines; pass secrets explicitly.
- Upload reports on failure (`actions/upload-artifact` with `if: failure()`).
- Treat PR titles, branch names and issue bodies as untrusted: never interpolate `${{ github.event.* }}` directly into `run:`; pass via `env:`. Avoid `pull_request_target` with checkout of PR code.

## Cloud auth via OIDC (no long-lived keys)

Grant `permissions: id-token: write` and use the provider's login action:

| Platform | Action | Trust `aud` | Pin `sub` to |
|---|---|---|---|
| AWS | `aws-actions/configure-aws-credentials` with `role-to-assume` | `sts.amazonaws.com` | `repo:ORG/REPO:ref:refs/heads/main` or `:environment:prod` |
| Azure | `azure/login` with client/tenant/subscription IDs | `api://AzureADTokenExchange` | `repo:ORG/REPO:environment:prod` |
| GCP | `google-github-actions/auth` with `workload_identity_provider` | as configured | repo + ref or environment (attribute condition) |

Never wildcard the `sub` (`repo:ORG/*`). If the token is rejected, fix `aud`, don't loosen `sub`.

## Build and push an image

Use `docker/login-action`, `docker/metadata-action` (tags: branch, PR, semver, short SHA) and `docker/build-push-action` with `cache-from: type=gha`, `cache-to: type=gha,mode=max`. Tag images with the git SHA; deploy by SHA or digest so rollbacks are exact.

## Deploy strategies

- **Preview per PR**: Vercel/Netlify/Cloudflare Workers Previews/Cloud Run tagged revisions. Previews are public unless you add access control; say so.
- **Staged rollout**: merge → auto deploy to staging → verify → production via `environment: production` with required reviewers → watch errors for ~15 minutes → done or roll back.
- **Canary / traffic split**: Cloud Run `update-traffic --to-revisions=NEW=10`, Workers gradual deployments, Argo Rollouts. Increase 1% → 10% → 50% → 100% while error rate holds.
- **Feature flags** decouple deploy from release: ship dark, enable for a % of users, kill switch instead of redeploy. Give every flag a removal date.
- **Rollback workflow**: a `workflow_dispatch` job that redeploys a given previous version/tag. Test it before you need it. Rollback restores code, not data; migrations must be backward compatible (expand → migrate → contract).

## Environments and secrets

- `.env.example` committed; `.env` git-ignored; `.env.test` committed with fake values only.
- CI secrets in GitHub Secrets/Environments; production secrets only in the production environment or the platform's secret store. CI test jobs never see production secrets.
- Never echo secrets; GitHub masks registered secrets but not values derived from them.

## Repo hygiene automation

- Branch protection on `main`: required status checks, ≥ 1 review, no force-push.
- Dependabot/Renovate weekly, PR limit ~5; group minor/patch updates.
- Someone owns keeping CI green; a broken main is fixed or reverted first.

## Speed (pipeline over ~10 minutes)

Apply in order: cache dependencies → run lint/types/tests/build as parallel jobs → path filters to skip unaffected jobs (docs-only PRs) → shard tests with a matrix → move slow suites to a schedule → larger runners.

## Feeding CI failures back to an agent

Copy the exact failing step output; fix locally; reproduce with the same command CI runs; push. Lint → run the fixer; type error → fix at the reported location; test → debug, don't skip; build → check config and lockfile.

## Verify after changing CI

- [ ] All gates present and blocking merge
- [ ] Runs on PR and on push to main
- [ ] Least-privilege `permissions`, OIDC for clouds, no secrets in YAML
- [ ] Production deploy needs approval and has a tested rollback
- [ ] Pipeline < 10 minutes for the main path
