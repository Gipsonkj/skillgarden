# Fine-tuning runners: Unsloth, Colab, Mac, LlamaFactory, Axolotl, HF Jobs, tracking, and exporting the result

> Distilled from: unsloth-buddy and its mlx, hardware and export sub-skills (TYH-labs/unsloth-buddy, MIT); unsloth-trl-mapping reference of lora-qlora-recipes (wshobson/agents, MIT); llamafactory-sft (hiyouga/LlamaFactory, Apache-2.0); huggingface-llm-trainer and its hub_saving, hardware and trackio references (huggingface/skills, Apache-2.0); runpod golden paths (runpod/runpod-plugins-official, Apache-2.0); modal (K-Dense-AI/scientific-agent-skills, Apache-2.0). Library behaviour as of the sources (Unsloth 2026.7.x, trl 1.8): check current release notes. The Colab, Axolotl and tracking sections are written in our own words from the official Google Colab FAQ, the Colab CLI and colab-mcp repos (googlecolab), Unsloth's notebook docs, the Axolotl docs, the Transformers Trainer docs and the W&B Hugging Face integration docs (as of October 2026).

The recipe (method, data, LoRA settings) is in [fine-tuning.md](fine-tuning.md). This guide is about where it runs and what you do with the output.

## 1. Pick the runner

| Situation | Use | Why |
|---|---|---|
| The user already uses or pays for a runner or GPU account (Colab Pro, RunPod, HF, their own box) | That one | No new account, no new bill; the recipe is the same everywhere |
| No GPU and no budget; a first small LoRA | **Google Colab** free tier with an Unsloth notebook | Free GPU in a browser; limits are unpublished and sessions end (section 3) |
| Any NVIDIA GPU; messages-shaped data with `assistant_only_loss`; you want the reference behaviour | **Plain TRL + PEFT** | The safe default |
| One NVIDIA GPU and memory is tight | **Unsloth** | About 60% less VRAM and ~2x faster in the source's numbers; some gaps (section 2) |
| Apple Silicon, no cloud | **mlx-tune** | Small models; Unsloth-like API |
| YAML configs, many model families, a web UI, full or LoRA or QLoRA | **LlamaFactory** | Good for repeatable runs on your own GPUs |
| One YAML file per run that you rerun and share; DeepSpeed across several GPUs | **Axolotl** | Config-driven CLI: preprocess, train, infer, merge (section 6) |
| No GPU of your own; paid HF plan; results land on the Hub | **HF Jobs** | Script plus flags; ephemeral machine |
| You want control of the box or long runs | **Modal / RunPod pod** | [gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md) |
| Unsure which GPU account they have or what they will spend | Ask | Which account they log into and the spending cap decide the runner |

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

## 3. Google Colab

Hosted Jupyter notebooks with free and paid GPUs. Pick it for a first small fine-tune with no GPU and no budget, or when the user already has Colab Pro. For runs that must not be cut off, rent a pod or use HF Jobs instead.

**Limits (Colab FAQ):** GPU types vary over time; free GPU access is restricted and the usage limits are unpublished and fluctuate. On the free tier a notebook runs for at most 12 hours, depending on availability and usage; idle VMs are deleted. Pro+ allows continuous runs of up to 24 hours with enough compute units. Paid access is Pro, Pro+ or Pay As You Go (compute units). Without a positive compute-unit balance, SSH shells, remote desktops and web UIs that bypass the notebook are not allowed, so don't run `llamafactory-cli webui` or Open WebUI on free Colab.

**Everything on the VM is lost** when the session ends. Save checkpoints to Google Drive or push them to the Hub with `hub_strategy="every_save"` (section 7), and use small `save_steps`.

