# GPU hosting: RunPod, Modal, HF Jobs, and what it costs

> Distilled from: runpod and its golden paths 01, 04, 05, 13, 20 (runpod/runpod-plugins-official, Apache-2.0); modal and its gpu, web-endpoints and volumes references (K-Dense-AI/scientific-agent-skills, Apache-2.0); huggingface-llm-trainer and estimate_cost.py (huggingface/skills, Apache-2.0); comfyui (NousResearch/hermes-agent, MIT); diffusers-cli (huggingface/diffusers, Apache-2.0). Prices and CLI versions are as of the sources (mid-2026): check the vendor's pricing page and `--help` before quoting them.

Rent a GPU when the model doesn't fit your machine, when traffic needs a public endpoint, or for a training run. Every paid resource gets a teardown step **before** you create it.

## 1. Pick the shape

| You need | Use | Billing |
|---|---|---|
| A long-lived server at a URL you talk to (Ollama, vLLM, ComfyUI, a dev box) | RunPod **pod** | Per second while it exists, plus volume storage |
| A request/response API that scales to zero | RunPod **serverless** or **Modal** web endpoint | Per second of worker time; ~$0 idle with zero min workers |
| Python you write locally, run on cloud GPUs (batch, training, endpoints) | **Modal** (or RunPod Flash) | Per second of container time |
| A training or eval batch job with results pushed to the Hub | **HF Jobs** (paid HF plan) | Per hour of the flavour |
| A managed model endpoint with no code | HF Inference Endpoints ([serving-endpoints.md](serving-endpoints.md)), RunPod Hub vLLM worker | Per hour while running |

## 2. Cost maths

```text
run_cost   = price_per_hour × hours (include idle and boot time)
per_1M_out = price_per_hour ÷ (tokens_per_second × 3600) × 1,000,000
timeout    = estimated_hours × 1.3                     # 30% buffer for load, save, upload
```

HF Jobs flavours as listed in the source (approximate, per hour): `t4-small` ~$0.75, `t4-medium` ~$1.50, `l4x1` ~$2.50, `a10g-small` ~$3.50, `a10g-large` ~$5, `a10g-largex2` ~$10, `a100-large` ~$10, `a10g-largex4` ~$20. For training time, the source's estimator uses a rough rule: 0.1 h per 1K examples per billion parameters per epoch on an a10g-large (T4 about 2x slower, A100 about 0.7x). Treat it as a first guess and time a short run.

Real data points from the RunPod source runs: a 0.5B vLLM endpoint on an RTX 4090, scaled to zero, cost well under a cent per test call (≈ $0.69 across a day of test runs); a first cold start pulling a ~10 GB worker image took over 20 minutes once and 162 s once warm.

Cost guards, always:
- RunPod pods: `--terminate-after <ISO time>` (deletes the pod). `--stop-after` only stops compute and keeps billing the disk.
- Serverless: `--workers-min 0`; `--workers-max` as the spending ceiling.
- Modal: no `min_containers` unless latency demands it; `scaledown_window` short; `modal app stop` when done.
- HF: scale endpoints to zero or pause; Jobs end on their own but bill until the timeout.
- Finish with a list command (`runpodctl pod list`, `serverless list`, `network-volume list`; `modal app list`) to prove nothing is left running.

## 3. RunPod

