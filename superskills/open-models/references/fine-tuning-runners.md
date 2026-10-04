# Fine-tuning runners: Unsloth, Mac, LlamaFactory, HF Jobs, and exporting the result

> Distilled from: unsloth-buddy and its mlx, hardware and export sub-skills (TYH-labs/unsloth-buddy, MIT); unsloth-trl-mapping reference of lora-qlora-recipes (wshobson/agents, MIT); llamafactory-sft (hiyouga/LlamaFactory, Apache-2.0); huggingface-llm-trainer and its hub_saving, hardware and trackio references (huggingface/skills, Apache-2.0); runpod golden paths (runpod/runpod-plugins-official, Apache-2.0); modal (K-Dense-AI/scientific-agent-skills, Apache-2.0). Library behaviour as of the sources (Unsloth 2026.7.x, trl 1.8): check current release notes.

The recipe (method, data, LoRA settings) is in [fine-tuning.md](fine-tuning.md). This guide is about where it runs and what you do with the output.

## 1. Pick the runner

| Runner | Use when | Notes |
|---|---|---|
| **Plain TRL + PEFT** | Any NVIDIA GPU; messages-shaped data with `assistant_only_loss`; you want the reference behaviour | The safe default |
| **Unsloth** | One NVIDIA GPU and memory is tight | About 60% less VRAM and ~2x faster in the source's numbers; some gaps below |
| **mlx-tune** | Apple Silicon, no cloud | Small models; Unsloth-like API |
| **LlamaFactory** | YAML configs, many model families, a web UI, full or LoRA or QLoRA | Good for repeatable runs on your own GPUs |
| **HF Jobs** | No GPU of your own; paid HF plan; results land on the Hub | Script plus flags; ephemeral machine |
| **Modal / RunPod pod** | You want control of the box or long runs | [gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md) |

## 2. Unsloth

Install with `pip install unsloth` (or `uv pip install unsloth`) in a fresh environment. Unsloth also ships an auto-install script that is piped into Python; this craft doesn't use it.

```python
from unsloth import FastLanguageModel        # import before trl / transformers
model, tok = FastLanguageModel.from_pretrained("unsloth/Qwen2.5-7B-Instruct", max_seq_length=2048, load_in_4bit=True)
model = FastLanguageModel.get_peft_model(model, r=32, lora_alpha=64, lora_dropout=0, bias="none",
          target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
          use_gradient_checkpointing="unsloth", random_state=3407)
# then trl SFTTrainer(model=model, processing_class=tok, ..., args=SFTConfig(optim="adamw_8bit", bf16=True, ...))
```

