// The eight functions of the brochure (`overview.labels`), in its order, as the home's house
// story tells them (HouseStory.astro). Texts from the brochure's copy (dymora-app
// design/marketing/copy/it.md and the brochure build, `feature.*`, `climate`), never rewritten here.
// The /funzioni/ page, its pictures and the header's mega menu were removed on 2026-11-26; the full
// data (points, media, devices, scenes) is on the branch archivio/funzioni.

export interface Feature {
  slug: string;
  label: string;
  eyebrow: string;
  title: string;
  line: string;
}

export const features: Feature[] = [
  {
    slug: 'luci',
    label: 'Luci',
    eyebrow: 'Luci',
    title: "Gestisci l'impianto di illuminazione con **un click**.",
    line: "Controlla luci, colori e intensità tramite l'app.",
  },
  {
    slug: 'clima',
    label: 'Clima',
    eyebrow: 'Clima',
    // Brochure page `climate`; `feature.climate` keeps the points and the web text.
    title: 'Il **clima** di casa, da dove vuoi.',
    line: 'Gestisci il riscaldamento anche quando non sei in casa.',
  },
  {
    slug: 'tapparelle',
    label: 'Tende e tapparelle',
    eyebrow: 'Tende e tapparelle',
    title: 'Apri e chiudi tende e tapparelle **comodamente**.',
    line: 'Imposta le tue routine, e dimenticati dei comandi fisici.',
  },
  {
    slug: 'serrature',
    label: 'Serrature',
    eyebrow: 'Serrature',
    title: 'Gestisci e controlla lo stato delle tue **serrature**.',
    line: "Dall'app gestisci serrature, cancelli e citofoni anche quando non sei in casa, mantenendo tutto sotto controllo.",
  },
  {
    slug: 'allarme',
    label: 'Allarme',
    eyebrow: 'Allarme',
    title: "Se scatta l'**allarme**, lo sai subito.",
    line: "Inserisci e disinserisci l'allarme dall'app e ricevi una notifica sul telefono se scatta.",
  },
  {
    slug: 'telecamere',
    label: 'Telecamere',
    eyebrow: 'Telecamere',
    title: "L'**AI in locale** distingue persone, veicoli e animali.",
    line: 'Guardi le telecamere in diretta, rivedi eventi e registrazioni autorizzate e ricevi una notifica quando rilevano un evento.',
  },
  {
    slug: 'consumi',
    label: 'Consumi',
    eyebrow: 'Consumi',
    title: 'Controlla i **consumi** degli apparecchi.',
    line: "Rivedi lo storico di tutti i consumi dell'edificio: Dymora analizza per te gli sprechi e trova le inefficienze, permettendoti di risparmiare soldi in bolletta.",
  },
  {
    slug: 'irrigazione',
    label: 'Irrigazione',
    eyebrow: 'Irrigazione',
    title: 'Innaffia il tuo **giardino** in automatico.',
    line: "Configuriamo noi pompe e valvole per farle partire da sole. Dall'app vedi se il terreno ha l'umidità adatta alle tue piante.",
  },
];
