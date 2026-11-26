/*
 * Home "Per chi è Dymora" and retrofit (src/components/home/Buildings.astro).
 *
 * Multi  [data-multi]
 *   [data-multi-item=id]   the renders, one active at a time
 *   [data-multi-row=id]    the rows of the app's picker on the phone
 *   [data-multi-seg=id]    the segments of the progress rail
 *   [data-multi-text=id]   the segments' texts (their id is the anchor): the active one gets the rule
 *   .sprite in an item     a property drawn as a sprite: its data-preload token (the lights
 *                          clip) joins data-layers while the property is selected (sprite.js)
 * Retro  [data-retro]
 *   .bld__swap / .bld__wipe   the render and its sweep (buildings.css, --split)
 *   [data-retro-opt=0|1]      the texts of the two options
 *   [data-retro-before]       the period building, a sprite: its data-preload token (the lights
 *                             clip) joins data-layers while it shows, and leaves as the line sweeps
 *                             on (sprite.js plays it backwards)
 *
 * Both loop while on screen and pause when they leave it or the tab is hidden; each starts from
 * its first state when it comes back.
 * Multi: Proprietari → Affitti brevi → Aziende → …; before each change a tap lands on the next row.
 * Pointing at a segment's text (or tapping it), or arriving on its anchor, selects it and holds it;
 * the loop goes on from there when the mouse leaves the texts.
 * Retro: the period building, its windows light up, the line sweeps to the modern house, then
 * back, and again.
 * With prefers-reduced-motion (or without JavaScript) nothing moves: the static markup stays.
 */
