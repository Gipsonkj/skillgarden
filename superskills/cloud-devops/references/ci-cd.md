# CI/CD pipelines

> Distilled from: ci-cd-and-automation (addyosmani/agent-skills, MIT), github-actions-templates (wshobson/agents, MIT), terraform-skill (antonbabenko/terraform-skill, Apache-2.0), wrangler (cloudflare/skills, Apache-2.0), plus the official GitLab CI/CD and Jenkins docs (written in our own words)

CI is the enforcement layer: every change passes the same gates, every time. Shift checks left (cheap and fast first) and ship small batches often.

## Pick a CI tool

| Situation | Use | Why |
|---|---|---|
| The repo already has a pipeline (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`) or the team pays for one | That one | Gates belong where the team already looks; never run two CIs on the same branch |
| Code on GitHub, no CI yet | GitHub Actions (below) | Built in, and OIDC login to AWS, Azure and GCP (table below) |
| Code on GitLab (gitlab.com or self-managed) | [GitLab CI/CD](#gitlab-cicd) | Built in; environments, rollback button and registry in the same place |
| Company runs a Jenkins controller, or builds must stay on its own machines | [Jenkins](#jenkins) | Self-hosted; reuse its agents and stored credentials, don't start a new controller for one repo |
| Only a static site or Worker with no tests to gate | The host's Git integration (Vercel, Netlify, Cloudflare) | Previews per PR without a pipeline; add CI once there are tests |
| Not sure where the code lives or who owns CI | Ask the user | Which Git host they push to and who approves prod decides the tool |

The quality gates, rules and deploy strategies below hold in every tool; only the syntax changes.

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

## GitLab CI/CD

The pipeline is `.gitlab-ci.yml` at the repo root. Jobs run in stages; with no `stages:` list GitLab uses `.pre`, `build`, `test`, `deploy`, `.post`.

**Drive it from Claude:** the `glab` CLI (`brew install glab`, then `glab auth login`; or set `GITLAB_TOKEN`, plus `GITLAB_HOST` for a self-managed instance, in the shell, never in the repo). `glab ci lint` validates the file before you push, `glab ci status` / `glab ci view` show the current pipeline, `glab ci trace` streams a job log, `glab ci retry` reruns failed jobs, `glab ci run` starts a pipeline, `glab ci list` shows history. GitLab also has an MCP server (beta, all tiers) at `https://<gitlab-host>/api/v4/mcp` with OAuth: `claude mcp add -s user --transport http GitLab https://<gitlab-host>/api/v4/mcp`; MCP access must first be allowed for the top-level group (gitlab.com, by its Owner) or for the instance (self-managed, by an administrator). On gitlab.com it allows 60 requests a minute on Free, 600 on Premium and Ultimate.

```yaml
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

stages: [test, deploy]

test:
  stage: test
  image: node:22
  interruptible: true
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules]
  script:
    - npm ci
    - npm run lint
    - npx tsc --noEmit
    - npm test

deploy_prod:
  stage: deploy
  script:
    - ./deploy.sh "$CI_COMMIT_SHA"
  environment:
    name: production
    url: https://example.com
  resource_group: production
  interruptible: false
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
```

What matters:
- **Manual prod gate.** `when: manual` *inside* `rules` makes a blocking manual job (`allow_failure` defaults to `false`), so the pipeline waits for someone to press play. Outside `rules` it defaults to `allow_failure: true` and the pipeline goes green without it. On Premium/Ultimate, also make `production` a protected environment (only listed people can deploy) and add deployment approvals; approved deployments still have to be started by hand.
- **One deploy at a time.** `resource_group: production` runs deploy jobs to that group one by one (`process_mode` defaults to `unordered`; `oldest_first` keeps order).
- **Cancel stale runs** with `interruptible: true` on test jobs only; keep deploys `interruptible: false`.
- **Useful variables:** `CI_COMMIT_SHA` / `CI_COMMIT_SHORT_SHA` (first 8 chars) for image tags, `CI_PIPELINE_SOURCE` (`merge_request_event`, `push`, `schedule`, `web`), `CI_REGISTRY_IMAGE` with `CI_REGISTRY_USER` / `CI_REGISTRY_PASSWORD` to push to the project registry, `CI_ENVIRONMENT_NAME`.
- **Secrets:** Settings > CI/CD > Variables, never in `.gitlab-ci.yml` (anyone with repo access can read it). Mask them (single line, no spaces, 8+ characters) and mark prod ones protected so only protected branches and tags get them. Use a File-type variable for things a tool wants as a path (kubeconfig, service-account file).
- **Keyless cloud auth:** request an OIDC token with `id_tokens` and trade it with the cloud. The token's `sub` is `project_path:{group}/{project}:ref_type:{type}:ref:{branch}`; pin the cloud trust policy to it (for AWS, the condition key `<gitlab-host>:sub`). The token expires with the job timeout, or after 5 minutes if none is set.

  ```yaml
  deploy_aws:
    id_tokens:
      GITLAB_OIDC_TOKEN:
        aud: https://gitlab.com
    script:
      - aws sts assume-role-with-web-identity --role-arn "$ROLE_ARN" --role-session-name "gl-$CI_JOB_ID" --web-identity-token "$GITLAB_OIDC_TOKEN"
  ```
- **Rollback:** Operate > Environments > the environment > **Rollback environment** on an earlier successful deployment. It creates a new deployment of that commit but reruns only the deploy job, so the deploy must live in that job's `script` (not depend on artifacts from an earlier job). "Prevent outdated deployment jobs" can hide the rollback button.
- **Limits:** gitlab.com Free namespaces get 400 compute minutes a month on GitLab-hosted runners; a small Linux runner uses 1 minute per minute of runtime. Check the user's plan before adding heavy matrix jobs.

## Jenkins

Self-hosted automation server; pipelines are a `Jenkinsfile` in the repo. A **Multibranch Pipeline** job finds every branch (and, with the Git host's plugin, every PR) that has a `Jenkinsfile` and builds each one; `BRANCH_NAME` and `CHANGE_ID` (the PR number) tell the pipeline where it is. Write declarative syntax, not scripted.

```groovy
pipeline {
  agent { docker 'node:22' }
  options {
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }
  stages {
    stage('Test') {
      steps {
        sh 'npm ci && npm run lint && npx tsc --noEmit && npm test'
      }
    }
    stage('Deploy prod') {
      when { branch 'main' }
      input {
        message 'Deploy to production?'
        ok 'Deploy'
        submitter 'release-managers'
      }
      environment { DEPLOY = credentials('prod-deploy') }   // username/password -> DEPLOY_USR, DEPLOY_PSW
      steps {
        sh './deploy.sh "$(git rev-parse HEAD)"'
      }
    }
  }
  post {
    failure { echo "Build ${BUILD_NUMBER} failed: ${BUILD_URL}" }
  }
}
```

**Drive it from Claude** (always against the user's own controller URL, with their API token in env vars):
- **Lint before pushing:** `curl -X POST --user "$JENKINS_USER_ID:$JENKINS_API_TOKEN" -F "jenkinsfile=<Jenkinsfile" "$JENKINS_URL/pipeline-model-converter/validate"`. With an API token no CSRF crumb is needed.
- **CLI:** the client jar is served by the controller itself at `$JENKINS_URL/jnlpJars/jenkins-cli.jar`. It reads `JENKINS_USER_ID` and `JENKINS_API_TOKEN` from the environment (or `-auth @file`, never `-auth user:token` typed into chat or a script). `java -jar jenkins-cli.jar -s "$JENKINS_URL" build my-job -p ENV=staging -f -v` starts a build and follows it; `console my-job` prints the log; `help` lists what the controller allows.
- **REST:** POST to `$JENKINS_URL/job/<name>/buildWithParameters` (or `/build`); append `/api/json` to any job or build URL for machine-readable status.
- **MCP:** the community `mcp-server` plugin exposes `/mcp-server/mcp` (tools such as `getJob`, `triggerBuild`, `getBuildLog`) with Basic auth from a user's API token. Installing plugins is the Jenkins admin's call; ask first.

Gotchas:
- **Secrets in single quotes.** `sh "curl -H 'Authorization: Bearer ${TOKEN}' ..."` lets Groovy paste the secret into the process arguments, visible in `ps`. Write `sh 'curl -H "Authorization: Bearer $TOKEN" ...'` so the shell expands it. Store secrets in Jenkins credentials and bind them with `credentials('id')` or `withCredentials`.
- **Groovy is glue only.** The controller runs the Groovy; heavy logic, `JsonSlurper` or HTTP calls there eat its memory. Do the work in `sh` steps on agents and return only the result. Batch shell commands into one step.
- Triggering a build that deploys, or approving an `input`, is a production action: show the job, parameters and target and wait for a yes.

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
