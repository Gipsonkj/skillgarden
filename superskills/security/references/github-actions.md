# Hardening GitHub Actions workflows

> Distilled from: secure-github-actions (intercom/2x-skills, MIT), agentic-actions-auditor (trailofbits/skills, CC-BY-SA-4.0).
> License: CC-BY-SA-4.0 (derived from trailofbits/skills agentic-actions-auditor). Share alike.

Use this when writing or reviewing `.github/workflows/*.yml`, especially workflows that run on pull requests, comments or issues, or that call AI agents.

## 1. The rules

| # | Rule | Why |
|---|---|---|
| 1 | Never put `${{ github.event.* }}` or other user-controlled expressions directly in a `run:` block. Pass them through `env:` and quote the variable (`"$TITLE"`). | Expressions are substituted into the script text before the shell runs. |
| 2 | Do not use `secrets: inherit` for reusable workflows; pass only the secrets the callee needs. | Least privilege. |
| 3 | Pin every third-party action to a full commit SHA, with the version in a comment (`uses: actions/checkout@<sha> # v4.2.2`). | Tags can be moved. |
| 4 | Restrict which actions may run (organization or repository allowlist). | Limits what a compromised workflow can pull in. |
| 5 | Declare `permissions:` at workflow or job level, starting from `contents: read`. A reusable-workflow caller caps the callee's permissions, so keep any `id-token: write` the callee genuinely needs. | The default token is often broader than needed. |
| 6 | No `@latest`, `@main` or floating tags for actions or tool installs. | Reproducibility and integrity. |
| 7 | A job that has secrets must not check out and execute code from an untrusted pull request head. Split into an unprivileged build job and a privileged job that only consumes artifacts. | Untrusted code would run next to the secrets. |
| 8 | Prefer `pull_request` over `pull_request_target`. Use the latter only for labeling/commenting without checking out PR code. | `pull_request_target` runs with base-repo secrets. |
| 9 | Scope AI agent tools tightly: an explicit allowlist of commands, no wildcard shell access. | Agents read untrusted text. |
| 10 | Do not let workflows approve or merge pull requests with the default token; use a GitHub App with narrow permissions if automation must do it. | Prevents self-approval. |
| 11 | Never write untrusted values into `$GITHUB_ENV` or `$GITHUB_PATH`. | They change the environment of every later step. |

Additional rules for public repositories:

| # | Rule |
|---|---|
| 12 | Fork pull requests get no secrets; require approval for first-time contributors' workflow runs. |
| 13 | `actions/checkout` with `persist-credentials: false` unless a later step must push. |
| 14 | Use OIDC (`id-token: write` + cloud role trust policy scoped to repo and branch) instead of long-lived cloud keys. |

## 2. Safe pattern for untrusted text

```yaml
on: pull_request
permissions:
  contents: read
jobs:
  check-title:
    runs-on: ubuntu-latest
    steps:
      - name: Validate title
        env:
          TITLE: ${{ github.event.pull_request.title }}
        run: |
          if [[ ! "$TITLE" =~ ^(feat|fix|chore|docs): ]]; then
            echo "Title must start with a conventional prefix"; exit 1
          fi
```

## 3. Workflows that call AI agents

Treat issue bodies, PR descriptions, comments, commit messages, file contents and CI logs as untrusted input to the agent. When reviewing such a workflow, check:

- [ ] Who can trigger it (any commenter, or only members with write access)? Gate on `author_association` or a label applied by maintainers.
- [ ] What the agent can do: tool allowlist, no unrestricted shell, no network beyond what is needed.
- [ ] What token it holds: minimal `permissions:`, no cloud credentials, no `secrets: inherit`.
- [ ] Agent output is data: never `eval` it, never interpolate it into a later `run:` script, never write it to `$GITHUB_ENV`.
- [ ] Sandbox settings are not loosened (no "dangerously skip permissions" style flags in CI).
- [ ] Outputs that go public (comments, PRs) cannot leak secrets from the environment.

Broad tool wildcards and relaxed sandboxes do not create a problem on their own, but they turn any other weakness above into a much worse one.

## 4. Review checklist

- [ ] Every `uses:` pinned to a SHA.
- [ ] `permissions:` declared; nothing broader than needed.
- [ ] No `${{ github.event.* }}` inside `run:`.
- [ ] No privileged trigger combined with checkout of PR head code.
- [ ] Secrets passed explicitly, never inherited.
- [ ] Tool installs pinned by version and checksum.
- [ ] Optional: run `zizmor` or `actionlint` over the workflows if installed.
