# Running models locally: Ollama, llama.cpp, LM Studio, MLX, and a chat page with Open WebUI

> Distilled from: ollama and its api and hardware-sizing references (ericrisco/rsc-harness, MIT); huggingface-local-models and its references (huggingface/skills, Apache-2.0); gguf-quantization and its references (Orchestra-Research/AI-Research-SKILLs, MIT); swift-mlx-lm (ml-explore/mlx-swift-lm, MIT); unsloth-buddy (TYH-labs/unsloth-buddy, MIT). Section 6 is written in our own words from the official Open WebUI, llama.cpp server, LM Studio and Docker docs (as of October 2026).

One machine, one user or a small team. When weights plus cache exceed the box, stop downgrading and move to a GPU host ([gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md)).

## 1. Pick the runtime

| Runtime | Best for | Format | API |
|---|---|---|---|
| **Ollama** | Easiest path; a daemon that loads models on demand; app development | GGUF (MLX backend on big Macs) | Native `/api/*` and OpenAI-compatible `/v1` on `localhost:11434` |
| **llama.cpp** (`llama-cli`, `llama-server`) | Full control of flags, any Hub GGUF by name, CPU builds | GGUF | OpenAI-compatible on `localhost:8080` |
| **LM Studio** | Desktop GUI; browse, download and chat; no terminal | GGUF (and MLX on Mac) | Optional local OpenAI-compatible server (check its docs for the port) |
| **MLX** | Apple Silicon apps; Swift apps via mlx-swift-lm | MLX weights (`mlx-community/*`) | In-process |
| **llama-cpp-python** | GGUF inside a Python program | GGUF | In-process, or `python -m llama_cpp.server` |
| **transformers** | Research, full-precision Python on a CUDA GPU | safetensors | In-process |

Installs: Ollama from ollama.com (desktop app or package manager); llama.cpp `brew install llama.cpp` or `winget install llama.cpp`, or a CMake build ([quantization.md](quantization.md)); llama-cpp-python `pip install llama-cpp-python` (with `CMAKE_ARGS="-DGGML_CUDA=on"` or `-DGGML_METAL=on` for GPU builds). Prefer package managers over piping install scripts to a shell.

## 2. Ollama

```bash
ollama pull qwen3:8b          # pin an explicit size tag; avoid bare :latest
ollama run qwen3:8b "Summarise this in one line: ..."
ollama ps                     # loaded in memory now, and when it unloads
ollama list                   # on disk (pulled), not loaded
ollama show qwen3:8b          # template, parameters, context length, quant
ollama stop qwen3:8b          # unload from memory; ollama rm frees disk
```

- A model takes memory only once a request loads it, and unloads after `keep_alive` (default 5 minutes; `0` unloads now, `-1` keeps it).
- **Context:** `options.num_ctx` in a request applies to that request only. Make it permanent with a Modelfile. Long contexts cost memory ([vram-and-sizing.md](vram-and-sizing.md)).
- `:latest` drifts between releases. Pin a size or quant tag and check it with `ollama show`.

### API

Native chat (streams NDJSON by default; the final object has `done: true` and timing):

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:8b",
  "messages": [{"role": "user", "content": "Name three primes."}],
  "stream": false,
  "options": {"temperature": 0.2, "num_ctx": 8192},
  "keep_alive": "10m"
}'
```

| Endpoint | Purpose |
|---|---|
| `/api/chat` | Multi-turn; `tools`, `images` (base64), `think`, `format` |
| `/api/generate` | Single-turn prompt; don't hand-build chat history with it |
| `/api/embed` | Embeddings (`input` string or array) |
| `/api/tags`, `/api/ps`, `/api/show` | Disk, memory, model details |
| `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, `/v1/models` | OpenAI-compatible layer |

Use native `/api/chat` for Ollama-only knobs (`keep_alive`, `format` as a JSON Schema, `think`); use `/v1` to reuse an OpenAI SDK unchanged with `base_url="http://localhost:11434/v1"` and any non-empty key. Tokens per second = `eval_count / (eval_duration / 1e9)` from the final response object.

