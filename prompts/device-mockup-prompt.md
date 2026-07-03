# Dymora — Device Mockup Image-Generation Prompt

Reusable, parametrized prompt for generating website hero/scroll assets.
Usage: attach ONE app screenshot, replace every `{PARAMETER}`, send.

---

## MASTER PROMPT

```
You are generating a premium marketing asset for "Dymora", a smart-building /
home-automation platform. I have attached a real screenshot of the Dymora app.
Your task: embed that screenshot, pixel-faithful, into a photorealistic
{DEVICE} mockup and compose it into a branded scene.

=== 1. SCREEN CONTENT — STRICT RULES ===
- Use the attached screenshot EXACTLY as the on-screen content. Do not redraw,
  reinterpret, retouch, translate or "improve" it. Do not invent UI elements.
- All text in the screenshot must remain sharp, legible and unaltered.
- Fit the screenshot to the device screen edge-to-edge with correct aspect
  ratio ({SCREEN_FIT}: e.g. "fill, cropping bottom edge" or "fit exactly").
- Apply subtle, realistic screen glass reflection (max 5% opacity, one soft
  diagonal streak) — never covering text or key UI numbers.
- Screen brightness slightly above ambient, like a real OLED display in a
  dim studio: deep blacks matching the device bezel, vivid orange accents.

=== 2. DEVICE ===
- Device: {DEVICE} ({DEVICE_DETAILS}).
- Color/finish: {DEVICE_FINISH} — prefer matte space-black / graphite so the
  hardware blends with the brand's near-black palette.
- Render with product-photography accuracy: correct bezels, corner radii,
  camera cutout/notch, button placement, no fictional hardware.
- Orientation: {ORIENTATION}. Angle: {ANGLE} (e.g. "straight-on frontal",
  "three-quarter left, 15° yaw, 5° pitch", "floating with slight backward tilt").

=== 3. SCENE & BACKGROUND ===
- Style: minimal, dark, technical, premium — "industrial precision meets
  quiet luxury". NOT cozy, NOT colorful, NOT cluttered.
- Background: {BACKGROUND} — choose from the brand set:
  (a) near-black #0A0A0A studio wall with a very faint fine square grid
      texture (thin lines, ~2% white opacity, like blueprint paper);
  (b) warm off-white #F4F0E8 seamless studio backdrop with soft floor shadow;
  (c) split composition: left half near-black with grid texture, right half
      off-white, device straddling the seam.
- One soft radial glow in burnt orange (#EA4314 at ~15% opacity) behind or
  beside the device, off-center, like embers behind glass.
- Optional brand motif ({MOTIF}): a thin dashed orange line (#EA4314) running
  horizontally through the scene and "connecting" to the device edge, ending
  in a small glowing orange node — evoking a device↔hub network link. Keep it
  behind the device, never over the screen.
- Floor/surface: {SURFACE} (e.g. "none — device floats with soft drop
  shadow", "dark brushed concrete slab", "matte black plinth").

=== 4. LIGHTING ===
- Single large softbox key light from upper {LIGHT_SIDE}, gentle falloff.
- Rim light: faint warm orange edge light on the device's shadow side,
  echoing #EA4314 — subtle, 10–15% intensity.
- Deep soft shadows, no harsh speculars, no lens flare, no HDR halos.

=== 5. COMPOSITION & OUTPUT ===
- Composition: {COMPOSITION} (e.g. "device centered, 60% of frame height,
  generous negative space above for headline overlay", "device anchored to
  bottom edge, cropped at 20%", "two devices: {DEVICE} in front, {DEVICE_2}
  behind and to the right, overlapping, both showing attached screenshots").
- Negative space reserved at {NEGATIVE_SPACE} for website text overlay —
  keep it completely clean.
- Aspect ratio {ASPECT_RATIO}, resolution {RESOLUTION}, PNG.
- Background must be {BG_MODE}: "transparent (isolated device cutout with
  baked soft shadow)" or "full scene as described above".

=== 6. FORBIDDEN ===
No people, no hands, no plants, no coffee cups, no desks with props, no
visible brand logos other than what appears inside the screenshot, no text
rendered by you anywhere in the image, no watermark, no blue/purple/teal
color casts, no gradients other than the specified orange glow, no cartoon
or illustration style — photorealistic product photography only.
```

---

## PARAMETER SETS (per device)

| Parameter | MacBook Pro | iPhone 16 Pro | iPad Pro | Google Pixel 9 |
|---|---|---|---|---|
| `{DEVICE}` | MacBook Pro 16" | iPhone 16 Pro | iPad Pro 13" | Google Pixel 9 Pro |
| `{DEVICE_DETAILS}` | thin bezels, notch, black keyboard visible | Dynamic Island, titanium edges | slim symmetric bezels, no home button | camera bar on back if visible |
| `{DEVICE_FINISH}` | space black | black titanium | space grey | obsidian |
| `{ORIENTATION}` | landscape, lid open ~110° | portrait | landscape or portrait | portrait |
| `{ANGLE}` | straight-on or 3/4 left 15° | straight-on frontal | 3/4 right 20°, slight pitch | straight-on frontal |
| `{SCREEN_FIT}` | fill 16:10 | fill 19.5:9 | fill 4:3 | fill 20:9 |

Shared defaults: `{LIGHT_SIDE}`=left · `{ASPECT_RATIO}`=16:9 desktop hero / 4:5 scroll cards · `{RESOLUTION}`=at least 2560px long edge · `{MOTIF}`=on for hero, off for cards.

Series consistency (append when generating a set):
```
This image is part of a series. Keep identical: lighting setup, background
treatment, shadow softness, orange glow hue/intensity, and camera focal
length across all images, so they read as one photoshoot.
```

---

## NOTE — scroll animations

Animated transitions on the site are NOT the image generator's job. Generate
static PNGs (ideally `{BG_MODE}` = transparent cutouts), then animate on the
page with CSS/JS: scroll-triggered fade+rise reveals, parallax between device
layers, sticky sections where devices swap as the user scrolls.