(function () {
  "use strict";

  var STEP = 2200;  // multi: how long each property shows
  var TAP = 400;    // multi: from the tap to the change
  var HOLD = 1800;  // retro: how long each building shows
  var SWEEP = 1000; // retro: the sweep
  var LIGHTS = 500; // retro: from the period building showing to its windows lighting up

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  function all(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  // Calls `start` when `root` is on screen (and the tab visible), `stop` when it no longer is.
  function whileOnScreen(root, start, stop) {
    var seen = false, running = false;
    function update() {
      var go = seen && !document.hidden;
      if (go === running) return;
      running = go;
      if (go) start(); else stop();
    }
    new IntersectionObserver(function (entries) {
      var e = entries[entries.length - 1];
      if (e.intersectionRatio >= 0.4) seen = true;
      else if (!e.isIntersecting) seen = false;
      update();
    }, { threshold: [0, 0.4] }).observe(root);
    document.addEventListener("visibilitychange", update);
  }

  // A list of timers that can be cancelled together.
  function timers() {
    var ids = [];
    return {
      at: function (ms, fn) { ids.push(setTimeout(fn, ms)); },
      clear: function () { ids.forEach(clearTimeout); ids = []; },
    };
  }

  function multi(root) {
    var items = all(root, "[data-multi-item]");
    var rows = all(root, "[data-multi-row]");
    var segs = all(root, "[data-multi-seg]");
    var texts = all(root, "[data-multi-text]");
    if (!items.length || !rows.length) return;
    var ids = rows.map(function (r) { return r.getAttribute("data-multi-row"); });
    var t = timers();
    var index = 0;
    var held = false, running = false;
    var sprites = items.map(function (el) { return el.querySelector(".sprite[data-preload]"); });
    root.style.setProperty("--bld-dwell", STEP + "ms");
    // The pinned title's height, so the segments' anchors land below it.
    var head = root.querySelector(".bld__head");
    if (head && window.ResizeObserver) {
      new ResizeObserver(function () {
        root.style.setProperty("--bld-head", head.offsetHeight + "px");
      }).observe(head);
    }

    // The selected property's lights on, the others off; -1 turns them all off.
    function light(i) {
      sprites.forEach(function (sp, j) {
        if (sp) sp.setAttribute("data-layers", j === i ? sp.getAttribute("data-preload") : "");
      });
    }

    function mark(list, attr, id, cls) {
      list.forEach(function (el) { el.classList.toggle(cls, el.getAttribute(attr) === id); });
    }
    function show(i) {
      index = i;
      mark(items, "data-multi-item", ids[i], "is-active");
      mark(rows, "data-multi-row", ids[i], "is-active");
      mark(texts, "data-multi-text", ids[i], "is-active");
      light(items.map(function (el) { return el.getAttribute("data-multi-item"); }).indexOf(ids[i]));
      segs.forEach(function (s, j) {
        s.classList.remove("is-run");
        s.classList.toggle("is-on", j < i);
      });
      if (segs[i]) { void segs[i].offsetWidth; segs[i].classList.add("is-run"); }
    }
    function tap(i) {
      rows[i].classList.remove("is-tap");
      void rows[i].offsetWidth;
      rows[i].classList.add("is-tap");
    }
    function step() {
      var next = (index + 1) % ids.length;
      t.at(STEP - TAP, function () { tap(next); });
      t.at(STEP, function () { show(next); step(); });
    }

    // Lit in the markup (no JavaScript, reduced motion); dark until the chapter shows, so the
    // first property lights up in front of the reader, and again every time it comes back.
    // A held segment: the rail shows it full, nothing moves on.
    function hold(id) {
      var i = ids.indexOf(id);
      if (i < 0) return;
      held = true;
      t.clear();
      if (i !== index || !running) show(i);
      segs.forEach(function (s, j) { s.classList.remove("is-run"); s.classList.toggle("is-on", j <= i); });
      if (!running) light(-1);
    }
    function release() {
      if (!held) return;
      held = false;
      if (running) step();
    }
    texts.forEach(function (el) {
      var id = el.getAttribute("data-multi-text");
      el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hold(id); });
      el.addEventListener("click", function () { hold(id); });
    });
    var list = texts.length && texts[0].parentNode;
    if (list) list.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") release(); });
    function fromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      if (ids.indexOf(id) >= 0) hold(id);
    }
    window.addEventListener("hashchange", fromHash);

    root.classList.add("is-live");
    light(-1);
    fromHash();
    whileOnScreen(root, function () {
      running = true;
      if (held) { show(index); hold(ids[index]); } else { show(0); step(); }
    }, function () {
      running = false;
      t.clear();
      rows.forEach(function (r) { r.classList.remove("is-tap"); });
      if (!held) {
        show(0);
        segs.forEach(function (s, j) { s.classList.remove("is-run"); s.classList.toggle("is-on", j === 0); });
      }
      light(-1);
    });
  }

  function retro(root) {
    var opts = all(root, "[data-retro-opt]");
    var after = root.querySelector(".bld__after");
    if (opts.length < 2 || !after) return;
    // Fully clipped, a lazy image would only load mid-sweep: fetch it with the page.
    after.loading = "eager";
    // The period building's sprite: its lights clip (data-preload) plays while it shows.
    var house = root.querySelector("[data-retro-before] .sprite[data-preload]");
    var t = timers();
    var on = false;
    root.style.setProperty("--bld-sweep", SWEEP + "ms");

    function lights(value) {
      if (house) house.setAttribute("data-layers", value ? house.getAttribute("data-preload") : "");
    }
    function set(value) {
      on = value;
      root.classList.toggle("is-after", on);
      opts.forEach(function (el, j) { el.classList.toggle("is-active", j === (on ? 1 : 0)); });
    }
    function step() {
      // On the period building, its windows light up a beat after it shows.
      if (!on) t.at(LIGHTS, function () { lights(true); });
      t.at(HOLD + (on ? 0 : LIGHTS), function () {
        root.classList.add("is-moving");
        // Leaving the period building, the lights go out under the line.
        if (!on) lights(false);
        set(!on);
        t.at(SWEEP, function () { root.classList.remove("is-moving"); step(); });
      });
    }

    // Lit in the markup (reduced motion); dark until the chapter shows, as in Multi.
    root.classList.add("is-live");
    lights(false);
    set(false);
    whileOnScreen(root, step, function () {
      t.clear();
      root.classList.remove("is-moving");
      lights(false);
      set(false);
    });
  }

  function init() {
    all(document, "[data-multi]").forEach(multi);
    all(document, "[data-retro]").forEach(retro);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
