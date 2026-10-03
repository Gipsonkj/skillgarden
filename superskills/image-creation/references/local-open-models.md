# Local open models: Stable Diffusion (diffusers) and ComfyUI

> Distilled from: stable-diffusion (NousResearch/hermes-agent, MIT), comfyui-workflow-builder (mckruz/comfyui-expert, MIT), prompt-images (replicate/skills, Apache-2.0), flux-image-best-practices (black-forest-labs/skills, MIT)

Use local models when the user has a GPU, needs privacy, unlimited volume, LoRAs/ControlNet, or no per-image cost. Check model licences: FLUX.1/FLUX.2 [dev] weights are non-commercial; SDXL and SD 3.5 have their own terms.

## 1. Pick model and resolution

| Model | Native res | VRAM (fp16) | Notes |
|---|---|---|---|
| SD 1.5 | 512x512 | ~4 GB | Huge LoRA/ControlNet ecosystem, weak text |
| SDXL | 1024x1024 | ~6-8 GB | Best general open baseline; negative prompts work |
| SD 3.5 | 1024x1024 | 10+ GB | Better prompt following and text |
| FLUX.1/2 [dev] | ~1 MP | ~16 GB fp16 / ~8 GB fp8 | Best open quality; no negative prompt; separate VAE |

Wrong resolution for the model is the #1 cause of duplicated limbs and tiled subjects. Keep width/height multiples of 8 (64 is safer) and stay near the native pixel count; change the aspect ratio, not the area (SDXL: 1344x768, 1216x832, 1024x1024, 832x1216, 768x1344).

## 2. diffusers quick start

```python
import torch
from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler
pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16").to("cuda")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
g = torch.Generator("cuda").manual_seed(42)
img = pipe(prompt="A lighthouse on a basalt cliff at blue hour, long exposure, wet rocks",
           negative_prompt="blurry, low quality, distorted, extra limbs, watermark, text",
           num_inference_steps=25, guidance_scale=6.5, width=1344, height=768, generator=g).images[0]
img.save("lighthouse.png")
```

Apple Silicon: `.to("mps")` and `torch_dtype=torch.float16` (fall back to float32 if you get black images).

## 3. Parameters that matter

| Param | Typical | Effect |
|---|---|---|
| `num_inference_steps` | 20-30 (DPM++/UniPC), 30-50 (Euler), 4-8 (LCM/Turbo/Lightning) | More is not always better past ~30 |
| `guidance_scale` (CFG) | SD1.5 7-8, SDXL 5-7, LCM ~1, FLUX dev 3-4 via distilled guidance | Too high = burnt, over-saturated |
| `strength` (img2img) | 0.3-0.5 light touch, 0.6-0.8 restyle | 1.0 ignores the input |
| `negative_prompt` | short artifact list | SD-family only |
| `generator.manual_seed` | fixed int | reproducibility |

Schedulers: DPMSolverMultistep or UniPC (15-25 steps, sharp) as default; EulerAncestral for more variety; DDIM for deterministic; LCM for 4-8-step speed (with the LCM LoRA).

## 4. img2img, inpainting, ControlNet, LoRA

- **img2img**: `AutoPipelineForImage2Image`; resize the input to the model's native size first.
- **Inpainting**: `AutoPipelineForInpainting` with `image` + `mask_image` (white = repaint). Feather the mask; describe the fill.
- **ControlNet** keeps structure: `canny` (edges), `depth` (3D layout), `openpose` (human pose), `lineart`/`scribble` (sketch to image), `mlsd` (architecture lines). Strength 0.5-1.0; lower for more freedom.
- **LoRA**: `pipe.load_lora_weights(path, adapter_name="style")`; multiple: `pipe.set_adapters(["style","char"], adapter_weights=[0.7, 0.5])`. Use the trigger word. Keep summed weights ≲ 1.5.
- **Identity** without training: IP-Adapter (style/subject), InstantID or PuLID (faces). With InstantID keep CFG 4-5.

## 5. Memory and speed

Order to try when you hit CUDA OOM: `pipe.enable_model_cpu_offload()` → `enable_attention_slicing()` → `enable_vae_slicing()` / `enable_vae_tiling()` (large images) → batch size 1 → smaller resolution → `enable_sequential_cpu_offload()` (slow). Use fp16/bf16 (bf16 needs Ampere+). Call `torch.cuda.empty_cache()` between big jobs.

