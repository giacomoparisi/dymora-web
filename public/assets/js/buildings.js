/*
 * Home "Più edifici" and retrofit (src/components/home/Buildings.astro).
 *
 * Multi  [data-multi]
 *   [data-multi-tabs] button[data-multi-tab=id]   the pills (hidden without JavaScript)
 *   [data-multi-item=id]                          the renders, one active at a time
 *   [data-multi-row=id]                           the rows of the app's picker, on every device
 * Retro  [data-retro]
 *   [data-retro-switch] .bld__toggle[role=switch] the switch (hidden without JavaScript)
 *   [data-retro-side=0|1]                         its two labels, also clickable
 *   [data-retro-item=i] [data-retro-opt=i]        the renders and the texts of the two options
 *
 * While on screen each one steps by itself (Multi every STEP ms with a progress bar on the active
 * pill, Retro every FLIP ms) until the visitor uses a control; hovering or focusing pauses it.
 * With prefers-reduced-motion nothing steps by itself: the controls still work.
 * The root gets `is-live` once its controls are on; `is-auto` while it steps by itself.
 */
(function () {
  "use strict";

  var STEP = 3200;
  var FLIP = 4200;

  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function all(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  // Calls `step` every `ms` while `root` is on screen, not hovered or focused, and not taken over.
  function autoplay(root, ms, step) {
    var timer = 0, visible = false, held = false, stopped = still;

    function run() {
      clearTimeout(timer);
      timer = 0;
      var go = visible && !held && !stopped && !document.hidden;
      root.classList.toggle("is-auto", go);
      if (go) timer = setTimeout(function () { step(); run(); }, ms);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        run();
      }, { threshold: 0.35 }).observe(root);
    }
    root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { held = true; run(); } });
    root.addEventListener("pointerleave", function () { held = false; run(); });
    root.addEventListener("focusin", function () { held = true; run(); });
    root.addEventListener("focusout", function () { held = false; run(); });
    document.addEventListener("visibilitychange", run);

    return {
      restart: run,
      stop: function () { stopped = true; run(); },
    };
  }

  function multi(root) {
    var tabs = all(root, "[data-multi-tab]");
    var items = all(root, "[data-multi-item]");
    var rows = all(root, "[data-multi-row]");
    var group = root.querySelector("[data-multi-tabs]");
    if (!tabs.length || !items.length) return;
    var ids = tabs.map(function (t) { return t.getAttribute("data-multi-tab"); });
    var index = 0;

    function show(i) {
      index = i;
      var id = ids[i];
      tabs.forEach(function (t, j) { t.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      items.forEach(function (el) { el.classList.toggle("is-active", el.getAttribute("data-multi-item") === id); });
      rows.forEach(function (el) { el.classList.toggle("is-active", el.getAttribute("data-multi-row") === id); });
      root.setAttribute("data-multi-active", id);
      root.classList.remove("is-flow");
      void root.offsetWidth; // restart the pulse and the pill's progress
      root.classList.add("is-flow");
    }

    var play = autoplay(root, STEP, function () { show((index + 1) % ids.length); });

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        play.stop();
        show(i);
      });
    });

    group.hidden = false;
    root.classList.add("is-live");
    show(0);
    play.restart();
  }

  function retro(root) {
    var box = root.querySelector("[data-retro-switch]");
    var toggle = root.querySelector(".bld__toggle");
    var items = all(root, "[data-retro-item]");
    var opts = all(root, "[data-retro-opt]");
    var sides = all(root, "[data-retro-side]");
    if (!box || !toggle || items.length < 2) return;
    var on = false;

    function set(value) {
      on = value;
      var i = on ? 1 : 0;
      toggle.setAttribute("aria-checked", on ? "true" : "false");
      items.forEach(function (el, j) { el.classList.toggle("is-active", j === i); });
      opts.forEach(function (el, j) { el.classList.toggle("is-active", j === i); });
      sides.forEach(function (el) { el.classList.toggle("is-active", el.getAttribute("data-retro-side") === String(i)); });
    }

    var play = autoplay(root, FLIP, function () { set(!on); });

    toggle.addEventListener("click", function () { play.stop(); set(!on); });
    sides.forEach(function (el) {
      el.addEventListener("click", function () {
        play.stop();
        set(el.getAttribute("data-retro-side") === "1");
      });
    });

    box.hidden = false;
    root.classList.add("is-live");
    set(false);
    play.restart();
  }

  function init() {
    all(document, "[data-multi]").forEach(multi);
    all(document, "[data-retro]").forEach(retro);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
