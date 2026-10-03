# Code <-> Figma token sync and drift checks

> Distilled from: token-sync-layer (jrpease/throughline, MIT); figma-export-tokens, figma-import-tokens, figma-check-design-parity and figma-lint-design (southleft/figma-console-mcp-skills, MIT); figma-codegen design-diff and mapping-file practice (awdr74100/figwright, MIT); design-system-patterns token governance (wshobson/agents, MIT).

## 1. Decide the direction first

| Model | Source of truth | Good for | Rule |
|---|---|---|---|
| Figma-first | Figma variables | Design-led teams, values tuned visually | Code consumes generated files; changes start in Figma |
| Code-first | `tokens/*.json` in git | Eng-led teams, multi-platform, reviewable history | Figma variables are imported from the repo |
| Split by tier | e.g. primitives in code, semantic mapping in Figma | Mature systems | Write down which tier lives where; never edit a tier on its non-owning side |

Bidirectional sync of the same tier without an owner always drifts. Pick one per tier and record it in the repo README or a `tokens/OWNERSHIP.md`.

Generated files (CSS, Tailwind theme, Swift, Kotlin) are build artifacts: never hand-edit them; fix the source and rebuild.

## 2. Figma -> code

1. **Read all variables, all modes.** Run `scripts/figma-export-tokens/read-variables.js` through `use_figma`. It returns collections, modes, variables with hex colours, alias references, scopes and code syntax. Save it as `variables.json`. (`get_variable_defs` alone is not enough: default mode only.)
2. **Convert deterministically.**
   ```bash
   node scripts/figma-export-tokens/convert-tokens.mjs variables.json --format dtcg --out tokens/
   # other formats: css-vars, tailwind-v4, tailwind-v3, scss, ts-module, json-flat, json-nested,
   #                style-dictionary-v3, tokens-studio   flags: --modes Light,Dark --collection Color --prefix ds-
   ```
   Report every warning it prints (slug collisions, non-numeric weights): they are real defects in the Figma file.
3. **Normalise at the boundary:** opacity 0-100 -> 0-1, round float noise, drop the tier prefix from names if your code doesn't use it (`Primitives/gray/500` -> `color.gray.500`).
4. **Build per mode** with Style Dictionary (or use the converter's CSS/Tailwind output directly for small systems). Web keeps references; native flattens.
5. **Validate:** contrast for every text/surface pair in every mode; every generated custom property matches a source token; no mode collapsed into another.
6. **Land as a reviewable diff/PR**, never a silent overwrite. The PR body lists tokens added, changed, deleted and probable renames.

## 3. Code -> Figma

1. Parse the DTCG file into the import constants:
   ```bash
   node scripts/figma-import-tokens/parse-tokens.mjs tokens/color.tokens.json --default-mode Light --collection Color
   ```
   It prints `COLLECTION_NAME`, `MODES` and `TOKENS` (types mapped, `{ref}` aliases kept, `16px` -> 16, saved variable ids honoured).
2. Paste those constants into `scripts/figma-import-tokens/apply-tokens.js` and run it through `use_figma` **after the user confirms** the target collection and conflict policy. It creates literals first, then aliases, and matches existing variables by saved id, then key, then exact name, so re-runs update in place.
   - It renames the collection's first mode to `MODES[0]`: check that matches the file before running on an existing collection.
   - Default policy: code wins on values; never delete Figma-only variables without asking.
3. Set scopes and code syntax on new variables (they default to all scopes).
4. Read back with `read-variables.js` and diff against the source.

## 4. Drift checks

| Check | How | Flag when |
|---|---|---|
| Token values | Export Figma to `json-flat`, flatten code tokens the same way, diff by name | Same name, different value (per mode) |
| Missing / extra | Same diff | Token only on one side |
| Probable rename | A token vanished and a new one appeared with identical `$value` and `$type` | Surface prominently: consumers of the old name break |
| Component parity | `scripts/figma-check-design-parity/check-parity.js` via `use_figma` with a `CODE_SPEC` of what code renders | Any discrepancy; score below 90 |
| Hardcoded values in Figma | `scripts/figma-lint-design/lint-design.js` with `RULES = ['design-system']` | `hardcoded-color`, `no-text-style`, `token-misuse` |
| Hardcoded values in code | Search styles for literals (below) | A literal where a token exists |
| Design changed since build | Keep a baseline of the node's design context (or screenshot + export) at build time; re-read and diff on re-sync | Changed nodes: edit only the code they map to |

Parity score: `max(0, 100 - (critical x 15 + major x 8 + minor x 3 + info x 1))`. Colour and spacing and font family/size mismatches are major; radius, border width, opacity, width/height, weight, line height, letter spacing are minor. Tolerances: +-1 px for spacing, type and radius, +-2 px for width/height, +-0.01 opacity. Only the `CODE_SPEC` sections you fill are compared.

Code-side literal search (adapt paths):

```bash
rg -n --glob '*.{css,scss,tsx,jsx,vue,svelte}' '#[0-9a-fA-F]{3,8}\b|rgba?\(' src/        # raw colours
rg -n --glob '*.{tsx,jsx,vue,svelte,html}' '\b(p|m|gap|w|h|text|rounded)-\[[0-9.]+px\]' src/   # Tailwind arbitrary values
rg -n --glob '*.{tsx,jsx}' 'style=\{\{' src/                                              # inline styles
```

Exclude the token build output and third-party code from the search.

## 5. CI and review

- Run the token build and its validation on every PR that touches `tokens/`. Fail on contrast regressions and on a mode producing fewer variables than the others.
- Token-only PRs change every screen: run full visual snapshots, not "changed stories only".
- Keep a small mapping file for confirmed Figma-name -> code-name pairs that automation got wrong (`docs/figma-token-map.md`). Record a row only after you rendered the result and it matched; a wrong row silently mis-maps every future run.
- Remove mapping rows that point at renamed or deleted tokens.

## 6. Report template

```markdown
## Token sync: Figma -> code (2026-10-03)
Source: <file name> (<fileKey>), collections: Color (Light, Dark), Spacing
| Change | Count | Examples |
|---|---|---|
| Added | 3 | color.bg.info, ... |
| Changed | 2 | color.text.muted Light #6B7280 -> #64748B |
| Deleted | 1 | space.18 |
| Probable rename | 1 | color.bg.default -> color.surface.default (same value) |
Contrast: all pairs pass in Light and Dark (tightest 4.6:1 text.muted on bg.subtle, Dark).
Warnings from converter: none.
Not checked: Android output (no consumer yet).
```
