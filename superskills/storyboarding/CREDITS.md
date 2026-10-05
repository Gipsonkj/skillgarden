# Credits

All reference files are distilled in our own words. Chinese-language sources were distilled into English. Copied files are listed under "Bundled files" with their licences beside them.

## Sources used

| Skill | Repo | Licence | What was used |
|---|---|---|---|
| short-drama-storyboard | https://github.com/zenstory-ai/drama-skills/tree/main/skills/short-drama-storyboard | MIT | Start-only keyframes, renderability checklist, end-frame rule, dialogue timing from the sound timeline, dialogue coverage defaults, vertical size rules, reference-state markers (IMG/REF/PLAN), revision rules |
| short-drama-write | https://github.com/zenstory-ai/drama-skills/tree/main/skills/short-drama-write | MIT | Episode contract, first beat as hook, script markup and production tags, dialogue-as-action pass, exit state |
| baoyu-comic | https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-comic | MIT | Comic workflow, art style/tone/layout menus, panel sizes, page storyboard structure, lettering rules, character sheet, reference strategies |
| sw-story-structure | https://github.com/jtydhr88/screenwriting-skills | MIT | Structure hierarchy, value turns, 15-beat model, board/card method, act-three gap check |
| sw-scene-craft | https://github.com/jtydhr88/screenwriting-skills | MIT | Five-step scene design, enter late/leave early, action over talk, twelve alternative locations, props and detail rules, suspense and delay |
| sw-workflow | https://github.com/jtydhr88/screenwriting-skills | MIT | Outline-to-script workflow and format conventions |
| cinematic-director | https://github.com/wuwangzhang1216/DirectorSKILL | MIT | Hard rules, shot functions, size ladder and cut geometry, height/lens/movement tables, 180°/30°/eyeline encoding for AI, coverage patterns, blocking and proxemics, identity string contract, continuity axes, asset naming, risk rubric, pacing math, prompt shapes S1-S4, repair ladder; bundled templates |
| storytelling | https://github.com/fal-ai-community/skills/tree/main/skills/storytelling | MIT (stated in README) | Hook/setup/development/turn/close beats, 15 s and 30 s ad maps, pacing bands |
| cinematography | https://github.com/fal-ai-community/skills/tree/main/skills/cinematography | MIT (stated in README) | Shot/lens/lighting intake checklist |
| video | https://github.com/smixs/visual-skills/tree/main/video | CC-BY-4.0 — author Serge Shima (sergeshima.com), attribution required | Scene formula, details law (three-detail rule), three-jobs rule, Murch rule of six, five anchors, three-layer storyboard, shot card, rhythm ladders, animatic keyframe card and density ladder, universal prompt rules, Seedance/Kling/Veo prompt notes |
| h3-storyboard | https://github.com/phileiny/h3-storyboard-skill | MIT | One-beat-per-shot finding, dialogue time redistribution, contact/liquid limits, body-part-as-subject, crop relations over fractions |
| seedance-2-5-video-director | https://github.com/liyue-aigc/seedance-2-5-video-director | MIT | Seedance 2.5 modes and limits, multi-grid storyboard blueprint, asset role declarations, extension/edit rules |
| short-drama-director | https://github.com/lixiaoxiao9888-create/manju-laoli-skill/tree/main/short-drama-director | MIT | Pre-locks, 12-beat emotion curve, segment seam options, cast roster continuity, single-subject first shot, negation-as-word-root rule, VO/OS rules, delivery tone slot, character sheet tiers |
| script-writer | https://github.com/ailabs-393/ai-labs-claude-skills/tree/main/packages/skills/script-writer | MIT | YouTube script components (hook, intro, CTA, pattern interrupts) |
| ai-video-storyboard | https://github.com/aicontentskills/ai-video-storyboard-skill | MIT (stated in README) | Platform cadence table, Visual Theme block, narrative patterns, post-production checklist idea |
| manage-storyboard-projects | https://github.com/Yuuhann1999/codex-storyboard/tree/main/plugins/agent-storyboard/skills/manage-storyboard-projects | MIT | Storyboard-app MCP workflow (one-call create/update, shot fields, delete confirmation, no invented timestamps) |
| video-shots | https://github.com/eternityspring/reelbench-skills/tree/main/skills/video-shots | Apache-2.0 | Measured shot breakdown method, vocabularies; bundled script |
| film-storyboard-skill | https://github.com/rainlib/ai-storyboard/tree/main/.claude/skills/film-storyboard-skill | GPL-3.0 | Idea only (nine key moments → four-panel sequences), restated in our own words. No text, scripts or templates copied, so no copyleft code is in this bundle |

## Tool documentation

Docs, link-only reference, written in our own words. Used for the tool sections in `script-and-scene-craft.md`, `storyboard-projects.md`, `shot-lists-and-boards.md` and `comics-and-panels.md`.

