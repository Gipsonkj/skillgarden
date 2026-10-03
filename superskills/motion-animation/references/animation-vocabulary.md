> Distilled from: animation-vocabulary (emilkowalski/skills, MIT), motion-graphics motion-vocabulary (heygen-com/hyperframes, Apache-2.0), cinematic-scroll-storytelling effect vocabulary (mengto/skills, MIT)

# Animation vocabulary (reverse lookup)

Use when someone describes an effect loosely and needs the word to prompt a designer, an AI or a search. Lead with the term and one line; add 1–2 close alternates only when two terms compete. If nothing fits exactly, give the nearest term and say it's an approximation, or describe it by combining terms ("a stagger of scale-in entrances"). Don't invent terms.

Answer format:

```
**Origin-aware animation**: the panel grows out of the button that opened it, not from its own centre.
Close alternates: **Scale in** (if it just grows in place).
```

## Entrances and exits

| They say | Term | Means |
|---|---|---|
| "fades in/out" | Fade | opacity change only |
| "slides in from the side" | Slide in | enters from off-screen along one edge |
| "grows in" | Scale in | small → full size, usually with a fade |
| "bouncy pop when it opens" | Pop in | scale in with a slight overshoot |
| "gets uncovered", "wipes in" | Reveal / Wipe | clip-path or mask uncovers it |
| "comes into focus" | Blur in / Materialise | blur → sharp with fade |
| "the animation when it's added/removed" | Enter / Exit | mount and unmount animations |

## Sequencing and timing

| They say | Term | Means |
|---|---|---|
| "one after another" | Stagger | small delay between items, a cascade |
| "all of it moving together nicely" | Orchestration / Choreography | timing several animations as one motion |
| "the points in between" | Keyframes / Tween / Interpolation | defined states, generated in-betweens |
| "stays on the last frame" | Fill mode (`forwards`, `both`) | keeps first/last frame styles |
| "ticks like a countdown" | Stepped animation (`steps(n)`) | discrete jumps, no interpolation |
| "words arrive on the beat" | Beat sync / Kinetic beat slam | motion cued to musical beats |

## Movement and transforms

| They say | Term | Means |
|---|---|---|
| "moves" | Translate | along X/Y |
| "tilts in 3D", "card flips" | 3D tilt / Flip (rotateX/Y) | depth rotation |
| "how deep the 3D looks" | Perspective | lower value = stronger depth |
| "the point it spins/grows from" | Transform origin | anchor of scale and rotation |
| "pops out of the button" | Origin-aware animation | grows from its trigger |
| "slants" | Skew | shears along an axis |
| "follows a curved path" | Motion path | element travels along an SVG path |

## Between states

| They say | Term | Means |
|---|---|---|
| "one fades into the other in place" | Crossfade / Dissolve | out and in at the same spot |
| "the shape turns into another shape" | Morph | geometry interpolates (Dynamic Island) |
| "thumbnail flies into the big view" | Shared element transition | same element travels and resizes across views |
| "things slide to new spots instead of jumping" | Layout animation (FLIP) | animate size/position changes |
| "page animates when navigating" | Page / route transition; View transition | browser morphs between states or pages |
| "forward slides left, back slides right" | Direction-aware transition | direction encodes navigation |
| "keeps you oriented" | Continuity transition | before and after visibly connected |
| "expands and collapses" | Accordion / Collapse | height opens/closes |

## Scroll

| They say | Term | Means |
|---|---|---|
| "appears as you scroll to it" | Scroll reveal / Scroll-triggered | plays when entering the viewport |
| "moves exactly with the scrollbar" | Scroll-linked / Scroll-scrubbed | progress tied to scroll position, reversible |
| "background moves slower" | Parallax | layers at different scroll speeds |
| "section sticks while things change" | Pinning / Sticky stage | section held while a timeline plays |
| "cards stack on top of each other" | Sticky card stack | earlier cards recede as later ones arrive |
| "scrolls sideways while I scroll down" | Horizontal scroll (fake) | pinned panel, vertical scroll drives x |
| "Apple product page video on scroll" | Scroll-scrubbed image/video sequence | frames mapped to scroll progress |
| "buttery smooth scroll" | Smooth scrolling (Lenis, ScrollSmoother) | interpolated scroll position |

