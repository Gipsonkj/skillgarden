---
name: open-models
description: Run, serve, fine-tune and evaluate open-weight models (Llama, Qwen, Gemma, Mistral, DeepSeek, gpt-oss), instead of or beside paid APIs. Covers picking a model and checking its weight licence for commercial use; VRAM, context and cost maths; running locally with Ollama, llama.cpp, LM Studio or MLX; serving with vLLM, SGLang and OpenAI-compatible endpoints; GPU hosting on RunPod, Modal and HF Jobs; GGUF, AWQ and GPTQ quantization; the Hugging Face Hub, hf CLI, transformers, datasets and Spaces; fine-tuning with LoRA/QLoRA, TRL, Unsloth or LlamaFactory; benchmarking with lm-eval-harness or lighteval; pointing agents and tools at a local model. Triggers: "run a model locally", "which open model fits my GPU", "can I use Llama commercially", "serve Qwen with vLLM", "deploy a model on RunPod", "quantize to GGUF", "fine-tune with LoRA", "hf download", "evaluate my fine-tune", "use Ollama with my agent". Image, video or audio generation recipes: image-creation, ai-video, audio-generation.
---

# Open models

Covers using open-weight language models as infrastructure: choosing one and clearing its licence, sizing memory and cost, running it on a laptop or a rented GPU, serving it behind an OpenAI-compatible endpoint, shrinking it with quantization, adapting it with LoRA, and proving it is good enough with evals. Open image, video and audio models share the infrastructure (one short section on getting ComfyUI or diffusers up), but their prompts and workflows belong to the media crafts. Agent design and general app hosting belong to `ai-agents` and `cloud-devops`.

## Core principles

