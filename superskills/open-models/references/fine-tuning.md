# Fine-tuning: when, which method, data, and the LoRA/QLoRA recipe

> Distilled from: lora-qlora-recipes and its hyperparameters and unsloth-trl-mapping references (wshobson/agents, MIT); trl-training (huggingface/trl, Apache-2.0); huggingface-llm-trainer and its training_methods, reliability and troubleshooting references (huggingface/skills, Apache-2.0); unsloth-buddy and its data sub-skill (TYH-labs/unsloth-buddy, MIT); llamafactory-sft (hiyouga/LlamaFactory, Apache-2.0); open-weights (ericrisco/rsc-harness, MIT). TRL API notes as of trl 1.8 (mid-2026): check the TRL docs for your version.

Where to run it (Unsloth, Mac, LlamaFactory, HF Jobs) and how to export the result: [fine-tuning-runners.md](fine-tuning-runners.md).

## 1. Should you fine-tune at all?

| Goal | First try | Fine-tune when |
|---|---|---|
| Follow a format, tone or house style | Prompt with examples; structured output | Prompts get long or the format still breaks at volume |
| Do a narrow task cheaply (classify, extract, route) | A bigger model with a prompt | You need a small, fast, cheap model to match it |
| Know facts or documents | Retrieval (RAG) | Rarely: dense knowledge injection needs full fine-tuning and still drifts |
| Prefer one kind of answer over another | Better prompt or a judge | You have preference pairs |
| Reason better on checkable tasks (maths, code with tests) | A reasoning model | You can write a reward function |

Before training, write the eval you'll judge it by ([evaluation.md](evaluation.md)) and score the base model on it. No baseline, no way to know if training helped. Check the base model's licence: the fine-tune inherits it.

## 2. Pick the method (TRL names)

| Method | Trainer | Data shape | Use for |
|---|---|---|---|
| **SFT** | `SFTTrainer` | `messages` list, or `prompt` + `completion`, or `text` | Teaching a behaviour from demonstrations; the usual start |
| **DPO** | `DPOTrainer` | `prompt`, `chosen`, `rejected` | Preferences after SFT |
| **KTO** | `KTOTrainer` | `prompt`, `completion`, `label` (true/false) | Unpaired thumbs up/down |
| **GRPO** | `GRPOTrainer` | `prompt` only + reward function(s) | Online RL on verifiable rewards |
| Reward model | `RewardTrainer` | `chosen`, `rejected` | Training a scorer, not a policy |
| Distillation | `DistillationTrainer` | `prompt` + a teacher model | Moving a big model's behaviour into a small one (mind the teacher's licence) |

ORPO, CPO, online DPO and others live in `trl.experimental` with unstable APIs.

## 3. Prepare the data (most failures start here)

1. **Shape.** Conversational SFT: `{"messages": [{"role": "system"|"user"|"assistant", "content": "..."}]}`. The trainer applies the model's chat template: **never apply it yourself** and never pre-render chats into flat text, or loss lands on the prompt too.
2. **Validate before paying for a GPU.** Column mismatches cause most failed jobs (DPO especially: exact `prompt`, `chosen`, `rejected`). For a Hub dataset:
   ```bash
   uv run scripts/huggingface-llm-trainer/dataset_inspector.py --dataset <org>/<name> --split train
   ```
   It reports per method `READY`, `NEEDS MAPPING` (with copy-paste mapping code) or `INCOMPATIBLE`, using only the Hub's datasets-server API (public datasets). For local files, load them and print the columns and two rows.
3. **Map, don't edit in place.** Write a new file with `.map(...)` (e.g. `instruction, output → messages`); keep the user's original untouched.
4. **Clean.** Deduplicate; drop empty and truncated answers; check length against `max_length`; remove secrets and personal data; make sure you have the right to train on it.
5. **Split.** Hold out ~10% (`train_test_split(test_size=0.1, seed=42)`), never trained on.
6. **Size.** Smoke test: 50-100 examples. Real runs: 1K-10K+ good examples beat 100K noisy ones. With tiny sets, compute steps: `ceil(rows ÷ (batch × grad_accum)) × epochs`; single-digit step counts underfit and give no loss curve.
7. No data? Generate 50-100 seed examples with a strong model, review them by hand, then grow. Check that model's terms allow training on its outputs.

## 4. The LoRA / QLoRA recipe

Default to **LoRA**; use **QLoRA** (NF4 4-bit frozen base + bf16 adapters) only when the bf16 base doesn't fit; reserve **full fine-tuning** for dense knowledge injection.

