/*
 * Home "Dispositivi" (src/components/home/Brands.astro, src/styles/brands.css).
 *
 * Markup:
 *   .brd                  the section; .is-live once this script runs (the loop is CSS)
 *   [data-brd-stage]      the stage; .is-on while it shows: the names light up and the rows glide.
 *                         .is-paused once the visitor pauses the loop
 *   [data-brd-pause]      pause button (WCAG 2.2.2: moving content over 5 s), shown by this script
 *
 * The rows glide on their own, never with the scroll, and only while the stage is on screen.
 * Without JavaScript or with reduced motion the script does nothing: rows centred, names lit.
 */
(function () {
  "use strict";

  function init() {
    var section = document.querySelector(".brd");
    if (!section || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var stage = section.querySelector("[data-brd-stage]");
    if (!stage) return;
    section.classList.add("is-live");

    var pause = stage.querySelector("[data-brd-pause]");
    if (pause) {
      pause.hidden = false;
      pause.addEventListener("click", function () {
        var paused = stage.classList.toggle("is-paused");
        pause.setAttribute("aria-pressed", String(paused));
        pause.setAttribute("aria-label", paused ? "Riprendi l'animazione dei marchi" : "Metti in pausa l'animazione dei marchi");
      });
    }

    // The names light up and the rows glide each time the stage comes back on screen.
    new IntersectionObserver(function (entries) {
      stage.classList.toggle("is-on", entries[entries.length - 1].isIntersecting);
    }, { threshold: 0.35 }).observe(stage);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
