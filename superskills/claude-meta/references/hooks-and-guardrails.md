> Distilled from: hook-development (anthropics/claude-plugins-official, Apache-2.0), git-guardrails-claude-code (mattpocock/skills, MIT), claude-automation-recommender (anthropics/claude-plugins-official, Apache-2.0), strategic-compact (affaan-m/ECC, MIT)

# Claude Code hooks and guardrails

Hooks are shell commands (or LLM prompts) that the harness runs on events. Use them for anything that must happen **every time**: memory and instructions can be forgotten, hooks cannot. "From now on, whenever X, do Y" is a hook, not a CLAUDE.md line.

## Events

| Event | Fires | Typical use |
|---|---|---|
| `PreToolUse` | Before a tool runs | Block or rewrite risky calls, protect files |
| `PostToolUse` | After a tool succeeds | Format, lint, typecheck, run related tests |
| `UserPromptSubmit` | User sends a prompt | Add context, block secrets in prompts |
| `Stop` / `SubagentStop` | Agent wants to finish | Refuse to stop until tests ran |
| `SessionStart` | Session begins/resumes | Load context, set env vars |
| `SessionEnd` | Session ends | Cleanup, logging |
| `PreCompact` | Before compaction | Save state to a file |
| `Notification` | Claude notifies the user | Desktop alert |

## Where to configure

- Project: `.claude/settings.json` (shared) or `.claude/settings.local.json` (personal).
- All projects: `~/.claude/settings.json`.
- Plugin: `hooks/hooks.json` inside the plugin; use `${CLAUDE_PLUGIN_ROOT}` for paths.

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [{ "type": "command",
                    "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh",
                    "timeout": 10 }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npx prettier --write \"$(jq -r '.tool_input.file_path')\"" }] }
    ]
  }
}
```

If the settings file exists, **merge** into the existing `hooks` arrays; never overwrite other settings.

### Matchers
- Exact `"Write"`, alternatives `"Edit|Write"`, everything `"*"`, regex `"mcp__.*__delete.*"`. Case-sensitive.
- Leave the matcher off for events without tools (`Stop`, `UserPromptSubmit`).

## Input and output contract (command hooks)

- Input: JSON on stdin with `session_id`, `transcript_path`, `cwd`, `hook_event_name`, plus `tool_name` / `tool_input` (tool events), `prompt` (UserPromptSubmit).
- Read fields with `jq`: `cmd=$(jq -r '.tool_input.command')`.
- Exit codes:
  - `0` success. stdout shows in the transcript (for `UserPromptSubmit`/`SessionStart` it is added as context).
  - `2` **block**. stderr is fed back to Claude as the reason. Use this to stop a tool call or refuse a stop.
  - anything else: non-blocking error, shown to the user.
- Structured JSON output (exit 0) for finer control:

```json
{"hookSpecificOutput": {"hookEventName": "PreToolUse",
  "permissionDecision": "deny", "permissionDecisionReason": "Edits to .env are blocked"}}
```
`permissionDecision` is `allow`, `deny` or `ask`. A `Stop` hook blocks with `{"decision": "block", "reason": "Run the test suite first"}`.

Env vars: `$CLAUDE_PROJECT_DIR` (repo root), `${CLAUDE_PLUGIN_ROOT}` (plugin dir), `$CLAUDE_ENV_FILE` (SessionStart only: append `export X=y` lines to persist env vars).

## Prompt hooks

`{"type": "prompt", "prompt": "...", "timeout": 30}` asks a model to judge (e.g. "Was the test suite run after the last code edit? If not, block with a reason"). Use for judgement calls on `Stop`, `SubagentStop`, `UserPromptSubmit`, `PreToolUse`. Use command hooks for anything deterministic: they are faster, free and predictable.

## Rules for safe hooks

1. Start scripts with `set -euo pipefail`; quote every variable (`"$file_path"`).
2. Validate input: reject `..` path traversal, sensitive paths (`.env`, `*.pem`, `~/.ssh`).
3. Keep them fast (default timeout 60 s command, 30 s prompt; aim for < 1 s on hot paths like every `Edit`).
4. All matching hooks run **in parallel** and don't see each other's output; don't depend on order.
5. Don't log secrets.
6. Hooks are read at session start. After editing, check with `/hooks` or restart; debug with `claude --debug`.
7. Make temporary hooks switchable with a flag file (`[ -f "$CLAUDE_PROJECT_DIR/.strict" ] || exit 0`).

## Ready-made recipes

| Need | Event + matcher | Command idea |
|---|---|---|
| Block destructive git | PreToolUse `Bash` | `bash scripts/git-guardrails-claude-code/block-dangerous-git.sh` (blocks push, reset --hard, clean -f, branch -D, checkout ., restore .) |
| Validate shell commands | PreToolUse `Bash` | `scripts/hook-development/validate-bash.sh` (example to adapt: its `su*` check also matches harmless commands such as `sum`) |
| Protect files | PreToolUse `Edit\|Write` | `scripts/hook-development/validate-write.sh` (example to adapt: traversal, system paths, .env) |
| Auto-format | PostToolUse `Edit\|Write` | prettier / ruff format / gofmt / rustfmt on `.tool_input.file_path` |
| Typecheck after edit | PostToolUse `Edit\|Write` | `npx tsc --noEmit` (exit 2 with errors so Claude fixes them) |
| Block lock-file edits | PreToolUse `Edit\|Write` | deny when path matches `*lock*` |
| Tests before stopping | Stop | prompt hook, or a script that checks a "tests passed" marker |
| Load project context | SessionStart | `scripts/hook-development/load-context.sh` |
| Save state before compaction | PreCompact | append current task + next step to the plan file |
| Suggest compaction | PreToolUse `Edit\|Write` | count tool calls; suggest `/compact` around 50 calls or ~80% context |

Customise the guardrail list with the user: ask project vs global scope and which patterns to add or drop.

## Build, test, ship

1. Write the script, `chmod +x`.
2. Lint it: `bash scripts/hook-development/hook-linter.sh my-hook.sh`.
3. Validate config: `bash scripts/hook-development/validate-hook-schema.sh .claude/settings.json` (or `hooks/hooks.json`).
4. Test with sample input:
   ```bash
   bash scripts/hook-development/test-hook.sh --create-sample PreToolUse > /tmp/in.json
   bash scripts/hook-development/test-hook.sh my-hook.sh /tmp/in.json
   echo '{"tool_input":{"command":"git push origin main"}}' | bash .claude/hooks/block-dangerous-git.sh; echo "exit=$?"   # expect 2
   ```
5. Restart the session (or confirm with `/hooks`), trigger the event for real, and check behaviour.

## Choosing the right automation

| Need | Use |
|---|---|
| Must happen on every event, no judgement | Hook |
| Repeatable workflow with steps and files | Skill |
| Specialised reviewer/worker with its own context and limited tools | Subagent (`references/subagents-and-delegation.md`) |
| External system (DB, GitHub, browser, docs) | MCP server |
| Bundle of the above to share | Plugin |
| Allow/deny a command without a script | `permissions.allow` / `permissions.deny` in settings |

To recommend automations for a repo, read `package.json`/`pyproject.toml`/`go.mod`, existing `.claude/`, test and CI config, then give the top 1-2 per category with a one-line "why" tied to what you found (e.g. "Prettier config present: PostToolUse auto-format"). This is read-only; build only what the user picks.
