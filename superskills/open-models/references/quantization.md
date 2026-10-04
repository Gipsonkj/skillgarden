# Quantization: GGUF, AWQ, GPTQ and friends

> Distilled from: gguf-quantization and its references (Orchestra-Research/AI-Research-SKILLs, MIT); huggingface-local-models quantization and hub-discovery references (huggingface/skills, Apache-2.0); huggingface-llm-trainer gguf_conversion (huggingface/skills, Apache-2.0); open-weights sizing-and-quant and ollama (ericrisco/rsc-harness, MIT); unsloth-buddy (TYH-labs/unsloth-buddy, MIT); llamafactory-sft (hiyouga/LlamaFactory, Apache-2.0).

Quantization stores weights in fewer bits so a model fits smaller hardware, for a small quality cost. **First look for a ready-made quant on the Hub**; quantize yourself only when none exists or you need a custom calibration.

## 1. Pick the format by runtime

| Format | Runs in | Use it for |
|---|---|---|
| **GGUF** | llama.cpp, Ollama, LM Studio, llama-cpp-python | CPU, Apple Silicon, single-GPU local work. Self-contained file, quant in the name |
| **AWQ** | vLLM, TGI, transformers | GPU serving; activation-aware 4-bit with strong quality |
| **GPTQ** | vLLM, TGI, transformers | GPU serving; older 4-bit, very widely available |
| **bitsandbytes NF4 / int8** | transformers | Load-time quantization for experiments and QLoRA training, not fast serving |
| **EXL2** | ExLlamaV2 | Flexible bit-rates on consumer GPUs |
| **HQQ** | transformers | Fast, calibration-free |
| **MLX 4-bit** | MLX (Apple Silicon) | `mlx-community/*-4bit` repos for MLX apps |

Rule: local, Mac or CPU → GGUF. GPU serving → AWQ or GPTQ. Fine-tuning experiments → bitsandbytes NF4.

## 2. Reading a GGUF tag

`Q4_K_M` = ~4-bit weights (`Q4`), k-quant mixed precision that keeps sensitive tensors at more bits (`_K`), medium size tier (`_M`; `_S` smaller, `_L` larger). Legacy tags (`Q4_0`, `Q4_1`, `Q5_0`) are flat and worse at the same size. `IQ2_XXS` ... `IQ4_XS` are importance-aware low-bit types that need an imatrix. Repo-specific labels such as Unsloth's `UD-Q4_K_M` are their own recipes: **keep the repo's label exactly**, don't normalise it to `Q4_K_M`.

Quality ladder, measured on a 7B Llama 2 in the source (perplexity vs fp16; lower is better):

| Quant | Size (7B) | Perplexity change | Verdict |
|---|---|---|---|
| fp16 | 13.0 GB | baseline | Reference |
| Q8_0 | 7.0 GB | +0.03% | Near-lossless |
| Q6_K | 5.5 GB | +0.13% | Best quality per byte |
| Q5_K_M | 4.8 GB | +0.39% | Code and technical work |
| **Q4_K_M** | 4.1 GB | +1.68% | **Default** |
| Q4_K_S | 3.9 GB | +2.62% | Tight memory |
| Q3_K_M | 3.3 GB | +6.07% | Last resort, small models only |
| Q2_K | 2.7 GB | +15.3% | Usually unusable |

Picks by job: chat and assistants Q4_K_M (Q5_K_M if spare memory); code Q5_K_M or Q6_K; technical, legal or medical Q6_K or Q8_0; drafts Q4_K_M; Raspberry Pi class devices Q3_K_S or Q2_K only because nothing else fits.

**Drop model size before dropping below Q4.** A 14B at Q4_K_M beats a 70B at Q2_K on quality and fit.

## 3. Get a pre-quantized GGUF

1. Search `https://huggingface.co/models?search=<family>&apps=llama.cpp&sort=trending`.
2. Open `https://huggingface.co/<repo>?local-app=llama.cpp`: the "Hardware compatibility" panel lists each quant label with its file size, and the "Use this model" snippet is the launch command to copy. If the page text doesn't expose the panel, say so and fall back to the tree.
3. Confirm exact filenames: `https://huggingface.co/api/models/<repo>/tree/main?recursive=true`. Keep `.gguf` files; `mmproj-*.gguf` is the vision projector (needed for image input, not the main model); `BF16/` shards are the unquantized source.
4. Run it straight from the Hub: `llama-server -hf <repo>:<QUANT>`, or `--hf-repo <repo> --hf-file <file.gguf>` when labels are ambiguous. Ollama: `ollama pull` a library tag, or `FROM ./model.gguf` in a Modelfile ([local-inference.md](local-inference.md)).

Report it like: repo, recommended quant and size, launch command, other quants with sizes, projector file.

