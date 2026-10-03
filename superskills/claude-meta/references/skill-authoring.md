> Distilled from: skill-creator (anthropics/skills, Apache-2.0), writing-skills (obra/superpowers, MIT), writing-for-agents (mattpocock/skills, MIT), self-learning (Kulaxyz/self-learning-skills, MIT)

# Writing a skill

A skill is a folder with a `SKILL.md` (YAML frontmatter + Markdown) and optional `scripts/`, `references/`, `assets/`. It is a reusable technique, pattern or reference, not a story of how you solved one problem once.

## 1. Decide if it should be a skill at all

| Situation | Put it in |
|---|---|
| Multi-step procedure you will repeat across sessions or projects | A skill |
| One fact, path, env var name or one-line correction | `CLAUDE.md` / memory file |
| Project convention everyone on the repo needs every session | Project `CLAUDE.md` |
| Rule a regex or validator can enforce | A hook, linter or test, not prose |
| One-off fix unlikely to recur | Nothing |
| Standard practice already well documented | Nothing (link it) |

Create a skill when the technique was not obvious, you will reach for it again, and it applies beyond one moment.

## 2. Capture intent first

Before drafting, answer (from the conversation if it already contains the workflow, otherwise ask):
1. What should the skill let Claude do?
2. When should it trigger: which phrases, file types, situations?
3. What does the output look like?
4. Is the output objectively checkable (file transforms, extraction, code, fixed steps)? Then plan test prompts. Subjective output (style, art) is judged by a human instead.

Ask about edge cases, input formats, example files and dependencies before you write test prompts.

## 3. Folder anatomy and progressive disclosure

```
skill-name/
  SKILL.md          required: frontmatter + instructions
  references/       loaded only when SKILL.md points to them
  scripts/          run, not read (saves tokens, deterministic)
  assets/           files used in the output (templates, fonts)
```

Three loading levels:
1. `name` + `description`: always in context (~100 words). Every word costs on every turn.
2. `SKILL.md` body: loaded when the skill fires. Keep it under 500 lines; aim far lower for skills that load often (<200 words for always-on helpers).
3. Bundled files: loaded or run only when needed. Unlimited.

Rules:
- Inline what every branch of the task needs; push behind a pointer what only some branches need.
- One reference file per variant (`references/aws.md`, `references/gcp.md`) so Claude reads only the relevant one.
- Add a table of contents to any reference over 300 lines.
- Every pointer says *when* to read the file ("Read `references/x.md` when the input is a scanned PDF").
- Call scripts through their interpreter (`bash scripts/x.sh`, `python3 scripts/x.py`): packagers sometimes strip the executable bit.
- Do not use `@file` links: they force-load the file immediately.
- If all three test runs wrote the same helper script, bundle that script.

## 4. Frontmatter

```yaml
---
name: processing-invoices          # lowercase, digits, hyphens; matches folder
description: Extracts line items and totals from invoice PDFs and scans into CSV. Use when the user shares an invoice, receipt or bill, asks to reconcile supplier costs, or wants invoice data in a spreadsheet, even if they don't say "invoice".
---
```

- `name` + `description` are the only required fields. Total frontmatter limit 1024 characters for the description.
- `disable-model-invocation: true` makes the skill user-only (typed as `/name`). Zero context cost, but you must remember it exists. Use for manual workflows (handoff, release, deploy).

### Writing the description (the trigger)

The description is the only thing Claude sees when deciding to load the skill. Sources conflict on its content; the stronger rule, backed by testing in writing-skills, is:

- **State what the skill covers in one clause, then list the triggers.** Do not summarise the workflow steps. When a description says "dispatches a subagent per task with review between tasks", agents follow the description and skip the body.
- Be a little pushy: Claude tends to under-trigger. Add "even if they don't mention X" for the indirect cases.
- One trigger per distinct case. Synonyms for the same case are one trigger written twice.
- Use words users actually type: error messages, symptoms ("flaky", "hangs"), tool and file names.
- Third person, no "I can help".
- Front-load the most distinctive word.
- Simple one-step requests ("read this file") never trigger skills regardless of wording, so don't optimise for them.

Bad: `description: Helps with async tests.`
Bad: `description: Use for TDD - write test, watch it fail, write code, refactor.` (workflow summary)
Good: `description: Use when tests have race conditions, timing dependencies, or pass and fail inconsistently.`

