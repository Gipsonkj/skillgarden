# Evaluating agents and MCP servers

> Distilled from: evaluation (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), mcp-builder evaluation guide and harness (anthropics/skills, Apache-2.0), google-agents-cli-eval (google/agents-cli, Apache-2.0), launch-your-agent (anthropics/launch-your-agent, Apache-2.0)

Agents are non-deterministic and take different valid paths. Grade **outcomes**, not step sequences; run deterministic checks before any LLM judge; and keep a held-back set so you can tell real fixes from overfitting.

## 1. Build the eval set

- Start with 20–30 cases from real usage; grow to 50+ for a reliable signal. A brand-new agent can start with 1–3 cases with known-good answers.
- No past cases? The first verified output becomes case 1. Save it.
- Stratify by difficulty and report per stratum: **simple** (1 tool call), **medium** (several calls, comparison), **complex** (many calls, ambiguity), **very complex** (long interaction, synthesis).
- Include edge cases: empty results, not-found IDs, huge lists, ambiguous requests, injection attempts in fetched content.
- **Hold back** 20–30% of cases. Iterate only on the rest; grade the held-back set when you think you're done.

Case shape:
```json
{"id": "c07", "input": "Compare Q3 revenue for ACME and Globex",
 "expected": {"answer_contains": ["ACME", "Globex"], "must_call": ["get_financials"]},
 "rubric": ["Both figures cited with source", "States which is higher", "No invented numbers"],
 "complexity": "medium"}
```

## 2. Grade in layers

1. **Deterministic gates first** (fail fast, no tokens): output parses, schema valid, required files exist, no duplicate IDs, end state matches (DB row created, file written). A favourable LLM score can never launder a failed gate.
2. **Rubric scoring**: 3–6 binary or 0–1 criteria per case, scored separately. Typical dimensions: factual accuracy, completeness, grounding/citations, tool efficiency, format, safety.
3. **LLM judge** for the fuzzy criteria: give it the task, the output, the reference (if any), the rubric with level descriptions, and ask for a verdict + reason per criterion. Prefer a different model family from the agent to reduce self-preference.
4. **Human review** on a sample and on every disagreement between judge and gate.

Thresholds: overall pass ≥0.7 for general use, ≥0.9 for high-stakes. Store per-dimension scores, not just the average.

## 3. What to look at when it fails

| Failure | Change first |
|---|---|
| Goal not reached | Orchestration: missing tool, premature stop, wrong tool order |
| Reaches goal inefficiently | Planning instructions, remove redundant calls, lower effort |
| Wrong tool / bad arguments | Tool descriptions and schemas (tool-design.md) |
| Hallucinated facts | "Only from tool results" rule; verify the tool returned what was claimed |
| Bad final answer quality | The worst-scoring rubric criterion in the instructions |
| Safety violation | Guardrails in instructions **and** tool permissions |
| Flaky | Lower randomness, tighter instructions, rubric metrics; keep the case |

Change **one thing** per iteration, re-run, and compare against the previous results file. Keep a log of fixes tried so you don't repeat them. Expect several rounds.

Anti-shortcuts: don't lower the bar to pass, don't delete flaky cases, don't keep rewriting expected answers (that's an agent problem), don't iterate on every case you have.

## 4. Budgets and baselines

- Run evals at production-realistic token and tool budgets, not unlimited.
- Token use, number of tool calls and model choice explain most score variance in browsing-agent research: compare "better model, same budget" against "same model, bigger budget".
- Any multi-agent design must beat a single-agent baseline on the same set to justify its cost.
- Track cost per **completed task**, not per request.

## 5. Production monitoring

- Sample live traffic into the same rubric; alert at pass rate <0.85 (warning) and <0.70 (critical).
- Turn real failures into new eval cases (trace → dataset).
- Re-run the full set before promoting any new prompt, tool or model version.

## 6. MCP server evaluation (10 questions)

Purpose: can a model with **only** your server answer realistic, hard questions?

Write 10 questions that are:
- **Independent** of each other; **read-only** (no writes needed); **stable** (answers won't change: use closed projects, past date windows; never "how many reactions now").
- **Hard**: multi-hop, often dozens of tool calls, paging, older data; not solvable by one keyword search (paraphrase, don't copy words from the target).
- **Verifiable by string match**: one value (name, ID, date, number, True/False, A/B/C/D). State the format in the question ("Answer YYYY/MM/DD").
- Mostly human-readable answers; diverse types (users, dates, files, URLs).

Process: read the API docs → list the server's tools (don't read its code) → explore real data read-only → draft questions → solve each yourself with the tools to confirm the answer.

File format:
```xml
<evaluation>
  <qa_pair>
    <question>Which user closed the most issues labelled "bug" in March 2024? Give the username.</question>
    <answer>sarah_dev</answer>
  </qa_pair>
</evaluation>
```
See `scripts/mcp-builder/example_evaluation.xml`.

### Run the harness

`scripts/mcp-builder/evaluation.py` connects to your server, lets Claude answer each question with the tools, compares answers, and collects the model's per-tool feedback.

```bash
pip install -r scripts/mcp-builder/requirements.txt     # anthropic, mcp
export ANTHROPIC_API_KEY=...                            # or an active `ant auth login` profile
# stdio: the script launches the server itself
python scripts/mcp-builder/evaluation.py -t stdio -c python -a my_server.py \
  -e API_KEY=... -m claude-opus-5-5 -o report.md eval.xml
# streamable HTTP: start the server first
python scripts/mcp-builder/evaluation.py -t http -u http://localhost:3000/mcp \
  -H "Authorization: Bearer $TOKEN" -m claude-opus-5-5 -o report.md eval.xml
```
Always pass `-m` with a current model ID: the script's built-in default is an old model. Read the `<feedback>` sections in the report and fix tool names, descriptions and output size before adding more tools.

## 7. Platform eval tooling

- **Claude Managed Agents**: an Outcome (task + rubric, `max_iterations` default 3, max 20) has a separate grader iterate the agent until the rubric passes; results `satisfied`, `needs_revision`, `max_iterations_reached`, `failed`. Re-run held-back cases (one session each, same pinned agent version) before promoting a version.
- **Google ADK / agents-cli**: `agents-cli eval run` (generate + grade), `eval compare old.json new.json`; multi-turn metrics `multi_turn_task_success`, `multi_turn_trajectory_quality`, `multi_turn_tool_use_quality`; per-case `rubric_groups`; `eval analyze` clusters 10+ failures; prompt optimisation (`eval optimize`) is slow and costly, run only on request.
- **Microsoft Foundry**: the `observe` workflow (batch evals, continuous evaluation, trace-to-dataset).
- **Mastra**: traces + scores via Studio and `mastra api`.

## 8. Done checklist

- [ ] ≥20 cases (or 1–3 golden cases for a v0), stratified, with held-back slice
- [ ] Deterministic gates run before any judge
- [ ] Rubric dimensions scored and stored separately
- [ ] Baseline recorded; every change compared against it
- [ ] Held-back set passes at the agreed threshold
