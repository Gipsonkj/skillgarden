> Distilled from: threejs-animation (cloudai-x/threejs-skills, MIT stated in README), hyperframes-animation adapters/three (heygen-com/hyperframes, Apache-2.0); "From Cinema 4D" written in our own words from Maxon's glTF export help (link-only)

# Three.js animation

Covers motion in Three.js scenes: procedural motion, keyframe clips, GLTF skeletal animation, morph targets, blending, and making 3D deterministic for video renders. Scene setup, materials and lighting are out of scope; scroll-driven 3D camera paths pair this file with `scroll-animation.md`.

## Pick a tool

| Your situation | Use | Why |
|---|---|---|
| You already use or pay for a 3D app (Cinema 4D, Blender) | That one, exported as GLB | The animation stays editable where it was made; Three.js only plays it |
| Unclear whether the 3D is for a live page, a rendered video or both | Ask before building | The live page needs a small GLB and a mixer; a video needs deterministic frames |
| No app, no account; spins, floats, orbits, hover reactions | Three.js code alone (this guide) | Free and open source (MIT); procedural motion needs no exported file |
| Keyframed, rigged or character motion for the web | Author in Cinema 4D ("From Cinema 4D" below) or Blender (**3d-modeling**), export GLB, play with `AnimationMixer` | glTF carries transform, morph and skin animation |
| Motion graphics rendered as frames or video from Cinema 4D | Cinema 4D's Commandline renderer (`motion-app-handoff.md`) | Renders without the interface |
| 3D inside a HyperFrames video | Three.js with the deterministic rules at the end of this guide | Seek-safe frames |

## The loop (and the clock pitfall)

`THREE.Clock` is stateful: `getElapsedTime()` internally calls `getDelta()`, so calling both in one frame makes the second return ~0. Read the delta once per frame and accumulate time yourself.

```js
import * as THREE from "three";
const clock = new THREE.Clock();
let elapsed = 0;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 1 / 30); // clamp so a background tab doesn't jump the scene
  elapsed += dt;
  mesh.rotation.y += dt * 0.6;              // rate-based: frame-rate independent
  mesh.position.y = Math.sin(elapsed) * 0.5; // time-based: deterministic per time
  mixer?.update(dt);                          // mixers need the delta every frame
  renderer.render(scene, camera);
});
```

Newer Three.js also ships `THREE.Timer` (call `timer.update()` once per frame, then read `getDelta()` / `getElapsed()` freely).

Prefer **time-based** formulas (`f(elapsed)`) over accumulating increments wherever you can: they are seekable, reproducible and survive dropped frames.

## Keyframe clips

| Piece | Job |
|---|---|
| `KeyframeTrack` | times (s) + flat value array for one property path |
| `AnimationClip` | named set of tracks with a duration |
| `AnimationMixer` | plays clips on a root object; `mixer.update(dt)` every frame |
| `AnimationAction` | playback controls for one clip on one mixer |

```js
const bounce = new THREE.AnimationClip("bounce", 2, [
  new THREE.NumberKeyframeTrack(".position[y]", [0, 1, 2], [0, 1, 0]),
]);
const mixer = new THREE.AnimationMixer(mesh);
mixer.clipAction(bounce).play();
```

Track types: `NumberKeyframeTrack` (`.material.opacity`, `.position[y]`, `.morphTargetInfluences[smile]`), `VectorKeyframeTrack` (`.position`, `.scale`; 3 values per key), `QuaternionKeyframeTrack` (`.quaternion`; 4 per key; never animate Euler rotation via tracks), `ColorKeyframeTrack` (`.material.color`, 0–1 RGB), `BooleanKeyframeTrack` (`.visible`, discrete). Interpolation: `InterpolateLinear` (default), `InterpolateSmooth` (cubic spline), `InterpolateDiscrete` (step). Clip tracks have no easing curves: shape motion with extra keys, or drive the property from GSAP / your own easing instead.

## Actions

```js
const action = mixer.clipAction(clip);
action.setLoop(THREE.LoopOnce, 1);   // LoopRepeat (default), LoopPingPong
action.clampWhenFinished = true;     // hold the last frame instead of snapping back
action.timeScale = 1;                // negative plays backwards
action.reset().fadeIn(0.3).play();
mixer.addEventListener("finished", (e) => onDone(e.action));
```

Crossfade between states: `current.crossFadeTo(next.reset().play(), 0.3, true)`. Keep crossfades around 0.2–0.5 s; longer reads as mush, shorter as a pop.

## GLTF skeletal animation

```js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const gltf = await new GLTFLoader().loadAsync("character.glb");
scene.add(gltf.scene);
const mixer = new THREE.AnimationMixer(gltf.scene);
const actions = Object.fromEntries(gltf.animations.map((c) => [c.name, mixer.clipAction(c)]));
actions.Idle?.play();
```

- List clip names first (`gltf.animations.map(c => c.name)`); don't guess names like "Walk".
- Bones: `skinnedMesh.skeleton.bones`, find by name; `new THREE.SkeletonHelper(root)` to debug. Attach props by `bone.add(object)` with a local offset.
- Procedural bone tweaks (head look-at) go **after** `mixer.update()` each frame, or the mixer overwrites them.
- `THREE.AnimationUtils.subclip(clip, "name", startFrame, endFrame, fps)` cuts one long take into actions; `clip.optimize()` drops redundant keys.

