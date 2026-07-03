# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

`dymora-web` is the public static website for **dymora.eu**, deployed via GitHub Pages (the `CNAME` file maps the custom domain — do not delete it). There is no build system, no package manager, no tests: every page is a single self-contained HTML file with all CSS inlined in a `<style>` block.

Current pages:

- `privacy/index.html` — GDPR privacy policy (Italian), a long-form document with a sticky topbar, hero, and anchored `<section id="...">` blocks (`#titolare`, `#dati`, `#diritti`, `#cookie`, etc.).
- `support/index.html` — support contact page (Italian), a single centered card pointing to `support@dymora.eu`.

## Development

```bash
# Preview locally (no build step)
python3 -m http.server 8000        # then open http://localhost:8000/privacy/

# Deploy = push to main (GitHub Pages serves the branch directly)
```

Pages must remain mobile-responsive — sizes use `clamp()` and media queries; keep that pattern when editing.

## Design System

Both pages share an identical `:root` token block. When adding a page, copy it verbatim so the site stays visually consistent:

- **Colors**: `--char: #1c1c1c` (near-black surfaces), `--orange: #e8541e` (accent), `--cream-bright: #f4f0e8` (page background), `--ink: #1d1c1a` (text). Official brand palette: primary `#0A0A0A`, secondary `#EA4314`.
- **Web fonts** (Google Fonts): `Chakra Petch` (`--display`, headings/kickers, uppercase with wide letter-spacing) and `Sora` (`--body`, weight 300). The brand's native app fonts are Asta Sans Medium and Doto ExtraBold; the web uses these Google Fonts substitutes.
- **Recurring motifs**: dark topbar with 2px orange bottom border; hero/card on `--char` background with a radial orange glow (`::after` circle, top-right); orange kicker text in uppercase display font.

All user-facing content is in Italian (`<html lang="it">`).

### App UI Language (reference for new pages)

The Dymora product app defines the brand's visual language; new web pages should echo it:

- **Headlines**: bold sans, sentence case, ending with a period, with the key word in orange — e.g. "Your energy.", "Don't miss anything **important.**", "System **overview.**".
- **Kickers**: a short orange dash followed by uppercase, wide-tracked technical text — `— ENERGY`, `— PUSH NOTIFICATIONS`, `— VIDEO SURVEILLANCE`. Section labels use a leading dot instead: `● SETTINGS`, `● WHY ENABLE THEM`, often followed by a thin horizontal rule.
- **Dark headers with a faint grid**: near-black header/hero areas carry a subtle square grid-line texture; the "dymora" wordmark is a custom stencil/segmented display face (Doto-style).
- **Data display**: very large numerals with a small orange unit superscript (`412 W`, `9.2 kWh`, `3.4 TB / 6 TB`); uppercase letter-spaced metric labels (`POWER · REAL TIME`, `CONSUMPTION · TODAY`); delta indicators like `↓ 8% VS YESTERDAY`.
- **Cards**: dark rounded-corner cards sit on a light (off-white/light-grey) page background; stat tiles pair a big number with a small icon top-right.
- **Buttons**: primary = solid orange pill with icon + label; secondary = orange-outline pill on dark, or plain text link ("Skip for now").
- **Connection motif**: nodes (device, hub, camera, AI chip) drawn as rounded dark squares joined by dashed orange lines, active node outlined in orange with a glow.
- **Status**: small colored dots — green for live/online, orange for alarm/attention; camera/video placeholders use diagonal-stripe texture.

Note: the app UI copy in screenshots is English, while the current web pages (privacy/support) are Italian; camera names and legal content stay Italian.

## About Dymora (context for content edits)

Dymora is a smart-building / building-automation platform for residential and commercial buildings — an independent system integrator delivering turnkey domotics (lighting, climate, security/alarm, video surveillance, energy monitoring, shutters) managed from one unified ecosystem instead of fragmented vendor apps.

- **Value proposition**: simplicity (one coherent interface, guided device selection, no vendor lock-in), measurable efficiency (energy and operational monitoring/analytics), and a continuous service (maintenance, monitoring, updates, ongoing consulting — not a one-shot install).
- **Segments**: B2C (homes, apartments, mid/high-end residential) and B2B (real-estate developers/builders for new or renovated buildings, plus businesses with existing premises: shops, offices, warehouses).
- **Business model**: hybrid hardware + subscription — one-time revenue from design/installation, recurring revenue from platform, support, and service subscriptions.

Contact: `support@dymora.eu`.
