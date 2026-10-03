# Reviewing UI: audits, change reviews and the polish pass

> Distilled from: impeccable (pbakaus/impeccable, Apache-2.0), interface-review (jakubkrehel/skills, MIT), emil-design-eng (emilkowalski/skills, MIT), web-design-guidelines (vercel-labs/agent-skills, MIT), baseline-ui (ibelick/ui-skills, MIT), accessibility (addyosmani/web-quality-skills, MIT)

Three different jobs. Pick the one the user asked for and don't mix them:

| Job | Question it answers | Output |
|---|---|---|
| Audit | "How good is this screen / app?" | Scored report, findings by severity, no fixes |
| Change review | "Did my change make the UI worse?" | Findings on the diff, each with a status |
| Polish pass | "Make this finished" | Applied fixes across the whole path, then verification |

Reviews are read-only unless the user asks for fixes. Mark any visual or runtime claim you did not see rendered as **Not verified**.

## Audit: five dimensions, 0-4 each

| # | Dimension | Check | 4 means |
|---|---|---|---|
| 1 | Accessibility | Contrast, focus, keyboard, semantics, labels, alt, motion preferences | WCAG 2.2 AA met, verified with keyboard + screen reader |
| 2 | Performance | Layout-property animation, unbounded blur/shadow, image loading, bundle weight, re-renders, layout shift | Fast, no jank, CLS ≈ 0 |
| 3 | Responsive | Fixed widths, horizontal scroll at 320 px, targets < 44 px, broken touch gestures, text scaling | Works from 320 px to wide, touch-first |
| 4 | Theming | Hard-coded colours, broken dark mode, inconsistent tokens | Every value is a token; both themes pass contrast |
| 5 | Implementation integrity | Design-system drift, repeated shortcuts, decorative or invented content, interchangeable template structure (see [anti-slop.md](anti-slop.md)) | Coherent, product-specific system |

Total out of 20: 18-20 excellent, 14-17 good, 10-13 acceptable, 6-9 poor, 0-5 critical.

**Severity on every finding**

| Tag | Meaning | When to fix |
|---|---|---|
| P0 Blocking | Task can't be completed, data loss, inaccessible path | Now |
| P1 Major | Significant difficulty or a WCAG AA failure | Before release |
| P2 Minor | Annoyance with a workaround | Next pass |
| P3 Polish | No real user impact | If time allows |

Each finding: `[P?] name` / location (`file:line` or component) / dimension / impact on users / standard violated (if any) / recommendation. End with systemic patterns ("hard-coded colours in 15 components"), what is working well, and the 3-5 next steps. Don't fix during an audit.

Run the measurable checks with tools when available: Lighthouse or axe for accessibility, the browser's performance panel, a contrast checker on computed pairs, screenshots at 320/768/1280 px.

## Change review (diff-scoped)

1. **Resolve scope.** If the branch is ahead of `git merge-base origin/<default> HEAD`, review that range plus uncommitted changes and report both counts. Otherwise the dirty working tree. If neither, there is nothing to review: say so and offer the last commit, a named PR/branch, or a whole-repo audit. Never silently review `HEAD~1`.
2. **Exclude** lockfiles, snapshots, generated and vendored files, and say what you excluded.
3. **Expand the blast radius** one hop (direct importers/callers of changed files); two hops for tokens, theme values and shared primitives. Review at most five consumers and say how many you skipped.
4. **Read the removed lines.** Regressions only show on the `-` side:

   ```bash
   git diff -U0 "$BASE"...HEAD -- '*.tsx' '*.css' | grep -E '^-[^-]' | grep -E 'aria-|role=|alt=|<label|focus|tabindex|prefers-|lang=|dir=|tabular-nums|text-wrap'
   ```

   A removal is a lead, not a finding. It's cleared by an equivalent replacement: `aria-label` -> `aria-labelledby` to visible text, `div role=button` -> `<button>`, `outline` -> a box-shadow ring that still passes, a literal -> a token with the same contrast, `left` -> `inset-inline-start`, a string moved into the translation catalogue.
5. **Status every finding**: `Introduced` (the change created it), `Regression` (the change weakened something that worked), `Pre-existing` (in touched code but not caused by it; confirm with `git blame -L n,n $BASE -- file`). Keep pre-existing findings to a few.
6. **Hold it to its stated intent.** Read the PR title, body and commit messages. Look for what's missing: a new variant styled for some states but not hover/focus/disabled/loading; a new string missing from the translation catalogue; a new component with no empty, loading, error or narrow-width state; a control added to one surface but not its siblings.
7. **Don't mutate the checkout.** Fetch PR refs; don't `git checkout` them. Use a separate worktree if you must render.

Verdict: Approve / Approve with comments / Request changes, based on any P0-P1 `Introduced` or `Regression` finding.

## Review output format

For code-level UI feedback use one table, one row per issue:

| Before | After | Why |
|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | Specify properties; `all` animates layout and colour unexpectedly |
| `<div onClick={close}>` | `<button type="button" aria-label="Close">` | Keyboard and screen-reader support for free |
| `scale(0)` entry | `scale(0.96)` + `opacity: 0` | Nothing appears from nothing; feels natural |

Group by file when reviewing many files: `## src/Button.tsx` then terse `file:line - issue -> fix` lines. Skip praise inside findings; put "what's working" in one short section at the end.

## Polish pass (make it finished)

1. **Establish the system.** Find the tokens, shared components and neighbouring screens this should match. Classify each gap: missing token / one-off that should use a shared component / conceptual mismatch with neighbours / local defect.
2. **Gather evidence.** Is the path functionally complete? What's deliberately unfinished? Which states, content lengths, roles and input methods will real users hit?
3. **Triage in this order:**
   1. Broken or blocked tasks, data loss, misleading state, inaccessible paths.
   2. Missing loading, empty, error, success, disabled, permission states.
   3. Flow, hierarchy, responsive and design-system drift.
   4. Visual and motion inconsistencies.
   5. Code and asset cleanup (debug output, dead styles, unused imports).
4. **Polish the whole path**, not the current screenshot: arrival, transition, empty, recovery. Same-role type consistent, optical alignment, icon family and stroke coherent, copy and capitalisation consistent. Ask before changing factual claims.
5. **Verify**: mobile, intermediate and wide layouts; every state; zoom, contrast, focus, screen-reader names; reduced motion; both themes. Report what you checked and what you couldn't.

Don't add animation or decoration to make polish visible. The best polish is often removal.
