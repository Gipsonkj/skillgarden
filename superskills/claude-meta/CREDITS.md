# Credits

All sources are MIT or Apache-2.0. Reference files are distilled in our own words; scripts and templates are copied as-is with their source licence beside them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| skill-creator | https://github.com/anthropics/skills | Apache-2.0 | Skill anatomy, progressive disclosure, description writing, eval loop, trigger optimisation; scripts `quick_validate.py`, `package_skill.py`, `run_loop.py`, `run_eval.py`, `improve_description.py`, `generate_report.py`, `utils.py` (scripts/skill-creator/) |
| brainstorming | https://github.com/obra/superpowers | MIT | Spike/bounded/architectural classification, approval gates, spec self-review |
| using-superpowers | https://github.com/obra/superpowers | MIT | Check-skills-first rule, instruction priority |
| writing-plans | https://github.com/obra/superpowers | MIT | Plan header, task/step format, plan self-review |
| subagent-driven-development | https://github.com/obra/superpowers | MIT | Dispatch contract, review/fix loop, model selection, ledger and rulings; template `implementer-prompt.md` |
| executing-plans | https://github.com/obra/superpowers | MIT | Inline execution, ledger recovery, stop conditions |
| writing-skills | https://github.com/obra/superpowers | MIT | TDD for skills, pressure scenarios, match-form-to-failure, micro-tests, description-is-not-a-workflow rule |
| caveman | https://github.com/JuliusBrussee/caveman | Apache-2.0 | Terse output rules |
| find-skills | https://github.com/vercel-labs/skills | MIT | Finding and vetting skills with the skills CLI |
| grilling / grill-me | https://github.com/mattpocock/skills | MIT | Decision-tree interview in rounds |
| handoff | https://github.com/mattpocock/skills | MIT | Handoff document contents |
| writing-for-agents | https://github.com/mattpocock/skills | MIT | Context pointers, two loads, leading words, positive prompting, pruning |
| git-guardrails-claude-code | https://github.com/mattpocock/skills | MIT | Guardrail hook setup; script `block-dangerous-git.sh` |
| planning-with-files | https://github.com/OthmanAdi/planning-with-files | MIT | Files-as-memory, 2-action rule, 3-strike protocol; templates `task_plan.md`, `findings.md`, `progress.md` |
| codex-delegate | https://github.com/amElnagdy/delegate-skills | MIT | Codex brief/dispatch/review/land loop |
| claudex-loop | https://github.com/chaseai-yt/claudex-loop | MIT | Cross-provider plan review roles and limits |
| context-engineering | https://github.com/addyosmani/agent-skills | MIT | Context hierarchy, trust levels, restartable session boundary, CLAUDE.md example |
| strategic-compact | https://github.com/affaan-m/ECC | MIT | When-to-compact table, what survives compaction |
| continuous-learning-v2 | https://github.com/affaan-m/ECC | MIT | Instinct model summary and cautions (no code copied) |
| mem-search | https://github.com/thedotmack/claude-mem | Apache-2.0 | Search-filter-fetch memory workflow |
| self-learning | https://github.com/Kulaxyz/self-learning-skills | MIT | Capture cues, promotion rule, harvest procedure; template `SKILL.template.md` |
| claude-md-improver | https://github.com/anthropics/claude-plugins-official | Apache-2.0 | CLAUDE.md audit workflow, scoring rubric, what to add / leave out |
| claude-automation-recommender | https://github.com/anthropics/claude-plugins-official | Apache-2.0 | Signal-to-automation recommendations |
| hook-development | https://github.com/anthropics/claude-plugins-official | Apache-2.0 | Hook events, I/O contract, safety rules; scripts `validate-hook-schema.sh`, `test-hook.sh`, `hook-linter.sh`, examples `validate-bash.sh`, `validate-write.sh`, `load-context.sh` |
| agent-development | https://github.com/anthropics/claude-plugins-official | Apache-2.0 | Agent file format and system prompt design; script `validate-agent.sh` |
| context-optimization | https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering | MIT | Masking/compaction/partitioning order and thresholds, cache-stable prefixes |
| unlazy | https://github.com/Leonxlnx/unlazy | MIT | Acceptance gates before work, four-pass leaf work (ideas only, no scripts) |

## Also see (not included)

- claude-mem plugin (full memory system): https://github.com/thedotmack/claude-mem
- Agent-Skills-for-Context-Engineering, the sibling skills (context-degradation, context-compression, filesystem-context): https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
- planning-with-files hook automation (`skill-hook.sh`, `session-catchup.py`), not copied because it installs lifecycle hooks and can read local session records: https://github.com/OthmanAdi/planning-with-files
- agentmemory (checked, not ranked): https://github.com/rohitg00/agentmemory
- awesome lists used for discovery: https://github.com/hesreallyhim/awesome-claude-code, https://github.com/VoltAgent/awesome-agent-skills

## Link-only sources

These have no license that allows reuse. Their ideas are described in our own words and nothing is copied.

| Source | Link | License | What was used |
|---|---|---|---|
| Build one AI setup from everything you've saved (Stiles Dichter, 2 Oct 2026) | https://stilesdichter.com/guides/campaign | None stated | The method behind `references/skill-stack-from-saves.md`: sort saves by topic, write down what each teaches, keep the most specific version of repeated tips, split into task skills plus a master skill, refresh weekly |
