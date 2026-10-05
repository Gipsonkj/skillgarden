# Go deeper: original skills

The guides in this super skill distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

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
