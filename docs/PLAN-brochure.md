# Piano — allineare dymora.eu alla brochure

Creato: 2026-11-23 · branch di partenza: `redesign/site` (Astro, commit `5401a7d`)

## Fonti (in `dymora-app`)

- Brochure: `design/marketing/dist/dymora-depliant-digitale.pdf` (11 pagine, 2026-11-23), specifiche in `design/marketing/brochure/decision.md`, sorgente `design/marketing/brochure/src/`.
- Testi: `design/marketing/copy/it.md`. Promesse ammesse: `design/marketing/claims.md`.
- Decisione sito precedente: `design/marketing/site/decision.md` (2026-11-06), già implementata in `redesign/site`.
- Modelli animati: sprite `device_*` dell'app, uno per scena in `art/<scena>/` con `sprites.json` (fotogrammi, colonne, offset, anchor). Runtime e regole in `docs/ANIMATIONS.md`.
- Screenshot dello store: `design/store-screenshots/renders/` (pezzi ritagliati come in `store-screenshots/decision.md` §7).

Da `site/decision.md` a oggi la brochure è cambiata: nuove pagine `multi`, `retrofit` e `climate`, nuovo ordine, pezzi delle schermate al posto dei telefoni interi.

## 1. Ordine della home, uguale alla brochure

| # | Pagina della brochure | Sezione del sito | Animazioni (sprite dell'app) |
|---|---|---|---|
| 1 | Copertina "The Art of Living Smart" | Apertura di Federico (commit `5401a7d`), solo la prima schermata: menu, cascata di punti, "The Art of Living Smart." e "Goditi l'esperienza, al resto pensiamo noi." | Ingresso del titolo e dei punti, in CSS |
| 2 | "Controlla la tua casa sotto ogni aspetto" (`overview`) | `#panoramica`: casa con 8 etichette | Toccando un'etichetta si anima la parte della casa: luci, irrigazione, telecamere, tapparelle e tenda, allarme, clima, consumi, porta (`device_house_*`) |
| 3 | Più edifici (`multi`) | `#edifici`: computer, tablet, telefono e 3 edifici | Schermi che cambiano |
| 4 | "Dymora si adatta al tuo edificio" (`retrofit`) | `#ristrutturazioni`: casa d'epoca e casa moderna | Si accendono gli elementi della casa moderna |
| 5 | "Sai cosa succede quando non ci sei?" (`opening`) | Problema e telecamere, link a `/videosorveglianza/` | Telecamere della casa che scansionano |
| 6 | Consumi (`feature.energy`) | Sezione carbon: casa con flussi di energia, torta, tile | Flussi energetici, piano a induzione, pompa di calore, lavastoviglie |
| 7 | Sicurezza (`security`, `feature.alarm`, `feature.locks`) | Allarme e serrature | Sensori che scattano, notifica sul telefono, porta e serratura, tastierino |
| 8 | Luci, tende e tapparelle (`feature.lights`, `feature.covers`) | Luci, tapparelle e tende | Lampade che si accendono, tapparella e tenda che si muovono |
| 9 | Clima (`climate`, `climate.save`) | Sezione carbon: termostato, grafico, dispositivi | Termostato, valvola termostatica, climatizzatore |
| 10 | Irrigazione (`feature.irrigation`) | Giardino | Rubinetto, prati, irrigatori della casa |
| – | Solo sito | Principi (`service.principles`), "Come si parte" (`start`), FAQ | Nessuna |
| 11 | Chiusura "Raccontaci di cosa hai bisogno." (`closing`) | `#contatti` (il QR della brochure punta lì: non cambiare) | Hub |

