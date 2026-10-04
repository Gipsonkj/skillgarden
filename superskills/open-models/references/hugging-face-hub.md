# Hugging Face Hub, hf CLI, transformers, datasets and Spaces

> Distilled from: hf-cli (huggingface/skills, Apache-2.0); huggingface-local-models hub-discovery (huggingface/skills, Apache-2.0); huggingface-llm-trainer and its hub_saving and reliability references (huggingface/skills, Apache-2.0); llamafactory-sft (hiyouga/LlamaFactory, Apache-2.0); unsloth-buddy data sub-skill (TYH-labs/unsloth-buddy, MIT). Command list as generated for huggingface_hub v2.1.1: run `hf <command> --help` for the current flags.

The Hub is where open weights, datasets and demo apps live. `hf` replaces the deprecated `huggingface-cli`; if an old guide says `huggingface-cli download`, use `hf download`.

## 1. Install and authenticate

```bash
pip install -U huggingface_hub        # or: uv pip install -U huggingface_hub; gives the `hf` command
hf update                             # later updates, using whatever installed it
hf auth whoami                        # who am I (fails cleanly if logged out)
```

Hugging Face also documents a `curl ... | bash` installer; this craft uses pip or uv instead.

Auth, in order of preference:
1. `HF_TOKEN` environment variable (works for the CLI, Python libraries, vLLM and jobs).
2. `hf auth login` (browser or token prompt; stores it locally). `hf auth list` / `switch` manage several tokens.

Use a **read** token for downloads and a **write** token only where you upload or push. Never paste a token into a command line, a file in the repo, or chat; prefer `HF_TOKEN` over `--token`.

## 2. Find and inspect models

```bash
hf models list --search qwen --apps llama.cpp --limit 20             # also: --author, --filter, --pipeline-tag, --gated, --num-parameters
hf models info Qwen/Qwen3-8B --format json                           # parameters (safetensors.total), tags, licence
hf models card Qwen/Qwen3-8B --metadata                              # model card front matter
hf papers search "speculative decoding"                              # papers on the Hub
```

Every command takes `--format json` (or `--json`) for scripts and `-q` for one id per line. URL equivalents: `https://huggingface.co/models?search=<term>&apps=llama.cpp&sort=trending`, the repo page, and `https://huggingface.co/api/models/<repo>/tree/main?recursive=true` for exact files and sizes.

**Verify before you use.** Check that the repo and file exist (`hf models info`, the tree API) before starting a download, a server or a paid job. Typos and renamed datasets are the cheapest failures to avoid.

Gated repos (Llama, Gemma and many others): accept the terms on the model page while logged in, then download with your token. A 401 or 403 means the token is missing or the terms aren't accepted: stop and ask the user, don't loop.

## 3. Download

```bash
hf download Qwen/Qwen3-8B                                              # into the shared cache
hf download <repo> --include "*Q4_K_M*.gguf" --local-dir ./models      # only what you need
hf download <repo> --revision <commit-or-tag> --dry-run               # pin a revision; preview size
HF_XET_HIGH_PERFORMANCE=1 hf download <repo> --local-dir ./models/<name>   # faster transfers
```

- `HF_HUB_ENABLE_HF_TRANSFER=1` is deprecated; use `HF_XET_HIGH_PERFORMANCE=1`.
- Pin `--revision` for anything you ship or evaluate, so results are reproducible.
- A cached folder can be an empty shell: check total size, that every shard listed in `model.safetensors.index.json` exists, and that no `*.incomplete` files remain.
- In mainland China, ModelScope (`modelscope download --model <id> --local_dir <path>`) is often faster.
- Mount instead of copying: `hf-mount` (`brew install hf-mount`) exposes a repo as a read-only folder and fetches files on demand.

## 4. Cache housekeeping

The default cache is `~/.cache/huggingface/hub`. Models are big; check before you fill a disk.

```bash
hf cache list --sort size            # what's taking space
hf cache prune --dry-run             # detached revisions and incomplete downloads
hf cache rm <repo> --dry-run         # then without --dry-run, after the user agrees
hf cache verify <repo>               # checksums
```

## 5. Create, upload, version