Structured output: pass a JSON Schema as `format` with `temperature: 0` and tell the model to answer in JSON. Tool calling and wiring into agents: [agents-and-tools.md](agents-and-tools.md).

### Modelfile

```dockerfile
FROM qwen3:8b
SYSTEM "You are a terse senior code reviewer. Answer in bullet points."
PARAMETER num_ctx 16384
PARAMETER temperature 0.2
```

`ollama create reviewer -f Modelfile`, then `ollama run reviewer`. `FROM ./model.gguf` imports a local GGUF; `ADAPTER` adds a LoRA; `TEMPLATE`, `LICENSE`, `MESSAGE` and `STOP` round it out. Lint Modelfiles before shipping: every one needs a `FROM`; a `num_ctx` above ~32K is a likely out-of-memory on consumer GPUs.

### Environment knobs

| Variable | Effect |
|---|---|
| `OLLAMA_HOST` | Bind address. Default is localhost; `0.0.0.0:11434` exposes it to the network with **no auth** |
| `OLLAMA_MODELS` | Where models are stored |
| `OLLAMA_KEEP_ALIVE` | Default unload timer |
| `OLLAMA_NUM_PARALLEL` | Concurrent requests per model; each adds KV cache |
| `OLLAMA_MAX_LOADED_MODELS` | Models resident at once |
| `OLLAMA_KV_CACHE_TYPE` | `q8_0` or `q4_0` to shrink the cache |
| `OLLAMA_FLASH_ATTENTION` | `1` for lower memory and more speed on supported GPUs |

Ollama is one daemon with limited parallelism: fine for development and a small team, not a multi-tenant production server ([serving-endpoints.md](serving-endpoints.md)).

## 3. llama.cpp

Run any GGUF straight from the Hub (downloads into the cache; `hf auth login` first for gated repos):

```bash
llama-cli    -hf unsloth/Qwen3.6-35B-A3B-GGUF:UD-Q4_K_M          # interactive
llama-server -hf unsloth/Qwen3.6-35B-A3B-GGUF:UD-Q4_K_M -c 8192   # OpenAI-compatible server on :8080
llama-server --hf-repo <repo> --hf-file <exact-file.gguf> -c 4096  # when quant labels are ambiguous
llama-server -m ./model-Q4_K_M.gguf -ngl 99 -c 8192 --port 8080   # local file, all layers on GPU
```

