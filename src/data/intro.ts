// Data of the home's house story and Per chi è Dymora sections (HouseStory.astro: overview;
// Buildings.astro: segments, retrofit). Texts from
// dymora-app design/marketing/copy/it.md, never rewritten here.

// Overview — the tags light up one at a time and each part of the house plays in
// (story.js): `on` tokens join data-layers, `off` tokens leave it (their clip reversed).
// The house starts closed: shutters down, awning in, everything off.
// Leader points: brochure decision.html, page `overview`, normalised on the house.
export const overview = {
  title: '**Controlla** il tuo edificio sotto ogni aspetto.', // `overview.title.web`
  lead: 'Con progettazione, installazione, configurazione e assistenza di Dymora.',
  alt: 'La casa con luci, clima, tapparelle, serrature, allarme, telecamere, consumi e irrigazione gestiti da Dymora',
  items: [
    { id: 'clima', label: 'Clima', row: 'top', on: 'climate_hp_fan_start_off>climate_hp_fan_run_off climate_hp_air_off climate_hp_led_off climate_ac_fan_start_off>climate_ac_fan_run_off climate_ac_air_off climate_ac_led_off' },
    { id: 'allarme', label: 'Allarme', row: 'top', on: 'alarm_armed_off' },
    { id: 'consumi', label: 'Consumi', row: 'top', on: 'grid_flow_off grid_light_off' },
    { id: 'luci', label: 'Luci', row: 'top', on: 'lit_off' },
    { id: 'irrigazione', label: 'Irrigazione', row: 'bot', on: 'irrigation_on_off>irrigation_run_off' },
    { id: 'tapparelle', label: 'Tapparelle', row: 'bot', on: 'awning_out_off!', off: 'shutters_down_off!' },
    { id: 'telecamere', label: 'Telecamere', row: 'bot', on: 'camera_left_on_off>camera_left_scan_off~24 camera_right_on_off>camera_right_scan_off~-24' },
    { id: 'serrature', label: 'Serrature', row: 'bot', on: 'door_led_off!' },
  ] as { id: string; label: string; row: 'top' | 'bot'; on: string; off?: string }[],
  // Order of the story: the shutters open and the awning comes out, then the lights.
  sequence: ['tapparelle', 'luci', 'clima', 'irrigazione', 'consumi', 'serrature', 'allarme', 'telecamere'],
  // The app's draw order (art/house/brief.md): light, then curtains, shutters, awning, the rest.
  order: 'lit_off shutters_down_off shutters_through_off awning_shade_off balustrade_off awning_out_off grid_light_off grid_flow_off irrigation_on_off irrigation_run_off camera_left_on_off camera_left_scan_off camera_right_on_off camera_right_scan_off climate_hp_air_off climate_hp_fan_start_off climate_hp_fan_run_off climate_hp_led_off climate_ac_air_off climate_ac_fan_start_off climate_ac_fan_run_off climate_ac_led_off alarm_armed_off door_led_off',
  rest: 'balustrade_off shutters_down_off!',
  functions: ['Luci', 'Allarme', 'Clima', 'Telecamere', 'Tapparelle', 'Consumi', 'Serrature', 'Irrigazione'],
};

// Segments — "Per chi è Dymora" (copy `segments`, `segments.owners|rentals|business`): the app's
// installation picker, where each property stands for one kind of client. Each property is a
// Blender scene from dymora-app (model-animator, art/<scene>/, web-only, scripts/app-assets.json):
// its `lights` clip plays when it is selected and back when the picker moves on.
// `id` is also the anchor of the segment's text (the opening links to it). `app` is the
// installation's name in the picker.
export interface Segment {
  id: string; tag: string; app: string; title: string; line: string; points: string[];
  sprite: string; lights: string;
}
export const segments = {
  eyebrow: 'Per chi è Dymora',
  title: 'Una soluzione su misura per **ogni edificio**.',
  line: 'Per chi vive, affitta o lavora in più edifici: li gestisci tutti dalla stessa app, sul device che preferisci.',
  items: [
    {
      id: 'proprietari', tag: 'Proprietari', app: 'Montagna',
      title: 'Tutti i tuoi **immobili**, in una sola app.',
      line: "La casa dove vivi, quella in montagna o al mare: passi dall'una all'altra quando vuoi.",
      points: [
        "Ricevi una notifica se scatta l'allarme o le telecamere rilevano un evento.",
        'Accendi il riscaldamento prima di arrivare.',
        'Rivedi i consumi di ogni immobile, anche quando è vuoto.',
      ],
      sprite: 'mountain_chalet', lights: 'lights_on_idle!',
    },
    {
      id: 'affitti-brevi', tag: 'Affitti brevi', app: 'Appartamento',
      title: 'I tuoi appartamenti, **pronti** per ogni ospite.',
      line: 'Meno sopralluoghi, consumi sotto controllo e un soggiorno più comodo, che distingue i tuoi alloggi.',
      points: [
        "Un codice di accesso per ogni ospite: lo crei dall'app e lo cancelli alla partenza.",
        'Clima e luci si spengono dopo la partenza, con le automazioni che configuriamo con te.',
        'Vedi accessi e consumi di ogni appartamento, e chi fa le pulizie ha un suo utente, con le sole funzioni che servono.',
      ],
      sprite: 'apartment_building', lights: 'lights_on_idle!',
    },
    {
      id: 'aziende', tag: 'Aziende', app: 'Ufficio',
      title: 'Le tue **sedi**, sotto controllo.',
      line: 'Uffici, negozi e magazzini: accessi, luci, clima e consumi di ogni sede nella stessa app, e ogni collaboratore vede solo le funzioni che gli servono.',
      points: [
        'Codici di accesso per personale e fornitori, e lo storico degli accessi della porta.',
        'Luci e clima seguono gli orari della sede, con le automazioni che configuriamo con te.',
        'Rivedi lo storico dei consumi di ogni sede: Dymora analizza gli sprechi e trova le inefficienze.',
      ],
      sprite: 'office_building', lights: 'lights_on_idle!',
    },
  ] as Segment[],
};

// Retrofit — the period building is a Blender scene from dymora-app (model-animator,
// art/period-house, web-only): `lights` lights its windows while it shows. The modern house is a
// plain image of the same plot (buildings.css lines the two plots up).
export const retrofit = {
  eyebrow: 'Edifici esistenti e ristrutturazioni',
  title: '**Dymora si adatta** al tuo edificio.',
  close: "Non c'è una soluzione unica. **C'è la tua.**",
  before: { sprite: 'period_house', lights: 'lights_on_house!' },
  options: [
    {
      tag: 'Senza ristrutturazione',
      alt: "Un edificio d'epoca con l'impianto esistente",
      title: '**Pronta in un giorno**, senza cantiere.',
      body: 'Soluzioni poco invasive: niente opere murarie e nessun impianto elettrico da rifare.',
    },
    {
      tag: 'Con ristrutturazione',
      src: '/assets/images/edificio-moderna.webp',
      alt: 'Una casa moderna con luci, tenda e irrigazione accese',
      title: '**Pianificata con te**, in ogni dettaglio.',
      body: 'Impianto progettato su misura durante la fase di ristrutturazione sulle tue esigenze.',
    },
  ],
};