**Fastest start: an Unsloth notebook.** Unsloth publishes ready notebooks for Colab and Kaggle (index in its docs, source in `github.com/unslothai/notebooks`). Open one, run all, swap in your dataset and model, train, export. Their free notebooks are sized for the free GPU (about 15 GB VRAM in Unsloth's docs). Read each cell before running it, and skip any cell that pipes a download into a shell. In the notebook, put the Hub token in Colab's Secrets panel as `HF_TOKEN`; `huggingface_hub` picks it up, so it never sits in a cell.

**Driving Colab from Claude: the Colab CLI** (Google's `google-colab-cli`, Apache-2.0, Linux and macOS only):

```bash
uv tool install google-colab-cli          # or: pip install google-colab-cli
colab --auth oauth2 sessions              # first sign-in: the USER runs this in their own terminal
```

The `oauth2` sign-in (the CLI's default) prints a Google URL and waits for the code to be pasted back, so the user does it once themselves; the token is cached in `~/.config/colab-cli/`. The other mode, `--auth adc`, uses Application Default Credentials instead (`gcloud auth application-default login` with the Colab scopes listed in the CLI's docs). Then:

```bash
colab new -s ft --gpu T4                              # GPUs: T4, L4, G4, A100, H100 (plan and capacity decide)
colab install -s ft unsloth trl datasets
colab upload -s ft data/train.jsonl train.jsonl
colab exec -s ft -f train.py                          # sends the local file to the VM's kernel; no upload needed
colab download -s ft outputs/adapter.tar.gz ./adapter.tar.gz   # tar the output dir inside train.py first
colab stop -s ft                                      # release the VM
colab sessions                                        # must show nothing left running
```

- One-shot: `colab run --gpu T4 train.py` allocates a VM, runs the script, then releases it even if the script fails; `--keep` leaves it running (then `colab stop` yourself).
- `colab exec` and `colab run` take `--timeout` (seconds, default 30) to stop silent tasks hanging: raise it for training, and log every few steps.
- `colab drivemount -s ft` mounts Google Drive at `/content/drive` for checkpoints; `colab log -s ft -o run.md` exports the session history.
- `colab usage` shows the compute-unit rate and balance. **Paid GPUs spend compute units:** before `colab new` or `colab run` with an A100 or H100 (or anything on a paid plan), show the GPU, the expected hours and the current balance, and wait for a yes.
- Prefer `exec`, `run` and `upload`/`download` over `colab ssh` and `colab console` on a free account (no SSH without compute units, above).
- Working inside a notebook already open in the browser instead: Google's `colab-mcp` server connects a local agent to that Colab session (MCP config runs it with `uvx` from `github.com/googlecolab/colab-mcp`; read the repo before adding it). In VS Code, the official Google Colab extension can run a local notebook on a Colab runtime (Select Kernel → Colab → Auto Connect, or New Colab Server to choose the machine type).

## 4. On a Mac

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

## 5. LlamaFactory

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

## 6. Axolotl

One YAML file drives the whole run; good when the same config is rerun, shared or scaled out with DeepSpeed. Needs an NVIDIA GPU (Ampere or newer for bf16 and Flash Attention) or an AMD GPU, and Python 3.12 or newer.

```bash
export UV_TORCH_BACKEND=cu130               # or cu128, to match the CUDA on the box
uv venv && source .venv/bin/activate
uv pip install --no-build-isolation "axolotl[deepspeed]"
axolotl fetch examples                      # example configs to start from
axolotl preprocess my_run.yml               # tokenise and check the data before paying for GPU time
axolotl train my_run.yml
axolotl inference my_run.yml --lora-model-dir="./outputs/lora-out"
axolotl merge-lora my_run.yml --lora-model-dir="./outputs/lora-out"
```

Docker instead of an install: `axolotlai/axolotl-uv:main-latest` (cloud hosts: `axolotlai/axolotl-cloud-uv:main-latest`). The keys that matter in the YAML: `base_model`, `datasets` (each with `path` and `type`), `adapter: lora` or `qlora`, `load_in_4bit` or `load_in_8bit`, `output_dir`, and optionally `wandb_project` (section 9). Start from the closest example, apply the LoRA recipe from [fine-tuning.md](fine-tuning.md), and show the config to the user before a long or paid run.

## 7. Hugging Face Jobs

```bash
hf jobs uv run --flavor a10g-large --timeout 2h --secrets HF_TOKEN train.py     # flags before the script
hf jobs logs <job-id> --follow
hf jobs cancel <job-id>
```

- Order matters: `hf jobs uv run`, then flags, then the script. It's `--secrets` (plural) for the token.
- The script needs a PEP 723 header listing its dependencies (`# /// script` … `dependencies = ["trl", "peft", ...]`). Pass a URL or a file the job can reach; a path only on your laptop won't exist on the job machine, so upload it to a Hub repo first if needed.
- The default timeout (30 minutes) is too short for training. Estimate and add 30% ([gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md)).
- The machine is wiped at the end. In the trainer config: `push_to_hub=True`, `hub_model_id="<user>/<name>"`, `hub_strategy="every_save"` so checkpoints survive a timeout.
- Live metrics: `report_to="trackio"` (or W&B, section 9).
- Hardware by model size (source guide): under 1B → `t4-small` (demos); 1-3B → `t4-medium` or `l4x1`; 3-7B → `a10g-small` or `a10g-large`; 7-13B → `a10g-large` or `a100-large` with LoRA; 13B+ → `a100-large` or `a10g-largex2` with LoRA. Check `hf jobs hardware` for the current list.
- `uvx trl-jobs sft ...` wraps common TRL recipes as jobs.

## 8. RunPod or Modal

On a pod: no public ports, models and outputs on a network volume, launch with `setsid ... > /workspace/train.log 2>&1 < /dev/null &`, set `--terminate-after` longer than the run, copy or push results, then remove the pod. On Modal: a function with `gpu="A100-80GB"` (or `H100:N`), a Volume for checkpoints, `accelerate launch` with a fixed argument list. Details in [gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md).

## 9. Track the run

| Situation | Use | Why |
|---|---|---|
| The user already logs runs to a tracker | That one | Runs stay comparable with their history |
| Free, results next to the model on the Hub | trackio: `report_to="trackio"` | Open source; can sync to a Hugging Face Space (`trackio_space_id`); the default for HF Jobs in this guide |
| Team already on Weights & Biases, or wants hosted loss curves with GPU metrics | W&B: `report_to="wandb"` | Logs hyperparameters, metrics and GPU/CPU use, memory and temperature |
| No account, or an offline box | `report_to="none"` (the Trainer default), or W&B with `WANDB_MODE=offline` | Nothing leaves the machine |

**W&B with the Trainer** (TRL's `SFTConfig` takes the same `report_to` and `run_name`): `pip install wandb`; the key in `WANDB_API_KEY` set by the user (or the user runs `wandb.login()` themselves); `WANDB_PROJECT` names the project (default `huggingface`); `run_name` in the training config names the run. `WANDB_LOG_MODEL` decides whether weights are uploaded: `"false"` (default), `"end"` (once at the end) or `"checkpoint"` (every `save_steps`). Uploading puts model weights on W&B's servers: ask before turning it on. Axolotl: set `wandb_project` in the YAML.

## 10. Export and serve the result

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
- [ ] On Colab: checkpoints saved off the VM, paid GPU approved, `colab sessions` empty at the end
- [ ] Install via pip or uv; no pipe-to-shell installers
- [ ] Config shown to the user before a long or paid run
- [ ] Results leave ephemeral machines (Hub push, volume)
- [ ] Teardown set for any paid GPU
- [ ] Exported artefact evaluated, not just the training checkpoint