| Tool | Docs | What was used |
|---|---|---|
| Boords | https://boords.com/docs/public-api, https://boords.com/docs/connections, https://boords.com/docs/creating-storyboards, https://boords.com/docs/export-formats, https://boords.com/docs/adding-your-own-images, https://boords.com/docs/frame-editor, https://boords.com/docs/quick-start, https://boords.com/docs/concepts | MCP connector setup and scope, REST API auth, hierarchy, create-with-frames, image upload, limits, aspect ratios, import formats, exports |
| Final Draft | https://kb.finaldraft.com/hc/en-us/articles/15575076862228-Can-Final-Draft-import-a-file-written-in-a-Fountain-based-screenwriting-program, https://kb.finaldraft.com/hc/en-us/articles/15575252515988-What-file-formats-can-I-import-into-Final-Draft, https://kb.finaldraft.com/hc/en-us/articles/27525594609684-How-do-I-export-a-Final-Draft-file-to-a-different-format-like-RTF-or-TXT, https://kb.finaldraft.com/hc/en-us/articles/15574994199060-What-kinds-of-files-can-the-Final-Draft-Go-or-the-Final-Draft-Mobile-app-open-or-import, https://www.finaldraft.com/blog/how-to-use-final-draft-script-elements | FDX format, import and export formats, Fountain workaround, script element names |
| Fountain | https://fountain.io/syntax/ | Syntax essentials |
| StudioBinder | https://support.studiobinder.com/en/articles/10334726-how-to-create-a-storyboard-with-a-script, https://support.studiobinder.com/en/articles/1458081-how-to-create-shot-lists-storyboards-with-a-screenplay, https://support.studiobinder.com/en/articles/11459514-how-to-upload-multiple-images-to-your-storyboard-at-once, https://support.studiobinder.com/en/articles/1507120-how-to-change-the-aspect-ratio-in-storyboards, https://support.studiobinder.com/en/articles/10336071-how-to-generate-a-pdf-of-your-storyboards, https://support.studiobinder.com/en/articles/11734371-how-to-export-your-storyboard-as-a-csv, https://support.studiobinder.com/en/articles/10952576-how-do-i-import-a-revised-script | Script import, images, aspect ratio, PDF and CSV export |
| Toon Boom Storyboard Pro | https://docs.toonboom.com/help/storyboard-pro-25/storyboard/project/create-project-final-draft.html, https://docs.toonboom.com/help/storyboard-pro-25/storyboard/caption/import-script.html, https://docs.toonboom.com/help/storyboard-pro-25/storyboard/structure/import-image-automatically.html, https://docs.toonboom.com/help/storyboard-pro-25/storyboard/export/export-edl-aaf-xml.html, https://docs.toonboom.com/help/storyboard-pro-25/scripting/about-scripting.html, https://docs.toonboom.com/help/storyboard-pro-24/storyboard/scripting/reference/index.html | Final Draft import mapping, caption import, image naming, EDL/AAF/XML export, scripting and batch mode |
| Storyboarder | https://wonderunit.com/storyboarder/, https://github.com/wonderunit/storyboarder | Features, exports, release date |
| Adobe Photoshop, Premiere and the Adobe for creativity connector | https://helpx.adobe.com/photoshop/desktop/add-video-and-animation/create-animation-frames/create-frame-based-animations.html, https://helpx.adobe.com/photoshop/desktop/add-video-and-animation/create-animation-frames/specify-a-delay-time-in-frame-animations.html, https://helpx.adobe.com/premiere/desktop/organize-media/import-files/migrate-from-final-cut-pro-x.html, https://helpx.adobe.com/premiere/desktop/organize-media/import-files/import-avid-media-composer-project-files.html, https://helpx.adobe.com/premiere/desktop/render-and-export/export-files/export-a-project-as-an-edl-file.html, https://blog.adobe.com/en/publish/2026/04/28/adobe-for-creativity-connector, https://developer.adobe.com/adobe-for-creativity/, https://developer.adobe.com/adobe-for-creativity/getting-started/ | Frame animation steps, frame delay, XML/AAF import and EDL limits, connector setup and scope |
| Clip Studio Paint | https://help.clip-studio.com/en-us/manual_en/540_comic/Frames_and_Panels.htm, https://help.clip-studio.com/en-us/manual_en/540_comic/Webtoons.htm, https://help.clip-studio.com/en-us/manual_en/570_pages/Exporting_multi-page_projects.htm, https://help.clip-studio.com/en-us/manual_en/210_file/Creating_a_New_Canvas.htm, https://www.clipstudio.net/en/news/202012/17_02/, https://www.clipstudio.net/en/comics-manga/tool/exporting-printing/ | Frame borders, webtoon view and export, batch export, EX-only features |
| Midjourney | https://docs.midjourney.com/hc/en-us/articles/32013696484109-Community-Guidelines, https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service | No API; automation prohibited |

## Bundled files

| Path | Source | Licence |
|---|---|---|
| `scripts/video-shots/video-shots.mjs`, `report.css`, `report.js` | eternityspring/reelbench-skills (video-shots), copied as-is | Apache-2.0, `scripts/video-shots/LICENSE.source-repo` |
| `templates/cinematic-director/beat-sheet-template.md`, `shot-plan-template.md` | wuwangzhang1216/DirectorSKILL (assets/), copied as-is; their internal links point to files in the original repo | MIT, `templates/cinematic-director/LICENSE` |

## Excluded

- storyboard (deanpeters/product-manager-skills): non-commercial licence; nothing used.

## Also see (not included)

- storyboard-creation (inference-sh/skills): https://github.com/inference-sh/skills/tree/main/guides/video/storyboard-creation
- video-interaction-mapper (figma/mcp-server-guide), UI/product interaction storyboards: https://github.com/figma/mcp-server-guide/tree/main/workflow-skills/video-interaction-mapper
