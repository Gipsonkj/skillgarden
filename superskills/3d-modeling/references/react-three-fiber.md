# React Three Fiber scenes

> Distilled from: r3f-fundamentals and its renderers reference (EnzeD/r3f-skills, MIT stated in README); three-best-practices (emalorenzo/three-agent-skills, MIT); blender-web-pipeline R3F notes (freshtechbro/claudedesignskills, MIT). Plus general knowledge of `@react-three/fiber` and `@react-three/drei`.

React Three Fiber (R3F) renders a Three.js scene from JSX. Everything in [threejs-scenes.md](threejs-scenes.md) about colour space, materials, lighting and assets still applies; this guide covers what React changes. Per-frame motion and GLTF clips belong to the motion-animation craft.

## 1. Choose the baseline

- Read `package.json` and the lockfile first. Fiber 9 pairs with React 19; Fiber 8 with React 18. Check `three` and `@react-three/drei` versions too, and use docs for those versions. Don't upgrade a project to match a recipe; if a prop isn't documented for the installed version, say so instead of guessing.
- Keep the renderer the project has. WebGPU is opt-in (section 7).

## 2. Minimal scene

```tsx
import { Suspense } from "react";
import { Canvas, type ThreeElements } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

function Product(props: ThreeElements["group"]) {
  const { scene } = useGLTF("/models/product.glb");
  return <primitive object={scene} {...props} />;
}
useGLTF.preload("/models/product.glb");

export default function Viewer() {
  return (
    <div style={{ height: 480 }}>                {/* the parent needs a real height */}
      <Canvas camera={{ position: [2.5, 1.5, 3.5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Product />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls makeDefault enableDamping />
      </Canvas>
    </div>
  );
}
```

Notes:
- Type props per the installed Fiber version: Fiber 9 uses `ThreeElements['mesh']` (or `['group']`) for props and `useRef<Mesh>(null)` for refs; don't add global `JSX.IntrinsicElements` augmentation or the removed `Object3DNode` types.
- `Environment` presets load HDR files from a CDN by default; for production, pass `files="/env/studio_1k.hdr"` from your own host.
- The loading indicator is DOM: render it outside the Canvas, or use drei's `Html`/`useProgress` inside. Canvas children must be Three.js objects.

## 3. Rules that change decisions

**Hooks and boundaries**
- `useThree`, `useFrame` and loader hooks work only in components beneath `<Canvas>`, never in the component that renders the Canvas and never inside event callbacks.
- `useThree(s => s.camera)` subscribes to camera replacement, not to `camera.position` changes. Read transient values inside `useFrame`.

**State vs refs**
- React state for discrete changes (selected colour, open/closed). Refs and direct mutation for anything per frame. Never `setState` in `useFrame`.
- Reuse scratch vectors outside the frame callback; use the `delta` argument (seconds).
- `args` are constructor arguments: changing them rebuilds the object. Animate props or refs, not `args`. Memoise expensive geometry, arrays and materials whose inputs haven't changed.

**Render loop**
- `frameloop="always"` (default) for continuous motion. `frameloop="demand"` for viewers that rest: imperative changes then need `invalidate()`, and animations must keep invalidating until they settle. Drei controls invalidate for you.
- `useFrame` priorities: negative numbers order updates without taking over rendering; a positive priority means that callback must render the scene itself.
- Don't run a second animation loop next to R3F's.

**Renderer defaults**
- R3F's WebGL Canvas defaults to sRGB output and ACES Filmic tone mapping. `flat` switches to no tone mapping and `linear` changes the output colour space; neither is a generic fix for washed-out assets (check the asset's colour maps first).
- Shadows: on three r182+ use `shadows="percentage"` for PCF; bare `shadows` in Fiber 9 picks the deprecated `PCFSoftShadowMap`.
- `dpr={[1, 2]}` caps pixel ratio. Add `preserveDrawingBuffer`, higher DPR or extra passes only for a real requirement, and measure them.

