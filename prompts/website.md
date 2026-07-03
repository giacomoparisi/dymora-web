PROMPT PER CREAZIONE SITO CON ANIMAZIONE
## AGISCI COME

Uno sviluppatore creativo di livello mondiale (standard Awwwards) specializzato in:
- HTML5 e CSS semantico, single-file self-contained
- TypeScript vanilla (nessun framework)
- Animazioni SVG legate allo scroll (IntersectionObserver + scroll listener con requestAnimationFrame)

---

## IL COMPITO

Costruisci una landing page premium in stile scrollytelling per Dymora — una piattaforma di gestione intelligente per edifici residenziali e commerciali che unifica in un solo ecosistema illuminazione, clima, sicurezza, videosorveglianza ed energia. La pagina deve avere uno stile moderno e professionale, comunicare che "tutto è incluso in una sola app" e trasmettere un'estetica tech-luxury di building automation (non "telecamera di sicurezza"), coerente con il design system del brand.

La struttura della pagina è la seguente:
1. Navbar fissa in alto
2. Sezione hero con animazione ibrida (3 device al centro + cavi arancioni verso i 6 servizi)
3. Sezione introduttiva "Cos'è Dymora"
4. Sezione 3 pilastri di valore
5. Sezione servizi (6 servizi: Energia, Solare, Videosorveglianza, Allarme, Clima, Illuminazione)
6. Sezione "Contattaci"
7. Footer con contatti

---

## STACK TECNOLOGICO
- Markup e stile: HTML5 + CSS3, con tutto il CSS inline in un blocco `<style>` (coerente col resto del repo: ogni pagina è un singolo file autosufficiente, nessun build system, nessun package manager)
- Interattività e animazione: TypeScript (compilato a JS, oppure modulo TS caricato direttamente), nessun framework
- Animazione hero: SVG per i cavi + CSS transitions/keyframes; progresso scroll via IntersectionObserver e listener `scroll` con requestAnimationFrame
- Responsive: `clamp()` e media query (stesso pattern già usato in `privacy/index.html` e `support/index.html`)
- Linguaggio dei contenuti: italiano (`<html lang="it">`)

---

## DIREZIONE VISIVA E COLORI

Copiare verbatim il blocco `:root` delle pagine esistenti (`privacy/index.html`, `support/index.html`) così che il sito resti visivamente coerente.

Palette (design system Dymora):
- `--char: #1c1c1c` (superfici near-black)
- `--orange: #e8541e` (accento)
- `--cream-bright: #f4f0e8` (sfondo pagina)
- `--ink: #1d1c1a` (testo)
- Palette brand ufficiale: primario `#0A0A0A`, secondario `#EA4314`

Fusione seamless (non negoziabile):
Lo sfondo dell'area hero/animazione DEVE essere nero / `--char`, così da fondersi esattamente con lo sfondo dei mockup device (`images/iphone.jpeg`, `images/ipad.jpeg`, `images/macbook_pro.jpeg`), che sono già su sfondo nero. I bordi delle immagini device devono risultare invisibili — i device devono galleggiare nel vuoto. Aggiungere un radial glow arancione morbido dietro il cluster centrale.

Tipografia (Google Fonts):
- Chakra Petch → `--display`, per heading e kicker, uppercase con letter-spacing ampio
- Sora → `--body`, weight 300

Motivi ricorrenti (dal design system):
- Topbar scura con bordo inferiore 2px arancione
- Hero/card su sfondo `--char` con radial glow arancione (cerchio `::after`, in alto a destra)
- Kicker: trattino o dot arancione seguito da testo uppercase tracciato tecnico (`— ENERGIA`, `● IMPOSTAZIONI`)
- Dati: numeri molto grandi con piccola unità arancione (`9.2 kWh`, `412 W`), label metriche uppercase tracciate, delta come `↓ 8% VS IERI`

---

## COMPONENTE NAVBAR