1. **Licence first, on the exact model card.** Open weights are not open source. Classify the licence (OSI-open, custom community, restricted), check user caps, use restrictions and output clauses; "gated" only means you accept terms. Fine-tunes and quants inherit the base licence.
2. **Smallest model that passes your own eval.** Public benchmarks shortlist; a private task set with a baseline decides.
3. **Do the memory maths before downloading.** Weights ≈ parameters × bytes per parameter × 1.2, plus the KV cache for the real context, plus 20-30% headroom.
4. **Go down a size before going below Q4.** Q4_K_M is the usual floor; a smaller model at Q4 beats a bigger one at Q2.
5. **Pin everything.** Model revision or tag (never bare `:latest`), quant file, runtime version and flags; record them with every result.
6. **OpenAI-compatible everywhere.** Ollama, llama-server, vLLM, SGLang, RunPod and Modal all speak it; swap `base_url`, model and key from environment variables.
7. **Bind to localhost; authenticate anything exposed.** Local servers have no auth; RunPod proxy and Modal URLs are public unless you protect them.
8. **Installs through pip, uv, brew or official packages.** Hugging Face and RunPod document `curl | bash` installers; this craft doesn't use them, nor any pipe-to-shell install on a pod.
9. **Tokens and keys from the environment or a secret store,** never on a command line, in a repo or in chat. Read tokens for downloads, write tokens only where you push.
10. **Never route prompts or data through unofficial hosts.** Your machine, your rented GPU, or the official provider.
11. **Running is not ready.** Verify from outside: health, a real completion with the right chat template, and speed at the real prompt length.
12. **Every paid GPU gets a teardown before it starts:** `--terminate-after`, zero minimum workers, scale-to-zero, timeouts; finish with a list command showing nothing left running.
13. **Validate data before paying for training,** and push results off ephemeral machines (Hub or volume).
14. **LoRA recipe:** all linear layers, alpha = 2 × rank, LoRA learning rate (about 10x full fine-tuning), effective batch under 32, bf16 not fp16.
15. **`trust_remote_code` runs the repo's Python.** Read it, pin the revision, or pick a model that doesn't need it.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Private Qwen chatbot on a rented GPU: `references/choosing-models-and-licences.md` → `references/vram-and-sizing.md` → `references/gpu-hosting-runpod-modal.md` → `references/serving-endpoints.md`; tool calls from `ai-agents` → `references/tool-design.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Open vs paid API, break-even, which model for a job, finding candidates, licence classes and commercial checklist | [references/choosing-models-and-licences.md](references/choosing-models-and-licences.md) + `scripts/huggingface-llm-trainer/hf_benchmarks.py` |
| Will it fit: weights, KV cache, context, MoE, which GPU or Mac, partial offload, training memory | [references/vram-and-sizing.md](references/vram-and-sizing.md) |
| GGUF quant levels, converting and quantizing with llama.cpp, imatrix, AWQ and GPTQ, quality checks | [references/quantization.md](references/quantization.md) |
| Run on a laptop or desktop: Ollama, llama.cpp, LM Studio, MLX, llama-cpp-python | [references/local-inference.md](references/local-inference.md) |
| Serve to many users: vLLM, SGLang, llama-server, HF Inference Endpoints, safe exposure | [references/serving-endpoints.md](references/serving-endpoints.md) + `scripts/vllm-deploy-simple/quickstart.sh` |
| Rent GPUs: RunPod pods and serverless, Modal, HF Jobs, cost maths, teardown; ComfyUI or diffusers server setup | [references/gpu-hosting-runpod-modal.md](references/gpu-hosting-runpod-modal.md) |
| Hugging Face Hub: hf CLI, auth, download, cache, upload, datasets, transformers, Spaces | [references/hugging-face-hub.md](references/hugging-face-hub.md) + `scripts/huggingface-llm-trainer/dataset_inspector.py` |
| Should we fine-tune, SFT vs DPO vs GRPO, data prep, LoRA and QLoRA settings, TRL code | [references/fine-tuning.md](references/fine-tuning.md) + `scripts/huggingface-llm-trainer/dataset_inspector.py` |
| Where to train (Unsloth, Mac, LlamaFactory, HF Jobs, RunPod, Modal) and exporting adapters, merged weights or GGUF | [references/fine-tuning-runners.md](references/fine-tuning-runners.md) |
| Benchmarks, your own task eval, fair comparisons, quant and fine-tune checks, tokens per second | [references/evaluation.md](references/evaluation.md) + `scripts/huggingface-community-evals/` |
| Point an agent, app or coding tool at a local model: base URL, tool calling, JSON output, embeddings, hybrid routing | [references/agents-and-tools.md](references/agents-and-tools.md) |

To use one capability directly, name the task, or say "use open-models: <capability>" (for example "use open-models: will Qwen3 32B fit on a 24 GB GPU").

## Bundled scripts (huggingface/skills and vllm-project/vllm-skills, Apache-2.0)

| Script | Does | When |
|---|---|---|
| `scripts/vllm-deploy-simple/quickstart.sh` | Installs vLLM in a venv, starts, waits, tests, stops; `status`, `test`, `restart` | Quick vLLM server on a GPU box. Installs packages and binds 0.0.0.0: ask first, firewall it |
| `scripts/huggingface-community-evals/inspect_vllm_uv.py` | inspect-ai eval of a Hub model on a local GPU (vLLM or transformers) | Task evals such as gsm8k, mmlu; start with `--limit 10` |
| `scripts/huggingface-community-evals/lighteval_vllm_uv.py` | lighteval leaderboard-style tasks (vLLM or accelerate) | Open LLM Leaderboard-style task strings; start with `--max-samples 10` |
| `scripts/huggingface-llm-trainer/dataset_inspector.py` | Checks a public Hub dataset's columns for SFT, DPO, GRPO, KTO; prints mapping code | Before any paid training run |
| `scripts/huggingface-llm-trainer/hf_benchmarks.py` | Searches Hub benchmark datasets and reads their leaderboards (`HF_TOKEN`) | Shortlisting models by published scores |

Run the Python scripts with `uv run <script> --help` first. They call only huggingface.co and its datasets-server API, or your local GPU.

## Other crafts

| When the request also needs | Use |
|---|---|
| The agent around the model: framework choice, tool design, agent evals | `ai-agents` → `references/frameworks.md`, `references/tool-design.md`, `references/evaluation.md` |
| Packaging the model server in Docker, running it on Kubernetes, or choosing a general host | `cloud-devops` → `references/docker.md`, `references/kubernetes.md`, `references/platform-choice.md` |
| Images from local Stable Diffusion, FLUX dev, diffusers or ComfyUI workflows | `image-creation` → `references/local-open-models.md` |
| Video from open or hosted video models (LTX-2 and others) and video-model prompts | `ai-video` → `references/vendor-apis.md`, `references/generative-prompting.md` |
| Whisper transcription, open TTS or MusicGen run locally | `audio-generation` → `references/local-open-models.md`, `references/transcription.md` |
| Finding ML papers behind a model or method | `research-science` → `references/literature-search.md`, `references/database-apis.md` |
| Whether a score difference between models is real (tests, intervals) | `data-analysis` → `references/statistics.md` |
| Storing HF, RunPod or Modal keys, or vetting a model repo's code and packages | `security` → `references/secrets.md`, `references/supply-chain.md` |
| Comparing cost per task against a hosted API, and cutting tokens on either | `token-efficiency` → `references/api-cost-patterns.md`, `references/measuring-usage.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Every `hf` command and flag (repos, buckets, jobs, endpoints, spaces, webhooks) | [hf-cli](https://github.com/huggingface/skills/tree/main/skills/hf-cli) (Apache-2.0; its install line pipes a script to bash: use pip or uv instead) |
| RunPod pods, serverless, Flash, templates and the 20 verified golden paths | [runpod](https://github.com/runpod/runpod-plugins-official/tree/main/plugins/runpod/skills/runpod) (Apache-2.0; prefer brew or release binaries over its curl installer) |
| Modal images, GPUs, volumes, secrets, scaling, web endpoints and sandboxes in full | [modal](https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/modal) (Apache-2.0 skill in an MIT repo; community-written, not by Modal) |
| A guided LlamaFactory run end to end: GPU pick, configs, monitoring, validation, export | [llamafactory-sft](https://github.com/hiyouga/LlamaFactory/tree/main/.claude/skills/llamafactory-sft) (Apache-2.0) |
| An interview-led Unsloth or mlx-tune fine-tune with its helper scripts and Colab route | [unsloth-buddy](https://github.com/TYH-labs/unsloth-buddy/tree/main) (MIT; skip its piped auto-install option) |
| mlx-swift-lm in Swift apps: VLMs, tool calls, wired memory, LoRA, porting models | [swift-mlx-lm](https://github.com/ml-explore/mlx-swift-lm/tree/main/skills/mlx-swift-lm) (MIT) |
| lm-eval-harness custom tasks, API backends and multi-GPU evaluation in depth | [evaluating-llms-harness](https://github.com/Orchestra-Research/AI-Research-SKILLs/tree/main/11-evaluation/lm-evaluation-harness) (MIT) |
| Running ComfyUI itself: install checks, workflow execution, custom nodes, cloud route | [comfyui](https://github.com/NousResearch/hermes-agent/tree/main/optional-skills/creative/comfyui) (MIT; turn its analytics off; its cloud route sends prompts to Comfy Cloud) |

## Default workflow

1. **Pin the job.** What the model must do, data sensitivity, latency, volume, budget, and the hardware on hand (`nvidia-smi`, Mac memory).
2. **Shortlist and clear the licence.** Two or three candidates; licence class and commercial terms read on each card.
3. **Size it.** Weights plus KV cache at the real context with headroom; pick the quant and the machine (local, pod, serverless, Modal).
4. **Run the smallest working setup.** Ollama or llama.cpp locally, or one GPU with vLLM; teardown set first on paid hosts.
5. **Evaluate.** Private task set against the current option; speed at real prompt lengths; pick the winner.
6. **Adapt only if needed.** Better prompts or retrieval first; then LoRA with the recipe, validated data, and before/after evals.
7. **Ship.** OpenAI-compatible endpoint, localhost or authenticated, config from env; versions and flags recorded.
8. **Report.** Model, revision, licence class, quant, runtime, cost per hour or per million tokens, eval results, what was not checked, and what is still running.

## Done means

- [ ] Licence class and commercial terms checked on the exact model card; fine-tune or quant obligations noted
- [ ] Memory budget written down and confirmed with a real load at the real context
- [ ] Model revision, quant, runtime version and flags pinned and recorded
- [ ] Endpoint verified from outside: health, a real completion, speed
- [ ] Bound to localhost or behind auth; keys only in env or a secret store
- [ ] No pipe-to-shell installs; no prompts or data through unofficial hosts
- [ ] Task eval run against the baseline; fine-tunes checked for gain and regression
- [ ] Every paid resource has a teardown, and a final list shows nothing left running
