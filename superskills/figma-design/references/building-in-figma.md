# Building variables, components and libraries in Figma

> Distilled from: figma-import-tokens and the pack's `use_figma` and variable notes (southleft/figma-console-mcp-skills, MIT); create-api naming rules (redongreen/uSpec, MIT); component-architecture and theming references of design-system-patterns (wshobson/agents, MIT). The script below is original to this skill.

For the Plugin API mechanics of every write, load Figma's `figma-use` skill (and `figma-generate-library` for a whole library) when the plugin is installed. This guide covers what to build and in what order. Follow the write-safety rules in [figma-mcp.md](figma-mcp.md) section 5.

## 1. Inventory before you build

One read-only `use_figma` call that returns counts and names: pages, local variable collections (with modes and variable counts), paint/text/effect styles, components and component sets, and which library the file subscribes to. Build nothing until you know what exists; the most common agent damage is a second `Color` collection or a duplicate `Button`.

## 2. Library file layout

| Page | Contents |
|---|---|
| Cover | Name, version, owner, status |
| Getting started | How to enable the library, how to pick tokens, contribution link |
| Foundations | Colour, type, spacing, radius, elevation, motion: swatches and specimens bound to variables |
| Components (one page per family) | Component sets, then a documentation frame beside each: usage, do/don't, anatomy |
| Patterns | Forms, navigation, empty states composed from components |
| Deprecated | Retired components kept until consumers migrate, prefixed `⚠ Deprecated /` |

## 3. Variables, in order

1. Collections and modes (see [design-tokens.md](design-tokens.md) section 3 for the layout). Check the plan's mode limit before adding modes.
2. Primitive variables with literal values. Hide primitives from publishing.
3. Semantic variables as **aliases** of primitives, per mode. Literals first, aliases second, or alias targets won't exist.
4. Scopes on every variable (new ones default to all scopes).
5. Code syntax (WEB, and ANDROID / iOS if used) so design-to-code picks up real names.
6. Text, effect and gradient styles whose fields bind to variables.
7. Read back and compare with the source.

From a DTCG file use the bundled pipeline instead of hand-writing: `node scripts/figma-import-tokens/parse-tokens.mjs <file> --default-mode Light --collection Color` (add `--strip-prefix ds-` to drop a name prefix), paste its output into `scripts/figma-import-tokens/apply-tokens.js`, confirm with the user, run through `use_figma`. See [token-sync-and-drift.md](token-sync-and-drift.md) section 3.

Minimal find-or-create pattern for one variable (original example):

```js
const COLLECTION = 'Color';
const MODES = ['Light', 'Dark'];
const TOKEN = {
  name: 'text/primary',
  values: { Light: { r: 0.07, g: 0.09, b: 0.15, a: 1 }, Dark: { r: 0.95, g: 0.96, b: 0.97, a: 1 } },
  scopes: ['TEXT_FILL'],
  web: 'var(--color-text-primary)',
};

let col = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === COLLECTION);
const newCollection = !col;
if (!col) {
  col = figma.variables.createVariableCollection(COLLECTION);
  col.renameMode(col.modes[0].modeId, MODES[0]);   // only on a collection we just created
}
for (const m of MODES.slice(1)) if (!col.modes.some(x => x.name === m)) col.addMode(m);
const modeId = name => col.modes.find(x => x.name === name).modeId;

const existing = await figma.variables.getLocalVariablesAsync('COLOR');
let v = existing.find(x => x.variableCollectionId === col.id && x.name === TOKEN.name);
const created = !v;
if (!v) v = figma.variables.createVariable(TOKEN.name, col, 'COLOR');
for (const [mode, value] of Object.entries(TOKEN.values)) v.setValueForMode(modeId(mode), value);
v.scopes = TOKEN.scopes;
v.setVariableCodeSyntax('WEB', TOKEN.web);
return { collectionId: col.id, newCollection, variableId: v.id, created };
```

Alias instead of a literal: `v.setValueForMode(id, figma.variables.createVariableAlias(targetVariable))`.

## 4. Components

| Rule | Detail |
|---|---|
| Variant properties mirror the code API | `Size=sm/md/lg`, `Variant=primary/secondary/ghost`; same names and values as the props (see API rules in [component-specs.md](component-specs.md) section 2) |
| Interaction states as a `State` variant | `Default / Hover / Pressed / Focus / Disabled`; the **Focus** variant is required |
| Booleans for single show/hide toggles | `Show icon`; avoid a boolean plus a type axis for the same slot (use one instance-swap or variant) |
| Instance swap for icons and swappable parts | Set preferred values to the icon set |
| Text properties for every label | Bound to the text layer so instances are editable without detaching |
| Auto layout everywhere | Padding, gap and radius bound to variables; hug/fill set deliberately; min/max widths where code has them |
| Bind every colour | Fills and strokes to semantic variables, never primitives or raw hex |
| Name layers for what they are | `Label`, `Leading icon`, `Container`; these names flow into specs and code |
| Description and docs link | Every component set has a one-line description and a link to its docs |
| Keep variants combinable | Not every combination needs to exist, but every one that ships in code must |

Order inside a script session: base component -> bind variables -> add component properties and wire them to layers -> duplicate into variants -> `figma.combineAsVariants` -> arrange in a grid -> screenshot and check.

Wiring a text property (pattern): `const key = comp.addComponentProperty('Label', 'TEXT', 'Button');` then `labelNode.componentPropertyReferences = { characters: key };`. Load the font before touching text.

## 5. Code Connect

When the code components exist, map them with Code Connect so Dev Mode shows real usage. Load Figma's `figma-code-connect` skill for the mechanics; make sure the prop names in the mapping are the ones in the component spec.

## 6. Pitfalls

- Duplicates from re-running a create script without find-or-create.
- Renaming the default mode of an existing collection by accident (an import script that renames mode 1 will do this).
- Detached instances used as "variants" in product files; the library never sees them.
- Variant explosions (5 sizes x 6 variants x 6 states x 2 icons = 720); split rarely-combined axes into booleans or separate components.
- Binding primitives directly to components, which makes dark mode impossible without duplication.
- Publishing before reviewing: a library publish reaches every subscribed file. Ask first.
