# Credits

This super skill distills these source skills. The reference text is rewritten in our own words. Scripts are copied unchanged, with each source's licence file beside them.

| Source skill | Repo | License | What was used |
|---|---|---|---|
| hyperframes | https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes | Apache-2.0 | Routing table, brief fields, production loop, review gates, capability map (plan-and-route, hyperframes-workflows) |
| general-video | https://github.com/heygen-com/hyperframes/tree/main/skills/general-video | Apache-2.0 | Composition contract, footage cut recipe, dispatch economics, done criteria (hyperframes-workflows) |
| music-to-video | https://github.com/heygen-com/hyperframes/tree/main/skills/music-to-video | Apache-2.0 | Beat-grid trust boundary, frame skeleton, montage treatments (music-beat-cut); **script copied:** `scripts/music-to-video/analyze-beatgrid.py` |
| faceless-explainer | https://github.com/heygen-com/hyperframes/tree/main/skills/faceless-explainer | Apache-2.0 | Explainer story design, hooks, clarity techniques, audio and caption steps (explainers-and-promos, plan-and-route) |
| talking-head-recut | https://github.com/heygen-com/hyperframes/tree/main/skills/talking-head-recut | Apache-2.0 (adapted upstream from notedit/vtake-skills, MIT) | Card pacing formula, zones, portrait sizing, assembly and QA rules (captions-talking-head) |
| embedded-captions | https://github.com/heygen-com/hyperframes/tree/main/skills/embedded-captions | Apache-2.0 | Decision gate, caption grouping, rail spec, legibility probes, failure modes (captions-talking-head) |
| video-use | https://github.com/browser-use/video-use | MIT | Hard rules, transcript-driven process, EDL, cut craft, overlays, sound rules, self-eval (footage-editing-ffmpeg, music-beat-cut, delivery-qa); **scripts copied:** `scripts/video-use/render.py`, `grade.py`, `timeline_view.py`, `pack_transcripts.py`, `transcribe.py` |
| brag | https://github.com/latent-spaces/brag/tree/main/skills/brag | MIT | Launch-video laws, tones, poster frame baked as frame 0, share copy, SFX rules (explainers-and-promos, delivery-qa, music-beat-cut) |
| video-editing | https://github.com/affaan-m/everything-claude-code/tree/main/skills/video-editing | MIT | Layered editing pipeline, ffmpeg cut/reframe/detect recipes (footage-editing-ffmpeg) |
| video | https://github.com/coreyhaines31/marketingskills/tree/main/skills/video | MIT | Approach chooser, model landscape, prompt formula, camera and style vocabulary, avatar fit, edit reverse-engineering (plan-and-route, generative-prompting, vendor-apis, explainers-and-promos) |
| video-generation | https://github.com/bytedance/deer-flow/tree/main/skills/public/video-generation | MIT | Structured JSON prompt shape, Veo/MiniMax provider selection by environment (generative-prompting, vendor-gemini-omni) |
| gemini-omni-flash-api | https://github.com/google-gemini/gemini-skills/tree/main/skills/gemini-omni-flash-api | Apache-2.0 | Limits, prompting, role tags, edit/extend rules (vendor-gemini-omni); **scripts copied:** `scripts/gemini-omni-flash-api/upload_file.py`, `video/generate_video.py`, `video/inspect_video.py`, `video/prep_video.py` |
| ltx2 | https://github.com/digitalsamba/claude-code-video-toolkit/tree/main/.claude/skills/ltx2 | MIT | Frame-count and resolution rules, cost, prompting, use cases (vendor-apis, generative-prompting) |
| ffmpeg-skill | https://github.com/kajisho5/ffmpeg-skill | MIT | Workflow order, platform safe zones and specs, loudness and VFR/keyframe gotchas, report format (footage-editing-ffmpeg, delivery-qa) |
| heygen-video | https://github.com/heygen-com/skills/tree/master/heygen-video | MIT | Video Agent flow, prompt construction, frame check, duration padding, troubleshooting (vendor-heygen-avatars) |
| vox-director | https://github.com/Alisa0808/vox-director | MIT | Beat/arc library, flat-safe camera vocabulary, collage prompt structure, Atlas Cloud and ffmpeg gotchas (generative-prompting, vendor-apis, explainers-and-promos) |
| flux-3-video | https://github.com/black-forest-labs/skills/tree/master/skills/flux-3-video | MIT | Specialist routing and hand-off fields (vendor-apis) |
| lanshu-create-ai-presenter-video | https://github.com/cclank/lanshu-create-ai-presenter-video | MIT | Consent rules, evidence-based state machine, presenter QA, recovery (vendor-heygen-avatars, delivery-qa); **script copied:** `scripts/lanshu-create-ai-presenter-video/finalize_delivery.sh` |
| genmedia | https://github.com/fal-ai-community/skills/tree/main/skills/genmedia | MIT (stated in README; no LICENSE file in the repo) | genmedia CLI command surface and rules (vendor-apis). Nothing copied verbatim. |
| rw-generate-video | https://github.com/runwayml/skills/tree/main/skills/rw-generate-video | MIT | Runway model table, ratios, credential and error handling (vendor-apis) |

## Also see (not included)

- remotion-best-practices, https://github.com/remotion-dev/skills/tree/main/skills/remotion-best-practices (no licence file; Remotion has its own source-available licence). Read it directly for Remotion work.
- hypit, https://github.com/hypit-ai/hypit/tree/main/skills/hypit (licence NOASSERTION; paid generation APIs).

Excluded: onetake (feitangyuan/onetake) is non-commercial only, so none of its content was used.