### From Cinema 4D

**File > Export > glTF** (defaults live in Preferences > Import/Export > glTF). Choose **GLB (Binary)**: smaller than `.gltf` and faster to load.

- Animation options: **Transform** (position, scale and rotation tracks from the Timeline), **Morph** (Pose Morphs of type Points only, or PLA), **Skin** (joint animation; glTF keeps at most the 4 strongest joint weights per point), **Bake Animation** (motion with no tracks, such as dynamics or a Vibrate tag, becomes a key per frame).
- The exported length follows the project's minimum and maximum time, so set those first. Step keys stay step only when X, Y and Z keys are all step.
- Node materials don't export, and materials look different from Cinema 4D: expect to adjust them.
- Open the GLB in a glTF viewer and check every clip before writing mixer code; then list `gltf.animations` names as above. Scripting, renders and the MCP server for Cinema 4D: `motion-app-handoff.md`.

## Morph targets

`mesh.morphTargetDictionary` maps names to indices; write `mesh.morphTargetInfluences[i]` (0–1) procedurally, or animate with a `NumberKeyframeTrack(".morphTargetInfluences[smile]", ...)`. Good for facial expressions, blob morphs, product open/close states.

## Blending

- **Weight blending** (locomotion): play idle/walk/run together and set `setEffectiveWeight` from a speed parameter so the weights always sum to 1.
- **Additive layers** (breathing, recoil on top of any base): `THREE.AnimationUtils.makeClipAdditive(clip)` then `action.blendMode = THREE.AdditiveAnimationBlendMode`.

## Procedural motion

- **Frame-rate independent smoothing**: `value = THREE.MathUtils.damp(value, target, lambda, dt)` (lambda ~4–12). Never `lerp(value, target, 0.1)` per frame; that speed depends on the frame rate. Vectors: damp each component, or `v.lerp(target, 1 - Math.exp(-lambda * dt))`.
- **Springs**: semi-implicit Euler (`v += (-k * (x - target) - c * v) * dt; x += v * dt`) with a clamped `dt`; stiffness ~100–300, damping ~10–30. Interruptible by construction (retarget mid-flight keeps velocity).
- **Oscillation**: `sin(t * w) * a` for bob; `abs(sin)` for bounce; `cos/sin` pairs for orbits; `sin(t), sin(2t)` for figure-eight. Give repeated objects phase offsets, not lockstep.
- **Camera moves**: animate a target object and `camera.lookAt(target)` each frame; ease the path (GSAP tween on a proxy object, or `CatmullRomCurve3.getPointAt(easedT)`). Keep camera motion slower and smoother than object motion.
- **Shaders**: pass `uTime` as a uniform; heavy per-vertex motion (grass, water, particles) belongs in the vertex shader, not in JS loops over positions.
- **GSAP on Three objects** works directly: `gsap.to(mesh.position, { y: 1, duration: 0.6, ease: "power3.out" })`; rotations on `mesh.rotation`, colours via a proxy then `material.color.set()`.

## Interaction feel

Hover/press responses on 3D objects follow the same budgets as UI (`motion-principles.md`): 150–300 ms, ease-out, scale changes of 3–8%. Use damping toward hover targets so rapid pointer moves don't stutter. Respect `prefers-reduced-motion`: stop idle spins and autoplaying camera drift, keep direct manipulation.

## Performance

- Share one `AnimationClip` across many mixers; limit active mixers; skip `mixer.update` for off-screen or distant objects.
- Pause the loop when the tab is hidden or the canvas is off-screen (IntersectionObserver) and resume with a fresh delta.
- Cap `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` for interactive pages.
- Instanced meshes for crowds of identical moving objects; update `instanceMatrix` and set `needsUpdate`.

## Deterministic 3D for video renders (HyperFrames)

A frame-capturing renderer seeks to arbitrary times, so wall-clock motion breaks. Rules:

- Render from the host's time, not from `Clock`, `Date.now()` or `performance.now()`. HyperFrames' `three` adapter sets `window.__hfThreeTime` and dispatches `hf-seek` with `event.detail.time`.
- Write one `renderAt(time)` that sets every animated property from `time` (procedural formulas, `mixer.setTime(time)` for clips; seek every mixer from the same `time`) and then renders.
- Pin output: `renderer.setSize(1920, 1080, false)`, `renderer.setPixelRatio(1)`.
- Load models, textures and HDRIs before seeking starts; never fetch at seek time. Long CPU setup (procedural meshes, shader compiles) can register a readiness promise on `window.__hf.buildReady["piece-name"]`.
- Set `data-duration="<seconds>"` on the root composition element: the three adapter cannot infer duration on its own.
- Avoid post-processing that depends on previous frames (feedback trails, temporal AA) unless you can rebuild it from `time`; seed every random source.
- Pin the `three` version in any import map so bare and addon imports match.

```js
function renderAt(t) {
  mesh.rotation.y = t * 0.7;
  mixer.setTime(t);
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(window.__hfThreeTime || 0);
```

Validate with `npx hyperframes lint` and `npx hyperframes check` (see `hyperframes-animation.md`).