**Install and auth** (prefer package managers; RunPod also documents a `curl ... | bash` installer, which this craft doesn't use): `brew install runpod/runpodctl/runpodctl` or a binary from the runpodctl GitHub releases; Flash with `uv tool install runpod-flash`. Auth with `export RUNPOD_API_KEY=...` (one key unlocks runpodctl, Flash and the hosted MCP; MCP OAuth alone leaves the CLIs blocked). Check with `runpodctl user`. The CLI moves fast: trust `runpodctl <resource> <action> --help` over any doc.

### A server on a pod (Ollama, vLLM, ComfyUI)

```bash
runpodctl datacenter list                                   # GPU availability per data centre
runpodctl network-volume create --name models --size 30 --data-center-id <dc>
runpodctl template search pytorch                           # prefer an official template or prebuilt image
runpodctl pod create --name llm --template-id <id> --gpu-id "<gpu>" \
  --ports "11434/http,22/tcp" \
  --env '{"OLLAMA_HOST":"0.0.0.0","OLLAMA_MODELS":"/workspace/ollama"}' \
  --network-volume-id <vol> --volume-mount-path /workspace \
  --terminate-after <ISO-8601 a few hours out>
runpodctl pod get <pod-id>; runpodctl ssh info <pod-id>     # then run commands over ssh
```

Rules learned the hard way (all from verified runs):
- **Ports and env are fixed at creation.** Adding an HTTP port later needs a reset.
- **The pod's `--env` reaches PID 1, not your SSH shell.** Pass env explicitly on the launch: `env OLLAMA_HOST=0.0.0.0 OLLAMA_MODELS=/workspace/ollama ollama serve`. Otherwise the server binds 127.0.0.1 and the proxy returns 502.
- Servers must **bind 0.0.0.0** inside the pod. Detach long-running processes with `setsid ... > /workspace/x.log 2>&1 < /dev/null &` so an SSH drop doesn't kill them.
- Network volumes are **locked to one data centre**: create the pod in the same one. Put models, `HF_HOME` and outputs under `/workspace`; container disk is wiped on stop.
- URL: `https://<pod-id>-<port>.proxy.runpod.net`. HTTPS through Cloudflare with a **~100 s cap** per request: stream long generations. Expect 502 for 30-60 s while the server warms up; poll `/api/tags` or `/health` with a bounded loop.
- The proxy URL is **public** and Ollama has no auth. Tell the user; don't serve private data unprotected.
- Prefer a prebuilt image or template with the server already installed over piping an install script into a shell on the pod.
- Official PyTorch templates keep torch in the system Python: install into that interpreter (PEP 668 needs `--break-system-packages`); a fresh venv won't see torch.

### Serverless vLLM with a cached Hub model

```bash
runpodctl version                                           # --model-reference needs v2.4.0+
runpodctl serverless create --name qwen --hub-id runpod-workers/worker-vllm \
  --gpu-id "NVIDIA GeForce RTX 4090" \
  --model-reference https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct:main
curl -s https://api.runpod.ai/v2/<endpoint-id>/health -H "Authorization: Bearer $RUNPOD_API_KEY"
```

- First call: use async `POST /v2/<id>/run` then poll `/status/<job>`. Sync routes (`/runsync`, `/openai/...`) sit behind the ~100 s edge timeout and return 524 while a cold worker loads the model.
- Warm: `POST /v2/<id>/openai/v1/chat/completions` is a drop-in OpenAI endpoint.
- `/health` can show a ready worker while vLLM is still booting: read worker logs before calling it broken.
- Autoscaling knobs (defaults in the source): `--workers-min 0` (warm workers bill while idle), `--workers-max 3` (set ~20% over peak), `--scale-by requests|delay`, `--scale-threshold 4`, `--idle-timeout 5` s; jobs time out at 600 s by default (`--execution-timeout`).
- Gated models need an `HF_TOKEN` env var on the endpoint. `--model-reference` is GPU only.
- Delete: `runpodctl serverless delete <id>` (and the template if you made one).

Fine-tune on a pod: no ports, detach the run, write adapters to the volume, `--terminate-after` longer than the run, then `runpodctl pod remove`. Training memory is roughly 4x inference for full fine-tuning; LoRA and QLoRA cut that ([vram-and-sizing.md](vram-and-sizing.md)).

## 4. Modal

**Install and auth:** `uv pip install modal`, then reuse an existing profile or `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET`; fall back to `modal setup` (browser). GPU use needs a payment method even with credits.

GPU strings (`gpu="L40S"`, `gpu="H100:2"`, fallback list `gpu=["H100", "A100-80GB", "L40S"]`): T4 16 GB, L4 24 GB, A10 24 GB (max 4 per container), L40S 48 GB (the source's default pick for inference), A100-40GB, A100-80GB, H100 80 GB, H200 141 GB, B200 192 GB, B300 288 GB. `H100` may be upgraded to H200 at no extra cost (`H100!` prevents it).

Serve an OpenAI-compatible vLLM server:

```python
import modal
app = modal.App("vllm-qwen")
image = modal.Image.debian_slim(python_version="3.11").uv_pip_install("vllm==0.21.0")   # pin; check the current release
weights = modal.Volume.from_name("hf-cache", create_if_missing=True)

@app.function(image=image, gpu="L40S", volumes={"/root/.cache/huggingface": weights},
              scaledown_window=300, timeout=3600)
@modal.web_server(port=8000)
def serve():
    import subprocess
    subprocess.Popen(["vllm", "serve", "Qwen/Qwen3-8B", "--max-model-len", "4096",
                      "--host", "0.0.0.0", "--port", "8000"])   # fixed argument list, no user input
```

- `modal serve app.py` for a temporary dev URL with hot reload; `modal deploy app.py` for a permanent one; `modal app stop vllm-qwen` to stop.
- The server must bind `0.0.0.0` inside the container.
- **Protect it:** for FastAPI-style endpoints add `requires_proxy_auth=True` (clients send `Modal-Key` and `Modal-Secret` headers from a proxy token); without it the URL is public.
- Cache weights on a Volume so cold starts don't re-download; `vol.commit()` after writing, `vol.reload()` before reading new files.
- Secrets: `modal secret create hf HF_TOKEN=...` then `secrets=[modal.Secret.from_name("hf")]`. Read only the variables the job needs.
- Scaling: `max_containers` caps spend; `min_containers` keeps warm (billed); `@modal.concurrent(max_inputs=...)` lets one container serve several requests.
- Run untrusted or model-generated code in a `modal.Sandbox` with `block_network=True`, not a normal function.

Training on Modal: request `gpu="A100-80GB"` or `H100:N`, launch `accelerate launch` or `torchrun` with a fixed argument list, and write checkpoints to a Volume.

## 5. Hugging Face Jobs (short)

Paid HF plan required. `hf jobs uv run --flavor a10g-large --timeout 2h --secrets HF_TOKEN <script-url-or-file>`: flags go **before** the script. Default timeout is 30 minutes, too short for training. The machine is wiped at the end: push results to the Hub. Details in [fine-tuning-runners.md](fine-tuning-runners.md).

## 6. Media model servers (ComfyUI, diffusers): infra only

Open image, video and audio models run on the same GPUs, but their recipes live in other crafts: workflows and prompts in `image-creation` (`local-open-models.md`), open video models in `ai-video` (`vendor-apis.md`), Whisper, TTS and MusicGen in `audio-generation` (`local-open-models.md`). This section only gets the server up.

- **ComfyUI:** check GPU, VRAM and disk first (the source's checker treats 6 GB VRAM as the minimum, 8 GB as OK, 12 GB as great, 16 GB RAM as the Mac minimum and 25 GB free disk as required); below that, Comfy Cloud is ComfyUI's own hosted option. Install the CLI with `pipx install comfy-cli` (or `uvx --from comfy-cli comfy`), turn analytics off with `comfy --skip-prompt tracking disable`, install with `comfy --skip-prompt install --nvidia` (or `--amd`, `--m-series`, `--cpu`), start with `comfy launch --background` (port 8188), health check `curl -s http://127.0.0.1:8188/system_stats`. `comfy launch -- --listen 0.0.0.0` exposes it: only behind auth. On RunPod use the official ComfyUI template instead of installing.
- **diffusers:** `diffusers-cli env` prints torch, CUDA and GPU info; `diffusers-cli schema <repo>` shows a pipeline's inputs without downloading weights.
- Same rules as LLMs: weight licence on the card (FLUX.1 [dev] is non-commercial), volume for models, teardown.

## Checklist

- [ ] Shape chosen (pod, serverless, Modal, Jobs, managed endpoint) and cost estimated
- [ ] Teardown set before creating (`--terminate-after`, zero min workers, scale-down)
- [ ] Keys from env or the platform secret store
- [ ] Models on a volume or host cache, not container disk
- [ ] Server binds 0.0.0.0 inside, auth in front outside
- [ ] Verified with a real request from outside; cold-start path uses async calls
- [ ] Final list command shows nothing left running
