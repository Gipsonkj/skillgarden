# VRAM, context and size maths

> Distilled from: ollama and its hardware-sizing reference, open-weights sizing-and-quant (ericrisco/rsc-harness, MIT); gguf-quantization (Orchestra-Research/AI-Research-SKILLs, MIT); huggingface-local-models (huggingface/skills, Apache-2.0); unsloth-buddy (TYH-labs/unsloth-buddy, MIT); vllm-deploy-simple (vllm-project/vllm-skills, Apache-2.0); modal gpu reference (K-Dense-AI/scientific-agent-skills, Apache-2.0).

Total memory = **weights + KV cache + overhead**. People size the weights, forget the cache, then run out of memory at long context. Budget all three before you download anything.

## 1. Weights

```text
weights_GB ≈ params(B) × bytes_per_param × 1.2      # ×1.2 = runtime and format overhead
```

| Precision | Bytes per param | 8B model | 32B | 70B |
|---|---|---|---|---|
| fp16 / bf16 | 2.0 | ~16 GB | ~64-70 GB | ~140 GB |
| 8-bit (Q8_0, int8) | ~1.0 (Q8_0 measures ~8.5 bits) | ~8-9 GB | ~32-36 GB | ~70-75 GB |
| Q6_K | ~0.8 | ~6-8 GB | ~26-31 GB | ~56-67 GB |
| 4-bit (Q4_K_M, AWQ, GPTQ) | ~0.5-0.6 (Q4_K_M measures ~4.9 bits) | ~5-6 GB | ~20 GB | ~40-48 GB |

The 4-bit and 8-bit figures are rounded from llama.cpp's measured k-quant rates (as cited in the sources, on Llama-3.1-8B). Round **up** when budgeting. The real number is the file size: read it from the Hub tree API, `ollama show`, or the `?local-app=llama.cpp` page, which lists each quant's size.

**A 70B at fp16 (~140 GB) fits no single GPU.** Either quantize to 4-bit (~40 GB, fits one 80 GB card) or split it across GPUs with tensor parallelism ([serving-endpoints.md](serving-endpoints.md)).

## 2. KV cache

Every token in context stores a key and a value per layer, on top of the weights:

```text
kv_bytes_per_token = 2 × layers × kv_heads × head_dim × bytes_per_element
kv_GB = kv_bytes_per_token × context_tokens × parallel_sequences / 1e9
```

Read `num_hidden_layers`, `num_key_value_heads` and `head_dim` (or `hidden_size ÷ num_attention_heads`) from the model's `config.json`. Worked example with a Llama-3.1-8B-style config (32 layers, 8 KV heads, head_dim 128, fp16 cache):

| Context | KV cache, 1 sequence |
|---|---|
| 8K | ~1 GiB |
| 32K | ~4 GiB |
| 128K | ~16 GiB (more than the Q4 weights) |

A 70B-class config (80 layers, same KV heads) needs ~2.5x that: tens of GB at 128K. Shape to remember: **doubling context doubles the cache, and so does doubling parallel requests.**

Shrink it:

| Lever | How | Cost |
|---|---|---|
| Cap context to what the task needs | Ollama `num_ctx`; llama.cpp `-c`; vLLM `--max-model-len` | None if the task fits |
| Quantize the cache | Ollama `OLLAMA_KV_CACHE_TYPE=q8_0` (about half) or `q4_0` (about a quarter); llama-cpp-python `type_k`/`type_v` | Small accuracy loss |
| Fewer parallel sequences | `OLLAMA_NUM_PARALLEL`, llama-server `--parallel` | Throughput |
| Flash attention | `OLLAMA_FLASH_ATTENTION=1` on supported GPUs | None |

## 3. What fits where (4-bit unless noted, leave headroom)

