# Evaluating agents and MCP servers

> Distilled from: evaluation (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), mcp-builder evaluation guide and harness (anthropics/skills, Apache-2.0), google-agents-cli-eval (google/agents-cli, Apache-2.0), launch-your-agent (anthropics/launch-your-agent, Apache-2.0); LangSmith and Langfuse sections written from their official docs (see CREDITS.md)

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

## 7. Platform eval and tracing tools

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| The team already logs into or pays for one (LangSmith, Langfuse, Foundry, ...) | That one | Traces, datasets and history are already there |
| Unsure which one the team uses | Ask the user | Never create an account or project for them |
| LangChain / LangGraph / Deep Agents stack | LangSmith | Same vendor; env-var tracing, datasets, experiments |
| Open source, self-hosted, or data must stay in your own infra; any framework | Langfuse | MIT core, self-hostable, 100+ integrations and OpenTelemetry support |
| OpenAI Agents SDK, no extra account | Its built-in tracing (OpenAI Traces dashboard) | On by default (frameworks.md) |
| Microsoft Agent Framework, local and free | OpenTelemetry → Aspire Dashboard container | Built-in OTel spans (frameworks.md) |
| Google ADK | `agents-cli eval` | Below |
| Microsoft Foundry | Its `observe` workflow | Below |
| Mastra | Studio + `mastra api` | Below |
| Claude Managed Agents | Outcomes | Below |
| Copilot Studio | Its built-in Evaluations | Test sets and graders (frameworks.md) |
| No account at all | A JSON case file, a results file per run, and the MCP harness in section 6 | Free, diffable in Git |

Traces hold prompts, tool arguments and outputs: never put secrets in them, and turn off sensitive-data capture where personal data flows through the agent.

### Framework-native tooling

- **Claude Managed Agents**: an Outcome (task + rubric, `max_iterations` default 3, max 20) has a separate grader iterate the agent until the rubric passes; results `satisfied`, `needs_revision`, `max_iterations_reached`, `failed`. Re-run held-back cases (one session each, same pinned agent version) before promoting a version.
- **Google ADK / agents-cli**: `agents-cli eval run` (generate + grade), `eval compare old.json new.json`; multi-turn metrics `multi_turn_task_success`, `multi_turn_trajectory_quality`, `multi_turn_tool_use_quality`; per-case `rubric_groups`; `eval analyze` clusters 10+ failures; prompt optimisation (`eval optimize`) is slow and costly, run only on request.
- **Microsoft Foundry**: the `observe` workflow (batch evals, continuous evaluation, trace-to-dataset).
- **Mastra**: traces + scores via Studio and `mastra api`.

### LangSmith

LangChain's hosted platform for tracing, datasets, experiments and prompt management; it also traces non-LangChain code.

- **Auth**: create a key at smith.langchain.com → Settings → API Keys (personal access token for your own scripts, service key for production; shown once). Set `LANGSMITH_API_KEY` and `LANGSMITH_TRACING=true` in the environment; `LANGSMITH_PROJECT` names the project (default `default`); `LANGSMITH_WORKSPACE_ID` when the key spans workspaces; `LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com` for the EU region (default `https://api.smith.langchain.com`).
- **Trace**: for `wrap_openai` and `@traceable`, nothing is logged unless `LANGSMITH_TRACING=true`. Plain code: `wrap_openai(openai.Client())` from `langsmith.wrappers`, and `@traceable(name="...")` on your own functions. OpenAI Agents SDK: `pip install "langsmith[openai-agents]"`, then `set_trace_processors([OpenAIAgentsTracingProcessor()])` (import from `langsmith.integrations.openai_agents_sdk`); this replaces the SDK's default OpenAI exporter, and the processor posts traces as soon as it is installed, even when `LANGSMITH_TRACING` is not set.
- **Evaluate**: `pip install -U langsmith`; datasets hold examples with `inputs` and `outputs`; a code evaluator takes `inputs`, `outputs`, `reference_outputs` and may return a bool.

```python
from langsmith import Client
client = Client()
ds = client.create_dataset(dataset_name="triage-v0", description="Support tickets")
client.create_examples(dataset_id=ds.id, examples=[
    {"inputs": {"ticket": "Charged twice for order 812"}, "outputs": {"route": "billing"}},
])
def routed_right(inputs: dict, outputs: dict, reference_outputs: dict) -> bool:
    return outputs["route"] == reference_outputs["route"]
results = client.evaluate(run_triage, data="triage-v0", evaluators=[routed_right],
                          experiment_prefix="triage-prompt-v2", max_concurrency=2)
```
Keep the held-back cases in a second dataset and evaluate it only at the end.
- **MCP** (to read traces, datasets and experiments from Claude): hosted at `https://api.smith.langchain.com/mcp`, or run locally with `uvx langsmith-mcp-server` and `LANGSMITH_API_KEY` in the environment. Tools include `fetch_runs`, `list_projects`, `get_thread_history`, `list_datasets`, `list_examples`, `list_experiments`, `list_prompts`.
- **Plans** (langchain.com/pricing today): Developer free for 1 seat with up to 5k base traces a month; Plus $39 per seat a month with up to 10k base traces, then pay as you go; base traces are kept 14 days, extended traces 180 days at extra cost. Self-hosted and hybrid are Enterprise options.

