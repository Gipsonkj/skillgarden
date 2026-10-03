> Distilled from: git-workflow-and-versioning (addyosmani/agent-skills, MIT), using-git-worktrees + finishing-a-development-branch (obra/superpowers, MIT), git-guardrails-claude-code + setup-pre-commit (mattpocock/skills, MIT)

# Git workflow: commits, branches, worktrees, finishing

**Commits are save points, branches are sandboxes, history is documentation.** Agents write code fast; disciplined version control keeps it reviewable and reversible.

## Branching

- **Trunk-based by default**: `main` always deployable; short-lived branches merged within 1-3 days. Prefer feature flags over long-lived branches. Release branches are fine for stabilising a release.
- Branch names: `feature/<short-desc>`, `fix/<short-desc>`, `refactor/<short-desc>`, `chore/<short-desc>`.
- On the default branch and about to commit? Create a branch first.
- Delete branches after merge.

## Commits

- **Atomic**: one logical change per commit, self-contained, tests green.
- **Separate concerns**: a refactor and a feature are two commits (or two PRs); formatting-only changes stand alone.
- **Message** explains *why*:
  ```
  feat: add email validation to registration endpoint

  Prevents invalid emails reaching the DB. Uses the Zod schema
  pattern already used in auth.ts.
  ```
  Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Never "fix", "update", "misc".
- **Size**: ~100 lines ideal, ~300 OK for one logical change, ~1000+ split it.
- **Save-point loop**: change -> test -> green? commit : roll back to the last commit and investigate. You never lose more than one increment. Before discarding uncommitted work you didn't create, ask.

### Pre-commit hygiene
```bash
git diff --staged                                    # what am I committing?
git diff --staged | grep -inE "password|secret|api_key|token"   # secrets?
npm test && npm run lint && npx tsc --noEmit         # or the project's equivalents
```
Don't commit build output (`dist/`, `.next/`), `.env*`, or personal IDE config. Commit lockfiles and migrations.

### Automate it (JS/TS projects, when the user asks)
Husky + lint-staged + Prettier: detect the package manager from the lockfile; install `husky lint-staged prettier` as devDependencies; `npx husky init`; `.husky/pre-commit` runs `npx lint-staged`, then the `typecheck` and `test` scripts (omit lines for scripts that don't exist and say so); `.lintstagedrc` = `{"*": "prettier --ignore-unknown --write"}`; create a Prettier config only if none exists. Verify with `npx lint-staged`, then commit; the commit itself smoke-tests the hook.

### Block destructive git commands for agents
`scripts/git-guardrails-claude-code/block-dangerous-git.sh` is a Claude Code `PreToolUse` hook that blocks `git push` (all variants, including `--force`), `git reset --hard`, `git clean -f`/`-fd`, `git branch -D`, `git checkout .` and `git restore .`. Install only when the user asks; ask whether it goes in project (`.claude/settings.json`) or global (`~/.claude/settings.json`) settings:
```json
{ "hooks": { "PreToolUse": [ { "matcher": "Bash", "hooks": [
  { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh" } ] } ] } }
```
Copy the script to `.claude/hooks/`, `chmod +x`, merge into existing settings (don't overwrite), then test: `echo '{"tool_input":{"command":"git push origin main"}}' | ./.claude/hooks/block-dangerous-git.sh` should exit 2 with a BLOCKED message. Needs `jq`.

## Worktrees for isolated work

1. **Detect existing isolation first**:
   ```bash
   GIT_DIR=$(cd "$(git rev-parse --git-dir)" && pwd -P)
   GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
   git rev-parse --show-superproject-working-tree   # prints a path => submodule, not a worktree
   ```
   `GIT_DIR != GIT_COMMON` (and not a submodule) = already in a worktree: don't create another.
2. Not isolated and no stated preference? Ask before creating one.
3. **Prefer the harness's native worktree tool** (e.g. an `EnterWorktree` tool or `--worktree` flag). Raw `git worktree add` alongside a native tool creates state the harness can't see or clean up.
4. Fallback: directory from the user's stated preference, else existing `.worktrees/`, else `worktrees/`, else create `.worktrees/`. **Verify it's ignored** (`git check-ignore -q .worktrees`); if not, add it to `.gitignore` and commit first. Then `git worktree add .worktrees/<branch> -b <branch>`.
5. Install deps and **run the baseline tests**. Failing baseline? Report and ask before building on it.

## Finishing a branch

1. **Full test suite green.** Failing? Report failures and stop.
2. Confirm the base branch ("This branched from `main`, correct?").
3. Offer exactly three options (two on a detached HEAD, no local merge):
   ```
   1. Merge back to <base> locally
   2. Push and create a Pull Request
   3. Keep the branch as-is
   ```
4. **Merge locally**: from the main checkout, `git checkout <base> && git pull && git merge <branch>`, rerun tests on the merged result, then remove the worktree you created and `git branch -d <branch>`.
5. **PR**: `git push -u origin <branch>`, open the PR with the forge CLI following the repo's PR template, report the URL. Keep the worktree for review feedback.
6. **Keep**: report branch name and worktree path.
7. **Discard** only if the user explicitly asks: list the branch, commits and worktree that will be deleted and wait for them to type `discard`.
8. Worktree removal refused because of uncommitted files? Never `--force` on your own; show `git -C <path> status --porcelain -uall` and ask: commit, move, or delete.
9. Only clean up worktrees you created; harness-managed ones are left to the harness.

## Change summary (after any modification)
```
CHANGES MADE:
- src/routes/tasks.ts: validation middleware on POST
THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: same gap, out of scope
POTENTIAL CONCERNS:
- Schema rejects extra fields; confirm that's intended
```

## Git for debugging
`git bisect start; git bisect bad; git bisect good <sha>` (or `git bisect run ./check.sh`), `git log --oneline -20`, `git log -S'symbol'` (when was this added/removed), `git blame -L 40,60 file`, `git log --grep=validation`.

## Releases
SemVer for anything with consumers (MAJOR breaking, MINOR additive, PATCH fix; unsure if breaking = treat as breaking). Tag releases (`git tag -a v1.4.0 -m "Release 1.4.0"`) and derive the version from the tag. Keep a human changelog grouped Added / Changed / Fixed / Deprecated / Removed / Security.

## Red flags
- Commit mixes refactor + feature + formatting.
- Branch alive for weeks; merging without rerunning tests on the result.
- Force-pushing shared branches; `--force` on worktree removal; deleting a branch without confirmation.
- Pushing, opening PRs or merging without the user's go-ahead.