Known gaps (Unsloth 2026.7.x, from the source's runs):
- No messages-shaped path that honours `assistant_only_loss=True`. If you need loss on assistant turns only, use plain TRL + PEFT.
- `import unsloth` patches trl for the whole process. Don't mix an Unsloth run and a plain TRL run in one Python process.
- `attn_implementation` passed through is dropped, and `padding_free` can collide with Unsloth's own packing. Leave both at defaults.

## 3. On a Mac

**mlx-tune** (Apple Silicon):

```bash
uv venv .venv --python 3.12 && source .venv/bin/activate     # Python 3.12 or lower
uv pip install mlx-tune
mkdir -p ~/.cache/huggingface/hub                             # missing cache dir breaks first download
```

```python
from mlx_tune import FastLanguageModel                         # Unsloth-shaped API
from mlx_lm.sample_utils import make_sampler
# generation takes a raw prompt string and a sampler: generate(..., sampler=make_sampler(temp=0.7))
```

GGUF export from mlx-tune is limited (fp16 only, fails when the model was loaded in 4-bit, Llama, Mistral and Mixtral only). Otherwise save merged weights and convert with llama.cpp ([quantization.md](quantization.md)).

**TRL on MPS** works for small runs: models up to ~3B, sequence 512-1024, batch 1 with gradient accumulation 8-16, LoRA r 8-16, and **float32** (fp16 gives NaN on MPS). Unified memory guide from the source: 16 GB → 0.5-1.5B, 32 GB → 1.5-3B, 64 GB → about 3B comfortably. Bigger than that: rent a GPU.

## 4. LlamaFactory

```bash
# install from a clone of hiyouga/LlamaFactory as its README says; commands run from the repo root
llamafactory-cli train my_run/train.yaml
llamafactory-cli chat  my_run/infer.yaml      # interactive; for agent checks, a short script loading ChatModel with the same args
llamafactory-cli export my_run/export.yaml
llamafactory-cli webui                       # port 7860; on a remote box: ssh -L 7860:localhost:7860 user@host
```

1. **Data.** Alpaca (`instruction`, `input`, `output`) or ShareGPT (`conversations` with `from` / `value`). Register it in `data/dataset_info.json`: `"my_dataset": {"file_name": "my_dataset.json"}` (add column mapping for ShareGPT).
2. **Config.** Start from `examples/train_lora/`, `examples/train_qlora/` or `examples/train_full/`. Pick `template` from `src/llamafactory/extras/constants.py` for the model family, and keep it **identical** in train, infer and export.
3. **Show before writing.** Present the config as a table with what differs from the example, and get the user's OK before writing the YAML and launching.
4. **One run directory** per attempt: `./llamafactory_runs/<model>_<method>_YYYYMMDD_HHMM/` holding the YAMLs, logs and outputs.
5. **GPU choice once.** Check `nvidia-smi` (or `amd-smi monitor`), then set `CUDA_VISIBLE_DEVICES` (or `HIP_VISIBLE_DEVICES`) for the run.
6. **Small datasets.** Steps = `ceil(rows ÷ (batch × grad_accum)) × epochs`. Raise epochs or lower accumulation until you get a usable number of steps.
7. **Watch it really run.** A `nohup ... &` wrapper that exits at once is not a finished run. It is done only when `pgrep -f "llamafactory-cli train"` shows nothing and the log has `train_runtime` or the final train metrics. Meanwhile report step and loss, and look at `training_loss.png` (`plot_loss: true`).
8. **Infer and export.** LoRA: `infer.yaml` sets `adapter_name_or_path`; full fine-tune: point at the output dir with no adapter. `export.yaml` merges (`export_size: 5`, `export_device: auto`, `export_legacy_format: false`); don't set `quantization_bit` when merging.

## 5. Hugging Face Jobs

```bash
hf jobs uv run --flavor a10g-large --timeout 2h --secrets HF_TOKEN train.py     # flags before the script
hf jobs logs <job-id> --follow
hf jobs cancel <job-id>
```

- Order matters: `hf jobs uv run`, then flags, then the script. It's `--secrets` (plural) for the token.
- The script needs a PEP 723 header listing its dependencies (`# /// script` … `dependencies = ["trl", "peft", ...]`). Pass a URL or a file the job can reach; a path only on your laptop won't exist on the job machine, so upload it to a Hub repo first if needed.
- The default timeout (30 minutes) is too short for training. Estimate and add 30% ([gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md)).
- The machine is wiped at the end. In the trainer config: `push_to_hub=True`, `hub_model_id="<user>/<name>"`, `hub_strategy="every_save"` so checkpoints survive a timeout.
- Live metrics: `report_to="trackio"`.
- Hardware by model size (source guide): under 1B → `t4-small` (demos); 1-3B → `t4-medium` or `l4x1`; 3-7B → `a10g-small` or `a10g-large`; 7-13B → `a10g-large` or `a100-large` with LoRA; 13B+ → `a100-large` or `a10g-largex2` with LoRA. Check `hf jobs hardware` for the current list.
- `uvx trl-jobs sft ...` wraps common TRL recipes as jobs.

## 6. RunPod or Modal

On a pod: no public ports, models and outputs on a network volume, launch with `setsid ... > /workspace/train.log 2>&1 < /dev/null &`, set `--terminate-after` longer than the run, copy or push results, then remove the pod. On Modal: a function with `gpu="A100-80GB"` (or `H100:N`), a Volume for checkpoints, `accelerate launch` with a fixed argument list. Details in [gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md).

## 7. Export and serve the result

| Goal | How |
|---|---|
| Keep adapters only (small, needs the base) | `trainer.save_model(dir)` or `model.save_pretrained(dir)` |
| Share on the Hub | `push_to_hub` with the token from `HF_TOKEN`; private by default; model card names the base and its licence |
| Merged full weights for vLLM or SGLang | PEFT `merge_and_unload()` on a bf16 base, or Unsloth `save_pretrained_merged(dir, tok, save_method="merged_16bit")` |
| GGUF for Ollama or llama.cpp | Merge first, then convert and quantize ([quantization.md](quantization.md)); Unsloth also has `save_pretrained_gguf` |
| Serve | `vllm serve ./merged --dtype auto`; `python -m sglang.launch_server --model-path ./merged`; Ollama Modelfile with `FROM ./model.gguf` (or `ADAPTER` for a GGUF LoRA) |

Merge onto the full-precision base, not the 4-bit one used for QLoRA training: merging into a quantized base breaks the model. Quantize afterwards. After export, run the same eval as before training on the exported artefact, since merging and quantizing can both shift results ([evaluation.md](evaluation.md)).

## Checklist

- [ ] Runner fits hardware and data format (assistant-only loss → plain TRL)
- [ ] Install via pip or uv; no pipe-to-shell installers
- [ ] Config shown to the user before a long or paid run
- [ ] Results leave ephemeral machines (Hub push, volume)
- [ ] Teardown set for any paid GPU
- [ ] Exported artefact evaluated, not just the training checkpoint
