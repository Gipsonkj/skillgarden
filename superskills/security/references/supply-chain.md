# Dependency and supply-chain risk

> Distilled from: supply-chain-risk-auditor (trailofbits/skills, CC-BY-SA-4.0), security-and-hardening (addyosmani/agent-skills, MIT), security-best-practices (openai/skills, Apache-2.0).
> License: CC-BY-SA-4.0 (derived from trailofbits/skills supply-chain-risk-auditor). Share alike.

Use this for "audit our dependencies", "is this package safe to add?", vulnerability alerts, and lockfile hygiene.

## 1. Known vulnerabilities: the native audit first

| Ecosystem | Command |
|---|---|
| npm | `npm audit --omit=dev` (production), then full |
| pnpm / yarn | `pnpm audit`, `yarn npm audit` |
| Python | `pip-audit` or `uv pip audit` if available |
| Go | `govulncheck ./...` (reports only reachable vulnerable symbols) |
| Rust | `cargo audit` |

Triage by reachability, not raw count:

| Severity | Reachable in production? | Action |
|---|---|---|
| Critical/High | Yes | Fix now: patch, upgrade or remove |
| Critical/High | Dev-only or unreachable | Fix soon; note why it is not urgent |
| Medium | Yes | Next release |
| Low | Any | Track |

Never run `npm audit fix --force` automatically: it applies breaking major upgrades. Upgrade deliberately and run the tests.

## 2. Package health: the bundled collector

For a broader risk picture (maintainers, release cadence, scorecard, deprecations) run the collector. It is standard-library Python 3.11+, supports npm (`package-lock.json`), PyPI (`uv.lock`) and Go (`go.mod`), and does not read yarn, pnpm or poetry lockfiles.

```bash
uv run scripts/supply-chain-risk-auditor/collect.py <project-dir> --json out/findings.json
uv run scripts/supply-chain-risk-auditor/render.py out/findings.json --out out/report.md
```

- It queries public services (deps.dev, OSV, the package registries, OpenSSF Scorecard, the GitHub API). Tell the user before running it on a private project, since package names leave the machine.
- Authenticate `gh` first: unauthenticated GitHub calls are limited to 60 per hour, authenticated to 5,000.
- A non-zero exit means it refused to produce a report; relay its message verbatim instead of guessing.

## 3. Before adding a new dependency

- [ ] Do we need it? Standard library or 20 lines of our own code may do.
- [ ] Maintained: release in the last 12 months, more than one maintainer, issues answered.
- [ ] Adoption: weekly downloads and dependents proportional to the risk it carries.
- [ ] Name is exactly right (typosquats differ by one character or a scope).
- [ ] License compatible with ours.
- [ ] Install scripts: does it run `postinstall`? Prefer packages that do not.
- [ ] Transitive weight: `npm ls <pkg>` or `npm view <pkg> dependencies`.

## 4. Lockfile and install hygiene

- Commit lockfiles; CI installs with `npm ci`, `pnpm install --frozen-lockfile`, `uv sync --locked`, `pip install --require-hashes`.
- Block install scripts by default where the tool supports it (`npm config set ignore-scripts true`, pnpm `onlyBuiltDependencies` allowlist) and allow them per package.
- Pin GitHub Actions to commit SHAs (see github-actions.md).
- Use a private registry or scoped packages for internal names so a public package with the same name cannot be pulled instead.
- Enable automated update PRs (Dependabot, Renovate) with grouped minor/patch updates and a short cooldown before adopting brand-new releases.

## 5. Report format

```
Summary: N direct, M transitive; X reachable high/critical
Table: package | version | issue | reachable? | fix version | action
Health flags: unmaintained, single maintainer, deprecated, low scorecard
Recommended changes (as a PR diff or command list)
```
