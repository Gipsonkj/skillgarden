# Evaluating open models: benchmarks, task evals, fine-tune checks, speed

> Distilled from: evaluating-llms-harness and its api-evaluation, benchmark-guide and custom-tasks references (Orchestra-Research/AI-Research-SKILLs, MIT); huggingface-community-evals and its scripts (huggingface/skills, Apache-2.0); huggingface-llm-trainer hf_benchmarks reference (huggingface/skills, Apache-2.0); gguf-quantization (Orchestra-Research/AI-Research-SKILLs, MIT); ollama api reference (ericrisco/rsc-harness, MIT). Timings are the sources' examples on one GPU: yours will differ.

Two different questions: **"Is this model generally capable?"** (public benchmarks) and **"Does it do my job well enough?"** (your own task eval). The second decides. Public scores pick candidates; your eval picks the winner.

## 1. Order of work

1. Write 20-200 real examples of the job with expected answers or a grading rule. Keep them out of any training data.
2. Score the current option (paid API or base model) on them: that's the bar.
3. **Smoke test** every run first: `--limit 10` (lm-eval, inspect) or `--max-samples 10` (lighteval). Fix template and parsing errors at this size, not after two hours.
4. Run candidates under the **same** settings; compare against the bar.
5. Re-run after any change that matters: quantization, fine-tune, merge, runtime switch.

## 2. lm-evaluation-harness

```bash
pip install lm-eval                    # or uv pip install lm-eval; add vllm for the vLLM backend
lm_eval --tasks list                   # task names
lm_eval --model hf \
  --model_args pretrained=<org>/<model>,dtype=bfloat16 \
  --tasks mmlu,gsm8k,hellaswag,arc_challenge,truthfulqa \
  --num_fewshot 5 --batch_size auto \
  --output_path results/ --log_samples --limit 10      # drop --limit after the smoke test
```

- **vLLM backend** is 5-10x faster: `--model vllm --model_args pretrained=<id>,tensor_parallel_size=1,dtype=auto,gpu_memory_utilization=0.8`. Source example: MMLU on a 7B model ~2 hours with `hf`, ~15-20 minutes with vLLM.
- Quick checks from the source: HellaSwag ~10 min, GSM8K ~5 min, PIQA ~2 min on one GPU; full MMLU (57 subjects) ~2 hours with `hf`.
- `--log_samples` saves every prompt and answer: read some. A score is only as good as its parsing.

**Against a running server** (Ollama, llama-server, vLLM, TGI): `--model local-completions --model_args model=<name>,base_url=<url>,num_concurrent=1`.

| Server | `base_url` |
|---|---|
| vLLM | `http://localhost:8000/v1` |
| llama-server | `http://localhost:8080/v1` |
| Ollama | `http://localhost:11434/v1` |

Endpoints without log-probabilities (most chat endpoints) can only run `generate_until` tasks (GSM8K-style), not multiple-choice loglikelihood tasks like MMLU or HellaSwag. Paid API backends exist too; only send benchmark or synthetic data to them, never private data the user hasn't cleared.

### Your own task

```yaml
# my_tasks/support_triage.yaml
task: support_triage
dataset_path: data/eval.jsonl                 # local file or a Hub dataset id
output_type: generate_until
doc_to_text: "Ticket: {{ticket}}\nCategory:"
doc_to_target: "{{category}}"
metric_list:
  - metric: exact_match
    aggregation: mean
    higher_is_better: true
```

`lm_eval --model ... --tasks support_triage --include_path my_tasks/`. If a local file fails to load, check the harness's custom-task docs for your version (split names, `dataset_kwargs`). Open-ended answers need a rubric or a judge model; agent-style evals (multi-step, tools) belong to the `ai-agents` craft's evaluation guide.

## 3. inspect-ai and lighteval (bundled scripts)

Both run a Hub model on your GPU with vLLM, falling back to transformers or accelerate. They need `uv`, `HF_TOKEN` for gated models, and a working `nvidia-smi`.

