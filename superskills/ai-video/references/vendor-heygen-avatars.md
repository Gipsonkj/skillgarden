# Vendor: AI presenters and avatars (HeyGen, Synthesia and provider-neutral presenter video)

> Distilled from: heygen-video (heygen-com/skills, MIT); lanshu-create-ai-presenter-video (cclank/lanshu-create-ai-presenter-video, MIT); video (coreyhaines31/marketingskills, MIT); ltx2 (digitalsamba/claude-code-video-toolkit, MIT); hyperframes capability menu (heygen-com/hyperframes, Apache-2.0). Synthesia section: Synthesia's API and MCP docs, in our own words.

## When an avatar is the right call

| Use an avatar | Use something else |
|---|---|
| Recurring updates, multilingual versions, personalized outreach at scale, explainers without filming | Authentic founder content (film it), UI walkthroughs (screen recording), creative/artistic pieces (generative video) |

## Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already has a HeyGen or Synthesia account, or a custom avatar in one | That provider | Their avatars, voices and plan are already there |
| Has a custom avatar or cloned voice but you don't know where | Ask which account; don't guess | Its ID comes from that account (HeyGen's avatar list, Synthesia's Copy ID) |
| The agent should direct the creative: scenes, b-roll, style | HeyGen Video Agent | Turns a prompt into a whole video (processing takes roughly 5 to 10 times the video's length) |
| Scripted presenter at scale: training, onboarding, many languages, template-filled | Synthesia Video API or MCP | Templates, translation and dubbing calls; Video API needs Creator or above |
| Wants to see a draft before paying (on a Synthesia plan) | Synthesia with `"test": true` | Free, watermarked, outside quota (30 a day) |
| Dub or translate an existing video | Synthesia dubbing or translation; HeyGen translation/dubbing | Both offer it; pick the account the user has |
| Own presenter image with another lip-sync or avatar model, or a provider that caps clip length | Provider-neutral pipeline below | Narration-locked state machine that works with any model |
| Stylized character, mask or helmet; exact lip sync doesn't matter | Image-to-video (LTX, Gemini Omni), see Cheaper stand-ins | Often looks better; self-hosted LTX has no API fee (you pay the GPU) |

## Consent and rights (hard rules)

- The presenter image shows one clear **adult**, and the user has the rights to it. Record the confirmation.
- Uploading a face or voice to a remote provider needs explicit approval for that upload.
- A voice clone needs an authorized sample of that person. Never infer or synthesize a real person's voice from their photo.
- Never try to get around a provider's likeness, celebrity or content filters.

## HeyGen Video Agent (`HEYGEN_API_KEY`, MCP or `heygen` CLI)

### Flow

1. **Discovery:** topic, audience, avatar (`avatar_id` from the user's avatars or a stock presenter), voice, orientation, language, assets. Read existing `AVATAR-<NAME>.md` notes before asking.
2. **Script** in the video's language, structure only, no per-scene durations:
   - Product demo: hook → problem → solution → CTA
   - Explainer: context → core concept → takeaway
   - Tutorial: what we'll build → steps → recap
   - Sales pitch: pain → vision → product → CTA
   - Announcement: hook → what changed → why it matters → next
   Show the script with word count and estimated duration; get approval.
3. **Prompt craft** (the Video Agent prompt):
   - Narrator framing: with an avatar, say "the selected presenter explains..." and never describe their appearance.
   - State the target duration and one topic.
   - Always add a script-freedom line: the script is a concept to convey, not a verbatim transcript; expand naturally; don't pad with silence. Without it the agent fills the target duration with dead air.
   - A **CRITICAL ON-SCREEN TEXT** block lists every literal number, quote, handle, URL and CTA, or it gets paraphrased.
   - Asset anchoring: "use the attached screenshot as b-roll when discussing features".
   - Tone in specific words ("confident and conversational").
   - Content first, then one **style block** at the end: colours as hex, fonts, and which media type per scene type (motion graphics for data, stock footage for real environments, AI-generated for abstract concepts).
   - Technical directives stay in English even when the script is not.
   - ≤60 s conversational: natural flow, no scene labels. >60 s or data-heavy: scene-by-scene with visual type and voiceover per scene.
4. **Frame check** (when an avatar is set): fetch the avatar look's type and dimensions, then append correction notes at the very end of the prompt:
   - Portrait/square avatar into a landscape video: frame chest-up, centred, extend the background with generative fill, no pillarboxing.
   - Landscape avatar into a portrait video: reframe to head and shoulders, extend vertically, no letterboxing.
   - Studio avatar with no background: place them in a clean environment that fits the tone.
   - Resolve the look ID fresh from the avatar group every time. Stored look IDs go stale.
5. **Submit:** `heygen video-agent create --prompt ... --avatar-id ... --voice-id ... --orientation landscape|portrait --wait --timeout 45m`. Processing takes roughly 5 to 10 times the video's length, so a short default timeout can cut a job off. Capture `session_id` right away.
6. **Poll silently:** first check at 5 min, then every 60 s. `thinking` for more than 15 min with no progress: tell the user once. Run at most 2 to 3 jobs in parallel.
7. **Deliver:** download the MP4, report duration accuracy (actual vs target) and the editor link. If changes are needed, adjust the prompt; never resubmit an identical prompt.

Duration control: the agent's timing varies (about 79 to 174% of target). Pad the requested duration by 1.6x for targets of 30 s or less, 1.4x for 31 to 119 s and 1.3x for 120 s or more. Explicit avatar IDs land closer (about 97%).

Known issues: stock avatar auto-selection can fail, so pass an explicit avatar ID. Web page URLs aren't accepted as file attachments, so download and upload the asset or summarize the page into the prompt. A freshly created avatar may not be ready for a few minutes.

UX: don't narrate pipeline internals or the transport (MCP vs CLI); poll in the background; deliver a link, a thumbnail and one summary line.

Other HeyGen capabilities that fit pipelines: photo-to-talking clip, video translation/dubbing, TTS. HyperFrames' media tooling can call these and adopt the MP4 into a project.

Telemetry note: the upstream skill suggests a `heygen feedback` call and an update-check script that contacts GitHub. Don't run either unless the user asks.

## Synthesia Video API (`SYNTHESIA_API_KEY`, or the Synthesia MCP)

Pick Synthesia for scripted presenter videos at scale: training, onboarding, internal updates, the same video in many languages, or videos filled from a template. Pick HeyGen's Video Agent when the agent should direct the creative itself.

- **Access:** REST at `https://api.synthesia.io`. The key goes in the `Authorization` header as is (no `Bearer`). Create it in Synthesia under Developers > API keys with the `Legacy (v2)` scope (an Interactive Avatars key won't work); it is shown once. The key belongs to the person, not the workspace, so webhooks made with it are tied to that person. The Video API needs a Creator plan or above.
- **MCP:** `https://mcp.synthesia.io/mcp`, per-user OAuth (leave the client ID and secret empty). In Claude: Customize > Connectors > Add custom connector. Starter, Creator or Enterprise accounts; tools create drafts (about 30 to 90 s), generate videos, check status and list videos, with hourly per-user caps.
- **Rate limits (Creator tier):** writes 60 a minute, 300 an hour, 1,000 a day; reads 60 a minute, 20,000 a day. Enterprise tiers are higher. A 429 carries `RateLimit-Limit` and `RateLimit-Reset` (seconds to wait).

| Job | Call |
|---|---|
| Create a video | `POST /v2/videos`: `input` (one object per scene: `avatar`, `background` required; `scriptText`, or `scriptAudio` with `scriptLanguage`; `avatarSettings`, `backgroundSettings`), plus `test`, `title`, `description`, `visibility` (`private` default, or `public`), `aspectRatio` (`16:9` default, `9:16`, `1:1`, `4:5`, `5:4`), `callbackId`, `folderId` |
| From a template | `POST /v2/videos/fromTemplate`: `templateId`, `templateData` (the template's variables), same `test`, `visibility`, `title`, `callbackId` |
| Status and download | `GET /v2/videos/{video_id}`: `status` is `in_progress`, `complete`, `error`, `rejected`, `deleted` or `approved`; when complete, `download` is a time-limited MP4 link |
| Notify instead of polling | `POST /v2/webhooks`: `url`, `events` (`video.completed`, `video.failed`); the response's `secret` (shown only then) verifies signed events |
| Translate a Synthesia video | `PUT /v2/translations/{root_video_id}`: `targetLanguages` such as `["es", "fr"]`, optional `translateScriptOnly`, `autoGenerate` (`private` or `public` renders the translations) |
| Dub an uploaded video | `POST /v2/dubbing`: `sourceAssetId` or `sourceVideoUrl`, `title` (max 256 chars), `targetLanguages`, `sourceLanguage` (required with `sourceAssetId`; optional with `sourceVideoUrl`, then detected automatically), optional `lipsyncEnabled`, `videoDuration` (`adaptive` or `original`), `visibility` |

```bash
# Draft: test videos are free, watermarked and don't count against quota (30 a day)
curl -s -X POST https://api.synthesia.io/v2/videos \
  -H "Authorization: $SYNTHESIA_API_KEY" -H "Content-Type: application/json" \
  -d '{"test": true, "title": "Onboarding v1 draft", "aspectRatio": "16:9", "visibility": "private",
       "input": [{"avatar": "AVATAR_ID", "background": "green_screen",
                  "scriptText": "Welcome to the team. In two minutes you will know where everything lives."}]}'
# Poll (rendering usually takes 3 to 5 minutes), then download the "download" link
curl -s https://api.synthesia.io/v2/videos/$VIDEO_ID -H "Authorization: $SYNTHESIA_API_KEY"
```

Gotchas:
- Always draft with `"test": true`. A final render (`test` false) counts against the plan's quota, and translations with `autoGenerate` and dubbing make new videos: show the script, avatar, languages and number of videos, check the credit balance (Billing API), and wait for a yes.
- Avatar IDs are UUIDs or short names. For one the user owns, copy it from the avatar's three-dot menu (Copy ID) in Synthesia.
- `sourceVideoUrl` for dubbing accepts S3 signed URLs only; other URLs fail with 501. Upload the file as an asset and use `sourceAssetId` instead.
- `public` visibility puts the video on a share page anyone with the link can watch; keep `private` unless asked.
- Webhook receivers must answer within 6 seconds; failed deliveries are retried twice over 10 minutes, so make the handler idempotent and still poll once if nothing arrives.
- A custom avatar of a real person follows the consent rules above.

## Provider-neutral presenter pipeline (any lip-sync or avatar model)

Narration is the master clock. Advance only when the evidence for each state exists:

```
intake → content_locked (script, beat sheet, approvals recorded)
       → audio_locked (decodable final narration, ASR matches the script)
       → visual_plan_locked (timeline, storyboard approved)
       → presenter_generated (selected take reviewed at normal speed)
       → composition_checked → rendered → verified (master + share + delivery report)
```

Rules:
1. Lock the complete narration with one voice configuration before generating any presenter video. Normalize sections to about -17 LUFS, run ASR, and fix omissions, numbers and names. Real durations now define the timeline.
2. When the provider caps clip length (for example 15 s), split at sentence boundaries from the ASR timings, never mid-word. Generate every segment from the same image, seed, framing, light and motion constraints, and keep seams continuous to ±0.1 s.
3. Pilot a short, low-cost segment first. Judge identity and mouth timing before a full run.
4. If body motion is good but the mouth is late, keep the motion plate and run a dedicated lip-sync repair with the exact locked audio (no duration change).
5. Mute every generated video track in the final composition; route only the approved narration and intended music.
6. Archive prompt, parameters, provider/model/version, task ID, requested seconds and acceptance notes, but never credentials or expiring URLs.
7. Stop after 3 rejected paid candidates, or before any change to cost, privacy, voice, appearance or provider, and ask.

Defaults for minimal input: 9:16, 1080x1920, 30 fps; 45 to 75 s for a topic; a designed hook, 2 to 4 beats and a short close; no music or promotional CTA unless asked.

Visual QA at normal speed: identity, face geometry, hair, glasses and clothing stay coherent; the mouth follows names, numbers, English tokens, plosives and phrase endings; blinks are sparse and bilateral; gestures happen once and settle; hands stay plausible and away from the face; the tail ends on a resting mouth; no darkening, freezes or duration creep.

## Cheaper stand-ins

- Stylized characters, masks, heavy beards or helmets, where exact lip sync doesn't matter: image-to-video (LTX, Gemini Omni) with "speaks slowly, subtle head movement" often looks better than photoreal lip-sync models.
- Photoreal presenters reading full sentences: use a real lip-sync/avatar model.
