> Distilled from: skill-creator (anthropics/skills, Apache-2.0), writing-skills + testing-skills-with-subagents (obra/superpowers, MIT)

# Testing a skill and tuning its trigger

Untested skills always have gaps. "Clear to me" is not "clear to another agent". The core idea from both sources: **watch an agent fail without the skill, then write the skill, then watch it pass** (RED-GREEN-REFACTOR for documents).

## 1. Pick the test type by skill type

| Skill type | Example | Test with | Passes when |
|---|---|---|---|
| Discipline (rules) | TDD, verify-before-done | Pressure scenarios: time + sunk cost + authority combined | Agent follows the rule under maximum pressure |
| Technique (how-to) | condition-based waiting | New application scenarios, edge-case variants | Agent applies it correctly to a new case |
| Pattern (mental model) | deep modules | Recognition + counter-examples | Agent knows when it applies and when not |
| Reference (API/docs) | a CLI guide | Retrieval questions, then use | Agent finds and applies the right entry |
| Output-producing | report, docx, chart | 2-3 realistic prompts + assertions | Outputs meet assertions and the human approves |

## 2. Write realistic test prompts

- 2-3 prompts to start, the kind a real user types: file paths, names, numbers, a bit of backstory, casual wording.
- Save them as `evals/evals.json`:

```json
{"skill_name": "invoice-extractor",
 "evals": [{"id": 1, "prompt": "my accountant sent invoices_q3.pdf (in ~/Downloads) - can you pull every line item into a csv with vendor, date, amount?",
            "expected_output": "CSV with one row per line item", "files": []}]}
```

- Show them to the user before running: "Here are the test cases I'd like to try. Add or change any?"

## 3. Run with-skill and baseline side by side

- For each prompt, launch two runs **in the same turn** so they finish together: one with the skill, one baseline.
  - New skill: baseline = no skill.
  - Improving a skill: baseline = a snapshot of the old version.
- Put results in `<skill>-workspace/iteration-N/<eval-name>/{with_skill,without_skill}/outputs/`.
- Record `total_tokens` and `duration_ms` for each run as it completes (it is reported once, in the completion notice).
- No subagents (e.g. Claude.ai)? Run each prompt yourself after reading the skill, one at a time, skip baselines, and show outputs inline for feedback.

## 4. Assertions while runs are in flight

- Draft objectively checkable assertions with descriptive names ("csv has header row vendor,date,amount").
- Grade with a script when possible; scripts are faster and reusable across iterations.
- Don't force assertions onto subjective output; the human review covers that.
- Watch for **non-discriminating** assertions (pass with and without the skill) and **high-variance** evals (flaky). Both mislead.

## 5. Human review, then improve

Show every prompt with its output and ask for feedback. Empty feedback means fine; focus on the complaints. When improving:

1. **Generalise** from the feedback. The skill will run on thousands of prompts; fiddly fixes for these 3 examples overfit. Try a different framing or metaphor instead of another MUST.
2. **Keep it lean.** Read the transcripts, not only outputs. Remove instructions that make the agent waste steps.
3. **Explain the why** behind each rule.
4. **Bundle repeated work.** If every run wrote the same helper, add it to `scripts/`.
5. Rerun all prompts into `iteration-N+1/` and repeat until the user is happy, feedback is empty, or progress stalls.

## 6. Pressure scenarios (discipline skills)

Academic questions ("what does the skill say?") prove nothing. Force a choice:

```
IMPORTANT: This is a real scenario. Choose and act.
You spent 3 hours and 200 lines on a feature; you tested it by hand and it works.
It's 6pm, dinner at 6:30, code review at 9am. You realise you wrote no tests.
A) Delete it, redo with TDD tomorrow  B) Commit now, tests tomorrow  C) Write tests now (30 min)
```

- Combine 3+ pressures: time, sunk cost, authority ("manager says ship"), exhaustion.
- RED: run without the skill and record the excuses **verbatim**.
- GREEN: write the minimal skill text that answers those excuses; rerun.
- REFACTOR: new excuse appears, add it to the `Excuse | Reality` table, rerun until stable.

## 7. Micro-test wording before full runs

Full scenarios are slow. Check that a specific sentence works first:
1. One fresh-context sample per call. System prompt = the realistic surrounding context (whole skill), user message = a task that tempts the failure.
2. Always include a **no-guidance control**. If the control doesn't fail, there is nothing to fix; don't add the guidance.
3. 5+ reps per variant. Single samples lie.
4. Read every flagged match by hand; automated counts confuse quoted counter-examples with real hits.
5. Variance is a metric: if 5 reps give 5 interpretations, the wording isn't binding. Change the form (see `references/skill-authoring.md` section 6) before adding words.

## 8. Description (trigger) optimisation

Do this after the body is stable.

### Build a trigger eval set (20 queries)
- 8-10 **should-trigger**: different phrasings, formal and casual, cases where the user never names the skill or file type, cases where this skill competes with another and should win.
- 8-10 **should-not-trigger near-misses**: share keywords but need something else. "Write a fibonacci function" as a negative for a PDF skill tests nothing.
- Realistic detail: paths, column names, company names, typos, lowercase.

```json
[{"query": "ok so my boss sent 'Q4 sales final FINAL v2.xlsx' and wants a profit margin % column, revenue is col C and costs col D i think", "should_trigger": true},
 {"query": "convert this csv to json for my API fixture", "should_trigger": false}]
```

Review the set with the user before running: bad queries produce bad descriptions.

### Run the loop (Claude Code only; needs the `claude` CLI)

```bash
cd scripts/skill-creator
python3 -m scripts.run_loop \
  --eval-set /abs/path/trigger-evals.json \
  --skill-path /abs/path/my-skill \
  --model <model-id-of-this-session> \
  --max-iterations 5 --verbose
```

- Splits 60% train / 40% held-out test, runs each query 3 times, proposes better descriptions from failures, and picks `best_description` by **test** score (avoids overfitting).
- Run it in the background and report progress per iteration.
- Apply `best_description` to the frontmatter; show before/after with scores.

## 9. Blind comparison (optional)

To answer "is v2 actually better?", give both outputs to a fresh agent without labels, ask which is better and why, then analyse what made the winner win. Needs subagents.

## Common rationalisations

| Excuse | Reality |
|---|---|
| "The skill is obviously clear" | Clear to you is not clear to another agent. Run it. |
| "It's just a reference" | References have gaps. Test retrieval. |
| "I'll test if problems come up" | Problems mean agents already failed with it. |
| "Batching several skills then testing is faster" | Test each before writing the next. |
| "Academic review is enough" | Reading is not using. Run application scenarios. |
