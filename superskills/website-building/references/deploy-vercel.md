> Distilled from: deploy-to-vercel (vercel-labs/agent-skills, MIT), vercel-cli (vercel/vercel, Apache-2.0), vercel-optimize (vercel-labs/agent-skills, MIT)

# Deploying on Vercel

Vendor-specific. Two hard rules: **deploy as preview unless the user explicitly asks for production**, and **never push, buy a domain, or change production settings without the user's yes**. Purchases (`vercel domains buy`) and billing changes are the user's to make.

## 1. Read the state first (safe commands only)

```bash
git remote get-url origin 2>/dev/null                       # git remote?
cat .vercel/project.json 2>/dev/null || cat .vercel/repo.json 2>/dev/null   # linked?
vercel whoami 2>/dev/null                                   # CLI installed + logged in?
vercel teams list --format json 2>/dev/null                 # which teams?
```

Do not use `vercel ls`, `vercel link` or `vercel project inspect` to *detect* state in an unlinked folder: they prompt, or with `--yes` silently link. `vercel whoami` reports the user and team, not the linked project. Before a consequential command in a linked folder, confirm the target with `vercel project inspect --non-interactive`.

## 2. Choose the method

| State | Do this |
|---|---|
| Linked + git remote | Ask, then commit and push. Non-production branches get preview deploys; the production branch deploys to production. Find the URL with `vercel ls --format json` (latest `deployments[].url`) |
| Linked, no remote | `vercel deploy [path] -y --no-wait`, then `vercel inspect <url>` for build status |
| Not linked, CLI logged in | Pick the team (ask only if more than one), then `vercel link --repo --scope <team>` if there is a git remote (matches by repo, creates `.vercel/repo.json`), else `vercel link --scope <team>`; then deploy as above |
| No CLI / not logged in | Installing the CLI (`npm i -g vercel`) is a global install: ask. Then `vercel login` (the user completes it in the browser), link, deploy |
| Sandbox with no auth possible | Vercel's own `deploy-to-vercel` skill ships a no-auth script that uploads the project and returns a preview URL plus a claim URL. Not bundled here; tell the user it uploads their source to Vercel, and get a yes first |

Production only on request: `vercel deploy --prod -y --no-wait`. Pass `--scope <team>` on every command once a team is chosen. Always show the deployment URL; report build status from `vercel inspect`.

## 3. CLI essentials

```bash
vercel pull                         # project settings + env into .vercel/
vercel dev                          # local dev with Vercel routing and env
vercel build && vercel deploy --prebuilt   # deploy local build output
vercel deploy --force               # fresh build without build cache
vercel env ls --format json
vercel env add API_KEY production   # environment is positional; agents pass --value "…" --yes or pipe stdin
vercel env pull .env.local          # only .env.local is auto-gitignored; check others
vercel env run -e preview -- next dev
vercel logs <deployment-url> --since 1h --limit 100 --json
vercel inspect <deployment-url> --logs
vercel curl /api/health --deployment <url>   # reach a protected preview without disabling protection
vercel domains add example.com my-project
vercel alias set <deployment-url> example.com
```

Parse URLs and JSON from stdout only; progress and warnings go to stderr. In agent mode, errors come back as JSON with `status`, `reason`, `hint` and `next`; check that a suggested `next` command keeps the user's target before running it, and never auto-run linking, login or mutations.

**Anti-patterns**
- `vercel link` (single `project.json`) in a monorepo with several projects. Use `vercel link --repo`.
- Letting a command auto-link in a monorepo; link explicitly first.
- `vercel deploy` after `vercel build` without `--prebuilt` (build output ignored).
- Tokens in command flags. Use the `VERCEL_TOKEN` env var; never echo it.
- Disabling deployment protection to test a preview. Use `vercel curl`.
- Forgetting `--non-interactive` in plain CI.
- Reaching for `vercel api` before the first-class command.

## 4. Debugging a failed build

1. `vercel inspect <url>` metadata: branch, commit, target, status.
2. `vercel inspect <url> --logs`: note install command, package manager version, build command, cache id and the **first** fatal error. Fix that one before any warning.
3. Read only the files the error names, plus lockfile and build config.
4. Compare with a nearby green deploy: commit, lockfile diff, cache id, install command.
5. Report with confidence words: "logs prove…", "likely trigger…", "not yet proven…", "validate by…".

Runtime errors: `vercel logs <url> --level error --since 1h --limit 100 --json`, bounded windows only; `--follow` for live debugging only.

## 5. Cost and performance on a deployed project

Vercel's `vercel-optimize` skill (not bundled: it is a multi-script pipeline needing CLI v53+, a linked project and Observability Plus) follows a doctrine worth keeping even by hand:
- **Metrics first.** Start from production signals (`vercel metrics`, `vercel usage`, Speed Insights), not a repo-wide grep.
- Investigate only routes a metric points to (low cache-hit routes, heavy function invocations, large data transfer, slow p75), and read only the files on that route.
- Confirm the account scope before reading usage: unscoped `vercel usage` can report the personal account while metrics come from the team.
- Recommend only features available in the detected framework version, and cite the docs.
- Typical wins: cache static and ISR-able routes, move per-request work out of hot paths, image optimisation settings, bot traffic controls, Fluid compute for I/O-bound functions.

## Pitfalls

- Deploying to production because "deploy it" was ambiguous. Preview first, give the URL, ask.
- Pushing to git without asking.
- Curling the deployed URL to "verify" when the user only asked for the link; if you need verification, use the testing guide.
- Committing a pulled `.env` file.
