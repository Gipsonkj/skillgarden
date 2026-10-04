# Three.js scenes: setup, loaders, materials, lighting

> Distilled from: threejs-fundamentals, threejs-loaders and threejs-materials (CloudAI-X/threejs-skills, MIT stated in README); three-best-practices (emalorenzo/three-agent-skills, MIT); threejs-aaa-graphics-builder authoring recipes (majidmanzarpour/threejs-game-skills, MIT). Plus general knowledge of Three.js r150+.

Plain Three.js, no React. For React projects read [react-three-fiber.md](react-three-fiber.md); for frame rate, memory and polish read [web-3d-performance.md](web-3d-performance.md). Moving things (clips, mixers, camera paths, scroll-driven 3D) belongs to the motion-animation craft.

## 1. Check the version first

Read `three` in `package.json` before writing code. APIs move between releases (colour management in r152, `RGBELoader` vs `HDRLoader`, node `PostProcessing` renamed `RenderPipeline` in r183). Write for the installed version and say so when unsure; don't upgrade a project to match a snippet.

Use ES module imports from `three` and `three/addons/...` (or an import map for a no-build page), never the old global `<script>` builds.

## 2. Minimal correct scene

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;      // default since r152
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(2.5, 1.5, 3.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas.parentElement;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas.parentElement);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
```

Rules behind it:
- One loop: `renderer.setAnimationLoop`, never a second `requestAnimationFrame` for the same scene.
- Cap pixel ratio at 2 (1.5 on weak mobiles); higher costs fill rate for no visible gain.
- Size from the container, not `window`, so the canvas fits layouts. Call `updateProjectionMatrix()` after changing fov, aspect, near or far.
- Near/far as tight as the scene allows (0.1 to 100 for an object viewer); a huge range causes z-fighting.
- Coordinate system: right-handed, +Y up, +Z towards the viewer, units are whatever the asset uses (glTF is metres).
- Static viewer? Render on demand (only when controls change) instead of every frame; see [web-3d-performance.md](web-3d-performance.md).

## 3. Cameras and controls

| Need | Use |
|---|---|
| Object or product viewer | `PerspectiveCamera` fov 30 to 50 plus `OrbitControls` with damping, `minDistance`/`maxDistance`, `maxPolarAngle` just under 90 degrees so users can't go under the floor |
| Isometric, diagrams, 2.5D | `OrthographicCamera` with a frustum sized to the scene |
| First person, walkthrough | `PointerLockControls` or custom; keep collision separate |

Frame a loaded model automatically: compute `new THREE.Box3().setFromObject(model)`, centre it at the origin, and place the camera at a distance from the bounding sphere radius and fov.

## 4. Loading models and textures

glTF/GLB is the runtime format. Set up every decoder the asset might need once:

```js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const draco = new DRACOLoader().setDecoderPath("/decoders/draco/");
const ktx2 = new KTX2Loader().setTranscoderPath("/decoders/basis/").detectSupport(renderer);
const loader = new GLTFLoader()
  .setDRACOLoader(draco)
  .setKTX2Loader(ktx2)
  .setMeshoptDecoder(MeshoptDecoder);