(The repo above is the example used in the source; pick yours with [choosing-models-and-licences.md](choosing-models-and-licences.md).) Copy the "Use this model" snippet from `https://huggingface.co/<repo>?local-app=llama.cpp` when it is visible; it carries extra flags such as `--jinja` (use the model's own chat template, needed for tool calling on many models).

Smoke test:

```bash
curl http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello in one sentence."}]}'
```

| Flag | Meaning |
|---|---|
| `-ngl N` | Layers on GPU; `99` = all (Metal, or when it fits) |
| `-c N` | Context length; sets KV cache size |
| `-t N` | CPU threads = physical cores, not logical |
| `--tensor-split 0.5,0.5` | Split across two GPUs |
| `--parallel N` | Concurrent sequences on the server |
| `--host 0.0.0.0` | Expose beyond localhost: only behind auth |
| `--lora file.gguf` | Apply an adapter at runtime |

llama-cpp-python in a program: `Llama(model_path=..., n_ctx=4096, n_gpu_layers=99 (0 for CPU only), n_threads=<physical cores>)`, then `create_chat_completion(messages=...)`. Grammar-constrained JSON is available through `LlamaGrammar` when you need guaranteed structure.

## 4. LM Studio

Point non-technical users here. Download a GGUF in the app (or drop one into its models folder; the source gives `~/.cache/lm-studio/models/`), set context length and GPU offload in the model settings, chat, and optionally start its local server for apps. The same sizing rules apply.

## 5. MLX on Apple Silicon

- **Easiest:** Ollama on a Mac with more than 32 GB unified memory uses its MLX backend automatically (Ollama 0.19+); smaller Macs use the llama.cpp engine.
- **Swift apps (macOS, iOS):** the `mlx-swift-lm` package. Load a quantized MLX model and chat:

```swift
let container = try await LLMModelFactory.shared.loadContainer(
    from: #hubDownloader(), using: #huggingFaceTokenizerLoader(),
    configuration: .init(id: "mlx-community/Qwen3-4B-4bit"))
let session = ChatSession(container)
for try await chunk in session.streamResponse(to: "Explain structured concurrency") { print(chunk, terminator: "") }
```

  It also covers vision models (`VLMModelFactory`), embeddings, tool calling, wired-memory policies and LoRA training; its original skill has the details (router, Go deeper).
- **Python:** the `mlx-lm` package runs `mlx-community` models from the command line and Python; check its README for the current commands. Fine-tuning on a Mac is in [fine-tuning-runners.md](fine-tuning-runners.md).

## 6. A chat page for other people: Open WebUI

### Pick a tool

| Situation | Use | Why |
|---|---|---|
| The user already uses or pays for a chat front end | That one | Keep their accounts and history; point it at the model's `/v1` URL |
| One person at their own computer, no terminal | LM Studio (section 4) | Desktop app with its own chat window; runs offline |
| A quick look in a browser on the same machine | llama-server's built-in web UI | On by default at the server URL (`http://127.0.0.1:8080`); no accounts; `--no-webui` turns it off |
| Family or a team on other devices, each with a login and their own chat history | **Open WebUI** | Self-hosted, multi-user, roles; works with Ollama and any OpenAI-compatible server |
| Not sure who will use it, from where, or who looks after accounts | Ask first | Whether it must be reachable beyond the home or office network changes the whole setup |

**Open WebUI** is a self-hosted web chat app in front of Ollama, llama-server, vLLM or LM Studio. Its licence is custom: since v0.6.6 the "Open WebUI" branding may not be removed or changed unless the deployment has 50 or fewer users in a 30-day period (or holds an enterprise licence). Fine for a family or small team; check it before rebranding it for a client.

### Install with Docker (Ollama on the same machine)

```bash
mkdir -p ~/.config/open-webui
(umask 077; printf 'WEBUI_SECRET_KEY=%s\n' "$(openssl rand -hex 32)" > ~/.config/open-webui/env)   # once; reuse on every update
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data --env-file ~/.config/open-webui/env \
  --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

- `-p 3000:8080`: the UI is at `http://localhost:3000`, and at `http://<this-machine's-LAN-IP>:3000` from other devices on the network.
- `-v open-webui:/app/backend/data`: the named volume holds users, chats and settings. Every update reuses it; never recreate the container without it.
- `WEBUI_SECRET_KEY` signs sessions. Left unset, the image generates a random key on first start and keeps it in a file inside the container, so recreating the container (every update) makes a new key and logs everyone out. Set it once and keep it in the env file above (outside any repo), never in chat or on the command line.
- `--restart always` brings it back after a reboot.
- Tags: `:main` is the recommended image; `:cuda` adds NVIDIA GPU support (add `--gpus all`); `:ollama` bundles Ollama inside the container. For anything long-lived, pin a release tag (`:vX.Y.Z` from the releases page) instead of `:main` (principle 5).
- Without Docker: `pip install open-webui`, then `open-webui serve` (Python 3.11 or 3.12; 3.13 is not supported yet). It listens on port 8080; change it with `--port`.

**Reaching Ollama from the container.** Inside a container `localhost` is the container itself, so `http://127.0.0.1:11434` finds nothing. The image looks for Ollama at `http://host.docker.internal:11434` by default, which `--add-host=host.docker.internal:host-gateway` makes resolve to the host. Ollama on another machine: add `-e OLLAMA_BASE_URL=http://<host>:11434`. If no models show up on Linux, the docs give two routes:
- `--network=host` with `-e OLLAMA_BASE_URL=http://127.0.0.1:11434` (drop `-p` and `--add-host`). The UI is then on port **8080**, not 3000.
- Or set `OLLAMA_HOST=0.0.0.0` on Ollama. That opens Ollama to the whole network with no auth (section 2), so firewall port 11434; prefer the first route.

### Accounts

1. **The first account to sign up becomes the admin.** Create it straight after the first start, before sharing the URL.
2. Roles are `admin`, `user` and `pending`. New sign-ups get `DEFAULT_USER_ROLE`, which defaults to `pending`: they have no access until an admin promotes them in **Admin Panel > Users**.
3. For a family or team: let each person sign up, approve them, then turn sign-ups off (`ENABLE_SIGNUP`, default `True`, or the same switch in Admin Settings).
4. Don't use `WEBUI_AUTH=False`. It is single-user mode with no login, and the docs say you cannot switch between single-user and multi-account mode afterwards.
5. **Saved settings beat environment variables.** `ENABLE_SIGNUP`, `DEFAULT_USER_ROLE`, `ENABLE_OLLAMA_API`, `OLLAMA_BASE_URLS` and `OPENAI_API_BASE_URLS` are persistent config: after the first start the values stored in the database win, and later `-e` changes are ignored unless `ENABLE_PERSISTENT_CONFIG=False`. Change them in Admin Settings instead.

### Other model servers

Admin path: **Settings > Admin > Connections > Manage OpenAI API Connections > Add Connection**, URL ending in `/v1`: llama-server `http://host.docker.internal:<port>/v1`, vLLM `http://host.docker.internal:8000/v1`, LM Studio `http://host.docker.internal:1234/v1` (from Docker, `localhost` becomes `host.docker.internal`). Leave the key blank for local servers without auth. Env equivalent: `OPENAI_API_BASE_URLS` and `OPENAI_API_KEYS`, each `;`-separated (persistent config, as above).

### Update without losing anything

```bash
docker pull ghcr.io/open-webui/open-webui:main      # or the next pinned vX.Y.Z tag
docker rm -f open-webui
# then the same docker run as above: same volume, same env file (same WEBUI_SECRET_KEY)
```

Accounts and chats live in the `open-webui` volume, so they survive. Back the volume up before a major version jump.

### Driving it from Claude (API)

An admin turns API keys on (**Settings > Admin > Authentication > API Keys**, or `ENABLE_API_KEYS`); non-admins also need the API Keys feature permission. Each user creates a key in **Settings > Account > API keys**. The user puts it in an environment variable themselves; then:

```bash
curl http://localhost:3000/api/models -H "Authorization: Bearer $OPENWEBUI_API_KEY"
curl http://localhost:3000/api/chat/completions -H "Authorization: Bearer $OPENWEBUI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3:8b", "messages": [{"role": "user", "content": "Say hello in one sentence."}]}'
```

`/api/chat/completions` is OpenAI-compatible and reaches every model the UI shows.

### Verify

From another device on the same network: open `http://<pc-ip>:3000`, sign in with a non-admin account, check the Ollama models are listed and one chat answers. Keep it on the local network; for use from outside, a VPN, not a router port-forward ([serving-endpoints.md](serving-endpoints.md), section 6).

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Out of memory on load or at long prompts | Weights plus KV cache too big | Smaller quant or model, cap context, quantize the cache, fewer GPU layers |
| Very slow, GPU idle | Layers on CPU, or wrong build | `-ngl 99`; build with CUDA or Metal; check `ollama ps` shows GPU |
| Rambling, wrong format, repeated tokens | Wrong chat template or a base model | Use the instruct model; `--jinja` or the model's own template; check `ollama show` |
| 403 when downloading | Gated repo | Accept the terms on the model page; `hf auth login` |
| Vision model ignores the image | Missing `mmproj` projector | Download the matching `mmproj-*.gguf` |
| Another device can't connect | Bound to localhost | Intended. Expose only through an authenticated proxy or VPN, or give people Open WebUI with logins (section 6) |
| Slow first load | Reading weights from disk | Normal; `keep_alive` keeps it warm |

## Checklist

- [ ] Runtime fits the job; model tag and quant pinned
- [ ] Memory budget done for the real context
- [ ] Chat template correct (instruct model, `--jinja` or Modelfile template)
- [ ] Bound to localhost unless an auth layer is in front
- [ ] Smoke-tested with a real request; tokens per second noted
- [ ] Open WebUI (if used): admin created first, sign-ups approved then closed, secret key and data volume kept across updates, checked from another device
