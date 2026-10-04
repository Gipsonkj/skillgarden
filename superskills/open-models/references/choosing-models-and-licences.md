# Choosing an open model and reading its licence

> Distilled from: open-weights (ericrisco/rsc-harness, MIT); huggingface-best and huggingface-local-models (huggingface/skills, Apache-2.0); hf_benchmarks.py from huggingface-llm-trainer (huggingface/skills, Apache-2.0); ollama (ericrisco/rsc-harness, MIT).

Model names and licences change monthly. The family notes below were written against model cards live in mid-2026; treat every version and licence line as "verify the card", and trust the method more than the list.

## 1. Open model or paid API?

| Open weights win when | A paid API wins when |
|---|---|
| Data must stay on your machines or in your region | You need frontier quality on hard reasoning, coding or long agent runs |
| Volume is high and steady, so a GPU stays busy | Volume is low or spiky; you'd pay for idle GPUs |
| You need to fine-tune, pin a version for years, or run offline | You have no one to run, patch and monitor a server |
| Rate limits or per-token prices block the product | Time to ship matters more than unit cost |

Often the answer is both: a local model for cheap, private or bulk steps (classification, extraction, embeddings, drafts) and a paid model for the hard step. Wiring that up is in [agents-and-tools.md](agents-and-tools.md).

**Break-even, roughly:** self-hosted cost per 1M output tokens = GPU price per hour ÷ (tokens per second × 3600) × 1,000,000. Measure tokens per second on your own prompts at your real concurrency (see [evaluation.md](evaluation.md), section 6), add idle hours, and compare with the API's price page. A GPU that sits idle half the day doubles the real cost.

## 2. Five gates, in order

The licence gate can veto everything above it, so don't fall for a model before clearing it.

1. **Task fit.** Match the model's design to the job (table below).
2. **Size versus hardware.** Can it fit at a sane quant with context? Do the maths in [vram-and-sizing.md](vram-and-sizing.md) before comparing quality.
3. **Licence.** Hobby, internal or a commercial product you distribute? Section 4.
4. **Hardware target.** Consumer GPU (8-24 GB), data-centre GPU (40-80 GB+), Apple unified memory, or CPU. This picks the format: GGUF for CPU, Mac and llama.cpp; AWQ or GPTQ for GPU serving ([quantization.md](quantization.md)).
5. **Community support.** Ready-made GGUF or AWQ quants on the Hub, support in your runtime (llama.cpp, Ollama, vLLM), a documented chat template, recent downloads. No quants and no runtime support means a research artefact, not a choice.

Rule: **the smallest model that passes your own eval wins.** It is cheaper, faster and fits more hardware. Prove it with a task eval before committing.

## 3. Task fit (families as of mid-2026; verify)

| Job | Families to shortlist | Notes |
|---|---|---|
| General chat and instruct | Llama, Qwen, Mistral, Gemma instruct variants | Instruct or chat tunes, not base models |
| Coding | Qwen-Coder, DeepSeek-Coder, gpt-oss, Codestral (check which release) | Prefer Q5_K_M or Q6_K locally when memory allows |
| Reasoning, maths | DeepSeek-R1 style reasoners and their distills, gpt-oss, Qwen reasoning variants | Reasoners emit long thinking: budget context |
| Multilingual | Qwen, Gemma | Read the card's language list |
| Vision (image in) | Qwen-VL, Llama vision, Gemma vision, PaliGemma, Phi multimodal | GGUF vision models need the `mmproj-*.gguf` projector file too |
| Embeddings, retrieval | A dedicated embedding model, not a chat model | e.g. `nomic-embed-text` on Ollama |
| Small, edge, CPU | 0.5B-4B: small Qwen, small Gemma, Phi-mini, SmolLM | Q4_K_M, short context |
| Full provenance (data and code open) | OLMo | When reproducibility matters, not just weights |

Size ladders differ a lot: Qwen runs from under 1B to 200B+ (dense and MoE); Gemma roughly 1B-27B plus specialised siblings; Phi roughly 3B-15B; gpt-oss ships 20B (targets about 16 GB) and 120B (one 80 GB GPU), both MoE.

**MoE:** a "120B" mixture-of-experts model may activate only ~5B parameters per token (fast), but you still need memory for all experts. Size memory by total parameters, speed by active ones.

## 4. Find and compare candidates

URL first, no tools needed:

```text
https://huggingface.co/models?search=<family>&apps=llama.cpp&num_parameters=min:0,max:24B&sort=trending
https://huggingface.co/<repo>?local-app=llama.cpp            # HF's recommended quant and launch snippet
https://huggingface.co/api/models/<repo>/tree/main?recursive=true   # exact files and sizes
```

With the `hf` CLI ([hugging-face-hub.md](hugging-face-hub.md)): `hf models list --search qwen --apps llama.cpp --num-parameters ... --format json`, then `hf models info <repo>` and `hf models card <repo> --metadata` for parameters (`safetensors.total`) and the licence tag.

Benchmarks: Hugging Face hosts official benchmark datasets with leaderboards.