const gltf = await loader.loadAsync("/models/product.glb");
scene.add(gltf.scene);
```

- **Host the decoders yourself.** Copy `node_modules/three/examples/jsm/libs/draco/` and `.../libs/basis/` into your public folder, matching the installed `three` version. A CDN path works for prototypes but pins you to someone else's host and version.
- `LoadingManager` coordinates progress across loaders (`onProgress(url, loaded, total)`, `onLoad`, `onError`). Show real progress, and an error state when a load fails.
- Cache: reuse one loader; clone `gltf.scene` for repeats (use `SkeletonUtils.clone` for skinned models).
- After load: `traverse` to set `castShadow`/`receiveShadow` on meshes that need them, find parts with `getObjectByName`, and never rescale in code what should be fixed in the asset.
- Other formats: `OBJLoader`/`MTLLoader`, `FBXLoader` (often 100x scale; prefer converting to GLB), `STLLoader` and `PLYLoader` return geometry only (add a material; call `computeVertexNormals()` for PLY). Convert these to GLB for production.
- Textures: `TextureLoader` for JPG/PNG/WebP, `KTX2Loader` for GPU-compressed. Colour maps get `tex.colorSpace = THREE.SRGBColorSpace`; normal, roughness, metalness and AO stay linear. Set `anisotropy` (up to `renderer.capabilities.getMaxAnisotropy()`) on floors and surfaces seen at grazing angles. glTF textures come configured; don't touch their `flipY`.

## 5. Materials

| Material | Use |
|---|---|
| `MeshStandardMaterial` | Default PBR: `color`, `roughness` (0 mirror, 1 matte), `metalness` (0 or 1 for real materials; in-between is for transitions), maps |
| `MeshPhysicalMaterial` | Selectively: clearcoat (car paint, lacquer), transmission plus `thickness` and `ior` (glass, liquid), sheen (fabric), iridescence, anisotropy (brushed metal) |
| `MeshBasicMaterial` | Unlit: UI in 3D, baked-lighting scenes, debug |
| `MeshLambertMaterial` / `MeshToonMaterial` | Cheap matte; cel shading with a stepped `gradientMap` (NearestFilter) |
| `ShaderMaterial` / TSL node materials | Custom looks; prefer TSL on the WebGPU renderer |

- Share materials: one instance per look, reused across meshes (fewer programs, fewer draw calls).
- Transparency is expensive and sorts badly. Prefer `alphaTest` cut-outs for foliage and decals; set `transparent: true` only when needed and `depthWrite: false` for glows.
- Transmission renders an extra pass; use it on one hero object, not a whole scene.
- Glass starting point: `MeshPhysicalMaterial({ roughness: 0, transmission: 1, thickness: 0.5, ior: 1.5 })` plus an environment map.
- Toggling features like `map` or `fog` after first render needs `material.needsUpdate = true` (recompiles the shader).

## 6. Lighting and environment

PBR materials need something to reflect. Image-based lighting does most of the work:

```js
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"; // check the name for your version
const pmrem = new THREE.PMREMGenerator(renderer);
const hdr = await new RGBELoader().loadAsync("/env/studio_1k.hdr");
scene.environment = pmrem.fromEquirectangular(hdr).texture;
hdr.dispose(); pmrem.dispose();
```

- A 1k HDR is enough for reflections in most viewers; use a blurred version or a solid colour as `scene.background` so the environment doesn't distract. `RoomEnvironment` (from addons) gives a neutral studio with no file at all.
- Add direct lights only where the environment can't: a `DirectionalLight` key for crisp shadows, maybe a rim. Three or fewer active lights; each shadow-casting light renders the scene again.
- Shadows: enable on the renderer (`renderer.shadowMap.enabled = true`, `PCFSoftShadowMap`), on the light, and per mesh. Fit the directional light's shadow camera tightly to the subject; map size 1024 to 2048; tune `shadow.bias` (around -0.0005) and `normalBias` against acne and peter-panning. For a static scene, `shadowMap.autoUpdate = false` and render shadows once.
- Cheap grounding: a soft blob or contact-shadow plane under the object instead of real shadows on mobile.
- Physically correct light units are the default since r155: intensities from old tutorials (written for legacy units) come out far too dim or bright. Adjust by eye with exposure fixed.
- Tone mapping: ACES Filmic suits cinematic looks; AgX or Neutral keep product and brand colours truer. Pick one and judge exposure on the real page, not a test view.

## 7. Scene graph and interaction

- Groups for structure, named children (`leftDoor`, `screenGlass`) so code finds parts.
- Toggle `visible` instead of add/remove for things that come back.
- Raycasting: raycast against a small list of pickable meshes or simple proxies, not the whole scene; `layers` separate pickable from decorative. Throttle hover raycasts to pointer moves.
- Labels and UI: HTML overlays positioned by projecting a world point (`vector.project(camera)`) or CSS2DRenderer, so text stays crisp and accessible.

## 8. Clean up

GPU memory is not garbage collected. When removing anything, dispose geometry, every material and every texture on it, and render targets; on teardown, `renderer.dispose()` and stop the loop. A recursive `disposeObject(obj)` that walks children and material texture slots is worth having in every project.

## 9. Pitfalls

- Black model: no lights and no environment, or a metal with nothing to reflect.
- Washed-out or too-dark colours: wrong colour space on a colour map, double tone mapping, or legacy light intensities.
- Model invisible: it loaded at 100x or 0.01x scale, or sits outside near/far. Log its bounding box.
- Jagged or shimmering edges: missing `antialias`, pixel ratio capped at 1 on a retina screen, or no mipmaps on a texture.
- Memory climbing on route changes: nothing disposed.

## Checklist

- [ ] Version-matched imports; one animation loop; pixel ratio capped
- [ ] Canvas sized from its container; camera and controls limited for the use
- [ ] GLB with self-hosted Draco/Meshopt/KTX2 decoders; loading and error states
- [ ] Colour maps sRGB, data maps linear; shared materials
- [ ] Environment lighting plus at most a few direct lights; shadows fitted
- [ ] Disposal on teardown; checked in a real browser with the console open
