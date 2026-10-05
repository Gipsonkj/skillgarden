# Credits

The router and references are written in this skill's own words from the licensed sources below plus general knowledge of the tools they describe. Model names, prices and CLI flags are as of the sources (mid-2026); the guides say where to check current docs. Scripts are copied unchanged with their licence beside them.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| huggingface-local-models | [huggingface/skills](https://github.com/huggingface/skills/tree/main/skills/huggingface-local-models) | Apache-2.0 | Hub discovery for GGUF repos, llama.cpp `-hf` runs, quant tables and imatrix, Metal/CUDA/ROCm builds, perplexity check (local-inference.md, quantization.md, choosing-models-and-licences.md) |
| hf-cli | [huggingface/skills](https://github.com/huggingface/skills/tree/main/skills/hf-cli) | Apache-2.0 | `hf` commands for auth, models, download, cache, repos, datasets, Spaces, Jobs and Endpoints (hugging-face-hub.md, serving-endpoints.md). Its `curl \| bash` installer is not used |
| huggingface-llm-trainer | [huggingface/skills](https://github.com/huggingface/skills/tree/main/skills/huggingface-llm-trainer) | Apache-2.0 | `dataset_inspector.py` and `hf_benchmarks.py` copied to `scripts/huggingface-llm-trainer/`; HF Jobs rules, hardware and cost tables, Hub saving, trackio, GGUF conversion and troubleshooting (fine-tuning.md, fine-tuning-runners.md, gpu-hosting-runpod-modal.md) |
| trl-training | [huggingface/trl](https://github.com/huggingface/trl/tree/main/skills/trl-training) | Apache-2.0 | Trainer list and data shapes, current argument names, GRPO reward functions, vLLM generation, `trl` CLI (fine-tuning.md) |
| llamafactory-sft | [hiyouga/LlamaFactory](https://github.com/hiyouga/LlamaFactory/tree/main/.claude/skills/llamafactory-sft) | Apache-2.0 | Data formats and registration, configs, run directories, GPU choice, fake-completion trap, infer and export settings, merge-into-full-precision rule (fine-tuning-runners.md) |
| diffusers-cli | [huggingface/diffusers](https://github.com/huggingface/diffusers/tree/main/.ai/skills/diffusers-cli) | Apache-2.0 | `diffusers-cli env` and `schema` only, in the media-server section of gpu-hosting-runpod-modal.md |
| comfyui | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent/tree/main/optional-skills/creative/comfyui) | MIT | Hardware thresholds, comfy-cli install and launch, analytics off, health check (gpu-hosting-runpod-modal.md section 6). Workflows stay in image-creation |
| runpod | [runpod/runpod-plugins-official](https://github.com/runpod/runpod-plugins-official/tree/main/plugins/runpod/skills/runpod) | Apache-2.0 | Pods, network volumes, proxy rules, serverless vLLM with `--model-reference`, autoscaling, cost guards, from its golden paths (gpu-hosting-runpod-modal.md, serving-endpoints.md). Its `curl \| bash` installer is not used |
| gguf-quantization | [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs/tree/main/10-optimization/gguf) | MIT | Quant ladder, convert and quantize steps, imatrix, llama-cpp-python, llama-server flags (quantization.md, local-inference.md, serving-endpoints.md) |
| huggingface-best | [huggingface/skills](https://github.com/huggingface/skills/tree/main/skills/huggingface-best) | Apache-2.0 | Benchmark-based shortlisting (choosing-models-and-licences.md) |
| lora-qlora-recipes | [wshobson/agents](https://github.com/wshobson/agents/tree/main/plugins/llm-finetuning/skills/lora-qlora-recipes) | MIT | LoRA and QLoRA recipe (targets, rank, alpha, learning rate, batch, bf16), failure modes, Unsloth-to-TRL gaps (fine-tuning.md, fine-tuning-runners.md) |
| modal | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/modal) | Apache-2.0 (skill; repo MIT) | GPU strings, vLLM web server, proxy auth, volumes, secrets, scaling, sandboxes (gpu-hosting-runpod-modal.md, agents-and-tools.md). Its instruction to cite a paper was left out |
| vllm-deploy-simple | [vllm-project/vllm-skills](https://github.com/vllm-project/vllm-skills/tree/main/plugins/vllm-skills/skills/vllm-deploy-simple) | Apache-2.0 | `quickstart.sh` copied to `scripts/vllm-deploy-simple/`; vLLM install, flags and endpoints (serving-endpoints.md) |
| evaluating-llms-harness | [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs/tree/main/11-evaluation/lm-evaluation-harness) | MIT | lm-eval commands, vLLM backend, local server evaluation, logprob limits, custom task YAML, timings (evaluation.md) |
| huggingface-community-evals | [huggingface/skills](https://github.com/huggingface/skills/tree/main/skills/huggingface-community-evals) | Apache-2.0 | `inspect_vllm_uv.py` and `lighteval_vllm_uv.py` copied to `scripts/huggingface-community-evals/`; backend choice and smoke-test-first workflow (evaluation.md) |
| open-weights | [ericrisco/rsc-harness](https://github.com/ericrisco/rsc-harness/tree/main/skills/open-weights) | MIT | Open vs paid decision, selection gates, licence classes and family traps, sizing and quant rules (choosing-models-and-licences.md, vram-and-sizing.md) |
| ollama | [ericrisco/rsc-harness](https://github.com/ericrisco/rsc-harness/tree/main/skills/ollama) | MIT | Ollama commands, API, Modelfile, env knobs, hardware sizing, tool calling, structured output, embeddings (local-inference.md, vram-and-sizing.md, agents-and-tools.md) |
| swift-mlx-lm | [ml-explore/mlx-swift-lm](https://github.com/ml-explore/mlx-swift-lm/tree/main/skills/mlx-swift-lm) | MIT | Swift loading and chat example, capabilities list (local-inference.md) |
| unsloth-buddy | [TYH-labs/unsloth-buddy](https://github.com/TYH-labs/unsloth-buddy/tree/main) | MIT | Unsloth setup, mlx-tune on Mac, Mac memory limits, export limits, data checks, training memory (fine-tuning-runners.md, vram-and-sizing.md). Its option of piping Unsloth's auto-install script into Python is not used |
| Open WebUI docs | [docs.openwebui.com](https://docs.openwebui.com) (quick start, environment configuration, roles, API keys, API endpoints, OpenAI-compatible connections, connection errors, licence) | docs, link-only reference, written in our own words | Docker install, volume, secret key, Ollama connection, roles and sign-up, persistent config, connections, updates, API (local-inference.md section 6) |
| llama.cpp server README | [ggml-org/llama.cpp tools/server](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) | docs, link-only reference, written in our own words | Built-in web UI and `--no-webui` (local-inference.md section 6) |
| LM Studio docs | [lmstudio.ai/docs/app](https://lmstudio.ai/docs/app) | docs, link-only reference, written in our own words | What the desktop app is, for the chat-UI picker (local-inference.md section 6) |
| Docker run reference | [docs.docker.com](https://docs.docker.com/reference/cli/docker/container/run/) | docs, link-only reference, written in our own words | `--env-file` format (local-inference.md section 6) |
| Google Colab FAQ | [research.google.com/colaboratory/faq.html](https://research.google.com/colaboratory/faq.html) | docs, link-only reference, written in our own words | GPU availability, usage limits, runtime limits, plans, disallowed activities (fine-tuning-runners.md section 3) |
| Colab CLI | [googlecolab/google-colab-cli](https://github.com/googlecolab/google-colab-cli) (README and docs/) | docs, link-only reference, written in our own words | Install, auth, `new`/`install`/`upload`/`exec`/`download`/`stop`/`run`/`usage` (fine-tuning-runners.md section 3) |
| colab-mcp | [googlecolab/colab-mcp](https://github.com/googlecolab/colab-mcp) | docs, link-only reference, written in our own words | What it connects and how it is launched (fine-tuning-runners.md section 3) |
| Unsloth docs | [unsloth.ai/docs](https://unsloth.ai/docs/get-started/unsloth-notebooks) (notebooks, VS Code install) | docs, link-only reference, written in our own words | Colab and Kaggle notebooks, VS Code Colab route (fine-tuning-runners.md section 3) |
| Hugging Face Hub quick start | [huggingface.co/docs/huggingface_hub/quick-start](https://huggingface.co/docs/huggingface_hub/quick-start) | docs, link-only reference, written in our own words | `HF_TOKEN` from Colab secrets (fine-tuning-runners.md section 3) |
| Axolotl docs | [docs.axolotl.ai](https://docs.axolotl.ai) (getting started, installation) | docs, link-only reference, written in our own words | Install, CLI commands, YAML keys, Docker images, GPU needs (fine-tuning-runners.md section 6) |
| Transformers and TRL docs | [Trainer](https://huggingface.co/docs/transformers/main_classes/trainer), [callbacks](https://huggingface.co/docs/transformers/main_classes/callback), [SFT trainer](https://huggingface.co/docs/trl/sft_trainer) | docs, link-only reference, written in our own words | `report_to`, `run_name`, W&B environment variables (fine-tuning-runners.md section 9) |
| W&B Hugging Face integration | [docs.coreweave.com/models/integrations/huggingface](https://docs.coreweave.com/models/integrations/huggingface) | docs, link-only reference, written in our own words | Login, `WANDB_API_KEY`, `WANDB_PROJECT`, offline mode, what is logged (fine-tuning-runners.md section 9) |

Licence texts: each `scripts/<source-skill>/LICENSE` (Apache-2.0, from the source repo). MIT and Apache-2.0 sources were otherwise distilled, not copied.

Not copied, and why:
- Vendor `curl | bash` installers (hf CLI, runpodctl, Ollama's install script on pods) and Unsloth's piped auto-installer: pipe-to-shell installs. The guides use pip, uv, brew, release binaries or prebuilt images instead.
- `inspect_eval_uv.py` from huggingface-community-evals: it sends eval prompts to third-party inference providers. The two local-GPU scripts are bundled instead.
- The trainer skill's option of running the dataset inspector from a remote URL: the reviewed copy is bundled locally.
- comfyui and diffusers-cli scripts: their workflows belong to image-creation; only server setup is summarised here.
- The modal skill's instruction to cite and fetch a paper: promotional, not part of using Modal.

## Also see (not included)

| Skill | Link | Why not included |
|---|---|---|
| h3lite | https://github.com/Rimagination/h3lite/tree/main | Link-only (security): its preferred install has users download a packaged bundle of model files and executable ComfyUI custom nodes from a file-sharing host. Not used, not recommended |