## 5. Body structure

```markdown
# Skill Name
One or two sentences: what this is and the core principle.

## When to use / when not to
## Core pattern or procedure (numbered steps, each ending on a checkable result)
## Quick reference (table)
## Common mistakes (what goes wrong + fix)
```

Writing rules:
- Imperative voice ("Run", "Check").
- Explain the *why* behind each rule. A model that understands the reason generalises; all-caps MUST/NEVER is a yellow flag.
- Every step ends on a completion criterion the agent can check ("every modified model listed", not "understand the code"). Vague criteria cause premature completion.
- One excellent, runnable example beats five languages of mediocre ones.
- Use a flowchart only for a non-obvious decision or a loop the agent might exit early. Lists for linear steps, tables for reference.
- Keep each concept's definition, rules and caveats under one heading.
- One source of truth per rule. Don't restate what `--help`, `package.json` or the directory listing already tells the agent; do record what it cannot look up (the unwritten convention, the reason, the gotcha).
- Prompt the positive behaviour. "Write one-line comments" works better than "don't write long comments": a prohibition puts the unwanted thing in context.
- Use a leading word the model already knows (*tracer bullet*, *red*, *tight loop*) instead of a three-line definition.
- Delete no-ops: sentences that tell the model what it does by default anyway.

## 6. Match the form to the failure

Look at how an agent fails *without* the guidance, then choose the form:

| Baseline failure | Use | Avoid |
|---|---|---|
| Knows the rule, skips it under pressure | Hard rule + rationalisation table + red-flag list | Soft "prefer..." |
| Complies but output has the wrong shape | A positive recipe: "the output is X, then Y, then Z" | A list of "don't"s |
| Leaves out a required element | A required slot in the template | A reminder in prose |
| Behaviour depends on a condition | "If <observable thing>, do X" | A blanket rule plus exceptions |

- No nuance clauses ("don't X unless it matters"): they reopen the negotiation. Write a separate conditional.
- Exemption clauses don't scope well. "This limit doesn't apply to code blocks" still shrinks code blocks; restructure instead.

### Bulletproofing discipline skills
- Close loopholes by name: "Delete means delete. Don't keep it as reference."
- Add "Violating the letter of the rule is violating its spirit."
- Build a two-column `Excuse | Reality` table from excuses you saw in baseline runs.
- Add a red-flags list ("If you think 'just this once', stop").

## 7. Naming

- Verb-first, describes the action: `creating-skills`, `condition-based-waiting`, `root-cause-tracing`.
- Not generic (`helper`, `utils`) and not a narrative (`fixing-the-march-bug`).

## 8. Router skills

When one topic covers many jobs, write one model-invoked router: a short `SKILL.md` with core rules and a `Task | Read` table pointing to `references/<job>.md`. Users trigger a sub-capability by naming the task. This keeps one description in context instead of ten.

## 9. Updating an existing skill

- Keep the original `name` and folder name.
- Snapshot it before editing (`cp -r skill/ workspace/skill-snapshot/`) so you can compare old vs new.
- If the installed path is read-only, copy it to a temp dir, edit there, then package.
- Prune while you add: stale lines settle into sediment. Ask of each line "does it still change behaviour?"

## 10. Safety

A skill must not surprise the user if its contents were described to them: no malware, data exfiltration, hidden instructions or credential collection. Record where a secret lives (env var name, vault), never the secret.

## Pre-ship checklist

- [ ] `name` matches folder; only letters, digits, hyphens
- [ ] Description <= 1024 chars, states scope + triggers, no workflow summary
- [ ] Body < 500 lines; heavy reference moved to `references/` with "read when" pointers
- [ ] Every referenced path exists; every reference is linked
- [ ] Scripts run via interpreter and were executed at least once
- [ ] At least 2-3 realistic test prompts run with the skill (see `references/skill-testing-and-triggering.md`)
- [ ] `python3 scripts/skill-creator/scripts/quick_validate.py <skill-dir>` passes (needs PyYAML; checks name <= 64 chars, description <= 1024, and allows only `name, description, license, allowed-tools, metadata, compatibility` - it will flag Claude Code extras like `disable-model-invocation`, which is fine for a Claude Code-only skill)
- [ ] To ship a `.skill` zip: `cd scripts/skill-creator && python3 -m scripts.package_skill <abs-skill-dir> [out-dir]`
