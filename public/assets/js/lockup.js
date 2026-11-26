/* BrandLockup.astro: plays the splash's opening once, when the lockup comes into view.
   Without IntersectionObserver or under reduced motion nothing is armed: the lockup stands whole. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.classList.add('is-in');
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-lockup]').forEach((el) => {
    el.classList.add('is-armed');
    io.observe(el);
  });
})();