Restano e vanno allineate allo stesso stile: `/consumi/`, `/videosorveglianza/`, `/privacy/`, `/cookie/`, `/support/`, 404. URL invariati (l'app usa `/privacy/`).

## 2. Lavori

### A. Prerequisiti
- CSP allentata solo in `astro dev` (gli stili arrivano come `<style>` inline e `style-src 'self'` li blocca). In produzione resta com'è.
- Workflow GitHub Actions per pubblicare la build Astro. Il passaggio di GitHub Pages ad Actions lo può fare solo il proprietario del repo.
- Decidere come unire `redesign/site` in `main`.

### B. Import degli asset
- Script `scripts/sync-app-assets` con un file di configurazione: copia da `dymora-app` gli sprite elencati e li converte in WebP, più i pezzi ritagliati dagli screenshot dello store.
- Limite di peso per sezione (oggi `public/assets/images` pesa già 11 MB).

### C. Player degli sprite
- Generalizzare in `sprite.js` il codice che oggi anima la casa in `home.js`.
- Legge `sprites.json`, parte quando la sezione è visibile (24 fps, come `SpriteFps` nell'app), carica gli sprite solo quando servono.
- Con `prefers-reduced-motion` mostra il fotogramma fermo.

### D. Componenti
Quelli della brochure (`brochure/decision.md`, *Elementi riusabili*) portati su web, con misure in `clamp()`:
- Fasce carbon e panna (`Field`)
- Sopratitolo con quadratino arancione (`Eyebrow`, `SectionLabel`)
- Titolo con la parola chiave in arancione (`HeroBlock`)
- Etichette collegate alla casa (`CalloutTag`, `CalloutComb`)
- Tile e cornici di telefono e computer (`ScreenWindow`, `PhoneFrame`, `LaptopFrame`)

### E. Testi
- Tutti da `copy/it.md`, nessuno riscritto. Ogni promessa verificata su `claims.md`.
- Testi oggi solo del depliant (`climate`, `security`, `retrofit`): vanno aggiunti al sito.

### F. Verifiche
- Nessuno scroll orizzontale a 320 px, resa a 1440 px.
- Tema scuro, `prefers-reduced-motion`, navigazione da tastiera, un `<h1>` e un `<main>` per pagina.
- Peso delle pagine, CSP.
- Nessun link ad Agevo, nessuna terza parte.

## 3. Fasi

1. Prerequisiti (A) e import degli asset (B).
2. Player degli sprite (C) e componenti (D).
3. Home, sezioni da 1 a 5.
4. Home, sezioni da 6 a 11.
5. `/consumi/` e `/videosorveglianza/`.
6. Verifiche (F), pubblicazione, attivazione di GitHub Pages con Actions.

## Decisioni (2026-11-23)

1. **Base di partenza:** `redesign/site`.
2. **Apertura:** la sequenza a scorrimento del branch (casa, cavi, dispositivi, "Sembra complicato?", "Prova tu") si toglie. Dopo l'apertura c'è la panoramica della brochure, con la casa interattiva a etichette.
   *Aggiornata il 2026-11-23:* al posto della copertina della brochure (`Cover`) torna la prima schermata dell'apertura di Federico, per scelta del proprietario. La scena a scorrimento resta tolta.
3. **Telefono:** non va sul sito. Contatti solo via mail.
4. **Colore:** come la brochure, fasce carbon e panna alternate. Niente tema scuro né interruttore del tema: si toglie `ThemeToggle` e si usano solo i render chiari o scuri scelti per ogni sezione, come nel depliant.
5. **Più edifici:** si pubblicano per ora i disegni segnaposto della brochure (`edificio-montagna.svg`, `edificio-ufficio.svg`), da sostituire con i render veri quando arrivano: si cambia la voce in `scripts/app-assets.json` e si rilancia lo script.

## Stato (2026-11-23)

Tutto sul branch `redesign/site`, niente commit ancora.

- **Fase 1 fatta.** CSP allentata solo in `astro dev` (`src/layouts/BaseLayout.astro`). Workflow `.github/workflows/deploy-pages.yml` già presente: GitHub Pages va passato a "GitHub Actions" dal proprietario prima di unire. Import: `scripts/sync-app-assets.py` + `scripts/app-assets.json` (sprite in `public/assets/sprites/`, immagini in `public/assets/images/`, pezzi della brochure in `public/assets/images/pieces/`; i pezzi `@pieces/` vengono da `$TMPDIR/dymora-brochure-pieces`, prodotti dalla build della brochure).
- **Fase 2 fatta.** Player `public/assets/js/sprite.js` (token `sheet`, `sheet!`, `a>b`, `data-order`, `data-play`, pulsanti `data-sprite-target`/`data-sprite-layer`). Componenti `Sprite`, `DeviceTile`, `Band`, `Eyebrow`, `Headline`, `SiteHeader` (masthead). Stili `src/styles/bands.css`. Tema scuro tolto.
- **Fase 3 e 4 fatte.** Home in `src/pages/index.astro`, sezioni in `src/components/home/` (Overview, Multi, Retrofit, Away, Energy, Security, Comfort, Climate, Irrigation, Service, Faq, Closing). Stili `src/styles/home.css`, `src/styles/features.css`. Vecchia apertura, `FeatureBand` e CSS morto rimossi.
- **Apertura cambiata (2026-11-23).** La home apre con `src/components/Opening.astro`: menu proprio (logo, info@dymora.eu, "Richiedi una consulenza"), cascata, `<h1>` "The Art of Living Smart." e sottotitolo, senza `SiteHeader`. Stili in `src/styles/opening.css`, solo l'hero, senza token copiati; l'animazione d'ingresso è in CSS e si spegne con `prefers-reduced-motion`. Tolti `Cover.astro` con i suoi stili in `home.css`, la scena a scorrimento, `public/assets/js/home.js`, `public/assets/house/` e la barra fissa "Richiedi una consulenza" su mobile. Verificato su `dist/`: un `<h1>`, console pulita, nessuno scroll orizzontale a 320 e 360 px.
- **Fase 5 fatta.** `/consumi/` (`src/styles/energy.css`): fasce carbon (titolo `feature.energy`, casa dei consumi), panna (`web` divisa in titolo e testo, tile Lavatrice e Presa intelligente con gli sprite `washing_machine` e `wall_socket`, la presa si accende e spegne), carbon (`points` e torta), panna (`cta`). `/videosorveglianza/` (`src/styles/video.css`): scena three.js e demo invariate (stessi id), su panna con masthead, `SiteFooter`, `Eyebrow`/`Headline`; poi carbon (`feature.video` `web` e `points`, i tre fotogrammi con Persona/Auto/Animale), panna (`24/7` come scritto, avvertenza di `web`, `faq.cameras.existing`, `faq.cameras.intruder`, `faq.platforms`), carbon (`cta`). Colori di rilevamento della scena allineati ai token (`--c-success`, `--c-secondary-button`). Stili delle cornici delle telecamere spostati da `home.css` a `features.css`; corretto il tag `tag--hit` trasparente sulle fasce carbon (anche in home). `site.css` ripulito (display, `site-header`, `.section`, `device--wide`/`--tablet`, `.stat`, `sr-only`, `w-label-l`, `w-only-dark`). Sprite aggiunti in `scripts/app-assets.json`: `washing-machine`, `wall-socket` (luce). Verificato su `dist/` a 1440, 360 e 320 px: nessuno scroll orizzontale, un `<h1>` e un `<main>`, nessun `<style`/`style="`, console pulita.
- **Fase 6, parte di sviluppo fatta (nessuna pubblicazione).** `/privacy/`, `/cookie/`, `/support/` e 404 portate allo stile: nuovo componente `src/components/PageHead.astro` (fascia carbon, sopratitolo, `<h1>`) e testo legale invariato su fascia panna, stili in `src/styles/legal.css` (tolti da `site.css` anche `legal-page`, `w-title`, `w-subtitle`, `w-eyebrow`). Footer sempre in fondo alla finestra (`body` flex), 404 tutta carbon. Pagina di prova `src/pages/lab/` tolta (non era tracciata; copia nella scratchpad della sessione). Verifiche su `dist/`: 7 pagine, un `<h1>` e un `<main>` ciascuna, `lang="it"`, nessun `<style>`, `style="` o gestore inline, CSP di produzione invariata, nessuna richiesta a terze parti (gli unici host esterni sono link nel testo della privacy e la licenza OFL), nessun riferimento ad Agevo, tutte le immagini con `alt`, `width` e `height`, nessuno scroll orizzontale a 320 e 360 px, focus visibile e link "Salta la dimostrazione" funzionante, `prefers-reduced-motion` gestito da `sprite.js`, `demo.js` e `site.css` (controllato sul codice, non emulato nel browser). Peso: home ~1,35 MB all'apertura e ~3,3 MB scorrendo tutta la pagina; `/videosorveglianza/` ~0,7 MB (three.js 675 KB, 171 KB compresso); `/consumi/` ~0,6 MB; pagine legali < 25 KB.
- **Da fare (fase 6):** revisione completa del sito da parte del proprietario, poi decidere come unire `redesign/site` in `main`, passaggio di GitHub Pages ad Actions, pubblicazione. Niente di questo è stato fatto.
- **Pulizia proposta, in attesa di conferma:** in `dist/` finiscono ~10,5 MB di immagini non usate da nessuna pagina (i vecchi screenshot `*-rooms-*`, `home-overview-*`, `installation-selection-*`, `alarm-armed-home-*`, `irrigation-*`, `energy-mock-*`, `video-surveillance-house-no-frames-*` tranne `compact-light`, `sym-*.png`, `feature_hub.png`, `logo-*-ink.svg`), la variante scura della casa (`assets/sprites/house/*_dark.webp`, 1,1 MB) e due sprite configurati ma non usati (`keypad`, `lawn_tile`, ~480 KB). Non pesano sulle pagine ma sul deploy.
- **Testi da approvare** (non in `copy/it.md`): "Goditi l'esperienza, al resto pensiamo noi." (sottotitolo dell'apertura di Federico), "Prova tu: tocca un'etichetta.", "Videosorveglianza" (pulsante), Ingresso/Persona/Auto/Animale, stanze Soggiorno/Cucina/Giardino, stati Accesa/Spenta, Aperta/Chiusa, Bloccata/Sbloccata, Aperto/Chiuso, "Rubinetto del giardino", "Domande".
- **Testi da approvare, fase 6:** sopratitoli "Privacy" e "Cookie" delle pagine legali.
- **Testi da approvare, fase 5:** `/consumi/` "Scopri come funziona", "Lavatrice", "Presa intelligente", "In uso", Accesa/Spenta; `/videosorveglianza/` "Scopri cosa può fare", "Salta la dimostrazione", "Scenario dimostrativo · Giardino di casa" e tutti i testi della demo (stati, didascalie, passi 01–03, notifica, "GATTO · IGNORATO", "PERSONA · ALLARME"), già sul sito vecchio ma non in `copy/it.md`; la demo scrive "IA", il copy "AI". Tolti perché non in `copy/it.md`: "Intelligenza attiva. Sempre.", "Non un altro video da tenere d'occhio", i tre blocchi numerati, "La tranquillità non va in pausa", le FAQ "Devo controllare continuamente le telecamere?" e "Un animale fa scattare l'allarme?", "Uno sguardo in più. Un pensiero in meno.".
- **Domanda aperta:** il pezzo della casa dei consumi mostra "Solare 640 W" (la brochure lo usa; la decisione sito del 6/11 vietava il solare). Ora è anche in apertura di `/consumi/`.