- Posizione: fixed, top-0, z-alta, full-width
- Sfondo: scuro con leggera trasparenza + backdrop blur; bordo inferiore 2px arancione
- Sinistra: logo Dymora = `images/logo.png` (icona squircle arancione) affiancato a `images/logo_text.png` (wordmark "dymora"). Nessun testo scritto a mano al posto del logo.
- Destra: link di navigazione ancora verso le sezioni (`#cos-e`, `#servizi`, `#contatti`)
- Stile link: testo tenue, hover con accento arancione, transizione fluida
- Su mobile: menu hamburger che apre un drawer verticale
- I link usano il font `--display` uppercase tracciato

---

## SEZIONE HERO — ANIMAZIONE IBRIDA (auto-play + scroll)

### Comportamento
La sezione hero è un wrapper alto (es. 300–400vh). Il contenuto interno è sticky (`position: sticky, top: 0, height: 100vh`) e resta centrato per tutta la durata, su sfondo nero. L'animazione parte da sola al caricamento (auto-play leggero, in loop) e lo scroll la intensifica e rivela progressivamente le connessioni. Al termine del wrapper lo scroll prosegue normalmente verso le sezioni successive.

### Cluster device (centro)
- Al centro i 3 device: `images/macbook_pro.jpeg` (dietro/centro), con `images/ipad.jpeg` e `images/iphone.jpeg` davanti ai lati, affiancati e leggermente sovrapposti.
- Gli sfondi neri dei mockup si fondono con lo sfondo hero (nessun bordo visibile). Usare scaling responsivo "contain", centrato su mobile e desktop.

### Nodi-servizio (attorno) + cavi arancioni
- 6 nodi disposti attorno al cluster: ENERGIA, SOLARE, VIDEOSORVEGLIANZA, ALLARME, CLIMA, ILLUMINAZIONE.
- Ogni nodo è un rounded-square scuro con icona e label uppercase (linguaggio app: nodi collegati, nodo attivo outlined in arancione con glow).
- Cavi arancioni (path SVG con `stroke-dasharray`) collegano ogni nodo al cluster centrale. Rappresentano che tutti i servizi sono inclusi in una sola app.

### Comportamento ibrido dell'animazione
- Auto-play al load: i cavi "scorrono"/pulsano di continuo (animazione dash-offset + glow), i device appaiono in dissolvenza.
- Scroll: intensifica l'effetto e rivela le connessioni una a una. Calcolare uno `scrollYProgress` (0.0 → 1.0) della sezione da `getBoundingClientRect`, smorzato con requestAnimationFrame; guidare il dash-offset dei cavi e accendere ogni nodo quando la sua feature è connessa.

### Precaricamento
- Prima dell'animazione mostrare uno stato di caricamento a schermo intero su sfondo nero, con spinner e barra di avanzamento in accento arancione `--orange`.
- Al 100% delle immagini caricate: dissolvenza in uscita del loader e avvio dell'esperienza (device in fade-in).

### Indicatore di scroll
- Testo "Scorri per esplorare" con freccia verso il basso, centrato in basso
- Visibile a 0% di progresso, dissolvenza in uscita completa entro il 10% di progresso

### Testi sovrapposti — beat narrativi (2–3)
Sovrapposti al cluster tramite un div `position: absolute, inset-0, pointer-events: none`. Ogni testo usa il progresso scroll per opacità e posizione Y.
Headline in stile brand: sentence case, parola-chiave in arancione, punto finale. Esempi:
- "Tutto il tuo edificio. In una sola **app**."
- "Un solo **ecosistema**. Nessuna app frammentata."
- "Progettato per **durare** nel tempo."
Mappatura opacità per ogni beat: [inizio, inizio+0.1, fine-0.1, fine] → [0, 1, 1, 0]. Movimento verticale: entrata y 20px → 0, uscita y 0 → -20px.

---

## SEZIONE COS'È DYMORA (`#cos-e`)

