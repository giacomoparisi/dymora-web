(() => {
  const story = document.getElementById('demo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = [
    ['SISTEMA ATTIVO', 'Tutto tranquillo. Anche per te.', 'Le telecamere osservano il giardino. L’IA analizza ciò che accade.', 'var(--ink)'],
    ['ANIMALE RICONOSCIUTO · NESSUN ALLARME', 'È solo il gatto. Puoi rilassarti.', 'L’IA lo distingue da una persona. Nessun alert, nessuna notifica.', 'var(--green)'],
    ['PERSONA RILEVATA · ALLARME', 'Qualcuno in giardino. Tu lo sai.', 'La presenza attiva la regola di allarme. La notifica arriva sull’app.', 'var(--red)']
  ];
  const buttons = [...document.querySelectorAll('[data-phase]')];
  const playback = document.getElementById('playback');
  const caption = document.querySelector('.caption');
  const duration = 18000;
  let phase = -1, progress = 0, elapsed = 0, frame = 0, previousTime = null;
  let paused = reduced.matches, inView = false;
  function update(p) {
    progress = p;
    const next = p < .3 ? 0 : p < .65 ? 1 : 2;
    if (next !== phase) {
      phase = next;
      document.getElementById('fallback-beam').setAttribute('fill',['#a5a9a4','#269263','#cd4141'][next]);
      document.getElementById('fallback-cat').setAttribute('display',next===1?'inline':'none');
      document.getElementById('fallback-human').setAttribute('display',next===2?'inline':'none');
      document.getElementById('state').textContent = states[next][0];
      document.getElementById('state').style.color = states[next][3];
      document.getElementById('caption-title').textContent = states[next][1];
      document.getElementById('caption-copy').textContent = states[next][2];
      buttons.forEach((b,i) => b.setAttribute('aria-pressed', String(i === next)));
      document.getElementById('notification').classList.toggle('visible',next === 2);
      document.getElementById('notification').setAttribute('aria-hidden',String(next !== 2));
    }
    window.dymoraScene?.(p, next, reduced.matches);
  }
  function tick(now) {
    frame = 0;
    if (previousTime === null) previousTime = now;
    // Render at most 30 frames per second; never catch up after a suspended tab.
    if (now - previousTime >= 1000 / 30) {
      elapsed = (elapsed + Math.min(now - previousTime, 100)) % duration;
      previousTime = now;
      update(elapsed / duration);
    }
    frame = requestAnimationFrame(tick);
  }
  function syncPlayback() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = null;
    playback.dataset.paused = String(paused);
    playback.setAttribute('aria-label', paused ? 'Riprendi l’animazione' : 'Metti in pausa l’animazione');
    playback.querySelector('span').textContent = paused ? 'Riprendi animazione' : 'Pausa animazione';
    // Automatic loops should not repeatedly interrupt screen-reader users.
    caption.setAttribute('aria-live', paused ? 'polite' : 'off');
    if (!paused && inView && !document.hidden) frame = requestAnimationFrame(tick);
  }
  playback.addEventListener('click', () => {
    paused = !paused;
    syncPlayback();
  });
  buttons.forEach((button,i) => button.addEventListener('click',() => {
    paused = true;
    elapsed = [0,.48,.84][i] * duration;
    syncPlayback();
    update(elapsed / duration);
  }));
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }).observe(story);
  document.addEventListener('visibilitychange', syncPlayback);
  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    syncPlayback();
    update(progress);
  });
  window.addEventListener('dymora-scene-ready', () => update(progress));
  update(0);
  syncPlayback();
})();