**Ownership and disposal**
- R3F disposes objects it created declaratively on unmount. `<primitive object={...}>` does not dispose the object you pass. Cached loader results (`useGLTF`) are shared: don't dispose them while another component uses them.
- `dispose={null}` opts a subtree out of auto-disposal; it isn't a performance switch.
- Effects and subscriptions must survive React Strict Mode mount, unmount, mount.

## 4. Loading GLB the R3F way

- `useGLTF(url)` suspends until loaded and caches by URL. Pass `true` or a decoder path as the second argument to enable Draco; drei also wires Meshopt. Host decoders yourself in production.
- For anything you'll edit, turn the model into a component: `npx gltfjsx model.glb --transform --types` writes a typed JSX component and an optimised `*-transformed.glb` (it runs glTF Transform under the hood). Then you can swap materials, hide parts and attach handlers per node.
- Clone for repeats with drei's `<Clone>` or `useMemo(() => scene.clone(), [scene])`; skinned meshes need `SkeletonUtils.clone`.
- Preload with `useGLTF.preload(url)` at module level for the first model; lazy-load the rest.

## 5. Useful drei pieces

| Need | drei |
|---|---|
| Orbit, limits, damping | `OrbitControls` (`makeDefault`), `PresentationControls` for product spins |
| Lighting and studio look | `Environment`, `Lightformer`, `Stage`, `ContactShadows`, `AccumulativeShadows` |
| Frame the model | `Bounds` (fit and clip), `Center` |
| DOM in the scene | `Html` (labels, hotspots), `useProgress` (loader progress) |
| Many copies | `Instances`/`Instance`, `Merged` |
| Text | `Text` (SDF), `Text3D` |
| Adapt quality | `PerformanceMonitor`, `AdaptiveDpr`, `AdaptiveEvents` |

Check each one's props against the installed drei version; they change between majors.

## 6. Interaction

- Pointer events on meshes: `onClick`, `onPointerOver`, `onPointerOut`. Call `e.stopPropagation()` so only the nearest hit reacts. Change the cursor in `onPointerOver`.
- Keep pickable meshes few or use invisible proxy meshes; raycasting thousands of meshes per pointer move costs frames.
- Keyboard and screen-reader access live in the DOM: mirror important 3D actions (colour swatches, "view from front") as real buttons outside the canvas.

## 7. WebGPU

Only when the task needs it (TSL node materials, compute). Fiber 9 accepts an async `gl` factory:

```tsx
import { WebGPURenderer } from "three/webgpu";
<Canvas gl={async (props) => {
  const renderer = new WebGPURenderer({ canvas: props.canvas as HTMLCanvasElement, antialias: true });
  await renderer.init();
  return renderer;
}} />
```

- Built-in materials work; custom GLSL `ShaderMaterial` and shader-patching helpers don't move to the node pipeline automatically. `@react-three/postprocessing` is WebGL-only.
- Don't mix Fiber 10 alpha imports (`@react-three/fiber/webgpu`) into a Fiber 9 project.
- Test init failure and the real target browsers and devices.

## 8. Verify

Type-check, run it in a browser with the console open, resize the window, unmount and remount the route (memory should return), and for `frameloop="demand"` check both waking up and going back to idle.

## Pitfalls

- Blank canvas: the parent has zero height.
- Hooks used above the Canvas: "R3F: Hooks can only be used within the Canvas component".
- `setState` in `useFrame`: the whole tree re-renders 60 times a second.
- New `Vector3` or material every render: garbage and shader recompiles.
- Disposing a cached GLTF in one component breaks it in another.

## Checklist

- [ ] Versions read; renderer unchanged unless required
- [ ] Hooks under Canvas; per-frame work in refs; scratch objects reused
- [ ] `frameloop` chosen for the use; `invalidate()` where demand rendering needs it
- [ ] GLB via `useGLTF` or `gltfjsx --transform`; decoders and HDRs self-hosted
- [ ] Disposal and Strict Mode checked; DOM fallbacks for loading and key actions