## Feedback and interaction

| They say | Term | Means |
|---|---|---|
| "shrinks a bit when clicked" | Press / tap feedback | ~0.97 scale on press |
| "fills up while you hold" | Hold to confirm | progress fill on long press |
| "flick it away" | Swipe to dismiss | drag off-screen with velocity |
| "stretchy resistance at the end" | Rubber-banding | resistance and snap-back past a boundary |
| "keeps sliding after I let go" | Momentum / Inertia | velocity carried after release |
| "shakes no" | Shake / Wiggle | error jitter |
| "circle spreads from the tap" | Ripple | expanding circle from touch point |
| "drag to rearrange" | Drag to reorder | others shift to make room |
| "tilts toward the mouse" | Pointer-tracking tilt / Magnetic hover | transform follows the cursor, sprung |

## Easing and springs

| They say | Term | Means |
|---|---|---|
| "fast then gentle" | Ease-out | default for UI |
| "slow start" | Ease-in | usually avoided in UI |
| "slow-fast-slow" | Ease-in-out | moves while visible |
| "constant speed" | Linear | spinners, marquees, scrubbed scroll |
| "custom curve" | Cubic-bezier | four-number easing |
| "springy, physical" | Spring | physics instead of a fixed duration |
| "how bouncy" | Bounce / Damping | lower damping = more oscillation |
| "how snappy" | Stiffness | higher = snappier |
| "how heavy" | Mass | more = slower, heavier |
| "goes past then settles back" | Overshoot | ends beyond target, returns |
| "can change direction mid-animation" | Interruptible animation | retargets without restarting |
| "feels done though it's still settling" | Perceptual duration | when a spring reads as finished |

## Loops and ambient

| They say | Term | Means |
|---|---|---|
| "scrolling ticker" | Marquee | continuous looped scroll |
| "back and forth" | Alternate / Yoyo | loop reverses each cycle |
| "gentle bobbing" | Float / Idle animation | subtle continuous drift |
| "breathing glow" | Pulse | repeating scale/opacity (avoid on UI status dots) |
| "circles around" | Orbit | continuous circular path |
| "seamless loop" | Loop seam | last frame matches first in position and velocity |

## Polish and effects

| They say | Term | Means |
|---|---|---|
| "draws itself" | Line drawing / Stroke draw-on | SVG stroke-dashoffset to 0 |
| "soft-edged reveal" | Mask | like clip-path but with gradient edges |
| "drag a divider to compare" | Before/after slider | clip-path wipe between two images |
| "letters change one by one" | Text morph / Scramble / Decode | character-level change |
| "typed out" | Typewriter | characters appear in sequence |
| "words rise from behind a line" | Masked line/word reveal (split text) | text units slide inside overflow masks |
| "numbers roll up" | Number ticker / Count-up | digits count to a value |
| "digits don't jiggle" | Tabular numbers | fixed-width numerals |
| "loading sheen" | Skeleton shimmer | moving highlight over placeholders |
| "speed smear" | Motion blur / Streak | directional blur at peak speed |
| "camera focus shift" | Rack focus / Depth-of-field blur | blur off-focus layers |
| "camera pushes in" | Push in / Zoom / Ken Burns | slow scale + pan |
| "RGB split glitch" | Chromatic aberration / Glitch | offset colour channels |

## Classic principles

| They say | Term |
|---|---|
| "winds up before moving" | Anticipation |
| "bits keep moving after it stops" | Follow-through / Overlapping action |
| "squishes when it lands" | Squash and stretch |
| "moves in a curve, not a line" | Arcs |
| "a smaller supporting move" | Secondary action |
| "one thing at a time, clearly" | Staging |
| "the animation makes it feel faster" | Perceived performance |

## Performance words

| They say | Term |
|---|---|
| "stutters" | Jank / dropped frames |
| "GPU does it" | Compositing / hardware acceleration (transform, opacity) |
| "browser recalculates layout every frame" | Layout thrashing |
| "warn the browser it will animate" | `will-change` |
| "frames per second" | FPS: 60 baseline, 120 on ProMotion displays |
