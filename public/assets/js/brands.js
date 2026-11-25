/*
 * Home "Marchi" (src/components/home/Brands.astro, src/styles/brands.css).
 *
 * Markup:
 *   .brd                  the section; .is-live once this script runs
 *   [data-brd-stage]      the stage; .is-on while it shows, so the names light up again each time
 *   --brd-p               how far the stage has crossed the window (0–1): the rows slide with it
 *
 * The rows move only with the scroll, never by themselves.
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

    var ticking = false;

    function update() {
      ticking = false;
      var r = stage.getBoundingClientRect();
      var h = window.innerHeight;
      var p = (h - r.top) / (h + r.height);
      stage.style.setProperty("--brd-p", Math.min(1, Math.max(0, p)).toFixed(4));
    }

    function request() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    // The names light up each time the stage comes back on screen.
    new IntersectionObserver(function (entries) {
      stage.classList.toggle("is-on", entries[entries.length - 1].isIntersecting);
    }, { threshold: 0.35 }).observe(stage);

    // Listen to the scroll only while the section is near the window.
    var near = false;
    new IntersectionObserver(function (entries) {
      var now = entries[entries.length - 1].isIntersecting;
      if (now === near) return;
      near = now;
      var method = near ? "addEventListener" : "removeEventListener";
      window[method]("scroll", request, { passive: true });
      window[method]("resize", request);
      request();
    }, { rootMargin: "25% 0px" }).observe(section);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
