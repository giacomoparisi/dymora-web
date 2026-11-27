/**
 * Dymora: receives the contact form of dymora.eu (footer, #contatti).
 *
 * Every valid request becomes one notification email to info@dymora.eu.
 * Nothing else is stored: no sheet, no calendar, no email to the visitor.
 * The answer is always JSON, { ok: true } or { ok: false, error }.
 *
 * Deployed as a web app; its /exec URL goes into src/data/contact.ts.
 * Deploy steps: README.md in this folder.
 */

const CONFIG = {
  // Fixed recipient: reading the deploying account would need one more scope.
  notifyTo: "info@dymora.eu",
  senderName: "Sito Dymora",
  timeZone: "Europe/Rome",
  // Requests filled in faster than this are treated as bots.
  minElapsedMs: 3000,
  // Anti-flood: at most maxPerWindow requests every windowSeconds, site-wide.
  maxPerWindow: 20,
  windowSeconds: 600,
  maxLength: 200,
  maxMessageLength: 3000,
};

// The fields of ContactForm.astro. Anything else in the request is ignored.
const FIELDS = ["name", "company", "email", "phone", "message"];
const REQUIRED = ["name", "email"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    // A bot gets the same answer as a person, so it learns nothing.
    const spam = spamReason_(params);
    if (spam) {
      console.log("Scartata come spam: " + spam + ".");
      return json_({ ok: true });
    }

    const data = clean_(params);
    if (REQUIRED.some((key) => !data[key]) || !EMAIL_RE.test(data.email)) {
      console.log("Rifiutata: campi obbligatori mancanti o email non valida.");
      return json_({ ok: false, error: "invalid" });
    }
    if (isFlood_()) {
      console.log("Rifiutata: limite di invii raggiunto.");
      return json_({ ok: false, error: "busy" });
    }

    sendNotification_(data);
    console.log("Notifica inviata a " + CONFIG.notifyTo + ".");
    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: "server" });
  }
}

// Opening the /exec URL in a browser shows that the deployment answers.
function doGet() {
  return json_({ ok: true, service: "dymora-contatti" });
}

function spamReason_(params) {
  if (params.website) return "campo trappola compilato";
  const elapsed = Number(params.elapsed_ms);
  if (!(elapsed >= CONFIG.minElapsedMs))
    return "compilata in " + (params.elapsed_ms || "?") + " ms";
  return "";
}

// One counter per time window in the script cache. The script lock keeps two
// requests arriving together from reading the same count.
function isFlood_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return true;
  try {
    const cache = CacheService.getScriptCache();
    const bucket = Math.floor(Date.now() / (CONFIG.windowSeconds * 1000));
    const key = "richieste-" + bucket;
    const count = Number(cache.get(key)) || 0;
    if (count >= CONFIG.maxPerWindow) return true;
    cache.put(key, String(count + 1), CONFIG.windowSeconds);
    return false;
  } finally {
    lock.releaseLock();
  }
}

// Trims, drops control characters and caps the length. Every field except the
// message becomes a single line, since it may end up in the subject.
function clean_(params) {
  const data = {};
  FIELDS.forEach((key) => {
    let value = String(params[key] || "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim();
    value =
      key === "message"
        ? value.replace(/\r\n?/g, "\n").slice(0, CONFIG.maxMessageLength)
        : value.replace(/\s+/g, " ").slice(0, CONFIG.maxLength);
    data[key] = value;
  });
  return data;
}

function sendNotification_(data) {
  const sentAt = Utilities.formatDate(
    new Date(),
    CONFIG.timeZone,
    "dd/MM/yyyy HH:mm",
  );
  const lines = [
    "Nuova richiesta dal modulo di contatto di dymora.eu.",
    "",
    "Nome e cognome: " + data.name,
    "Azienda: " + (data.company || "—"),
    "Email: " + data.email,
    "Telefono: " + (data.phone || "—"),
    "Inviata il: " + sentAt,
    "",
    "Esigenze:",
    data.message || "—",
    "",
    // When the script runs as the same mailbox it writes to, Gmail drops the
    // reply-to and "Rispondi" would answer ourselves: the address above works.
    "Per rispondere scrivi all'indirizzo email qui sopra.",
    "Conservazione: cancella questa email entro 12 mesi se la richiesta non porta a un contratto (vedi /privacy/).",
  ];
  MailApp.sendEmail({
    to: CONFIG.notifyTo,
    subject: "Richiesta dal sito · " + (data.company || data.name),
    body: lines.join("\n"),
    replyTo: data.email,
    name: CONFIG.senderName,
  });
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Run from the editor: the first time it asks for the permission to send
 * email, then it sends one sample notification to info@dymora.eu and logs
 * the answers to a valid request, a bot and an incomplete request.
 */
function testDoPost() {
  const valid = {
    name: "Prova Test",
    company: "Azienda di prova",
    email: "test@example.com",
    phone: "000 0000000",
    message: "Richiesta di prova generata da testDoPost.\nSeconda riga.",
    website: "",
    elapsed_ms: "10000",
  };
  const run = (label, parameter) =>
    console.log(label + ": " + doPost({ parameter: parameter }).getContent());
  run("valida (manda la mail)", valid);
  run("trappola", Object.assign({}, valid, { website: "https://spam.example" }));
  run("troppo rapida", Object.assign({}, valid, { elapsed_ms: "800" }));
  run("email mancante", Object.assign({}, valid, { email: "" }));
}