Sfondo chiaro (`--cream-bright`), padding verticale generoso.
Kicker arancione uppercase (es. `— LA PIATTAFORMA`).
Titolo stile brand: "Un solo sistema per tutto l'**edificio**."
Paragrafo introduttivo derivato da questa descrizione:
Dymora è una piattaforma di gestione intelligente per edifici residenziali e commerciali. Non si limita alla smart home intesa come insieme di dispositivi connessi, ma fornisce un sistema completo di controllo e automazione dell'edificio, progettato per funzionare in modo affidabile nel tempo e adattarsi all'evoluzione delle esigenze del cliente. Da un unico ecosistema si gestiscono illuminazione, climatizzazione e comfort, sicurezza e allarme, videosorveglianza, monitoraggio e ottimizzazione dei consumi energetici, tapparelle e altro. Il sistema è pensato sia per clienti privati (abitazioni) sia per clienti business (uffici, negozi, magazzini, edifici commerciali).

---

## SEZIONE 3 PILASTRI DI VALORE

Sfondo scuro o chiaro coerente col sistema; padding verticale generoso.
Titolo sezione stile brand + 3 card/blocchi. Ogni card ha headline brand (sentence case, parola chiave arancione, punto) + testo sintetico:

1. Semplicità.
   Un'esperienza unificata e coerente, senza gestire molte app, account e interfacce proprietarie. Approccio design-first: complessità percepita ridotta, soluzione pronta all'uso. Dymora guida il cliente nella scelta delle tecnologie e dei dispositivi più appropriati, evitando sovradimensionamenti e lock-in tecnologici.

2. Efficienza misurabile.
   Strumenti avanzati di monitoraggio, controllo e analisi che danno una visione chiara e continua dello stato dell'edificio: consumi e carichi energetici, illuminazione e clima, sensori, sicurezza e videosorveglianza, stato dei dispositivi. Permette di individuare inefficienze, confrontare storico e stato attuale, ottimizzare nel tempo.

3. Servizio continuativo.
   Non un progetto "one-shot": manutenzione e monitoraggio costanti, ottimizzazione periodica delle automazioni, aggiornamenti software, assistenza e consulenza continua. Il sistema resta sempre stabile, sicuro, aggiornato e coerente con le reali esigenze dell'edificio.

Animazione d'entrata: ogni card appare con fadeInUp quando entra nel viewport (IntersectionObserver).

---

## SEZIONE SERVIZI (`#servizi`) — 6 servizi

Sfondo chiaro; card scure rounded-corner su sfondo off-white (linguaggio app).
Titolo sezione stile brand (es. "Tutto sotto **controllo**.").
Una card/blocco per servizio, ciascuno con kicker `— NOME`, icona, e dove sensato una stat dimostrativa (numero grande + unità arancione + eventuale delta):

- ENERGIA — monitoraggio e ottimizzazione dei consumi. Es. `9.2 kWh`, label `CONSUMO · OGGI`, delta `↓ 8% VS IERI`.
- SOLARE — produzione e autoconsumo fotovoltaico. Es. `412 W`, label `PRODUZIONE · TEMPO REALE`.
- VIDEOSORVEGLIANZA — telecamere unificate. Placeholder video a righe diagonali, dot verde `LIVE`.
- ALLARME — sicurezza e rilevamento intrusioni. Dot arancione = attenzione.
- CLIMA — climatizzazione e comfort. Es. `21.5 °C`, label `TEMPERATURA · SOGGIORNO`.
- ILLUMINAZIONE — controllo luci e scenari.

Animazione d'entrata: fadeInUp on-scroll via IntersectionObserver.

---

## SEZIONE CONTATTACI (`#contatti`)

Sostituisce qualsiasi sezione di pricing: Dymora vende un servizio (progettazione/installazione una tantum + abbonamento), non un prodotto e-commerce, quindi NESSUN prezzo fisso.

- Card scura centrata su sfondo `--char` con radial glow arancione (coerente con `support/index.html`).
- Kicker arancione (es. `— PARLIAMONE`).
- Headline stile brand: "Progettiamo insieme il tuo edificio **intelligente**."
- Testo breve: invito a una consulenza; Dymora affianca il cliente dalla scelta delle tecnologie fino alla manutenzione continua.
- CTA: pill arancione con testo scuro → `mailto:support@dymora.eu`, con leggero glow esterno; hover scale-up 1.03 e intensificazione del glow.

