/*
 * Home overview: the house switches its functions on one at a time, by itself.
 *
 * Markup (src/components/home/Intro.astro):
 *   .ov-stage[data-ov-sequence="id id …"][data-ov-rest="tokens"]
 *     .sprite#ov-house[data-layers]            played by sprite.js
 *     .ov-item[data-ov-item=id][data-ov-on="tokens"][data-ov-off="tokens"]
 *
 * Each step adds the item's `on` tokens to the house's data-layers and removes its `off`
 * tokens (sprite.js plays them in, or reverses them out), and marks the tag `is-active`.
 * After the last step the house holds, goes back to rest (shutters down, all off) and
 * starts again. The story only advances while the house is on screen.
 * With prefers-reduced-motion every function is shown on at once, with no sequence.
 */
(function () {
  "use strict";

  var STEP = 900;    // ms between two functions
  var HOLD = 5000;   // everything on
  var REST = 2200;   // back to rest before the next round (the clips reverse out)
  var FIRST = 300;   // after the house first shows

  function parse(attr) {
    return (attr || "").split(/\s+/).filter(Boolean);
  }

  function init() {
    var stage = document.querySelector(".ov-stage[data-ov-sequence]");
    if (!stage) return;
    var house = stage.querySelector(".sprite[data-sprite]");
    var rest = parse(stage.getAttribute("data-ov-rest"));
    var items = {};
    Array.prototype.forEach.call(stage.querySelectorAll("[data-ov-item]"), function (el) {
      items[el.getAttribute("data-ov-item")] = el;
    });
    var sequence = parse(stage.getAttribute("data-ov-sequence")).filter(function (id) { return items[id]; });
    if (!house || !sequence.length) return;

    function apply(ids) {
      var tokens = rest.slice();
      sequence.forEach(function (id) {
        var el = items[id], on = ids.indexOf(id) !== -1;
        el.classList.toggle("is-active", on);
        if (!on) return;
        var off = parse(el.getAttribute("data-ov-off"));
        tokens = tokens.filter(function (t) { return off.indexOf(t) === -1; });
        parse(el.getAttribute("data-ov-on")).forEach(function (t) {
          if (tokens.indexOf(t) === -1) tokens.push(t);
        });
      });
      house.setAttribute("data-layers", tokens.join(" "));
    }

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) { apply(sequence); return; }

    var step = 0;          // functions on; sequence.length + 1 = back to rest
    var visible = false, timer = 0, started = false;

    function next() {
      timer = 0;
      if (step < sequence.length) {
        step++;
        apply(sequence.slice(0, step));
        schedule(step === sequence.length ? HOLD : STEP);
      } else {
        step = 0;
        apply([]);
        schedule(REST);
      }
    }

    function schedule(ms) {
      clearTimeout(timer);
      timer = 0;
      if (visible) timer = setTimeout(next, ms);
    }

    function wake() {
      if (!visible || timer) return;
      schedule(started ? STEP : FIRST);
      started = true;
    }

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) wake(); else { clearTimeout(timer); timer = 0; }
    }, { threshold: 0.35 }).observe(house);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
