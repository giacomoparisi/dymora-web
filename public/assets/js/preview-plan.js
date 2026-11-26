/*
 * PREVIEW ONLY (src/pages/anteprima-progetto/): each candidate scene plays in, rests a moment,
 * clears and plays again. "Rivedi" restarts it. A render drawn as a sprite turns its lights on
 * (its data-preload token joins data-layers, sprite.js) shortly after the scene starts.
 * Under reduced motion, or with ?hold in the address, the scenes play once and rest.
 * Delete with the page once one is chosen.
 */
(function () {
  "use strict";
  var SHOW = 6500, GAP = 900, LIGHTS = 350;
  var still = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || /[?&]hold\b/.test(location.search);

  Array.prototype.forEach.call(document.querySelectorAll("[data-pp]"), function (opt) {
    var scene = opt.querySelector("[data-pp-scene]");
    var replay = opt.querySelector("[data-pp-replay]");
    if (!scene) return;
    var sprites = Array.prototype.slice.call(scene.querySelectorAll(".sprite[data-preload]"));
    var timers = [];

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function lights(on) {
      sprites.forEach(function (sp) { sp.setAttribute("data-layers", on ? sp.getAttribute("data-preload") : ""); });
    }

    function play() {
      scene.classList.add("is-active");
      later(function () { lights(true); }, still ? 0 : LIGHTS);
      if (still) return;
      later(function () {
        scene.classList.remove("is-active");
        lights(false);
        later(play, GAP);
      }, SHOW);
    }

    function restart() {
      clear();
      scene.classList.remove("is-active");
      lights(false);
      later(play, 700);
    }

    if (replay) replay.addEventListener("click", restart);
    play();
  });
})();
