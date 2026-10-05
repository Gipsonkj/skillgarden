> Written in our own words from the official docs: Adobe After Effects help and the After Effects Scripting Guide that Adobe links to (ae-scripting.docsforadobe.dev), the Maxon Cinema 4D and Cineware help, and the Figma Motion help page (all link-only).

# Motion apps: After Effects, Cinema 4D and Figma Motion

How Claude works with the apps motion designers use: scripting and rendering After Effects, driving Cinema 4D through its built-in MCP server, rendering it from the command line, passing scenes between the two, and taking Figma Motion into code. Claude can't open `.aep` or `.c4d` files itself. It writes scripts the user runs, builds command lines, or works through an app's own MCP server when the user has switched it on.

## Pick a tool

| Your situation | Use | Why |
|---|---|---|
| The user or their designer already works in one of these apps | That one | Projects, plug-ins and skills carry over |
| You don't know which app the designer uses, or which version | Ask (and ask for the version) | Cinema 4D's MCP server needs 2026.4 or later; menus and scripting differ by version |
| 2D motion, compositing, or a Lottie source | After Effects | Claude can write ExtendScript for it and render with `aerender`; Bodymovin exports Lottie |
| 3D motion graphics and renders | Cinema 4D | Its built-in MCP server lets Claude work in the open scene; Commandline renders headless |
| 2D animation with Lottie export, outside Adobe | Cavalry (`lottie-svg-gif.md`) | Lottie export is built in |
| Quick motion in the browser, free plan | Jitter (`lottie-svg-gif.md`) | Free plan exports Lottie, GIF and MP4 |
| UI motion designed in Figma that will become code | Figma Motion | Dev Mode copies CSS, JSON or motion.dev code; open beta on every plan |
| No app at all and code is the deliverable | CSS, Motion or GSAP (`motion-principles.md` → the build guides); video: `hyperframes-animation.md` | Nothing to install or license |

Then route the job:

| Job | Route |
|---|---|
| AE animation to ship as Lottie | `lottie-svg-gif.md` ("From After Effects"); run the audit script below first |
| Repetitive AE work: build comps, set keyframes and eases, audit a project | ExtendScript `.jsx` the user runs |
| Render an AE comp without opening the UI, or in batches | `aerender` |
| Rename, rig, keyframe or render in an open Cinema 4D scene | Cinema 4D's MCP server (2026.4 and later) |
| Render a `.c4d` from a script or render farm | Cinema 4D `Commandline` |
| Composite Cinema 4D renders, cameras and lights in AE | `.aec` composition file, or Cineware |
| Cinema 4D animation on the web | glTF export, then `threejs-animation.md` ("From Cinema 4D") |
| Animation designed in Figma | Figma Motion code from Dev Mode or the Figma MCP server |

## After Effects

### Scripts (ExtendScript)

After Effects scripts are ExtendScript, Adobe's extended JavaScript, in `.jsx` or `.jsxbin` files.

- Run one: **File > Scripts > Run Script File**. Scripts in the app's `Scripts` folder appear under **File > Scripts**; dockable panels go in `ScriptUI Panels` and appear under **Window**. **Esc** stops a running script.
- Windows command line: `afterfx -r C:\path\script.jsx` runs it in the already open instance.
- Scripts can't write files or use the network until the user ticks **Allow Scripts To Write Files And Access Network** (Edit > Preferences on Windows, After Effects > Settings on macOS, then Scripting & Expressions). The scripts below need neither, so leave it off for them.
- Wrap changes in `app.beginUndoGroup("name")` … `app.endUndoGroup()` so one Undo reverses the script.
- Reach properties by match name (`"ADBE Transform Group"`, `"ADBE Opacity"`), which stays stable from version to version whatever the display name says.
- Keep to plain `var` and `function` code, read the script with the user before they run it, and try it on a copy of the project.

Audit a comp before a Lottie export (lists expressions, effects, track mattes, blend modes and live text, including inside precomps):

```js
// lottie-audit.jsx: open the comp, then File > Scripts > Run Script File
(function () {
  var comp = app.project.activeItem;
  if (!(comp instanceof CompItem)) { alert("Open a composition first."); return; }
  var out = [];
  function walk(group, where) {
    if (!group) return;
    for (var i = 1; i <= group.numProperties; i++) {
      var p = group.property(i);
      if (p.propertyType === PropertyType.PROPERTY) {
        if (p.canSetExpression && p.expressionEnabled) out.push(where + " > " + p.name + ": expression");
      } else {
        walk(p, where + " > " + p.name);
      }
    }
  }
  function audit(c) {
    for (var i = 1; i <= c.numLayers; i++) {
      var L = c.layer(i), at = c.name + " / " + L.name;
      if (L instanceof TextLayer) out.push(at + ": live text");
      if (L instanceof AVLayer) {
        if (L.hasTrackMatte) out.push(at + ": track matte");
        if (L.blendingMode !== BlendingMode.NORMAL) out.push(at + ": blend mode");
        if (L.source instanceof CompItem) audit(L.source);
      }
      var fx = L.property("ADBE Effect Parade");
      if (fx) for (var e = 1; e <= fx.numProperties; e++) out.push(at + ": effect " + fx.property(e).name);
      walk(L.property("ADBE Transform Group"), at);
      walk(L.property("ADBE Root Vectors Group"), at);  // shape layer contents
      walk(fx, at);
    }
  }
  audit(comp);
  alert(out.length ? out.join("\n") : "Nothing risky found.");
})();
```

