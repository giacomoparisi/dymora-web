# AGENTS.md

This file provides guidance to Codex and other coding agents when working with code in this repository. It mirrors `CLAUDE.md`: when one changes, update the other.

## What This Repo Is

`dymora-web` is the public static website for **dymora.eu**. It is an Astro site built to static files in `dist/`; styles and scripts are external and all production assets are self-hosted. `public/CNAME` maps the custom domain and must not be deleted.

GitHub Pages deploys with GitHub Actions (`.github/workflows/deploy-pages.yml`, source switched from the legacy root build on 2026-11-26 with the owner's approval): every push to `main` builds `dist/` and publishes it on dymora.eu. The pre-Astro files at the repo root (`index.html`, `images/`, `assets/`, ...) are no longer served. Never push directly to `main`.

Current pages:

- `src/pages/index.astro` — home page, restructured after premium smart-home sites (one idea per section, product first, scroll storytelling). Order: opening (`Opening.astro`: the hook over the "Rientro" film, `public/assets/video/`, AI-generated scenes labelled "Scene dimostrative", loaded after the page by `opening-video.js` with a pause button and poster-only under reduced motion or Save-Data) → one carbon section (`home/HouseStory.astro`): "I tuoi spazi. In una sola app." on the energy screen (`#app`, the only app render shown for now), then "Per chi è Dymora" (`home/Segments.astro` in its slot, `#soluzioni`, old `#edifici`; owner decision 2026-11-26: the site speaks to three kinds of client, data `segments` in `src/data/intro.ts`, copy `segments.*` in dymora-app `copy/it.md`; one row: the app's installation picker with one property per segment on the left, on the right one tab per segment and one text at a time at `#proprietari`, `#affitti-brevi`, `#aziende`, turning on its own about every 9 s (tabs clickable, pause button, the anchor selects and pauses; owner request 2026-11-26) (the opening has no chips or buttons, only the hook and the line, owner decision 2026-11-26); `buildings.js`), then the `#funzioni` house scroll story (`story.js`, data `features.ts` and `overview` in `intro.ts`: the house pinned while the eight functions scroll past, two at a time; restored on 2026-11-26 at the owner's request, without links to a functions page) → `#ristrutturazioni` (`home/Retrofit.astro`, its own carbon section: "Dymora si adatta al tuo edificio.") → `#servizio` (`home/Service.astro`, `service.css`, `service.js`: the service and "Come si parte" merged into one chapter, Ti ascoltiamo → Progettiamo → Installiamo → Configuriamo → Ti assistiamo, playing on its own (not on scroll, owner decision 2026-11-26): the steps take turns every few seconds while the section shows, each with its HTML-drawn scene on a carbon stage, with a pause button and a clickable rail/steps, nothing autoplays under reduced motion; `#come-si-parte` anchors its steps) → `#dispositivi` (`home/Brands.astro`, `brands.css`, `brands.js`: carbon, title pinned under the header, rows of well-known home-automation brand names with an official Home Assistant integration, gliding on their own in an endless loop (pause button) around the Dymora hub device; names in plain text only, no logos or protocol marks; under the rows only the line on reusing the customer's devices, the compatibility and trademark note was removed by the owner on 2026-11-26) → `#domande` (panna) → footer. Carbon and panna bands alternate. The orange closing band was removed (owner decision 2026-11-26): `#contatti` is now the footer's contact block. Segment copy uses only the promises cited in `claims.md` (Servizio-16): never cameras for short-term rentals or companies, no booking-portal integrations, no overview of all properties, no savings figures.
- `src/components/SiteHeader.astro` — sticky glass header on every page (Per chi, Funzioni → `/#funzioni`, Edifici → `/#ristrutturazioni`, Servizio, Dispositivi → `/#dispositivi`, Domande, the CTA) and a burger panel on phones (`header.js`, `header.css`; no-JS fallback in `public/assets/css/nojs.css`). On the home it floats over the opening (`overlay`). `SiteFooter.astro` — one carbon footer on every page: the contact block `#contatti` (the brochure QR target and the header CTA, keep it) with `ContactForm.astro` (`contact-form.js`, `contact-form.css`: with `endpoint` set in `src/data/contact.ts` it POSTs the request to the Google Apps Script web app in `integrations/google-apps-script/` (mails `info@dymora.eu`, deploy steps in its README; the folder never reaches `dist/`), and offers the ready mail if that fails; with the endpoint empty it opens the visitor's mail app with a ready message to `info@dymora.eu`. Set the endpoint only after /privacy/, /cookie/ and the CSP `connect-src` cover Apps Script), then the link columns and the legal data.
- `src/pages/videosorveglianza/` and `src/pages/consumi/` — `noindex` meta-refresh redirects to the home, kept so old links work. The `/funzioni/` page, its pictures and the header's mega menu were removed on 2026-11-26 (owner decision, B2B demo); they are kept on the branch `archivio/funzioni`.
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
- The opening remains carbon in both themes, with the film under a carbon scrim. Keep the film self-hosted, unhurried (loop around 30 s with slow warm crossfades, 1080p under ~5 MB plus a 720p file; owner decision, 2026-11-25) and warm in tone; sources live outside the repo. Product screenshots switch between their light and dark renders with `.w-only-light` and `.w-only-dark`.
- Use the `w-*` typography classes and the existing section components. Headlines are sentence case with the key phrase in `w-accent`.
- Keep image dimensions and meaningful alt text in markup. No "Immagini dimostrative." notes next to product renders or drawings (owner decision, 2026-11-25); the opening film keeps its "Scene dimostrative" label because its scenes are AI-generated.
- All user-facing content is Italian, except the approved hook “The Art of Living Smart”.

## About Dymora (context for content edits)

Dymora is a smart-building / building-automation platform for residential and commercial buildings — an independent system integrator delivering turnkey domotics (lighting, climate, security/alarm, video surveillance, energy monitoring, shutters) managed from one unified ecosystem instead of fragmented vendor apps.

- **Value proposition**: simplicity (one coherent interface, guided device selection, no vendor lock-in), measurable efficiency (energy and operational monitoring/analytics), and a continuous service (maintenance, monitoring, updates, ongoing consulting — not a one-shot install).
- **Segments**: B2C (homes, apartments, mid/high-end residential) and B2B (real-estate developers/builders for new or renovated buildings, plus businesses with existing premises: shops, offices, warehouses).
- **Business model**: hybrid hardware + subscription — one-time revenue from design/installation, recurring revenue from platform, support, and service subscriptions.

Contact: `support@dymora.eu`.
