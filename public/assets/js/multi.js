/*
 * Home multi: the properties reach the devices one at a time.
 *
 * Markup (src/components/home/Intro.astro):
 *   [data-multi]
 *     li[data-multi-item=id]                      the buildings
 *     [data-multi-path=id]                        optional segments drawn for each building
 *
 * Without JavaScript, or with prefers-reduced-motion, every building stays lit.
 * With motion, `is-live` dims the buildings; each step lights one and restarts `is-flow`,
 * which draws its branch of the comb. The story only runs while on screen.
 */
(function () {
  "use strict";

  var STEP = 2000;   // ms each property stays open

  function init() {
    var root = document.querySelector("[data-multi]");
    if (!root) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    var items = Array.prototype.slice.call(root.querySelectorAll("[data-multi-item]"));
    var paths = Array.prototype.slice.call(root.querySelectorAll("[data-multi-path]"));
    if (!items.length) return;

    var index = -1, timer = 0, visible = false;

    function show(i) {
      index = i;
      var item = items[i];
      var id = item.getAttribute("data-multi-item");
      items.forEach(function (el) { el.classList.toggle("is-active", el === item); });
      paths.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-multi-path") === id); });
      root.classList.remove("is-flow");
      void root.offsetWidth; // restart the drawing
      root.classList.add("is-flow");
    }

    function tick() {
      show((index + 1) % items.length);
      timer = setTimeout(tick, STEP);
    }

    function start() {
      if (timer) return;
      root.classList.add("is-live");
      timer = setTimeout(tick, index < 0 ? 250 : 0);
    }

    function stop() {
      clearTimeout(timer);
      timer = 0;
      // Resume from the same property.
      if (index >= 0) index = (index + items.length - 1) % items.length;
    }

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0.3 }).observe(root);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (visible) start();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