### Langfuse

Open-source LLM engineering platform: tracing, prompt management, datasets, experiments, LLM-as-judge and human annotation. Use Langfuse Cloud or self-host.

- **Auth**: project keys `LANGFUSE_PUBLIC_KEY` (`pk-lf-...`) and `LANGFUSE_SECRET_KEY` (`sk-lf-...`) plus `LANGFUSE_BASE_URL`: `https://cloud.langfuse.com` (EU, default), `https://us.cloud.langfuse.com`, `https://jp.cloud.langfuse.com`, `https://hipaa.cloud.langfuse.com`, or your own host. In code `langfuse = get_client()`, check with `langfuse.auth_check()`, and call `langfuse.flush()` before a script exits or the last spans are lost.
- **Trace the OpenAI Agents SDK**: `pip install openai-agents langfuse nest_asyncio openinference-instrumentation-openai-agents`, then before running agents:
  ```python
  import nest_asyncio
  nest_asyncio.apply()
  from openinference.instrumentation.openai_agents import OpenAIAgentsInstrumentor
  from langfuse import get_client
  OpenAIAgentsInstrumentor().instrument()
  langfuse = get_client()
  assert langfuse.auth_check()
  ```
  **Microsoft Agent Framework**: `get_client()`, then `enable_instrumentation(enable_sensitive_data=False)` from `agent_framework.observability`.
- **Datasets**: `langfuse.create_dataset(name="triage-v0")`; `langfuse.create_dataset_item(dataset_name="triage-v0", input={...}, expected_output={...}, metadata={"split": "held_back"})`. Pass `source_trace_id=` to turn a failing production trace into a case.
- **Experiments**: tasks take `*, item, **kwargs` (local data is a list of dicts with `input` and `expected_output`, read as `item["input"]`; dataset items are objects, read as `item.input`). Evaluators take `*, input, output, expected_output, metadata, **kwargs` and return `Evaluation(name=..., value=..., comment=...)` (`from langfuse import Evaluation`); their results land as scores on the traces.
  ```python
  def routed_right(*, input, output, expected_output, metadata, **kwargs):
      return Evaluation(name="route", value=float(output == expected_output))
  result = langfuse.run_experiment(name="triage-prompt-v2", data=cases,
                                   task=run_case, evaluators=[routed_right], max_concurrency=4)
  print(result.format())
  ```
  For a stored dataset: `langfuse.get_dataset("triage-v0").run_experiment(name=..., task=...)`.
- **Scores from your own checks**: `langfuse.create_score(name="gate_passed", value=1, trace_id=..., data_type="BOOLEAN")`; data types `NUMERIC`, `CATEGORICAL`, `BOOLEAN`, `TEXT`.
- **MCP**: `https://cloud.langfuse.com/api/public/mcp` (or the region / self-hosted host + `/api/public/mcp`), Streamable HTTP, Basic auth with base64 of `public_key:secret_key`. Build the header from env vars, never paste keys into chat, and register it in your user config, not a committed `.mcp.json`:
  ```bash
  claude mcp add --transport http langfuse https://cloud.langfuse.com/api/public/mcp \
    --header "Authorization: Basic $(printf '%s:%s' "$LANGFUSE_PUBLIC_KEY" "$LANGFUSE_SECRET_KEY" | base64)"
  ```
  Read **and write** tools are on by default (including prompt management): changing a production prompt label is a deploy, so show the change and wait for a yes.
- **Plans** (langfuse.com/pricing today): Hobby free with 50k units a month and 30 days of data access; Core $29 a month (100k units, 90 days); Pro $199 a month; extra usage from $8 per 100k units. **Self-host**: code outside the `ee/` folders is MIT; it needs Postgres, ClickHouse, Redis or Valkey, and S3-compatible storage; Docker Compose for trying it, Kubernetes (Helm) for production.

## 8. Done checklist

- [ ] ≥20 cases (or 1–3 golden cases for a v0), stratified, with held-back slice
- [ ] Deterministic gates run before any judge
- [ ] Rubric dimensions scored and stored separately
- [ ] Baseline recorded; every change compared against it
- [ ] Held-back set passes at the agreed threshold
