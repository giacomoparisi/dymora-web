/*
 * Home "Il servizio" (src/components/home/Service.astro, src/styles/service.css): the pinned
 * stage plays the scene of the step that has reached the reading line.
 *
 * Markup:
 *   .svc                              the section; .is-live once this script runs
 *   [data-svc-stage]                  the pinned stage
 *     [data-svc-scene=i]              one scene per step, .is-active plays it in
 *   [data-svc-node=i]                 the nodes of the rail (.is-active, .is-done before it)
 *   [data-svc-step=i]                 the steps, in order
 *   --svc-p                           how far the steps have scrolled (0–1), fills the rail
 *   .svc__head                        pinned title: its height → --svc-head
 *
 * The first step counts as reached until another one is. When the stage leaves the window its
 * scene is cleared, so it plays again on the way back.
 * On narrow screens the stage sits above the steps: a step counts once it shows under it.
 * Without JavaScript the first scene rests on the stage and every step reads as plain text.
 * Reduced motion is handled in the CSS: the scenes change without moving.
 */
(function () {
  "use strict";

  var LINE = 0.55; // share of the window height where a step counts as reached

  function init() {
    var section = document.querySelector(".svc");
    if (!section || !("IntersectionObserver" in window)) return;
    var stage = section.querySelector("[data-svc-stage]");
    var pin = section.querySelector(".svc__pin");
    var list = section.querySelector(".svc__steps");
    var scenes = Array.prototype.slice.call(section.querySelectorAll("[data-svc-scene]"));
    var nodes = Array.prototype.slice.call(section.querySelectorAll("[data-svc-node]"));
    var steps = Array.prototype.slice.call(section.querySelectorAll("[data-svc-step]"));
    if (!stage || !steps.length) return;
    section.classList.add("is-live");

    // The stage pins under the title, whatever its height.
    var head = section.querySelector(".svc__head");
    if (head && window.ResizeObserver) {
      new ResizeObserver(function () {
        section.style.setProperty("--svc-head", head.offsetHeight + "px");
      }).observe(head);
    }

    var shown = null, seen = false, ticking = false;

    function show(n) {
      var scene = seen ? n : -1;
      var key = n + ":" + scene;
      if (key === shown) return;
      shown = key;
      scenes.forEach(function (el, i) { el.classList.toggle("is-active", i === scene); });
      steps.forEach(function (el, i) { el.classList.toggle("is-active", i === n); });
      nodes.forEach(function (el, i) {
        el.classList.toggle("is-active", i === n);
        el.classList.toggle("is-done", i < n);
      });
    }

    function update() {
      ticking = false;
      var line = window.innerHeight * LINE;
      var box = list.getBoundingClientRect();
      var pb = pin.getBoundingClientRect();
      if (pb.left < box.right && pb.right > box.left) {
        // Stacked: measure in the window left under the pinned stage.
        line = pb.bottom + (window.innerHeight - pb.bottom) * 0.5;
      }
      var n = 0;
      steps.forEach(function (step, i) {
        var r = step.getBoundingClientRect();
        if (r.top + r.height * 0.35 < line) n = i;
      });
      var first = steps[0].getBoundingClientRect();
      var last = steps[steps.length - 1].getBoundingClientRect();
      var span = (last.top + last.height * 0.35) - (first.top + first.height * 0.35);
      var p = span > 0 ? (line - (first.top + first.height * 0.35)) / span : 0;
      section.style.setProperty("--svc-p", Math.min(1, Math.max(0, p)).toFixed(4));
      show(n);
    }

    function request() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    // The stage plays only while it shows.
    new IntersectionObserver(function (entries) {
      seen = entries[entries.length - 1].isIntersecting;
      shown = null;
      request();
    }, { threshold: 0.25 }).observe(stage);

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
    }, { rootMargin: "50% 0px" }).observe(section);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
