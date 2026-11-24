// Data of the introductory home section (Intro.astro: overview, multi, retrofit). Texts from
// dymora-app design/marketing/copy/it.md, never rewritten here.

// Overview — the tags light up one at a time and each part of the house plays in
// (overview.js): `on` tokens join data-layers, `off` tokens leave it (their clip reversed).
// The house starts closed: shutters down, awning in, everything off.
// Leader points: brochure decision.html, page `overview`, normalised on the house.
export const overview = {
  title: '**Controlla** la tua casa sotto ogni aspetto.',
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

// Multi — Montagna and Ufficio are the brochure placeholders until the real renders
// arrive (scripts/app-assets.json, docs/PLAN-brochure.md decision 5).
// The title has no full stop: the sentence goes on in `line`, under the devices.
export const multi = {
  title: 'Gestisci tutte le tue proprietà nella **stessa applicazione**',
  line: 'sul device che preferisci.',
  buildings: [
    { id: 'casa', label: 'Casa', src: '/assets/images/edificio-casa.webp', w: 1200, h: 810 },
    { id: 'montagna', label: 'Montagna', src: '/assets/images/edificio-montagna.svg', w: 1024, h: 691 },
    { id: 'ufficio', label: 'Ufficio', src: '/assets/images/edificio-ufficio.svg', w: 1024, h: 691 },
  ],
  devices: ['laptop', 'tablet', 'phone'],
};

export const retrofit = {
  title: '**Dymora si adatta** al tuo edificio.',
  close: "Non c'è una soluzione unica. **C'è la tua.**",
  options: [
    {
      tag: 'Senza ristrutturazione',
      src: '/assets/images/edificio-epoca.webp',
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
