/* PREVIEW ONLY (anteprima-chiusura): plays each visual once when it comes into view
   (`is-in`), counts the kWh up, and replays a variant from its "Rivedi" button.
   Under reduced motion nothing plays: the final state is already in the markup. */
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const count = (vz) => {
    vz.querySelectorAll('[data-vz-count]').forEach((el) => {
      const to = Number(el.dataset.to);
      const t0 = performance.now();
      const dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = fmt.format(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  const play = (vz) => {
    vz.classList.remove('is-in');
    void vz.offsetWidth;
    vz.classList.add('is-in');
    count(vz);
  };

  if (still) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      play(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-vz]').forEach((vz) => io.observe(vz));

  document.querySelectorAll('[data-vz-replay]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vz = document.getElementById(btn.getAttribute('aria-controls'))?.querySelector('[data-vz]');
      if (vz) play(vz);
    });
  });
})();