---

## FOOTER

- Wordmark Dymora (`images/logo_text.png`) e/o icona (`images/logo.png`)
- Contatto: `support@dymora.eu`
- Link a `privacy/` e `support/`
- Mantenere il dominio `dymora.eu` (il file `CNAME` mappa il dominio custom — non rimuoverlo)

---

## RIFINITURA E PRESTAZIONI
- Stato di caricamento: schermo intero nero, spinner e barra di avanzamento in `--orange`
- Indicatore scroll: "Scorri per esplorare", svanisce entro 10% di progresso
- Progresso scroll: calcolato da `getBoundingClientRect`, smorzato con requestAnimationFrame (nessuna dipendenza da librerie di animazione)
- Scaling cluster device: logica "contain", centrato sia su mobile che desktop
- Scrollbar personalizzata: minimale, scura, larghezza 4px, thumb arancione tenue, hover più intenso
- Pulizia al dismount: rimozione listener `scroll`, cancellazione requestAnimationFrame, disconnessione IntersectionObserver
- Nessun layout shift durante il caricamento (min-height sul wrapper)

---

## REGOLE DI TEMPORIZZAZIONE ANIMAZIONI

Ogni testo sovrapposto e ogni elemento on-scroll:
- Dissolvenza in entrata nel primo 10% del suo intervallo
- Rimane visibile e stabile nel range centrale
- Dissolvenza in uscita nell'ultimo 10%

Mappatura opacità: [inizio, inizio+0.1, fine-0.1, fine] → [0, 1, 1, 0]
Mappatura Y: [inizio, inizio+0.1, fine-0.1, fine] → [20, 0, 0, -20] (in px)

---

## REQUISITI CHIAVE
- TypeScript in tutto lo script, nessun uso di `any` dove evitabile
- Pulizia completa al dismount (event listener, requestAnimationFrame, IntersectionObserver)
- Completamente responsivo: mobile, tablet, desktop
- Animazione fluida a 60fps, nessuno sfarfallio durante lo scroll
- Stato di caricamento prima che l'animazione sia visibile
- Fusione seamless sfondo hero / sfondo mockup device: nero / `--char`
- La CTA "Contattaci" deve essere sempre cliccabile (pointer-events gestiti correttamente rispetto agli overlay)
- Coerenza col design system: copiare il blocco `:root` esistente, usare gli asset reali in `images/`

---

## NOTE SULLO STILE

Mood del brand: building automation tech-luxury — un solo ecosistema coerente al posto di app frammentate.

- Headline in stile app: bold sans, sentence case, punto finale, parola chiave in arancione (es. "Tutto il tuo edificio.", "System **overview.**")
- Kicker: trattino arancione + testo uppercase tracciato tecnico (`— ENERGIA`, `— VIDEOSORVEGLIANZA`); label di sezione con dot iniziale (`● IMPOSTAZIONI`), spesso seguito da una sottile riga orizzontale
- Header/hero scuri near-black con eventuale texture a griglia quadrata tenue; wordmark Dymora in font stencil/segmentato (immagini `logo.png` / `logo_text.png`)
- Dati: numeri molto grandi con piccola unità arancione in apice, label metriche uppercase tracciate, indicatori delta (`↓ 8% VS IERI`)
- Bottoni: primario = pill arancione solida con icona + label; secondario = pill outline arancione su scuro, oppure link testuale
- Motivo connessione: nodi (device, hub, camera, chip AI) come rounded-square scuri uniti da linee arancioni tratteggiate, nodo attivo outlined in arancione con glow
- Status: piccoli dot colorati — verde per live/online, arancione per allarme/attenzione; placeholder video con texture a righe diagonali
- Accento arancione `--orange` usato con parsimonia: CTA, barra di avanzamento, kicker, cavi/connessioni, nodi attivi, bordi evidenziati
- Whitespace generoso tra ogni sezione; coerenza visiva totale tra hero e sezioni successive (stesso sistema di colori, tipografia, opacità)
