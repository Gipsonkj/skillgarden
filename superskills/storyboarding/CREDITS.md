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
