> Distilled from: karpathy-guidelines (forrestchang/andrej-karpathy-skills, MIT), ponytail (DietrichGebert/ponytail, MIT), code-simplification (addyosmani/agent-skills, MIT), refactor (github/awesome-copilot, MIT), coding-standards (affaan-m/everything-claude-code, MIT)

# Simplicity, surgical changes and refactoring

**The best code is the code you didn't write. The next best is code a newcomer understands faster than the original.**

## 1. Think before coding

- State your assumptions. If a request has several readings, list them; don't pick one silently.
- If a simpler approach exists, say so and push back when it's warranted.
- If something is unclear, stop, name what's confusing, and ask.

## 2. The laziness ladder (before writing anything)

Stop at the first rung that works:
1. **Do we need this at all?** (YAGNI; unasked-for features are cost, not value.)
2. Is it **already in this codebase**? Search for an existing helper, component or pattern.
3. Does the **standard library** do it?
4. Does the **platform/framework** do it natively (HTML `<dialog>`, CSS `:has()`, `Intl`, DB constraints)?
5. Does an **already-installed dependency** do it?
6. Can it be **one line** or a small expression?
7. Only then write the **minimal** new code: no abstraction for single-use code, no config nobody asked for, no handling for impossible cases.

**When not to be lazy**: input validation at trust boundaries, error handling for real failure modes (network, disk, user input), security, accessibility, data migrations, and tests. Cutting these is not simplicity, it's debt.

Self-check: "Would a senior engineer call this overcomplicated?" 200 lines that could be 50: rewrite.

## 3. Surgical changes

- Touch only what the request needs. Every changed line should trace to it.
- Match the existing style, even if you'd do it differently.
- Don't "improve" adjacent code, comments or formatting; don't refactor what isn't broken.
- Unrelated dead code: mention it, don't delete it.
- Clean up only your own mess: remove imports/variables/functions that *your* change orphaned.
- Keep refactors and behaviour changes in separate commits (see `git-workflow.md`).

## 4. Simplifying existing code

**Behaviour stays exactly the same**: same outputs, side effects, errors and ordering. If you're not sure, it's not a simplification.

**Chesterton's fence**: before removing anything odd, find out why it's there (`git blame`, the PR, a comment, the tests). Remove it only once you understand it.

| Pattern | Simplification |
|---|---|
| Nesting 3+ levels deep | Guard clauses / early returns |
| Function 50+ lines or several jobs | Extract well-named functions |
| Nested ternaries | `if/else` or a lookup map |
| Boolean flag params (`render(true, false)`) | Separate functions or an options object |
| Repeated conditionals | One predicate function |
| Generic names (`data`, `result`, `tmp`, `handle`) | Names that say what it is |
| Comments explaining *what* | Clearer code; keep comments for *why* |
| Wrapper that only forwards | Inline it |
| Duplicate logic in 3+ places | Extract (2 copies is often fine) |
| Dead code, unused exports, stale flags | Delete (after checking usages) |
| Manual loop for map/filter/find | The idiomatic built-in |

Process: understand (callers, tests, history) -> make one change -> run tests -> repeat. Scope: recently changed code unless asked to go wider. **Rule of 500**: a refactor touching more than ~500 lines should be done with a codemod or tool, or split into stages.

## 5. Refactoring safely

1. Tests green before you start. No tests? Add characterisation tests for current behaviour first.
2. One small step at a time (rename, extract, move, inline), running tests after each.
3. Never change behaviour and structure in the same step.
4. Commit after each green step; easy to bisect, easy to revert.
5. Stop when the code is clear enough for the change you actually need to make ("make the change easy, then make the easy change").

Common moves: extract function/variable; rename; replace magic numbers with named constants; introduce parameter object; replace conditional with polymorphism or a map; move a function to the module whose data it uses; split a large module along its reasons to change; replace a nested callback chain with async/await.

## 6. Everyday standards

- **Names**: variables/functions describe purpose (`isActive`, `fetchMarketData`); booleans read as questions (`hasAccess`); no abbreviations unless universal.
- **Immutability by default**: return new objects/arrays (`{...user, name}`, `[...items, x]`, `toSorted()`) instead of mutating inputs.
- **Errors**: handle at the right level with context (`throw new Error(\`Failed to load order ${id}\`, { cause })`); never swallow silently.
- **Async**: run independent work in parallel (`Promise.all`); don't `await` in a loop when calls don't depend on each other.
- **Types**: precise types at module boundaries; avoid `any`; let inference handle locals.
- **Small, focused units**: files under ~400-800 lines, functions doing one thing.
- **Comments** explain *why* (constraints, trade-offs, links to issues), not *what*.

## Red flags

- Adding a dependency for something the stdlib or platform does.
- "We might need this later" abstractions, config options or extension points.
- Rewriting working code nobody asked you to touch.
- A "simplification" that changes error messages, ordering or edge-case behaviour.
- A refactor PR that also fixes a bug or adds a feature.