| Memory | Comfortable pick | Notes |
|---|---|---|
| 8 GB GPU | 7-8B Q4_K_M (~5-6 GB) | Small context; the OS needs some too |
| 12 GB | up to ~14B Q4_K_M; 7-8B Q8_0 | |
| 16 GB | 14B Q4_K_M; 32B does not fit | gpt-oss-20b class targets this tier |
| 24 GB (3090/4090, L4, A10) | ~32B Q4_K_M (~20 GB) | 70B does not fit at a usable quant |
| 48 GB (L40S, 2×24 GB) | 70B Q4 is tight | Long context pushes it over |
| 80 GB (A100/H100) | 70B Q4 (~40 GB) or a big MoE like gpt-oss-120b | fp16 ceiling is ~34B |
| 2×80 GB+ | 70B fp16 via tensor parallel | |
| Apple unified memory | Budget against total RAM minus several GB for macOS | 64 GB runs 32B Q4 comfortably; 70B Q4 leaves little room for context |
| CPU only | ≤3B Q4 GGUF | Slow but works; threads = physical cores |

Keep weights at **70-80% of memory** at most: the rest is cache, activations and runtime. vLLM claims a fraction of GPU memory up front (`--gpu-memory-utilization`, default 0.9; the bundled quickstart uses 0.8) and fills the rest of that slice with KV cache.

Apple Silicon note: Ollama can use an MLX backend (Ollama 0.19, March 2026) only on Macs with **more than 32 GB** unified memory; below that it uses the llama.cpp engine. The sizing maths is the same either way.

## 4. Partial GPU offload (llama.cpp, Ollama)

When the model is a bit too big for VRAM, llama.cpp can keep some layers on the CPU: `-ngl 99` puts all layers on the GPU (Mac Metal, or when it fits); a lower number such as `-ngl 20` splits the model. Each layer moved to the CPU slows generation a lot. Use it to get something running, not as a production plan. Multi-GPU split: `--tensor-split 0.5,0.5`.

## 5. Training memory (Unsloth figures, per the source)

| Model size | QLoRA 4-bit | LoRA 16-bit | Full fine-tune |
|---|---|---|---|
| 1-3B | ~4-6 GB | ~12-16 GB | ~24-32 GB |
| 7-8B | ~8-10 GB | ~24-32 GB | ~60-80 GB |
| 13-14B | ~12-16 GB | ~40-48 GB | ~120+ GB |
| 70B | ~40-48 GB | ~160+ GB | ~500+ GB |

GRPO with QLoRA: roughly 1 GB of VRAM per billion parameters, plus context. Plain TRL without Unsloth needs more (Unsloth's checkpointing alone saves roughly 30%). On a Mac with MPS: ≤3B, short context, float32 (see [fine-tuning-runners.md](fine-tuning-runners.md)).

## 6. GPU cheat sheet (VRAM)

T4 16 GB · L4 24 GB · A10/A10G 24 GB · RTX 4090 24 GB · L40S 48 GB · A100 40 or 80 GB · H100 80 GB · H200 141 GB · B200 192 GB · RTX PRO 6000 96 GB. Cloud names and prices: [gpu-hosting-runpod-modal.md](gpu-hosting-runpod-modal.md).

## 7. Fit decision

1. Weights for the model and quant you want (section 1; prefer the real file size).
2. Add KV cache for your target context × parallel requests (section 2).
3. Add 1-2 GB overhead (more for vLLM's CUDA graphs and activations).
4. Over budget? In this order: cap context, quantize the KV cache, step the model **down one size**. Do not go below Q4.
5. Still over at the quality you need? It is a remote GPU job (RunPod, Modal, HF Endpoints) or a paid API, not a quant downgrade.

## Pitfalls

| Pitfall | Fix |
|---|---|
| Pulling fp16 on a box that only fits Q4 | Q4_K_M, or Q8_0 if it fits: fp16 is ~4x the memory for a few % quality |
| `num_ctx` 128K on a 12 GB GPU | Cap context; quantize the cache |
| Sizing a 120B MoE like a 5B dense | Memory by total params |
| Forgetting parallel requests multiply the cache | Budget cache × concurrency |
| "It's pulled, so it's using VRAM" | `ollama list` is disk; `ollama ps` is memory |
| Q2 to cram a 70B onto 12 GB | A 14B at Q4_K_M beats a 70B at Q2_K on quality and fit |

## Checklist

- [ ] Weights from the real file size or the formula, rounded up
- [ ] KV cache for the real context and concurrency added
- [ ] Headroom of 20-30% left
- [ ] MoE sized by total parameters
- [ ] Not below Q4; smaller model or bigger box chosen instead