## 4. Make your own GGUF

Only when the repo has no GGUF (common for your own fine-tunes).

```bash
hf download <org>/<model> --local-dir ./model-src                 # full-precision weights
python convert_hf_to_gguf.py ./model-src --outfile model-f16.gguf --outtype f16   # from a llama.cpp checkout, after pip install -r requirements.txt
llama-quantize model-f16.gguf model-Q4_K_M.gguf Q4_K_M
llama-cli -m model-Q4_K_M.gguf -p "Hello" -n 50                    # smoke test
```

Build llama.cpp with CMake (many older guides still show `make GGML_CUDA=1`; current llama.cpp builds with CMake): `cmake -B build -DGGML_CUDA=ON` (omit for CPU; Metal is the default on Apple Silicon), then `cmake --build build --config Release`. Or `brew install llama.cpp` for the binaries. Several quants from one f16 file: loop `llama-quantize` over `Q4_K_M Q5_K_M Q6_K Q8_0`.

No GPU or build tools? The `ggml-org/gguf-my-repo` Space converts a Hub repo to GGUF in the browser.

**Importance matrix (imatrix)** improves Q4 and is essential at Q3 and below:

```bash
llama-imatrix -m model-f16.gguf -f calibration.txt -o model.imatrix --chunk 512 -ngl 99
llama-quantize --imatrix model.imatrix model-f16.gguf model-Q4_K_M.gguf Q4_K_M
```

Calibration text should look like the real workload (code for a code model), on the order of 100 MB in the source's guidance; diverse beats large.

Other routes:
- Ollama from a full-precision source: `ollama create my-model --quantize q4_K_M -f Modelfile` (FROM must be fp16 or fp32; you can't re-quantize a Q4).
- Unsloth after training: `model.save_pretrained_gguf("out", tokenizer, quantization_method="q4_k_m")` (`f16`, `q8_0`, `q5_k_m`, `q4_k_m`, `q3_k_m`, `q2_k`). On Mac via mlx-tune it always writes f16 and fails if trained with `load_in_4bit=True`; quantize afterwards with llama.cpp.

## 5. LoRA adapters and quantization

- **Merge into the full-precision base, then quantize.** Merging a LoRA into an already quantized model produces a broken model (LlamaFactory: don't set `quantization_bit` when exporting a merge).
- llama.cpp can also apply an adapter at runtime without merging: `--lora adapter.gguf --lora-scale 1.0`. Ollama: `ADAPTER` in a Modelfile.

## 6. GPU-serving quants (AWQ, GPTQ)

For vLLM and similar, pick a pre-quantized AWQ or GPTQ repo from the Hub (search the family name plus "AWQ" or "GPTQ") and serve it like any model; check the repo card for the runtime and GPU it was tested on. Making your own needs calibration data and the quantization library's own docs; the Orchestra AWQ and GPTQ skills cover that (see the router's Go deeper table). FP8 is another serving option on recent NVIDIA GPUs where the runtime supports it.

## 7. Check the quality you kept

- Perplexity on held-out text: `llama-perplexity -m model.gguf -f wiki.test.raw -c 512`; compare with the f16 file. More than a few percent worse at Q4 suggests a bad conversion or a missing imatrix.
- Better: run your own task eval on base vs quant ([evaluation.md](evaluation.md)). Code and maths lose more at low bits than chat.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Gibberish output | Quant too aggressive, bad conversion, wrong chat template | Q4_K_M or higher; reconvert; check the template |
| Out of memory | Model or context too big | Smaller quant tier, fewer GPU layers (`-ngl`), shorter context (`-c 2048`) |
| Conversion `KeyError` on a tensor | Architecture unsupported by your llama.cpp version | Update llama.cpp; check the architecture in `config.json` |
| "Vocabulary size mismatch" | Tokenizer and embeddings differ (often after adding tokens) | Resize embeddings to the tokenizer before saving, then convert |
| Out of memory during conversion | Conversion grabbed the GPU | `CUDA_VISIBLE_DEVICES="" python convert_hf_to_gguf.py ...` |
| File larger than expected | Wrong type passed to `llama-quantize` | Check the type argument; compare with the size table |
| Q8_0 much slower than Q4 | More bytes to move per token | Expected; pick by quality need |

## Checklist

- [ ] Looked for a pre-quantized repo first and read its compatibility panel
- [ ] Format matches the runtime (GGUF local, AWQ/GPTQ served)
- [ ] Repo-native quant label kept; `mmproj` fetched for vision models
- [ ] Not below Q4 without a reason the user accepted
- [ ] imatrix used for Q4 and below when quantizing yourself
- [ ] LoRA merged into full precision before quantizing
- [ ] Quality checked against f16 on a task eval or perplexity
