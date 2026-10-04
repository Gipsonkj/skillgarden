# Serving: vLLM, SGLang, llama-server and OpenAI-compatible endpoints

> Distilled from: vllm-deploy-simple and its quickstart script (vllm-project/vllm-skills, Apache-2.0); gguf-quantization advanced usage (Orchestra-Research/AI-Research-SKILLs, MIT); evaluating-llms-harness api-evaluation reference (Orchestra-Research/AI-Research-SKILLs, MIT); hf-cli (huggingface/skills, Apache-2.0); unsloth-buddy (TYH-labs/unsloth-buddy, MIT); modal web-endpoints reference (K-Dense-AI/scientific-agent-skills, Apache-2.0); runpod golden paths (runpod/runpod-plugins-official, Apache-2.0).

Serving means many requests, often from other machines. The goal is an **OpenAI-compatible endpoint** so every client, agent framework and eval tool works by changing a base URL.

## 1. Pick the server

| Server | Use when | Format | Default port |
|---|---|---|---|
| **vLLM** | Throughput: continuous batching, paged KV cache, tensor parallel across GPUs; the default for GPU serving | safetensors, AWQ, GPTQ | 8000 |
| **SGLang** | Alternative high-throughput GPU server; Unsloth and HF Endpoints both offer it | safetensors | check its docs |
| **llama-server** (llama.cpp) | One box, GGUF, CPU or Mac, light concurrency | GGUF | 8080 |
| **Ollama** | Development and small teams; not multi-tenant production | GGUF | 11434 |
| **TGI** (Hugging Face) | Docker-first serving | safetensors | per your `-p` mapping |
| **HF Inference Endpoints** | Managed, no server to run; scale to zero | Hub repos | managed URL |

Rule of thumb: Mac or CPU → llama-server; one NVIDIA GPU and real traffic → vLLM; no ops → a managed endpoint (HF Endpoints, RunPod serverless, Modal; see [gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md)).

## 2. vLLM

Install in a virtual environment (Python 3.10+; prefer uv):

```bash
uv venv --python 3.12 && source .venv/bin/activate
uv pip install vllm openai            # TPU uses the vllm-tpu package instead
vllm serve Qwen/Qwen2.5-1.5B-Instruct --port 8000 --max-model-len 8192 --gpu-memory-utilization 0.8
```

Or let the bundled script do install, start, wait and test, with logs and a PID file under `<venv>/tmp/`:

```bash
scripts/vllm-deploy-simple/quickstart.sh --venv .venv --model Qwen/Qwen2.5-1.5B-Instruct --port 8000 --gpu_memory_utilization 0.8
scripts/vllm-deploy-simple/quickstart.sh status | test | stop | restart
```

It detects CUDA, ROCm, TPU or CPU, uses uv if present, installs `vllm` (so ask before running it on the user's machine) and **binds to 0.0.0.0**, which exposes the server to the network; on a shared or public machine, put it behind a firewall or auth first. It only talks to localhost for its tests.

| Flag | Why |
|---|---|
| `--max-model-len` | Caps context and so the KV cache; the most common out-of-memory fix |
| `--gpu-memory-utilization` | Fraction of GPU memory vLLM claims (default 0.9); lower it if other processes share the GPU |
| `--tensor-parallel-size N` | Split one model across N GPUs on one machine (e.g. 70B fp16 on 2×80 GB) |
| `--dtype auto` | Use the checkpoint's dtype |
| `--host`, `--port` | Bind; keep `127.0.0.1` unless something in front authenticates |

Endpoints: `GET /health` (readiness), `GET /v1/models`, `POST /v1/chat/completions`, `POST /v1/completions`. First run downloads the model into the Hugging Face cache; set `HF_TOKEN` for gated repos. vLLM also runs offline in Python (`LLM(model=...).generate(...)`) for batch jobs.

Out of memory: a smaller model, lower `--max-model-len`, lower `--gpu-memory-utilization`, close other GPU processes, or a quantized (AWQ/GPTQ) checkpoint. Model not supported: check vLLM's supported-models list; fall back to transformers or TGI.

## 3. SGLang and llama-server

```bash
python -m sglang.launch_server --model-path ./merged-model          # SGLang, e.g. after merging a fine-tune
llama-server -m model-Q4_K_M.gguf -ngl 99 -c 4096 --parallel 4 --cont-batching --port 8080
```

With llama-server, the context is shared across `--parallel` slots: size `-c` for the total.

## 4. Managed: Hugging Face Inference Endpoints

```bash
hf endpoints catalog list --engine vllm --accelerator gpu --search qwen     # engines: llamacpp, sglang, tei, vllm
hf endpoints catalog deploy --repo <org>/<model> --name my-endpoint
hf endpoints hardware                                                         # instance options
hf endpoints describe my-endpoint                                             # URL and status
hf endpoints scale-to-zero my-endpoint | pause | resume | delete
```

`hf endpoints deploy NAME --repo ... --framework ... --accelerator ... --instance-size ... --instance-type ... --region ... --vendor ...` deploys any Hub repo. It is billed while running: scale to zero or pause when idle, and confirm before `delete` (permanent).

## 5. Calling any of them

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="unused-locally")
r = client.chat.completions.create(model="Qwen/Qwen2.5-1.5B-Instruct",
        messages=[{"role": "user", "content": "Say hello."}], max_tokens=50)
