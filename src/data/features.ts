// The eight functions of the brochure (`overview.labels`), in its order.
// Texts from the brochure's copy (dymora-app design/marketing/copy/it.md and the brochure build,
// `feature.*`, `climate`, `climate.save`), never rewritten here.
// A function with enough to show has a page of its own (`page: true`: `/videosorveglianza/`,
// `/consumi/`); the others open a detail popup on the home (FeatureDialog.astro), at
// `/#funzione-<slug>`. To promote one to a page: build it with FeaturePage.astro, set `page`
// and point `href` to it.

export interface Feature {
  slug: string;
  href: string;
  label: string;
  eyebrow: string;
  title: string;
  line: string;
  points: string[];
  web: string;
  /** Render of a device that stands for the function, on its card in "Cosa puoi fare" (FeatureLinks.astro). Decorative: the card's name says what it is. */
  device: { src: string; width: number; height: number };
  /** Has a page of its own: its card links there instead of opening the popup. */
  page?: boolean;
  /** The app screen shown in the home's detail popup (FeatureDialog.astro), when there is one. */
  image?: { src: string; alt: string; width: number; height: number };
  /** The overview's house with only this function playing (HouseHero.astro), for popups without an app screen. */
  house?: { layers: string; alt: string; buttons: { label: string; layer: string; pressed: boolean }[] };
}

