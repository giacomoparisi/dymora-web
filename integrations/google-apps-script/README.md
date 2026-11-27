# Modulo di contatto: endpoint Google Apps Script

Riceve il modulo del footer di dymora.eu (`#contatti`, `src/components/ContactForm.astro`) e manda una mail di notifica a `info@dymora.eu`. Non salva nulla altrove: niente foglio, niente Calendar, nessuna mail a chi scrive.

Questa cartella non fa parte del sito: Astro pubblica solo `src/pages/` e `public/`, quindi non finisce in `dist/`.

## Cosa fa `Code.gs`

- `doPost` legge i campi `name`, `company`, `email`, `phone`, `message`, più `website` (campo trappola) ed `elapsed_ms` (tempo di compilazione).
- Scarta in silenzio, rispondendo comunque `{ "ok": true }`, le richieste con il campo trappola compilato o inviate in meno di 3 secondi.
- Rifiuta con `{ "ok": false, "error": "invalid" }` le richieste senza nome o con un'email non valida.
- Limita gli invii a 20 ogni 10 minuti per tutto il sito (LockService + CacheService); oltre il limite risponde `{ "ok": false, "error": "busy" }`.
- Pulisce i campi (caratteri di controllo, una riga sola tranne il messaggio, lunghezza massima) e manda la notifica con `replyTo` sull'email di chi scrive.
- In caso di errore risponde `{ "ok": false, "error": "server" }`: il sito mostra allora l'email già pronta per `info@dymora.eu`.

Scope richiesto: solo `https://www.googleapis.com/auth/script.send_mail`.

## Deploy (account Google di Dymora)

1. Vai su <https://script.google.com> con l'account Google di Dymora e crea un **Nuovo progetto**, per esempio «Dymora · modulo contatti».
2. In **Impostazioni progetto** attiva «Mostra il file manifest "appsscript.json" nell'editor».
3. Sostituisci il contenuto di `Code.gs` e di `appsscript.json` con quello dei file di questa cartella.
4. Seleziona la funzione `testDoPost` e premi **Esegui**. La prima volta Google chiede l'autorizzazione «Inviare email per tuo conto»: accettala.
5. Controlla il risultato:
   - in **Registro di esecuzione** compaiono quattro righe: `valida` con `{"ok":true}`, `trappola` e `troppo rapida` con `{"ok":true}` (scartate in silenzio), `email mancante` con `{"ok":false,"error":"invalid"}`;
   - in `info@dymora.eu` arriva una sola mail «Richiesta dal sito · Azienda di prova».
6. Premi **Esegui il deployment → Nuovo deployment**, tipo **App web**:
   - Esegui come: **Me** (l'account di Dymora);
   - Chi ha accesso: **Chiunque**.
7. Copia l'URL dell'app web, quello che finisce con `/exec`, e mandalo a chi aggiorna il sito: va in `src/data/contact.ts`.
8. Verifica: aprendo l'URL `/exec` nel browser deve comparire `{"ok":true,"service":"dymora-contatti"}`.

Prima di mettere l'URL nel sito vanno pubblicati gli aggiornamenti di `/privacy/`, `/cookie/` e della CSP (`connect-src` con `https://script.google.com` e `https://script.googleusercontent.com`).

## Aggiornare lo script

Dopo una modifica: **Esegui il deployment → Gestisci deployment → modifica (matita) → Versione: Nuova versione → Esegui il deployment**. Così l'URL `/exec` resta lo stesso. Un «Nuovo deployment» crea invece un URL diverso, da aggiornare nel sito.

## Dove guardare se qualcosa non va

- **Esecuzioni** nell'editor: ogni richiesta lascia una riga («Notifica inviata…», «Scartata come spam…», «Rifiutata…» o l'errore).
- La quota di email giornaliera di Apps Script dipende dal tipo di account Google; se si esaurisce, `MailApp` dà errore e il sito propone l'email già pronta.

## Conservazione

Le richieste vivono solo come email in `info@dymora.eu`. Quelle che non portano a un contratto vanno cancellate entro 12 mesi, come indicato in `/privacy/`.