print(r.choices[0].message.content)
```

| Server | `base_url` | `model` value |
|---|---|---|
| vLLM | `http://localhost:8000/v1` | The served repo id (see `/v1/models`) |
| llama-server | `http://localhost:8080/v1` | Any string (one model loaded) |
| Ollama | `http://localhost:11434/v1` | The Ollama tag, e.g. `qwen3:8b` |
| RunPod serverless vLLM worker | `https://api.runpod.ai/v2/<endpoint-id>/openai/v1` | The repo id; `Authorization: Bearer $RUNPOD_API_KEY` |
| Modal web server | Your `*.modal.run` URL + `/v1` | The repo id; proxy-auth headers |

Keep the URL, model name and key in environment variables so the same code runs against local, hosted and paid endpoints ([agents-and-tools.md](agents-and-tools.md)).

## 6. Exposing a server safely

- Local servers have no auth by default (Ollama, llama-server, a bare vLLM). Bind to `127.0.0.1`; reach a remote box over SSH port forwarding (`ssh -L 8000:localhost:8000 user@host`) or a VPN.
- Public URLs (RunPod proxy, Modal, a cloud VM) need auth in front: Modal's `requires_proxy_auth=True`, RunPod serverless keys, or a reverse proxy that checks a bearer token. A RunPod pod proxy URL is public and Ollama has no auth: warn the user.
- Keys come from environment variables or the platform's secret store, never from code, CLI flags or chat.
- `--trust-remote-code` runs Python from the model repo. Read the repo's `.py` files first, or pick a model that doesn't need it.
- Never route prompts or user data through an unofficial relay or "free endpoint" you found online.

## 7. Verify before you hand it over

"Running" is not "ready". From **outside** the server, in order:

1. `GET /health` (vLLM) or `/v1/models` returns 200; poll with a bounded loop on first start, since model load can take minutes.
2. One short chat completion returns sensible text with the right chat template.
3. Under expected concurrency, measure tokens per second and time to first token ([evaluation.md](evaluation.md), section 6).
4. Record the model revision, quant, server version and flags.

## Pitfalls

| Pitfall | Fix |
|---|---|
| Server binds 0.0.0.0 on a laptop or shared box | `--host 127.0.0.1`, or a firewall and auth |
| Default context left at the model's maximum | `--max-model-len` to what the app needs |
| Gated repo fails at start | `HF_TOKEN` set in the server's environment |
| Model name mismatch in requests | Use the id from `/v1/models` |
| Ollama under production load | vLLM or a managed endpoint |
| Paid endpoint left running | Scale to zero, pause or delete; put it on the teardown list |

## Checklist

- [ ] Server matches hardware and traffic
- [ ] Context and memory flags set; fits with headroom
- [ ] Bound privately or authenticated; keys in env
- [ ] Health, a real completion and a load check pass from outside
- [ ] Versions and flags recorded; teardown planned for paid hosts