| Setting | Value | Why |
|---|---|---|
| Target modules | All linear: `q_proj k_proj v_proj o_proj gate_proj up_proj down_proj` | The MLP layers matter most; attention-only is the old, weaker convention |
| Rank `r` | 16-32 general SFT; 1-32 for RL (GRPO) adapters; up to ~256 only for large, diverse SFT | Higher rank memorises as fast as it generalises |
| `lora_alpha` | **2 × r** | Derive from rank; don't tune separately |
| Learning rate | QLoRA **2e-4**; LoRA conservative 1e-4; very conservative 5e-5 | LoRA needs ~10x the full fine-tune LR: porting a full-FT LR under-trains |
| rsLoRA | Only at r ≥ 32 | No effect below |
| Effective batch | **under 32** (`per_device × grad_accum × GPUs`) | The recipe was validated there. One trainer source suggests ~128 for full fine-tunes; for LoRA SFT the validated <32 wins |
| Precision | `bf16=True`; never fall back to fp16 on GPUs without bf16 | fp16 causes loss spikes and silent divergence. Check: `torch.cuda.is_bf16_supported()` |
| Dropout, bias | `lora_dropout=0` (Unsloth fast path), `bias="none"` | |
| Memory savers | gradient checkpointing, 8-bit AdamW (`optim="adamw_8bit"`), packing | Don't drop target modules to save memory: it barely helps and costs quality |
| Epochs | 1-3; watch eval loss | More epochs on small data = memorising |

Plain TRL + PEFT:

```python
from datasets import load_dataset
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer

ds = load_dataset("json", data_files="data/train.jsonl", split="train").train_test_split(test_size=0.1, seed=42)
trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B-Instruct",              # string id; loading kwargs via model_init_kwargs={"dtype": "bfloat16"}
    train_dataset=ds["train"], eval_dataset=ds["test"],
    peft_config=LoraConfig(r=16, lora_alpha=32, lora_dropout=0.0, bias="none", task_type="CAUSAL_LM",
                           target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"]),
    args=SFTConfig(output_dir="out/qwen-sft", max_length=2048, assistant_only_loss=True,
                   per_device_train_batch_size=4, gradient_accumulation_steps=4,   # effective 16
                   learning_rate=1e-4, num_train_epochs=2, bf16=True, gradient_checkpointing=True,
                   eval_strategy="steps", eval_steps=50, logging_steps=10, save_steps=200, seed=42),
)
trainer.train(); trainer.save_model("out/qwen-sft")
```

Current-API traps (stale examples are everywhere):
- `processing_class=tokenizer`, not `tokenizer=` (removed). Usually omit it: it's inferred from the model.
- `max_length` on `SFTConfig` (renamed from `max_seq_length`, which now raises an error). `dataset_text_field` also lives on `SFTConfig`.
- `assistant_only_loss=True` computes loss on assistant turns only (conversational data). `packing=True` packs sequences to cut padding; spot-check a few decoded packed rows.
- CLI equivalent: `trl sft --model_name_or_path <id> --dataset_name <ds> ...`; YAML with `--config`; multi-GPU with `accelerate launch`.

## 5. GRPO in brief

```python
def reward_len(completions, **kwargs):            # accept **kwargs; extra dataset columns arrive here
    return [-abs(20 - len(c[0]["content"])) for c in completions]   # conversational: lists of messages
trainer = GRPOTrainer(model="Qwen/Qwen2.5-0.5B-Instruct", reward_funcs=reward_len,
                      args=GRPOConfig(output_dir="out/grpo", max_completion_length=512),
                      train_dataset=load_dataset("trl-lib/DeepMath-103K", split="train"))
```

- Return one float per completion; several reward functions are summed.
- The generation batch (`per_device_train_batch_size × processes × steps_per_generation`) must divide by `num_generations` (default 8).
- Generation is the bottleneck: `use_vllm=True` with `vllm_mode="colocate"` (shares GPUs; size with `vllm_gpu_memory_utilization`) or `"server"` (separate `trl vllm-serve --model <id>`).
- Rewards must be hard to game: test the reward on hand-made good and bad answers first.

## 6. Failure modes

| Looks like | Usually is | Fix |
|---|---|---|
| Out of memory | Batch, context or method too big | Batch 1 + more grad accumulation; gradient checkpointing; shorter `max_length`; QLoRA; bigger GPU |
| Loss spikes, NaN | fp16 on non-bf16 hardware; LR too high | bf16; lower LR |
| Loss flat, model unchanged | LR too low (full-FT value on LoRA); attention-only targets | LoRA LR; all-linear targets |
| Great train loss, worse eval | Overfitting: rank or epochs too high for the data | Lower rank, fewer epochs, more varied data |
| Garbled output after training | Train and inference chat templates differ | Same template everywhere (LlamaFactory: `template` identical in train, infer, export) |
| Answers repeat the prompt | Loss on prompts (pre-rendered flat text) | Conversational format + `assistant_only_loss=True` |
| Dataset errors at start | Column names | Inspector, then map |
| All looks like a training-loop bug | A config that contradicts the recipe | Check the recipe table before debugging code |

## Checklist

- [ ] Fine-tuning justified; baseline scored on a held-out task eval
- [ ] Base model licence checked; data rights checked
- [ ] Data in the right shape, validated, deduplicated, split; original untouched
- [ ] LoRA recipe applied: all-linear, alpha = 2r, LoRA LR, effective batch < 32, bf16
- [ ] Current TRL argument names
- [ ] Before/after eval on the held-out set and a general check for regressions
