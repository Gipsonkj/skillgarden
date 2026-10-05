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
| adobe-anypdf | https://github.com/adobe/skills/tree/main/plugins/creative-cloud/adobe-for-creativity/skills/adobe-anypdf | Apache-2.0 | Adobe connector tool names, init-then-tool order, status polling, interactive page editor and fallback rules (pdf.md) |

## Official docs (link-only reference, written in our own words)

| Source | Used for |
|---|---|
| https://support.claude.com/en/articles/12542951-set-up-the-microsoft-365-connector | Microsoft 365 connector: admin consent, write tools, file types (cloud-office-files.md) |
| https://support.claude.com/en/articles/15183774-connect-to-microsoft-365 | Microsoft 365 connector: user setup, account types, permissions (cloud-office-files.md) |
| https://learn.microsoft.com/en-us/graph/api/driveitem-search?view=graph-rest-1.0 | Graph file search |
| https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0 | Graph download, pre-signed URL |
| https://learn.microsoft.com/en-us/graph/api/driveitem-get-content-format?view=graph-rest-1.0 | Graph convert to PDF |
| https://learn.microsoft.com/en-us/graph/api/driveitem-put-content?view=graph-rest-1.0 | Graph upload up to 250 MB |
| https://learn.microsoft.com/en-us/graph/api/resources/excel?view=graph-rest-1.0 | Excel workbook API: sessions, ranges, tables |
| https://learn.microsoft.com/en-us/graph/throttling | 429 and Retry-After |
| https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0 | Microsoft Graph PowerShell install |
| https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands?view=graph-powershell-1.0 | Connect-MgGraph, Get-MgContext, Disconnect-MgGraph |
| https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.authentication/invoke-mggraphrequest?view=graph-powershell-1.0 | Invoke-MgGraphRequest parameters |
| https://open.wps.cn/documents/app-integration-dev/wps365/server/introduce | WPS 365 OpenAPI paths and scopes |
| https://open.wps.cn/documents/app-integration-dev/wps365/server/certification-authorization/get-token/selfapp-tenant-access-token | WPS app token |
| https://open.wps.cn/documents/app-integration-dev/wps365/server/certification-authorization/user-authorization/flow | WPS user authorisation |
| https://open.wps.cn/documents/app-integration-dev/wps365/server/api-description/signature-description | WPS KSO-1 signing |
| https://open.wps.cn/documents/app-integration-dev/wps365/server/yundoc/file/get-file-download | WPS file download |
| https://www.wps.com/feature/file-opener/ and https://www.wps.com/academy/what-is-wps-office/about-wps/1863074/ | WPS formats and Office compatibility |
| https://ocrmypdf.readthedocs.io/en/latest/cookbook.html and https://ocrmypdf.readthedocs.io/en/latest/installation.html | OCRmyPDF commands and install (pdf.md) |
| https://claude.com/marketplace/connectors/adobe-creativity | Adobe connector listing and MCP URL |
| https://developer.adobe.com/document-services/docs/overview/pdf-services-api/gettingstarted/ | PDF Services token, assets, jobs, polling |
| https://developer.adobe.com/document-services/docs/overview/pdf-services-api/howtos/ocr-pdf/ and https://developer.adobe.com/document-services/docs/overview/pdf-services-api/howtos/compress-pdf/ | OCR and compress operations |
| https://developer.adobe.com/document-services/docs/overview/limits/ | Free tier and usage limits |
| https://developers.docusign.com/platform/mcp-server/ | Docusign MCP URLs, connector types, tools |
| https://developers.docusign.com/platform/mcp-server/anthropic-claude/ | Docusign custom connector setup in Claude |
| https://developers.docusign.com/platform/mcp-server/limitations-workarounds/ | Docusign MCP limits and GA key approval |
| https://www.docusign.com/blog/developers/claude-docusign-mcp-connector-guide | Docusign official connector steps in Claude |
| https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopes/create/ | Envelope create: status, fields, example |
| https://developers.docusign.com/docs/esign-rest-api/how-to/request-signature-email-remote/ | Base path for demo and production |

Reviewed but not used for content: genoffice (genspark-ai/genoffice, Apache-2.0) is a client for a hosted generation service; Kami's daily update check against GitHub was not carried over.

Deck and slide material (deck story, HTML slides, PowerPoint, frontend-slides scripts and templates, and their sources pptx-generator, frontend-slides, slidev, html-ppt, baoyu-slide-deck, ppt-master) moved to the presentations craft on 4 Oct 2026.

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| docx, pdf, pptx, xlsx (Anthropic) | https://github.com/anthropics/skills/tree/main/skills | Proprietary source-available license; link only, nothing copied or paraphrased |
| doc-coauthoring (Anthropic) | https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring | No license file |
| mineru | https://github.com/opendatalab/MinerU/tree/master/skills/mineru | Custom license with extra terms |
| genoffice | https://github.com/genspark-ai/genoffice | Hosted service client |
