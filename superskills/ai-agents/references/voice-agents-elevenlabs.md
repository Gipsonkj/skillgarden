# Voice agents with ElevenLabs

> Distilled from: agents (elevenlabs/skills, MIT), google-agents-cli-adk-code live notes (google/agents-cli, Apache-2.0)

Vendor-specific guide for real-time voice agents (assistants, support lines, characters, outbound calls). Needs an `ELEVENLABS_API_KEY` and a paid plan for volume. Check the current model and voice catalogue live (`GET /v1/convai/llm/list`) rather than trusting lists here.

## 1. Create and manage agents

CLI (recommended; config lives in your repo and is pushed):
```bash
npm install -g @elevenlabs/cli
elevenlabs auth login
elevenlabs agents init
elevenlabs agents add "Support Line" --template customer-service   # complete | minimal | voice-only | text-only | assistant
elevenlabs agents push
```
SDKs: Python `ElevenLabs().conversational_ai.agents.create(...)`, JS `new ElevenLabsClient().conversationalAi.agents.create(...)`. Core config: `conversation_config.agent` (`first_message`, `language`, `prompt.prompt`, `prompt.llm`, `prompt.temperature`, `prompt.tools`, `prompt.built_in_tools`) and `conversation_config.tts.voice_id`.

## 2. Voice prompt structure

```
# Personality   named character, 2–3 traits
# Environment   where they work, who calls, over what channel
# Tone          4–5 bullets: short sentences, spoken style, no lists or markdown, confirm numbers back
# Goal          numbered steps for the call flow; what success is
```
- Short, action-based instructions; mark the one critical step with "This step is important".
- Spell out how to say numbers, emails and IDs (digit by digit, read back to confirm).
- Put refusal/safety rules in the prompt **and** configure the platform's independent guardrails.
- Turn eagerness: `patient` for callers who pause, `eager` for quick back-and-forth, `normal` otherwise.

## 3. Tools

| Type | Runs | Use for |
|---|---|---|
| **Webhook** | Server-side HTTP (`api_schema` with URL, method, body schema) | DB lookups, bookings, anything with secrets |
| **Client** | In the browser/app (`clientTools` handlers) | UI changes, navigation, showing a product |
| **System** (`built_in_tools`) | Platform | `end_call`, `transfer_to_number`, `transfer_to_agent`, `language_detection`, `skip_turn`, `voicemail_detection`, `play_keypad_touch_tone` |

- Tool descriptions say when to use them ("Use when the caller asks about order status"); same tool-design rules as text agents.
- Enable `end_call` on every agent; `transfer_to_number` with a condition ("caller asks for a human") for phone support; `voicemail_detection` for outbound.
- Keep secrets server-side: webhook auth via workspace environment variables / auth connections, never in client tools.
- Long or multi-branch flows: use workflows/procedures rather than one giant prompt.

## 4. Starting conversations

- Private agents: your backend requests a signed URL or a WebRTC session token; the browser never sees the API key.
- Client: `Conversation.startSession({ agentId | signedUrl, onMessage, onError, ... })`; React: wrap in `ConversationProvider`, use `useConversationControls` / `useConversationStatus`.
- Pass ASR keyword hints for brand names and jargon (`overrides.asr.keywords`).
- Watch `onPing` latency and `onContextUsage` while testing.
- Outbound phone calls and widget embedding have their own setup (telephony number, embed snippet).

## 5. Latency and quality rules

- Pick a fast LLM for the conversational turn; push heavy work into webhook tools or a background agent.
- Keep the first message under ~2 seconds of speech.
- Test with real accents, background noise, interruptions (barge-in), silence and wrong inputs.
- Log transcripts and evaluate them against a rubric (task completed, correct transfer, no invented facts).

## 6. Alternatives

Google ADK Live agents (`Runner.run_live`) for Gemini Live; check model/region availability and deploy with a long request timeout (3600 s) and a warm instance to avoid cold-start silence. Cloudflare Agents has experimental voice (`@cloudflare/voice`). Microsoft Foundry supports duplex WebSocket hosted agents for voice.