| Symptom | Fix |
|---|---|
| Black image | dtype mismatch or fp16 VAE overflow: use the fp16-fixed SDXL VAE or float32 VAE |
| Noise/static | Too few steps or wrong scheduler config; check the model loaded fully |
| Blurry | More steps, a better VAE, native resolution |
| Burnt colours | Lower CFG |
| Duplicated subjects | Resolution too far from native |
| Package import errors | Upgrade `diffusers` and `huggingface_hub` together; match torch to CUDA |

Leave the built-in safety checker on. If it blocks a legitimate image, change the prompt rather than disabling it.

## 6. ComfyUI workflows (API JSON)

API-format workflow = a dict of nodes keyed by string id. Each node has `class_type` and `inputs`; a connection is `["<source_id>", <output_index>]` (0-based).

Basic SDXL text-to-image:

```json
{
  "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"}},
  "2": {"class_type": "CLIPTextEncode", "inputs": {"text": "POSITIVE PROMPT", "clip": ["1", 1]}},
  "3": {"class_type": "CLIPTextEncode", "inputs": {"text": "blurry, watermark, text", "clip": ["1", 1]}},
  "4": {"class_type": "EmptyLatentImage", "inputs": {"width": 1024, "height": 1024, "batch_size": 1}},
  "5": {"class_type": "KSampler", "inputs": {"seed": 42, "steps": 25, "cfg": 6.5, "sampler_name": "dpmpp_2m",
        "scheduler": "karras", "denoise": 1.0, "model": ["1", 0], "positive": ["2", 0],
        "negative": ["3", 0], "latent_image": ["4", 0]}},
  "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
  "7": {"class_type": "SaveImage", "inputs": {"filename_prefix": "sdxl", "images": ["6", 0]}}
}
```

Rules:
- `CheckpointLoaderSimple` outputs `[MODEL, CLIP, VAE]` at indices 0, 1, 2.
- FLUX is not a single checkpoint in most setups: `UNETLoader` (diffusion model) + `DualCLIPLoader` (clip_l + t5xxl, type `flux`) + `VAELoader` (`ae.safetensors`). Put guidance in a `FluxGuidance` node (~3.5) and set KSampler `cfg` to 1.0; leave the negative empty.
- img2img: `LoadImage` → `VAEEncode` → KSampler `latent_image`, `denoise` 0.4-0.7.
- Inpaint: `LoadImage` (with mask) → `VAEEncodeForInpaint` (grow_mask_by 6-16), or `InpaintModelConditioning` for inpaint models.
- LoRA: `LoraLoader` between checkpoint and sampler/CLIP (`strength_model`, `strength_clip` 0.6-1.0).
- ControlNet: `ControlNetLoader` + `ControlNetApplyAdvanced` on the positive/negative conditioning.
- Upscale: `UpscaleModelLoader` + `ImageUpscaleWithModel` (4x ESRGAN), then optional low-denoise (0.2-0.35) second pass.

Before running, validate against the actual server:
1. Every `class_type` exists (`GET /object_info`); custom nodes may be missing.
2. Every model filename matches what's installed (`GET /object_info/CheckpointLoaderSimple` lists ckpts).
3. No dangling required inputs.
4. VRAM estimate fits: SD1.5 ~4 GB, SDXL ~6 GB, FLUX fp8 ~8 GB / fp16 ~16 GB; add ~1.5 GB per ControlNet, ~2 GB IP-Adapter, ~4 GB InstantID.

Queue with `POST {COMFYUI_URL}/prompt` body `{"prompt": <workflow>}`; poll `GET /history/<prompt_id>`; fetch files from `GET /view?filename=...`. Workflows exported with "Save (API Format)" are the right shape; the normal UI save format is different.

## 7. Prompting local models

- SD 1.5/SDXL still respond to comma-separated tags and `(word:1.2)` weights; SD 3.5 and FLUX prefer prose like the hosted models.
- Keep negatives short and specific; long "bad anatomy, worst quality…" lists mostly add noise on SDXL.
- Text rendering is weak on SD1.5/SDXL: overlay text afterwards.