```bash
hf repos create my-org/my-model --private                    # --type dataset | space
hf upload my-org/my-model ./outputs/merged . --commit-message "Merged LoRA, run 2026-10-04"
hf repos branch create my-org/my-model experiment
hf repos tag create my-org/my-model v1.0
hf repos settings my-org/my-model --gated auto               # gate access
hf upload my-org/my-model ./file.gguf --create-pr            # propose instead of pushing to main
```

- `hf repos delete` and `hf repos delete-files` are irreversible: confirm with the user first.
- Write a model card: base model (with its licence obligations), data, training method, intended use, eval results, limitations. A fine-tune inherits the base's licence ([choosing-models-and-licences.md](choosing-models-and-licences.md)).
- Private by default for anything trained on private data.

## 6. Datasets

```bash
hf datasets info <org>/<dataset>
hf datasets parquet <org>/<dataset> --split train          # parquet URLs
hf datasets sql "<DuckDB SQL over those parquet URLs>"     # filter or reshape remotely; see --help for an example
```

Python, the usual moves:

```python
from datasets import load_dataset
ds = load_dataset("trl-lib/Capybara", split="train")                    # Hub dataset
local = load_dataset("json", data_files="data/train.jsonl", split="train")  # local JSONL
split = local.train_test_split(test_size=0.1, seed=42)                    # hold out an eval set
split["train"].push_to_hub("my-org/my-sft-data", private=True)
```

Explore a remote dataset's columns before downloading it: `uv run scripts/huggingface-llm-trainer/dataset_inspector.py --dataset <org>/<name> --split train` (public datasets; uses the Hub's datasets-server API only). Data preparation for training: [fine-tuning.md](fine-tuning.md).

## 7. transformers in five lines

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct", dtype="auto", device_map="auto")
msgs = [{"role": "user", "content": "Say hello."}]
ids = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt").to(model.device)
print(tok.decode(model.generate(ids, max_new_tokens=50)[0][ids.shape[-1]:], skip_special_tokens=True))
```

- Always build prompts with `apply_chat_template`; hand-written templates are the top cause of rambling output.
- `trust_remote_code=True` executes Python from the repo. Read its `.py` files first, pin the revision, or choose a model that doesn't need it.
- For serving, use vLLM or llama.cpp, not a `generate` loop ([serving-endpoints.md](serving-endpoints.md)).

## 8. Spaces (demo apps)

```bash
hf repos create my-org/demo --type space --sdk gradio         # see `hf spaces templates`
hf upload my-org/demo ./app . --type space
hf spaces hardware                                             # cpu-basic ... a100x8, zero-a10g
hf spaces settings my-org/demo --hardware t4-small --sleep-time 3600
hf spaces secrets add my-org/demo --secrets-file .env.space   # git-ignored file; values are write-only
hf spaces logs my-org/demo --build                             # build logs; drop --build for runtime
hf spaces pause my-org/demo                                    # stop billing
hf spaces zero-gpu quota                                       # remaining ZeroGPU time
```

Paid hardware bills while the Space runs: set a sleep time or pause it. Keys go in Space secrets, never in the repo.

## 9. Jobs and Endpoints

- **Jobs** (paid plan): `hf jobs uv run --flavor a10g-large --timeout 2h --secrets HF_TOKEN <script>`; `hf jobs hardware`, `hf jobs logs <id> --follow`, `hf jobs cancel <id>`. Training detail in [fine-tuning-runners.md](fine-tuning-runners.md).
- **Inference Endpoints:** `hf endpoints ...` ([serving-endpoints.md](serving-endpoints.md)).
- `hf skills add <name>` installs Hugging Face's own agent skills; read them before use like any third-party skill.

## Pitfalls

| Pitfall | Fix |
|---|---|
| `huggingface-cli` prints help or fails | Use `hf` |
| 403 on download | Accept the gate on the model page; check the token has read access |
| Disk fills during download | `--include` only the files you need; `--dry-run` first; `hf cache list` |
| Results change between runs | Pin `--revision` |
| Token committed to a repo | Revoke it at huggingface.co/settings/tokens now, then clean history |
| Training output lost on an ephemeral machine | `push_to_hub=True` with a write token, or copy to a volume |

## Checklist

- [ ] `hf` installed via pip or uv; auth from `HF_TOKEN`
- [ ] Repo, files and licence verified before download
- [ ] Only needed files downloaded; revision pinned
- [ ] Uploads private unless meant to be public; model card written
- [ ] Destructive repo or cache operations confirmed with the user
