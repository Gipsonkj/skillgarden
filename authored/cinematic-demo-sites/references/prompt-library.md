# Prompt library — stills + motion by business type

Ready-to-adapt prompts. **Stills** go to Nano Banana Pro (add `, 16:9`).
**Motion** goes to Wan i2v (always end with `slow, no cuts`). Pick 3 stills per business in the
**heritage → craft up close → payoff** order.

## Universal recipe
- Still: `[subject + real props], [emotion/action], [warm|atmospheric|dramatic] light, cinematic photorealistic, 16:9`
- Food still: add `appetising, cinematic food photography`
- Room still: add `moody atmospheric dramatic light`
- Motion: `[one small motion from the still], slow, no cuts`

## Food & grill (döner, kebab, grill, currywurst, breakfast)
- Still 1 (fire/origin): "a traditional grill master turning skewers over open charcoal flames, glowing embers, warm atmospheric, cinematic photorealistic"
- Still 2 (craft): "close-up of juicy grilled kebabs / köfte over open flames with char marks and steam, appetising, cinematic food photography"
- Still 3 (payoff): "a generous grill platter with rice, salad and flatbread on a rustic table, warm inviting light, cinematic food photography"
- Motion: "skewers turning slowly over glowing embers, slow, no cuts" · "steam gently rising off the platter, slow push in, no cuts"
- Döner spit: "the doner spit slowly rotating, meat glistening and dripping, heat-lamp glow, slow, no cuts"

## Café / bakery / gelato
- Stills: "artisan gelato glistening in the display case, colourful, cinematic photorealistic" · "a hand scooping creamy gelato into a cone, appetising, cinematic food photography" · "a gelato cone held up, creamy scoops, soft light"
- Motion: "gelato slowly glistening, subtle sheen, slow, no cuts" · "steam curling off a fresh espresso, slow, no cuts"

## Barber / hair salon
- Stills: "a stylish salon, a stylist styling a client's hair, warm elegant light, cinematic photorealistic" · "close-up of scissors cutting hair precisely, salon light" · "a person with freshly styled glossy hair, confident, salon mirror"
- Motion: "fine strands of hair falling as scissors trim, slow, no cuts" · "a woman with glossy styled hair turning her head slightly, slow, no cuts"

## Spa / massage / nails / beauty
- Stills: "a calm spa with warm water and soft steam, serene, cinematic photorealistic, moody atmospheric light" · "close-up of skilled hands giving a massage, soft light" · "colourful nail polish / manicure close-up, elegant, soft light"
- Motion: "soft steam drifting slowly over calm water, slow, no cuts" · "a hand slowly applying polish, close-up, slow, no cuts"

## Workshop / kfz / handyman
- Stills: "a clean modern garage with a car on a hydraulic lift, professional tools, cinematic photorealistic" · "close-up of a mechanic's hands working on an engine with a tool, focused, garage light" · "a gleaming clean car in the garage, light reflecting"
- Motion: "light slowly reflecting along the car body, slow push in, no cuts" · "hands working steadily on the engine, slow, no cuts"

## Gym / fitness
- Stills: "a moody gym with weights and equipment, dramatic light, cinematic photorealistic" · "a person lifting weights with focus and effort, muscles working, dramatic gym light" · "a fit person catching breath after a workout, confident, gym light"
- Motion: "a slow push in across the gym floor, dramatic light, slow, no cuts" · "chest rising and falling after effort, slow, no cuts"

## Lounge / bar / nightlife (shisha, wine, cocktails)
- Stills: "a cozy lounge with soft neon and lantern light, plush seating, drifting smoke, inviting nightlife, cinematic photorealistic" · "close-up of a drink being poured / smoke curling, moody" · "the room glowing at night, warm neon"
- Motion: "smoke drifting slowly through soft neon light, slow, no cuts" · "neon light gently shifting over the sofas, slow, no cuts"

## Florist / retail / concept store
- Stills: "a bright flower shop, hand-tied bouquets in season, fresh, cinematic photorealistic" · "close-up of hands binding a bouquet, soft morning light" · "a finished bouquet held up, colourful, soft light"
- Motion: "petals barely moving in a soft draft, slow, no cuts" · "hands slowly arranging stems, close-up, slow, no cuts"

## Negative prompt (always)
`blurry, low quality, distorted, warped, deformed, extra fingers, mutated hands`

## Wan params quick copy
`{ cfg: 2.0, width, height, length: 81, steps: 10, context_overlap: 48 }` — 16:9 → 1280×720,
9:16 → 720×1280. Raw base64 image in, base64 mp4 out. Long queue → poll for ~170 min.