```bash
uv run scripts/huggingface-community-evals/inspect_vllm_uv.py --model <org>/<model> --task gsm8k --limit 20
uv run scripts/huggingface-community-evals/inspect_vllm_uv.py --model <org>/<model> --task mmlu --backend hf --limit 20
uv run scripts/huggingface-community-evals/lighteval_vllm_uv.py --model <org>/<model> \
  --tasks "leaderboard|mmlu|5,leaderboard|gsm8k|5" --max-samples 20 --use-chat-template
uv run scripts/huggingface-community-evals/lighteval_vllm_uv.py --model <org>/<model> \
  --tasks "leaderboard|mmlu|5" --backend accelerate --max-samples 20
```

Use inspect for explicit task control (`inspect-evals` tasks), lighteval for leaderboard-style task strings. Add `--tensor-parallel-size N` for multi-GPU. Avoid `--trust-remote-code` unless you have read the repo's code. The upstream skill also has a provider-backed inspect script that sends prompts to third-party inference providers; it isn't bundled here.

Published leaderboard numbers for a candidate: `uv run scripts/huggingface-llm-trainer/hf_benchmarks.py search --query "<benchmark>"` and `... leaderboard <ns/repo> --top 10` (see [choosing-models-and-licences.md](choosing-models-and-licences.md)).

## 4. Fair comparisons

- Same few-shot count, chat template setting, prompt, decoding (temperature 0 for scoring), context and max tokens for every model.
- Compare the **artefact you'll ship**: the exact quant and runtime, not the bf16 original.
- Read the reported stderr (`acc_stderr` and similar). Two models within a couple of stderr of each other are tied. For proper significance testing and confidence intervals, hand off to `data-analysis` (`statistics.md`).
- Benchmarks leak into training data. A small model that beats much bigger ones everywhere is a contamination warning; trust your private task set more.
- Record model id and revision, quant, runtime and version, flags, harness version, date.

## 5. Checking quantization and fine-tunes

- **Quantization:** `llama-perplexity` on the same text for each quant (lower is better; compare only within one model) plus your task eval. A quant is fine when task scores stay within noise of the higher-precision version ([quantization.md](quantization.md)).
- **Fine-tune:** score base and fine-tune on the held-out task set (gain) **and** on a few general benchmarks such as MMLU or GSM8K with `--limit` (regression). A big task gain with a collapse elsewhere usually means overfitting or a template mismatch ([fine-tuning.md](fine-tuning.md)).
- Re-score after merge and export: the shipped GGUF or merged model, not the training checkpoint.

## 6. Speed: throughput and latency

Quality first, then check it's fast enough on the real hardware with the real context.

| Measure | How |
|---|---|
| Generation speed (tokens/s, one request) | Ollama: `eval_count / (eval_duration / 1e9)` from the final response; llama.cpp prints timings per request |
| Prompt processing speed | Ollama: `prompt_eval_count / (prompt_eval_duration / 1e9)`; matters most for long prompts and RAG |
| Time to first token | Stream a request and time the first chunk (client side) |
| Throughput under load | Fire N concurrent realistic requests at the server; total output tokens ÷ wall time; watch time to first token grow |
| Memory at peak | `nvidia-smi` or Activity Monitor during the longest expected prompt |

- Test with prompts as long as production ones; short prompts flatter everything.
- Warm up first: the first request includes model load.
- Ollama and llama-server slow down sharply when layers spill to CPU: check `ollama ps` or the load log.
- If throughput is short: vLLM instead of Ollama, a smaller quant or model, `--max-model-len` lower, more GPUs ([serving-endpoints.md](serving-endpoints.md)).

## Checklist

- [ ] Private task set with a grading rule; baseline scored
- [ ] Smoke test passed before full runs
- [ ] Same settings for all candidates; the shipped artefact evaluated
- [ ] Differences checked against stderr; contamination considered
- [ ] Fine-tune checked for gain and regression
- [ ] Speed measured with realistic prompts and concurrency
- [ ] Results recorded with versions and flags
