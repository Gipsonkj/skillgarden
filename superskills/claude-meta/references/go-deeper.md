# Go deeper: original skills

The guides in this super skill distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Every hook event, prompt-based hooks and `${CLAUDE_PLUGIN_ROOT}` paths for hooks shipped in a plugin | [hook-development](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/plugin-dev/skills/hook-development) (Apache-2.0) |
| Hooks that bring planning files back after `/clear`, compaction or a crash | [planning-with-files](https://github.com/OthmanAdi/planning-with-files/tree/master/skills/planning-with-files) (MIT; its hook scripts weren't copied: they install lifecycle hooks and read local session records) |
| Automatic lesson capture as confidence-scored instincts that grow into skills | [continuous-learning-v2](https://github.com/affaan-m/ECC/tree/main/skills/continuous-learning-v2) (MIT; hook-heavy, no code copied here, review what it records) |
| Searching past sessions in a persistent cross-session memory database | [mem-search](https://github.com/thedotmack/claude-mem/tree/main/plugin/skills/mem-search) (Apache-2.0; needs the claude-mem plugin) |
| Handing work to other coding CLIs (opencode, Cursor, Aider, Copilot) through its sibling skills | [codex-delegate](https://github.com/amElnagdy/delegate-skills/tree/master/skills/codex-delegate) (MIT) |
| Observation masking, cache-stable prefixes and the sibling compression and degradation skills | [context-optimization](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/context-optimization) (MIT) |
| Packaging skills, commands and agents as a plugin (plugin-dev's sibling skills) | [agent-development](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/plugin-dev/skills/agent-development) (Apache-2.0) |