```bash
uv run scripts/huggingface-llm-trainer/hf_benchmarks.py search --alias coding      # aliases: ocr, coding, math, retrieval, agents, asr...
uv run scripts/huggingface-llm-trainer/hf_benchmarks.py leaderboard <namespace>/<benchmark> --top 15
hf datasets leaderboard <namespace>/<benchmark>                                   # same data from the CLI
```

The script only calls huggingface.co and uses `HF_TOKEN` if set. If a leaderboard 404s, skip it and say so; if none fit, fall back to trending models tagged with the task and say the ranking is by popularity.

Device budget for a first filter: fp16 max params (B) ≈ memory (GB) ÷ 2; Q4 max params (B) ≈ memory (GB) × 2. These are ceilings with **no headroom**; confirm with the real formula before recommending. Keep a slightly-too-big top model in the table with a "needs Q4" note rather than dropping it silently.

Present it like this:

| # | Model | Params | Bench A | Bench B | Licence | On device |
|---|---|---|---|---|---|---|
| 1 | org/name (link) | 8B | 85.2 | - | Apache-2.0 | Yes (Q8_0) |
| 2 | org/name | 32B | 88.0 | 71.5 | custom (Llama) | Q4 only |
| 3 | proprietary-model | - | 90.0 | 80.1 | - | API only |

Flag closed models as "API only"; drop them if the user asked for open models only. Leaderboard scores can be contaminated: a small model beating frontier models everywhere is a warning sign, not a win.

## 5. Licences

"Open weights" means the file is downloadable. It says nothing about your rights. **The download button is not a licence.**

| Class | Members as of mid-2026 (verify) | Shipping |
|---|---|---|
| **OSI-open** (Apache-2.0, MIT) | most Qwen sizes, Mistral open models, Phi-4 family (MIT), gpt-oss (Apache-2.0), DeepSeek-R1 (MIT), Gemma 4 (Apache-2.0), OLMo, SmolLM | Commercial use, modify, redistribute. Keep the LICENSE and NOTICE |
| **Custom / community** | Llama (Meta Community Licence), Gemma 1-3 (Gemma Terms of Use) | Usually commercial **if** you meet every condition: acceptable-use policy, attribution, naming, scale caps, pass-through |
| **Non-commercial / restricted** | original Codestral (MNPL, non-production), research-only cards, some RAIL variants, revenue-gated licences, some Command terms | No commercial deployment without a separate licence |

Family traps that moved in one release cycle (mid-2026, verify):

- **Llama:** acceptable-use policy; "Built with Llama" shown on products; derived model names carry "Llama"; ship a copy of the licence with redistributed weights; above 700M monthly active users you must ask Meta for a licence. Gated on the Hub.
- **Gemma 1-3:** custom terms plus a prohibited-use policy that you must pass downstream and ship as a notice. **Gemma 4** moved to Apache-2.0. Same brand, opposite class by version.
- **Qwen:** mostly Apache-2.0, but some sizes have shipped under a separate Qwen licence. Check each size.
- **Mistral:** open models Apache-2.0; original Codestral is non-production; Codestral 2 was relicensed Apache-2.0; some newer models use a "modified MIT" with a revenue threshold.
- **DeepSeek:** R1 weights MIT; original V3 weights use a custom licence with use-based restrictions you must pass on. "DeepSeek = MIT" is too simple.

Mechanics:

- **Gated is not restricted.** Gated means "accept terms on the Hub, then download with a token" (a 403 means you haven't). A gated model can be commercial; an ungated card can still be research-only.
- **Derivatives inherit.** A fine-tune keeps the base model's obligations; a distill can inherit the teacher's terms; a merge inherits from every parent. Follow the `base_model` chain and take the strictest.
- Outputs: some licences say the vendor claims no rights in outputs (Gemma does); others restrict how outputs may be used to train other models. Read that clause if you plan distillation.
- Weights for image, video and audio models have their own terms (FLUX.1 [dev] is non-commercial, MusicGen weights are CC-BY-NC); the media crafts flag these too.

### Commercial-use checklist

- [ ] Opened the **exact model and size** card and its LICENSE or terms page, not a blog or this file
- [ ] Named the class: OSI-open, custom, or restricted
- [ ] Custom: listed each condition (attribution text, AUP, MAU or revenue cap, pass-through) and how you meet it
- [ ] Restricted: confirmed non-commercial use, or obtained a separate licence, or picked another model
- [ ] Checked every ancestor of a fine-tune, distill or merge
- [ ] Recorded the decision: model, revision, licence, conditions, date checked

## 6. Pitfalls

| Pitfall | Fix |
|---|---|
| Stating a licence from memory | State the class, then quote the card you just opened |
| Newest model by default | Smallest model that passes your eval |
| Sizing an MoE by active params | Memory by total params |
| Forcing a too-big model on with Q2 or Q3 | Pick a smaller model or a bigger box |
| Using a base model for chat | Pick the instruct or chat variant; base models don't follow instructions |
| Trusting a tag like `:latest` | Pin the exact tag or revision and quant |

## Checklist

- [ ] Task named; family designed for it shortlisted
- [ ] Smallest likely size picked and checked against the hardware with context
- [ ] Licence class identified and the exact card read
- [ ] Format matches the runtime; quant tier sane (Q4_K_M default)
- [ ] Candidates compared on a task eval, not only leaderboards
- [ ] Decision written down with the date the card was checked
