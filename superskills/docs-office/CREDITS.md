# Credits

This super skill is distilled from the open-licensed skills below. Text was rewritten and merged in our own words; only the scripts and templates listed were copied as-is, each with its source license beside it. Nothing was taken from Anthropic's proprietary docx/pdf/pptx/xlsx skills.

| Skill | Repo | License | What was used |
|---|---|---|---|
| docx | https://github.com/NousResearch/hermes-agent/tree/main/skills/productivity/docx | MIT | python-docx workflow, verification steps, revision/comment limits; `scripts/hermes-docx/` copied as-is |
| minimax-docx | https://github.com/MiniMax-AI/skills/tree/main/skills/minimax-docx | MIT | Pipeline routing (create/edit/apply template), OpenXML element order, units, typography tables, template/style-ID pitfalls, troubleshooting by symptom |
| minimax-xlsx | https://github.com/MiniMax-AI/skills/tree/main/skills/minimax-xlsx | MIT | Edit-in-place rules, XML create/edit flow, financial colour and number-format conventions, formula error fixes, delivery checklist; `scripts/minimax-xlsx/` and `templates/minimax-xlsx/minimal_xlsx/` copied as-is |
| minimax-pdf | https://github.com/MiniMax-AI/skills/tree/main/skills/minimax-pdf | MIT | Create/fill/reformat routes, content.json block schema, accent colour guidance, design tokens; `scripts/minimax-pdf/` copied as-is |
| pdf | https://github.com/openai/skills/tree/main/skills/.curated/pdf | Apache-2.0 | Render-and-inspect workflow, tool choice (reportlab, pdfplumber, pypdf, Poppler), final checks |
| markitdown | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/markitdown | MIT | Conversion API choice, privacy of external services, plugin caution, batch workflow; `scripts/markitdown/batch_convert.py` copied as-is |
| docling | https://github.com/docling-project/docling/tree/main/docling/.agents/skills/docling | MIT | CLI pipelines (standard/VLM/native), OCR engines, table mode, RAG loaders |
| convert-pdf-to-md | https://github.com/github/awesome-copilot/tree/main/skills/convert-pdf-to-md | MIT | PDF-to-Markdown with image extraction, mixed-folder rule; `scripts/convert-pdf-to-md/` copied as-is |
| markdown-exporter | https://github.com/bowenliang123/markdown-exporter | Apache-2.0 | Markdown-to-format command table |
| kami | https://github.com/tw93/Kami/tree/main/skills/kami | MIT | Contract-first intake, document-type routing, gap reporting, anti-patterns of AI documents |
| officecli | https://github.com/iOfficeAI/OfficeCLI/tree/main/skills/officecli | Apache-2.0 | officecli command summary (read/DOM edit/raw XML layers, help-first) |
| gws-docs, gws-sheets, gws-slides, gws-drive | https://github.com/googleworkspace/cli/tree/main/skills | Apache-2.0 | gws command pattern, schema introspection, API resources |
| google-workspace | https://github.com/NousResearch/hermes-agent/tree/main/skills/productivity/google-workspace | MIT | OAuth setup flow (desktop client, test users, headless redirect), scope minimisation |
| gog | https://github.com/openclaw/openclaw/tree/main/skills/gog | MIT | gog commands for Drive/Docs/Sheets, no-secrets-in-chat rule |
| lark-doc | https://github.com/larksuite/cli/tree/main/skills/lark-doc | MIT | lark-cli fetch scopes, update commands, observe-patch-verify loop, document genres |

Reviewed but not used for content: genoffice (genspark-ai/genoffice, Apache-2.0) is a client for a hosted generation service; Kami's daily update check against GitHub was not carried over.

Deck and slide material (deck story, HTML slides, PowerPoint, frontend-slides scripts and templates, and their sources pptx-generator, frontend-slides, slidev, html-ppt, baoyu-slide-deck, ppt-master) moved to the presentations craft on 4 Oct 2026.

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| docx, pdf, pptx, xlsx (Anthropic) | https://github.com/anthropics/skills/tree/main/skills | Proprietary source-available license; link only, nothing copied or paraphrased |
| doc-coauthoring (Anthropic) | https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring | No license file |
| mineru | https://github.com/opendatalab/MinerU/tree/master/skills/mineru | Custom license with extra terms |
| genoffice | https://github.com/genspark-ai/genoffice | Hosted service client |