Set keys and an ease (a 0.4 s fade-in that lands slowly):

```js
app.beginUndoGroup("Fade in");
var op = app.project.activeItem.layer(1).property("ADBE Transform Group").property("ADBE Opacity");
op.setValuesAtTimes([0, 0.4], [0, 100]);                   // times in seconds
op.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER);
op.setTemporalEaseAtKey(2, [new KeyframeEase(0, 75)]);     // speed, influence 0.1–100
app.endUndoGroup();
```

- A property with several dimensions that eases per dimension (Scale) takes one `KeyframeEase` per dimension: `[e, e, e]`.
- `app.project.items.addComp(name, width, height, pixelAspect, duration, frameRate)` makes a comp (4–30,000 px, up to 10,800 s, 1–99 fps); `comp.layers.addShape()`, `addText()`, `addSolid([r, g, b], ...)` (colours 0–1) and `addNull()` add layers; a shape layer's contents take new shapes through `addProperty("ADBE Vector Shape - Ellipse")`.
- Baking an expression by hand: select the property, **Animation > Keyframe Assistant > Convert Expression To Keyframes**. It puts a key on every frame and switches the expression off without deleting it.

### Render from the command line: `aerender`

`aerender` sits beside the app: in `Support Files` on Windows, in the `Adobe After Effects <version>` folder in Applications on macOS. `aerender -help` prints usage.

```bash
"/Applications/Adobe After Effects <version>/aerender" -project ~/work/hero.aep -comp "hero" \
  -s 0 -e 119 -RStemplate "<render settings template>" -OMtemplate "<output module template>" \
  -output ~/work/frames/hero_[####].png -v ERRORS_AND_PROGRESS
```

| Flag | Meaning |
|---|---|
| `-project path` | Project to open |
| `-comp name` | Comp to render; added to the render queue if it isn't there. Without it, the whole queue renders and `-RStemplate`, `-OMtemplate`, `-output`, `-s`, `-e` and `-i` are ignored. |
| `-rqindex n` | Render one queue item instead |
| `-s` / `-e` | First and last frame; the end frame is rendered too |
| `-RStemplate` / `-OMtemplate` | Templates by name; a name that doesn't exist is an error |
| `-output path` | Destination; `[####]` numbers the frames |
| `-reuse` | Use the running After Effects instead of starting a new one (the default) |
| `-mfr ON 80` | Multi-Frame Rendering with a CPU cap in percent |
| `-close DO_NOT_SAVE_CHANGES` | The default: close without saving |
| `-continueOnMissingFootage` | Log missing footage and render colour bars instead of stopping |
| `-log path` | Log to a file instead of stdout |

Install the project's fonts, effects and plug-ins on every machine that renders it. For Lottie checks, render the frames you will compare (first, middle, last) to PNG.

## Cinema 4D

Modelling and scene building belong to **3d-modeling**. This part covers animating, rendering and handing off.

### The built-in MCP server (Cinema 4D 2026.4 and later)

Maxon ships an MCP server inside the full Cinema 4D app, and it is the connection Maxon supports; switch off any community Cinema 4D MCP server in the same client so the model sees one set of tools. It doesn't run in Commandline, Team Render, c4dpy, Cineware or Lite.

1. In Cinema 4D: **Edit > Preferences > MCP > Server**, tick **Allow MCP Server** (it ships off), or use **Extensions > Mcp_adapter > Start MCP Server**.
2. **Clients**: pick a listed client and click **Update Selected Client**, which adds one entry to that client's config and backs the file up first. For a client that isn't in the list, choose **Other > Copy Config** and the user pastes the entry into the client's own MCP settings at user level. The entry holds the auth token or points to it: never paste it into chat or a file in a repo.
3. Start Cinema 4D first, then quit the client completely (background processes too) and start it again; a client does not retry a failed first connection. Test by asking for a cube.

Security, set by the user in Cinema 4D:

