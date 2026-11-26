// Data of the home's Per chi è Dymora and retrofit sections (Segments.astro: segments;
// Retrofit.astro: retrofit). Texts from
// dymora-app design/marketing/copy/it.md, never rewritten here.

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
  // Valid for all three segments, so it stays pinned with the title (owner wording, 2026-11-26).
  line: 'Gestisci uno o più edifici, **tutti nella stessa app**.',
  items: [
    {
      id: 'proprietari', tag: 'Proprietari', app: 'Montagna',
      title: 'La tua casa, **sotto controllo**, ovunque tu sia.',
      line: 'Che sia la casa dove vivi o una seconda casa che resta vuota per mesi, Dymora la rende più sicura, più comoda e più efficiente, e te la fa seguire da dove sei.',
      points: [
        'Più tranquillità: sai cosa succede nei tuoi immobili, anche da lontano.',
        'Più comfort: la casa segue le tue abitudini, con le automazioni che configuriamo con te.',
        'Meno sprechi: consumi sotto controllo, senza doverci pensare.',
      ],
      sprite: 'mountain_chalet', lights: 'lights_on_idle!',
    },
    {
      id: 'affitti-brevi', tag: 'Affitti brevi', app: 'Appartamento',
      title: 'I tuoi alloggi, **gestiti a distanza**.',
      line: 'Ogni arrivo da preparare, ogni partenza da controllare, i costi da tenere a bada: Dymora ti fa gestire gli alloggi da remoto, con meno spostamenti e più controllo.',
      points: [
        "Meno sopralluoghi: segui i tuoi alloggi dall'app, da dove sei.",
        "Costi sotto controllo: niente impianti accesi a vuoto tra un ospite e l'altro.",
        'Ospiti più soddisfatti: un soggiorno più comodo, che distingue i tuoi alloggi.',
      ],
      sprite: 'apartment_building', lights: 'lights_on_idle!',
    },
    {
      id: 'aziende', tag: 'Aziende', app: 'Ufficio',
      title: 'Le tue **sedi**, più semplici da gestire.',
      line: 'Uffici, negozi e magazzini: impianti diversi, persone che entrano ed escono, costi che pesano. Dymora riunisce tutto in un solo sistema, così gestisci ogni sede con meno tempo e meno sprechi.',
      points: [
        'Più efficienza: Dymora analizza i consumi di ogni sede e trova gli sprechi.',
        'Più controllo: ogni collaboratore accede solo a ciò che gli serve.',
        'Meno pensieri: la sede segue i tuoi orari, con le automazioni che configuriamo con te.',
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
