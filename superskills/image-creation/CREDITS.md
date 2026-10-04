# Credits: image-creation

All sources below are license_ok and not non-commercial. Reference files are distilled in our own words; scripts and templates are copied as-is with their licence beside them.

| Source skill | Repo URL | License | What was used |
|---|---|---|---|
| imagegen | https://github.com/openai/skills/tree/main/skills/.system/imagegen | Apache-2.0 | Prompt spec and use-case taxonomy, augmentation policy, edit invariants, Image API parameters; `scripts/imagegen/image_gen.py` copied with LICENSE.txt |
| algorithmic-art | https://github.com/anthropics/skills/tree/main/skills/algorithmic-art | Apache-2.0 | Philosophy-then-code process, seeded p5.js requirements; `templates/algorithmic-art/viewer.html` and `generator_template.js` copied with LICENSE.txt |
| gemini-api-dev | https://github.com/google-gemini/gemini-skills/tree/main/skills/gemini-api-dev | Apache-2.0 | Current Gemini image model ids, SDK names, Interactions API `output_image`, docs links |
| baoyu-image-gen | https://github.com/jimliu/baoyu-skills/tree/main/skills/baoyu-image-gen | MIT | Identity-preserving reference rules, GPT Image 2.x size constraints, provider selection, batch vs sequential guidance, Replicate model notes |
| fal-ai-media | https://github.com/affaan-m/everything-claude-code/tree/main/skills/fal-ai-media | MIT | fal MCP tools, Nano Banana app ids, image_size values |
| image | https://github.com/coreyhaines31/marketingskills/tree/main/skills/image | MIT | Approach/model decision tables, marketing workflows, platform sizes, web optimisation, OG tags, prompt mistakes |
| generate-image | https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/generate-image | MIT | OpenRouter model capabilities, preflight/billing behaviour, "illustration not evidence" rule; `scripts/generate-image/generate_image.py` copied with LICENSE.source-repo |
| imagegen-frontend-web | https://github.com/Leonxlnx/taste-skill/tree/main/skills/imagegen-frontend-web | MIT | One-image-per-section comps, continuity vs variation rules, hero composition alternatives, anti-slop list |
| prompt-images | https://github.com/replicate/skills/tree/main/skills/prompt-images | Apache-2.0 | Natural-language prompting, photographic vocabulary, text, editing, consistency and pitfalls |
| flux-image-best-practices | https://github.com/black-forest-labs/skills/tree/master/skills/flux-image-best-practices | MIT | FLUX.2 model family, no-negative rule, word order, hex colours, JSON prompts, i2i and multi-reference patterns |
| nano-banana-pro-openrouter | https://github.com/github/awesome-copilot/tree/main/skills/nano-banana-pro-openrouter | MIT | OpenRouter route to Gemini image, retry policy |
| nano-banana-pro (intellectronica) | https://github.com/intellectronica/agent-skills/tree/main/skills/nano-banana-pro | CC0-1.0 | Resolution mapping, filename convention; `scripts/nano-banana-pro/generate_image.py` copied with LICENSE.source-repo |
| nano-banana-pro (steipete) | https://github.com/steipete/agent-scripts/tree/main/skills/nano-banana-pro | MIT | Draft→final workflow, generation and edit templates, preflight/failure table |
| nano-banana | https://github.com/kingbootoshi/nano-banana-2-skill/tree/main/plugins/nano-banana/skills/nano-banana | MIT | Green-screen transparency route, blank-reference size trick, reference order, cost table |
| higgsfield-generate | https://github.com/higgsfield-ai/skills/tree/main/higgsfield-generate | MIT | Model routing defaults, prompt basics, ad-variant workflow idea, which-image-model-when routing (Nano Banana vs GPT Image 2.5) |
| higgsfield-ai-prompt-skill | https://github.com/OSideMedia/higgsfield-ai-prompt-skill | MIT | Nano Banana and GPT Image failure modes and fixes, location/reference handling, product reference-sheet recipe, GPT Image 2 prompt shapes (JSON/prose/meta), ad layout zones and wireframe trick (gemini-nano-banana, openai-gpt-image) |
| gpt-image-2-style-library | https://github.com/freestylefly/awesome-gpt-image-2/tree/main/agents/skills/gpt-image-2-style-library | MIT | Template families with lock/pitfall guidance (paraphrased; the 2 MB library and images were not copied) |
| stable-diffusion | https://github.com/NousResearch/hermes-agent/tree/main/optional-skills/mlops/stable-diffusion | MIT | diffusers pipelines, schedulers, parameters, ControlNet/LoRA, memory fixes, troubleshooting |
| imagen | https://github.com/sanjay3290/ai-skills/tree/main/skills/imagen | Apache-2.0 | Use cases for frontend placeholder and UI assets |
| comfyui-workflow-builder | https://github.com/mckruz/comfyui-expert/tree/master/skills/comfyui-workflow-builder | MIT | API-JSON node format, validation steps, VRAM table, common mistakes |
| image-prompt | https://github.com/gongnyang/gongnyang-prompt-kit/tree/main/skills/image-prompt | MIT | GPT Image 2 positive-phrasing rule, banned SD-era vocabulary, role-labelled text, 3x3 grid positions, canvas size as text-accuracy lever |
| bytedance-modelark | https://github.com/Gipsonkj/skillgarden/tree/main/authored/bytedance-modelark | MIT | Seedream 5.0 on ModelArk: endpoint, canvas floor and working sizes, model activation, phone-photo realism recipe (hosted-models-flux-replicate-fal); `scripts/bytedance-modelark/ark.py` copied with LICENSE |

## Also see (not included)

- genmedia (fal.ai official CLI for 1200+ endpoints): https://github.com/fal-ai-community/skills/tree/main/skills/genmedia (no LICENSE file; link only)
- ai-image-generation (inference.sh CLI, 50+ models): https://github.com/inference-sh/skills/tree/main/tools/image/ai-image-generation (no LICENSE file; link only)