export const features: Feature[] = [
  {
    slug: 'luci',
    device: { src: '/assets/images/devices/luci.webp', width: 428, height: 360 },
    href: '/#funzione-luci',
    label: 'Luci',
    eyebrow: 'Luci',
    title: "Gestisci l'impianto di illuminazione con **un click**.",
    line: "Controlla luci, colori e intensità tramite l'app.",
    points: [
      'Accendi e spegni una luce, una stanza o tutte insieme.',
      'Regoli luminosità, colore e temperatura del bianco sulle lampade compatibili.',
      'Vedi se una luce non risponde.',
    ],
    web: "Dall'app accendi e spegni una singola luce, tutte le luci di una stanza o tutte le luci di casa. Sulle lampade compatibili regoli anche luminosità, colore e temperatura del bianco. Se una luce non risponde, l'app te lo dice invece di mostrarla spenta.",
    image: { src: '/assets/images/pieces/lights-house.webp', alt: "La casa nell'app Dymora con le luci accese, gli scenari e le automazioni", width: 1200, height: 950 },
  },
  {
    slug: 'clima',
    device: { src: '/assets/images/devices/clima.webp', width: 285, height: 360 },
    href: '/#funzione-clima',
    label: 'Clima',
    eyebrow: 'Clima',
    // Brochure page `climate`; `feature.climate` keeps the points and the web text.
    title: 'Il **clima** di casa, da dove vuoi.',
    line: 'Gestisci il riscaldamento anche quando non sei in casa.',
    points: [
      'Vedi temperatura e umidità dai sensori disponibili.',
      'Imposti la temperatura dei climatizzatori compatibili.',
      'Cambi modalità, ventola e oscillazione.',
    ],
    web: "I sensori disponibili ti dicono che temperatura e che umidità ci sono nelle stanze. Sui climatizzatori compatibili imposti la temperatura e scegli modalità, ventola e oscillazione, dalla stessa app che usi per il resto della casa.",
    image: { src: '/assets/images/pieces/climate-chart.webp', alt: "Temperatura e umidità del soggiorno nelle ultime 24 ore, nell'app Dymora", width: 900, height: 758 },
  },
  {
    slug: 'tapparelle',
    device: { src: '/assets/images/devices/tapparelle.webp', width: 301, height: 360 },
    href: '/#funzione-tapparelle',
    label: 'Tende e tapparelle',
    eyebrow: 'Tende e tapparelle',
    title: 'Apri e chiudi tende e tapparelle **comodamente**.',
    line: 'Imposta le tue routine, e dimenticati dei comandi fisici.',
    points: [
      'Apri, chiudi e fermi tapparelle, tende e veneziane compatibili.',
      'Porti una tenda a una percentuale precisa, se il motore comunica la posizione.',
    ],
    web: "Apri, chiudi e fermi dall'app tapparelle, tende e veneziane compatibili. Se il motore comunica la sua posizione, puoi portarle a una percentuale precisa. Se non la comunica, hai i comandi e l'app non indovina se sono aperte o chiuse.",
    house: {
      layers: 'awning_out_off!',
      alt: 'La casa con la tenda della terrazza aperta',
      buttons: [
        { label: 'Tende', layer: 'awning_out_off!', pressed: true },
        { label: 'Tapparelle', layer: 'shutters_down_off!', pressed: false },
      ],
    },
  },
  {
    slug: 'serrature',
    device: { src: '/assets/images/devices/serrature.webp', width: 186, height: 360 },
    href: '/#funzione-serrature',
    label: 'Serrature',
    eyebrow: 'Serrature',
    title: 'Gestisci e controlla lo stato delle tue **serrature**.',
    line: "Dall'app gestisci serrature, cancelli e citofoni anche quando non sei in casa, mantenendo tutto sotto controllo.",
    points: [
      'Blocchi o sblocchi la serratura e azioni cancelli o citofoni compatibili.',
      'Vedi lo stato della serratura e, se ci sono i sensori, della porta e delle batterie.',
      'Crei e cancelli codici di accesso, sulle serrature con tastierino.',
    ],
    web: "Blocchi e sblocchi la serratura dall'app e azioni cancelli o citofoni compatibili. Vedi lo stato della serratura e, dove ci sono i sensori, anche quello della porta e delle batterie. Sulle serrature con tastierino crei un codice di accesso dall'app e lo cancelli quando non serve più.",
    image: { src: '/assets/images/pieces/lock-access.webp', alt: "La scheda Accessi della serratura nell'app Dymora", width: 800, height: 923 },
  },
  {
    slug: 'allarme',
    device: { src: '/assets/images/devices/allarme.webp', width: 378, height: 360 },
    href: '/#funzione-allarme',
    label: 'Allarme',
    eyebrow: 'Allarme',
    title: "Se scatta l'**allarme**, lo sai subito.",
    line: "Inserisci e disinserisci l'allarme dall'app e ricevi una notifica sul telefono se scatta.",
    points: [
      'Inserisci e disinserisci nelle modalità configurate.',
      'Vedi i sensori zona per zona.',
      "Ricevi una notifica in tempo reale se l'allarme scatta.",
    ],
    web: "Inserisci e disinserisci l'allarme dall'app, nelle modalità configurate per la tua casa, e vedi i sensori divisi per zona. Se l'allarme scatta ricevi una notifica in tempo reale sul telefono. Le notifiche richiedono sistema e connessione attivi e l'autorizzazione abilitata sull'app.",
    house: {
      layers: 'alarm_armed_off',
      alt: "La casa con l'allarme inserito",
      buttons: [{ label: 'Allarme', layer: 'alarm_armed_off', pressed: true }],
    },
  },
  {
    slug: 'telecamere',
    device: { src: '/assets/images/devices/telecamere.webp', width: 228, height: 320 },
    href: '/videosorveglianza/',
    page: true,
    label: 'Telecamere',
    eyebrow: 'Telecamere',
    title: "L'**AI in locale** distingue persone, veicoli e animali.",
    line: 'Guardi le telecamere in diretta, rivedi eventi e registrazioni autorizzate e ricevi una notifica quando rilevano un evento.',
    points: [],
    web: '',
  },
  {
    slug: 'consumi',
    device: { src: '/assets/images/devices/consumi.webp', width: 183, height: 256 },
    href: '/consumi/',
    page: true,
    label: 'Consumi',
    eyebrow: 'Consumi',
    title: 'Controlla i **consumi** degli apparecchi.',
    line: "Rivedi lo storico di tutti i consumi dell'edificio: Dymora analizza per te gli sprechi e trova le inefficienze, permettendoti di risparmiare soldi in bolletta.",
    points: [],
    web: '',
  },
  {
    slug: 'irrigazione',
    device: { src: '/assets/images/devices/irrigazione.webp', width: 136, height: 113 },
    href: '/#funzione-irrigazione',
    label: 'Irrigazione',
    eyebrow: 'Irrigazione',
    title: 'Innaffia il tuo **giardino** in automatico.',
    line: "Configuriamo noi pompe e valvole per farle partire da sole. Dall'app vedi se il terreno ha l'umidità adatta alle tue piante.",
    points: [
      'Vedi umidità del terreno, temperatura e batteria, quando la sonda le fornisce.',
      'Avvii e fermi pompe o valvole.',
      'Avvii con una durata, se il dispositivo la gestisce.',
    ],
    web: "La sonda nel terreno ti dice quanta umidità c'è, e, quando le fornisce, anche temperatura e stato della batteria. Dall'app avvii e fermi pompe o valvole, anche con una durata, se il dispositivo la gestisce.",
    image: { src: '/assets/images/pieces/irrigation-house.webp', alt: "Il giardino nell'app Dymora con gli irrigatori accesi", width: 1200, height: 982 },
  },
];

/** Functions shown in the home's detail popup: those without a page of their own. */
export const popupFeatures = features.filter((f) => !f.page);

export const feature = (slug: string): Feature => {
  const f = features.find((x) => x.slug === slug);
  if (!f) throw new Error(`Unknown feature ${slug}`);
  return f;
};

/** The title without its `**accent**` marks, for descriptions and link text. */
export const plain = (text: string) => text.replace(/\*\*/g, '');
