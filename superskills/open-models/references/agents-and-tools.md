# Open models in agents and tools

> Distilled from: ollama and its api reference (ericrisco/rsc-harness, MIT); open-weights (ericrisco/rsc-harness, MIT); huggingface-local-models hub-discovery reference (huggingface/skills, Apache-2.0); swift-mlx-lm (ml-explore/mlx-swift-lm, MIT); evaluating-llms-harness api-evaluation reference (Orchestra-Research/AI-Research-SKILLs, MIT); runpod (runpod/runpod-plugins-official, Apache-2.0); modal web-endpoints and sandbox references (K-Dense-AI/scientific-agent-skills, Apache-2.0).

This guide wires a local or self-hosted model into code that already talks to an LLM: agent frameworks, coding tools, scripts, RAG. How to design the agent and its tools is the `ai-agents` craft (`frameworks.md`, `tool-design.md`, `evaluation.md`); this guide covers the model end of the wire.

## 1. Swap the base URL

Nearly every runtime speaks the OpenAI Chat Completions shape, so most code needs three settings changed, not a rewrite.

| Running | `base_url` | `api_key` | `model` |
|---|---|---|---|
| Ollama | `http://localhost:11434/v1` | Any non-empty string (ignored) | Ollama tag, e.g. `qwen3:8b` |
| llama-server | `http://localhost:8080/v1` | Any string unless you set one | Any string |
| vLLM | `http://localhost:8000/v1` | Any string unless you set one | Repo id from `/v1/models` |
| LM Studio | Its local server URL (see the app) | Any string | As shown in the app |
| RunPod serverless vLLM | `https://api.runpod.ai/v2/<endpoint-id>/openai/v1` | `RUNPOD_API_KEY` | Repo id |
| Modal web server | `https://<your-app>.modal.run/v1` | Proxy-auth headers | Repo id |

Keep all three in environment variables (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`), read once at start-up, so the same code runs against a laptop, a GPU host and a paid API. Never hard-code keys; never commit a `.env`.

Native APIs still matter for knobs the OpenAI layer doesn't carry: Ollama's `keep_alive`, `format` as a JSON Schema, and `think` need `/api/chat` ([local-inference.md](local-inference.md)).

## 2. Tool calling

Ollama native, one round:

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:8b", "stream": false,
  "messages": [{"role": "user", "content": "Weather in Andorra?"}],
  "tools": [{"type": "function", "function": {
    "name": "get_weather", "description": "Current weather for a city",
    "parameters": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}}}]
}'
```

If the reply has `message.tool_calls`, run the tool, append the assistant message and `{"role": "tool", "content": "<result>"}`, and call again. Through `/v1` the OpenAI SDK's `tools=` parameter works the same way on servers that support it.

- **The model must be trained for tools.** Check the model card and the template (`ollama show <model>`); pick an instruct model that lists tool use.
- **llama-server** uses the model's own chat template when started with `--jinja`, which tool calling generally relies on; the Hub's "Use this model" snippet includes it when needed. Check the llama.cpp docs for your build.
- **Small models are weaker at tools**: wrong tool, malformed arguments, invented tools, loops. Keep the tool list short, descriptions plain, arguments few and typed; validate every call's arguments before running anything; cap the number of steps.
- **Test before you trust.** Run the agent's own eval set against the local model and against the current paid model, and compare success rates. The open-weights source's rule: if a smaller model clears your bar, it's cheaper, faster and fits more hardware, but prove it first. Agent eval design: `ai-agents` (`evaluation.md`).
- In Swift apps, mlx-swift-lm has its own tool-call handling (see its original skill).

## 3. Structured output

| Runtime | How |
|---|---|
| Ollama | `format` = a JSON Schema on `/api/chat`, `temperature: 0`, and say "answer in JSON" in the prompt |
| llama-cpp-python | Grammar-constrained output via `LlamaGrammar` |
| Any server | Validate the JSON against the schema in your code; retry once with the error message; then fail loudly |

Constrained decoding guarantees the shape, not the truth: still check values.

## 4. Context, speed and concurrency

- **Set the context explicitly.** Agents carry long histories and tool results; a default context silently truncates. Ollama: `num_ctx` per request or in a Modelfile; llama-server: `-c`; vLLM: `--max-model-len`. Every token of context costs memory ([vram-and-sizing.md](vram-and-sizing.md)).
- **Keep it loaded.** Ollama unloads after 5 idle minutes by default; set `keep_alive` (or `OLLAMA_KEEP_ALIVE`) for an agent that pauses between steps.
- **Parallel agents** need a server built for it: Ollama's `OLLAMA_NUM_PARALLEL` adds KV cache per slot; for real concurrency use vLLM ([serving-endpoints.md](serving-endpoints.md)). Measure tokens per second and time to first token at the agent's real prompt length ([evaluation.md](evaluation.md), section 6).
- **Reasoning models** spend tokens thinking. Ollama's `think` toggles it on models that support it; budget for it in latency and context.

## 5. Embeddings for RAG, locally

```bash
ollama pull nomic-embed-text
curl http://localhost:11434/api/embed -d '{"model": "nomic-embed-text", "input": ["first chunk", "second chunk"]}'
```

Returns `embeddings` (one float array per input); `/v1/embeddings` serves OpenAI-style clients. Use the same embedding model for indexing and querying; changing it means re-indexing. The retrieval pipeline itself (chunking, stores, ranking) belongs to `ai-agents` (`context-and-memory.md`).

## 6. Hybrid: local plus paid

Common, sensible split:
- **Local** for private data, high-volume simple steps (classify, extract, summarise, embed) and offline use.
- **Paid API** for the hardest reasoning steps, or as a fallback when the local model's output fails validation.

Route by step, not by whim: decide per step in config, log which model answered, and compare quality and cost on the eval set. The break-even maths is in [choosing-models-and-licences.md](choosing-models-and-licences.md).

## 7. Safety

- Local servers have **no auth**. Keep them on `127.0.0.1`; if an agent on another machine needs them, use SSH forwarding, a VPN, or an authenticating proxy.
- A tool-using agent runs code on your machine. Least privilege for every tool; confirm destructive actions; run model-generated code in a sandbox (Modal's `Sandbox` with `block_network=True`, or a container with no network).
- Never send prompts, files or keys to an unofficial "free" endpoint or relay. Use the runtime on your own machine, your own rented GPU, or an official provider.
- `trust_remote_code` and custom model repos execute code: read them first, pin revisions.
- Model files are downloads like any other: get them from the publisher's repo or a well-known quantizer, check the licence, and pin the revision.

## Checklist

- [ ] Base URL, key and model name from env; same code runs local and hosted
- [ ] Model supports tools (if used); arguments validated; step cap set
- [ ] Structured output validated in code
- [ ] Context and keep-alive set for agent workloads
- [ ] Agent eval run on the local model and compared with the current one
- [ ] Server private or authenticated; tools least-privilege; no unofficial hosts
