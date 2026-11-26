/*
 * Home "Il servizio" (src/components/home/Service.astro, src/styles/service.css): the five steps
 * take turns on their own while the section shows; each one plays its scene on the stage.
 *
 * Markup:
 *   .svc                              the section; .is-live once this script runs
 *   [data-svc-stage]                  the stage
 *     [data-svc-scene=i]              one scene per step, .is-active plays it in
 *   [data-svc-step=i]                 the steps, in order (.is-active); a click picks one
 *   [data-svc-node=i]                 the rail's nodes (.is-active, .is-done before it), with a button
 *   [data-svc-nav]                    the rail, shown by this script
 *   [data-svc-pause]                  pause button (WCAG 2.2.2), shown by this script
 *   .is-paused                        on the section once the visitor pauses the loop
 *   --svc-t                           on the active step: how far its turn has gone (0–1)
 *   --svc-p                           on the section: how far the loop has gone (0–1), fills the rail
 *
 * The loop runs only while the section shows and the tab is visible. When the stage leaves the
 * window its scene is cleared, so it plays again on the way back.
 * Without JavaScript the first scene rests and every step reads as plain text. With reduced
 * motion nothing plays on its own; the steps and the rail still change the scene.
 */
(function () {
  "use strict";

  var TURN = 4000; // ms each step stays before the next one

  function init() {
    var section = document.querySelector(".svc");
    if (!section || !("IntersectionObserver" in window)) return;
    var stage = section.querySelector("[data-svc-stage]");
    var scenes = Array.prototype.slice.call(section.querySelectorAll("[data-svc-scene]"));
    var nodes = Array.prototype.slice.call(section.querySelectorAll("[data-svc-node]"));
    var steps = Array.prototype.slice.call(section.querySelectorAll("[data-svc-step]"));
    var nav = section.querySelector("[data-svc-nav]");
    var pause = section.querySelector("[data-svc-pause]");
    if (!stage || !steps.length) return;
    var last = steps.length - 1;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.classList.add("is-live");
    if (nav) nav.hidden = false;

    var current = 0, seen = false, paused = still, elapsed = 0, before = 0, frame = 0;

    function paint() {
      var scene = seen ? current : -1;
      scenes.forEach(function (el, i) { el.classList.toggle("is-active", i === scene); });
      steps.forEach(function (el, i) { el.classList.toggle("is-active", i === current); });
      nodes.forEach(function (el, i) {
        el.classList.toggle("is-active", i === current);
        el.classList.toggle("is-done", i < current);
        var button = el.querySelector("button");
        if (button) {
          if (i === current) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        }
      });
      progress();
    }

    function progress() {
      var t = still ? 1 : Math.min(1, elapsed / TURN);
      steps[current].style.setProperty("--svc-t", t.toFixed(4));
      section.style.setProperty("--svc-p", Math.min(1, (current + t) / last).toFixed(4));
    }

    function go(n) {
      steps[current].style.removeProperty("--svc-t");
      current = (n + steps.length) % steps.length;
      elapsed = 0;
      paint();
    }

    function tick(now) {
      frame = 0;
      var dt = Math.min(100, now - before);
      before = now;
      elapsed += dt;
      if (elapsed >= TURN) go(current + 1);
      else progress();
      run();
    }

    function run() {
      var on = seen && !paused && !document.hidden;
      if (on && !frame) {
        if (!before) before = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!on && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      if (!on) before = 0;
    }

    // Picking a step, on the step itself or on the rail
    steps.forEach(function (el, i) {
      el.addEventListener("click", function () { if (i !== current) go(i); });
    });
    nodes.forEach(function (el, i) {
      var button = el.querySelector("button");
      if (button) button.addEventListener("click", function () { go(i); });
    });

    if (pause && !still) {
      pause.hidden = false;
      pause.addEventListener("click", function () {
        paused = !paused;
        section.classList.toggle("is-paused", paused);
        pause.setAttribute("aria-pressed", String(paused));
        pause.setAttribute("aria-label", paused ? "Riprendi l'animazione del servizio" : "Metti in pausa l'animazione del servizio");
        run();
      });
    }

    document.addEventListener("visibilitychange", run);

    // The loop runs, and the stage plays, only while it shows.
    new IntersectionObserver(function (entries) {
      var now = entries[entries.length - 1].isIntersecting;
      if (now === seen) return;
      seen = now;
      if (seen) elapsed = 0;
      paint();
      run();
    }, { threshold: 0.4 }).observe(stage);

    paint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
