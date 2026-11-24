# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

`dymora-web` is the public static website for **dymora.eu**. It is an Astro site built to static files in `dist/`; styles and scripts are external and all production assets are self-hosted. `public/CNAME` maps the custom domain and must not be deleted.

The GitHub Pages Actions workflow is prepared in `.github/workflows/deploy-pages.yml`. Do not switch the repository's Pages source to Actions without the project owner's explicit approval: that activation is scheduled separately. Never push directly to `main`.

Current pages:

- `src/pages/index.astro` — home page with the approved scroll-driven opening; engine in `public/assets/js/home.js`.
- `src/pages/videosorveglianza/index.astro` — AI video-surveillance page with the existing three.js scene and demo controls under `public/videosorveglianza/`.
- `src/pages/consumi/index.astro` — energy page.
- Home section "Cosa puoi fare con Dymora" (`src/components/FeatureLinks.astro`, `#funzioni`), data in `src/data/features.ts`: functions with `page: true` (video surveillance, energy) link to their page; the others (luci, clima, tapparelle, serrature, allarme, irrigazione) open a native `<dialog>` on the home (`src/components/FeatureDialog.astro`, `public/assets/js/feature-dialog.js`, URL `/#funzione-<slug>`). To promote a function to a page once it has enough content: build it with `src/components/FeaturePage.astro`, set `page: true` and its `href`, add it to the sitemap.
- `src/pages/privacy/index.astro` — GDPR privacy policy. The URL is also used by the app: keep it stable.
- `src/pages/cookie/index.astro` — cookie policy (no cookies, no third parties).
- `src/pages/support/index.astro` — support contact page.
- `src/pages/404.astro` — custom not-found page (`noindex`).
- `public/robots.txt`, `public/sitemap.xml` — update the sitemap when adding or removing a page.

## Rules

- **No third parties.** No cookies, analytics, embeds, external fonts or scripts. Fonts are self-hosted in `assets/fonts/` (SIL OFL, licenses alongside). Adding any third-party resource requires updating `/privacy/`, `/cookie/`, consent handling and the CSP first.
- **CSP.** `BaseLayout.astro` supplies the strict CSP meta tag. Do not add inline `<style>`, inline scripts, `style="..."` attributes or inline event handlers; use external CSS and JavaScript.
- **No business link to Agevo.** dymora.eu must not link to agevo.dymora.eu (or vice versa).
- **Do not invent company data or commitments.** Verified legal data: Alberto Citi, P.IVA 02100310495, Via Giovanni Paolo II 21b, 57023 Cecina (LI); `info@dymora.eu`, `privacy@dymora.eu`, `support@dymora.eu`.
- **Accessibility.** Keep one `<h1>` and a `<main>` per page, visible focus, `prefers-reduced-motion` support, no horizontal overflow at 320–360 px, small orange text on light backgrounds uses `--orange-ink`.

## Development

```bash
npm install
npm run dev                        # Astro development server
npm run build                      # static production build in dist/
python3 -m http.server 8000 --directory dist
```

Before handing off, build and test the static `dist/` output rather than relying only on the development server. Pages must remain mobile-responsive with no horizontal overflow at 320 px.

## Design System

The site now uses Astro with external CSS and JavaScript. Shared tokens and typography live in `src/styles/site.css`; the approved scroll-opening styles live in `src/styles/opening.css`. Do not copy token blocks into pages and do not add inline styles or handlers.

- The app token export is authoritative: primary `#1C1C1A`, secondary `#F45118`, and `--c-surface-muted` as the page background in both themes.
- Asta Sans is the text face; Doto 900 is limited to labels and numbers. Fonts are self-hosted WOFF2 files in `public/assets/fonts/` with the OFL license beside them.
- The opening remains carbon in both themes. Product screenshots switch between their light and dark renders with `.w-only-light` and `.w-only-dark`.
- Use the `w-*` typography classes and the existing section components. Headlines are sentence case with the key phrase in `w-accent`.
- Keep image dimensions and meaningful alt text in markup. Product renders are demonstrative and must say so nearby.
- All user-facing content is Italian, except the approved hook “The Art of Living Smart”.

## About Dymora (context for content edits)

Dymora is a smart-building / building-automation platform for residential and commercial buildings — an independent system integrator delivering turnkey domotics (lighting, climate, security/alarm, video surveillance, energy monitoring, shutters) managed from one unified ecosystem instead of fragmented vendor apps.

- **Value proposition**: simplicity (one coherent interface, guided device selection, no vendor lock-in), measurable efficiency (energy and operational monitoring/analytics), and a continuous service (maintenance, monitoring, updates, ongoing consulting — not a one-shot install).
- **Segments**: B2C (homes, apartments, mid/high-end residential) and B2B (real-estate developers/builders for new or renovated buildings, plus businesses with existing premises: shops, offices, warehouses).
- **Business model**: hybrid hardware + subscription — one-time revenue from design/installation, recurring revenue from platform, support, and service subscriptions.

Contact: `support@dymora.eu`.