- The server listens on the local machine only and needs the token. Remote access takes three changes (**Allow Remote Connections**, **Host**, **Whitelisted IPs**) and the connection is unencrypted; leave it off unless the user asks.
- **Security** has two switches, both on in a new install: **Allow exec_python Command** (runs Python on Cinema 4D's main thread) and **Allow Python-Bearing Operations** (Python tags, generators, effectors and fields, which are saved in the `.c4d` and run wherever it is opened). Suggest turning the second off when scenes are sent or received.
- **Toolset** switches tool groups: Rendering, Entities, Document, Shot Setup, Transforms, Selection, Hierarchy, System, Modeling, User Data, Animation, Node Graphs, MoGraph, Layers, Assets. Fewer groups give the model better choices. A missing tool reads to the model as a missing feature.
- Every call is written to an audit log in the `mcp` folder of the Cinema 4D preferences.

What it can do without Python includes: inspecting tracks and keyframes, creating, changing and removing keys, and evaluating transforms at given frames; reading clone transforms and changing exposed MoGraph generator and effector parameters; takes and layers; viewport capture, preview renders, render settings and starting, monitoring or stopping renders.

Working rules:

- It edits the open document. Before touching a production scene, ask the user to save or open a new document, list the planned changes and wait for a yes. Each batch is one undo step.
- Values are raw: an angle shown in degrees is stored in radians, a percentage as 0–1, a colour as 0–1 per channel, a length in the document's unit (a default cube's size is 200). Convert on the way in and read values back.
- `capture_viewport` freezes the app while it evaluates the scene; `render_preview_image` doesn't block. Remove any review camera or helper you add.
- Dialogs in Cinema 4D are invisible to the client: when a call fails, ask the user what the status bar or dialog says.
- Generated animation can arrive as a key every second frame with linear interpolation. If the user will refine it by hand, ask for few keys with eases.
- Hundreds of single objects can stall a request: build fewer, merged objects, or work in batches.
- Python SDK docs are versioned per release (`developers.maxon.net/docs/py/2026_3_0/` and so on): read the version that matches the user's app.

### Command-line rendering

`Commandline.exe` (Windows) renders without the interface and keeps a console open; on macOS run the binary in `Cinema 4D.app/Contents/MacOS` from Terminal. On first start it must be licensed (Maxon account, License Server or RLM).

```bash
Commandline.exe -render C:\scenes\hero.c4d -take "front" -frame 0 120 1 \
  -oimage D:\renders\hero -oformat PNG -oresolution 1920 1080 -engine REDSHIFT g_logfile=C:\render.txt
```

- `-frame start end step` overrides the scene; with one number, only that frame renders.
- `-oimage` overrides the save path and adds frame numbers; `-omultipass` does the same for multi-pass.
- `-oformat`: TIFF, TGA, BMP, IFF, JPG, PICT, PSE, RLA, RPF, B3D, HDR, EXR, PNG, PSP.
- `-engine`: VIEWPORT, STANDARD, PHYSICAL or REDSHIFT. `-threads 0` picks the optimal count.

### Cinema 4D to After Effects

| Your situation | Use | Why |
|---|---|---|
| The team already has a hand-off that works | Keep it | |
| Renders are final; compositing happens in After Effects | `.aec` composition file | Brings in the multi-passes, cameras and lights; no live link needed |
| The 3D should stay editable from After Effects | Cineware | A `.c4d` layer that updates on every save |
| Both apps open, frames must match while you work | Live Link | Ties the two timelines |


- **Composition file (`.aec`)**: in Render Settings > Save, enable the compositing project file for After Effects; it saves into the render folder (or use **Save Project File...** later). It carries the resolution, frame rate and multi-pass paths; **Include 3D Data** adds cameras and lights whose Export to Composition option is on, and objects with a Cineware (External Composition) tag arrive as nulls. After Effects needs the importer: copy `Exchange Plug-ins/After Effects/Importer` from the Cinema 4D install into After Effects' `Support Files/Plug-Ins`, then **File > Import > File**. Multi-passes are in linear colour.
- **Cineware**: a `.c4d` becomes a layer in After Effects (**File > New > Maxon Cinema 4D File**, or import one). **Edit > Edit File Externally** opens it in Cinema 4D, and each save updates After Effects. The Cineware effect sets the renderer, extracts cameras and scene data, and caches simulations.
- **Live Link** ties the two timelines: enable **Activate Live Link on Start** in Cinema 4D's Preferences > Extensions > After Effects and restart; the link is made from After Effects. Bake or cache simulations first.

## Figma Motion

Figma's timeline animation tool, in open beta on every plan (editing needs can-edit access). Developers scrub the read-only timeline in Dev Mode and copy the animation as CSS, JSON or motion.dev code, or the Figma MCP server sends that code to a coding agent. Treat it as a spec, not final code: check its durations and easing against `motion-principles.md` (UI motion usually wants to be shorter than a designer's preview), add reduced motion and interruption, then build with `web-ui-recipes.md` or `react-transitions-and-motion.md`. Smart Animate prototype settings belong to **figma-design**.

## Verify

- Scripts: read them with the user, run on a copy, check one Undo reverses them.
- Renders: open the first, middle and last frame and check the frame count against `-s`/`-e` or `-frame`.
- MCP work: look at the Object Manager and the viewport before reporting anything done; the model reads the scene through the same tools it changes it with.
- Say plainly what you could not see, run or open.
