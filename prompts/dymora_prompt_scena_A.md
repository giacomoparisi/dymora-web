# Dymora — Prompt modulare · Scena A (primo frame)

Stile: 3D minimal, pulito, premium ed elegante. Pochi dettagli, solo quelli che contano.

Il prompt è diviso in una **base fissa** (non cambiarla mai, garantisce la coerenza tra i frame) e in **placeholder** `{{...}}` che sostituisci con lo stato desiderato (acceso / spento / assente).

---

## 1. Prompt base (copia questo)

```
A single detached two-story villa, clean minimal 3D style, premium and elegant,
three-quarter front view with a slight high angle. Soft studio lighting, gentle
ambient occlusion, smooth matte materials, soft contact shadows. Reduced detail —
only what matters — generous negative space. Palette: warm neutral architecture
(off-white plaster, pale sand, light wood) on a {{BACKGROUND}}, with a single warm
amber accent for anything active or lit. Large clean glass, thin metal details.
No clutter, no text, no logos.

Roof solar panels: {{SOLARE}}
Facade windows: {{FINESTRE}}
Security cameras: {{VIDEOCAMERE}}
Alarm siren: {{SIRENA}}
Figure: {{MANICHINO}}

High-end product-visualization render (Cinema 4D / Octane look), soft global
illumination, shallow depth of field, centered composition. Aspect ratio 16:9.
```

---

## 2. Valori dei placeholder

Per ogni elemento incolla **una sola** delle righe al posto del `{{...}}`.

### `{{BACKGROUND}}` — sfondo
- Dark premium → `deep charcoal near-black studio backdrop with a soft radial glow behind the villa`
- Light premium → `soft warm off-white studio backdrop with a subtle vertical gradient`

### `{{SOLARE}}` — pannelli solari
- ACCESO → `a neat array of dark solar panels on the roof, subtly catching light, a faint amber energy glow along their edges`
- SPENTO → `a neat array of matte dark solar panels on the roof, no glow, inactive`
- ASSENTE → `a clean empty roof, no solar panels`

### `{{FINESTRE}}` — finestre
- ACCESE → `large windows glowing with a warm amber interior light`
- SPENTE → `large windows with dark reflective glass, unlit`
- ASSENTI → `a facade with no visible windows` *(sconsigliato per una villetta)*

### `{{VIDEOCAMERE}}` — videocamere
- ACCESE → `small minimalist security cameras at the roof corners, each with a subtle glowing indicator light, active`
- SPENTE → `small minimalist security cameras at the roof corners, no indicator light, idle`
- ASSENTI → `no security cameras`

### `{{SIRENA}}` — sirena lampeggiante d'allarme
- ACCESA → `a compact alarm siren box on the facade emitting a bright flashing red-and-blue light, casting a soft colored glow on the nearby wall`
- SPENTA → `a compact alarm siren box on the facade, unlit, inactive`
- ASSENTE → `no alarm siren`

### `{{MANICHINO}}` — figura / manichino
- PRESENTE → `a faceless minimalist 3D mannequin, smooth matte neutral material, no facial features, elegant simple form, {{POSA_MANICHINO}}`
- ASSENTE → `no figure in the scene`

### `{{POSA_MANICHINO}}` — posa + posizione (usato solo se il manichino è presente)
Combina **posa** e **collocazione nel frame**. Esempi pronti:
- `standing at the front door, facing the house, in the lower-center foreground`
- `standing on the front lawn seen from behind, looking up at the villa, lower-left foreground`
- `walking along the path toward the entrance, mid-ground on the right`
- `standing to the right of the house, one hand raised as if holding a smartphone`
- `sitting on a low garden bench on the left, relaxed posture`
- `standing small in the foreground for scale, centered, back to the camera`

> Suggerimento posizione: aggiungi sempre un riferimento di collocazione (`foreground`, `lower-left`, `mid-ground right`, ecc.) per controllare **dove** appare nel frame, oltre alla posa.

---

## 3. Negative prompt (consigliato)

```
cluttered details, busy background, text, watermark, logo, harsh shadows,
photorealistic skin, realistic human face, extra limbs, distorted geometry,
lens flare, grain, noise, oversaturated colors
```

---

## 4. Esempio compilato (dark, tutto acceso, manichino alla porta)

```
A single detached two-story villa, clean minimal 3D style, premium and elegant,
three-quarter front view with a slight high angle. Soft studio lighting, gentle
ambient occlusion, smooth matte materials, soft contact shadows. Reduced detail —
only what matters — generous negative space. Palette: warm neutral architecture
(off-white plaster, pale sand, light wood) on a deep charcoal near-black studio
backdrop with a soft radial glow behind the villa, with a single warm amber accent
for anything active or lit. Large clean glass, thin metal details. No clutter,
no text, no logos.

Roof solar panels: a neat array of dark solar panels on the roof, subtly catching
light, a faint amber energy glow along their edges.
Facade windows: large windows glowing with a warm amber interior light.
Security cameras: small minimalist security cameras at the roof corners, each with
a subtle glowing indicator light, active.
Alarm siren: a compact alarm siren box on the facade emitting a bright flashing
red-and-blue light, casting a soft colored glow on the nearby wall.
Figure: a faceless minimalist 3D mannequin, smooth matte neutral material, no facial
features, elegant simple form, standing at the front door, facing the house, in the
lower-center foreground.

High-end product-visualization render (Cinema 4D / Octane look), soft global
illumination, shallow depth of field, centered composition. Aspect ratio 16:9.
```

---

## 5. Note per la coerenza tra i frame

- **Blocca il seed** (stesso seed su tutti i frame) e non toccare mai la base: cambia solo le righe dei placeholder. Così la villetta resta identica e sembra la stessa scena che si "accende".
- Tieni **inquadratura, luce e palette** costanti: sono nel blocco base apposta.
- Per Midjourney: aggiungi `--ar 16:9 --style raw` e, per lo stile 3D pulito, valuta `--stylize` basso. Per modelli tipo Flux/SDXL usa il negative prompt qui sopra.
- Genera **prima il frame "tutto spento"** come master, poi accendi un elemento alla volta: è il modo più veloce per costruire la sequenza dell'animazione.
