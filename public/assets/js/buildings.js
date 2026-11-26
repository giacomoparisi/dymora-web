/*
 * Home "Per chi è Dymora" and retrofit (src/components/home/Segments.astro, Retrofit.astro).
 *
 * Multi  [data-multi]
 *   [data-multi-item=id]   the renders, one active at a time
 *   [data-multi-row=id]    the rows of the app's picker on the phone: a click picks the segment
 *   [data-multi-tabs]      the tablist, shown by this script (role tablist)
 *   [data-multi-tab=id]    one tab per segment (role tab, roving tabindex, arrow keys)
 *   [data-multi-seg=id]    the bar under each tab: fills while its segment shows
 *   [data-multi-text=id]   the segments' texts (role tabpanel; their id is the anchor): one shows
 *   [data-multi-pause]     pause button (WCAG 2.2.2), shown by this script
 *   .sprite in an item     a property drawn as a sprite: its data-preload token (the lights
 *                          clip) joins data-layers while the property is selected (sprite.js)
 * Retro  [data-retro]
 *   .bld__swap / .bld__wipe   the render and its sweep (buildings.css, --split)
 *   [data-retro-opt=0|1]      the texts of the two options
 *   [data-retro-before]       the period building, a sprite: its data-preload token (the lights
 *                             clip) joins data-layers while it shows, and leaves as the line sweeps
 *                             on (sprite.js plays it backwards)
 *
 * Both loop while on screen and pause when they leave it or the tab is hidden.
 * Multi: Proprietari → Affitti → Aziende → …, long enough on each to read its text; before
 * each change a tap lands on the next row. A tab, or a row of the picker, picks its segment and the
 * turns go on from there; pointing at the text or the picker's list holds it until the mouse leaves; the pause button stops the turns, and so
 * does arriving on a segment's anchor. Off screen, unless paused, it starts again from the first.
 * With prefers-reduced-motion the tabs work but nothing turns on its own (no pause button).
 * Retro: the period building, its windows light up, the line sweeps to the modern house, then
 * back, and again. With prefers-reduced-motion it stays still.
 * Without JavaScript the static markup stays: the first segment, the three texts in a column.
 */
(function () {
  "use strict";

  var STEP = 9000;  // multi: how long each segment shows (time to read its text)
  var TAP = 400;    // multi: from the tap to the change
  var HOLD = 1800;  // retro: how long each building shows
  var SWEEP = 1000; // retro: the sweep
  var LIGHTS = 500; // retro: from the period building showing to its windows lighting up

  var still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
    var tabs = all(root, "[data-multi-tab]");
    var bars = all(root, "[data-multi-seg]");
    var texts = all(root, "[data-multi-text]");
    var tablist = root.querySelector("[data-multi-tabs]");
    var pause = root.querySelector("[data-multi-pause]");
    if (!items.length || !rows.length || !tabs.length || !tablist) return;
    var ids = tabs.map(function (b) { return b.getAttribute("data-multi-tab"); });
    function byId(list, attr, id) {
      for (var i = 0; i < list.length; i++) if (list[i].getAttribute(attr) === id) return list[i];
      return null;
    }
    var t = timers();
    var index = 0;
    var running = false, hovered = false, paused = false;
    var sprites = ids.map(function (id) {
      var it = byId(items, "data-multi-item", id);
      return it && it.querySelector(".sprite[data-preload]");
    });
    root.style.setProperty("--bld-dwell", STEP + "ms");
    // The pinned title's height, so the segments' anchors land below it.
    var head = root.querySelector(".bld__head");
    if (head && window.ResizeObserver) {
      new ResizeObserver(function () {
        root.style.setProperty("--bld-head", head.offsetHeight + "px");
      }).observe(head);
    }

    // Tabs and panels
    tablist.setAttribute("role", "tablist");
    tablist.hidden = false;
    tabs.forEach(function (b, i) {
      var panel = byId(texts, "data-multi-text", ids[i]);
      b.setAttribute("role", "tab");
      if (panel) {
        b.setAttribute("aria-controls", panel.id);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", b.id);
      }
    });

    // The selected property's lights on, the others off; -1 turns them all off.
    function light(i) {
      sprites.forEach(function (sp, j) {
        if (sp) sp.setAttribute("data-layers", j === i ? sp.getAttribute("data-preload") : "");
      });
    }
    function mark(list, attr, id, cls) {
      list.forEach(function (el) { el.classList.toggle(cls, el.getAttribute(attr) === id); });
    }
    // The bars: the ones before the current full, the current one filling (`run`) or full.
    function bar(run) {
      bars.forEach(function (s, j) {
        s.classList.remove("is-run");
        s.classList.toggle("is-on", j < index || (j === index && !run));
      });
      if (run && bars[index]) { void bars[index].offsetWidth; bars[index].classList.add("is-run"); }
    }
    function show(i) {
      index = i;
      var id = ids[i];
      mark(items, "data-multi-item", id, "is-active");
      mark(rows, "data-multi-row", id, "is-active");
      mark(texts, "data-multi-text", id, "is-active");
      texts.forEach(function (el) {
        var on = el.getAttribute("data-multi-text") === id;
        el.setAttribute("aria-hidden", String(!on));
        if ("inert" in el) el.inert = !on;
      });
      tabs.forEach(function (b, j) {
        b.classList.toggle("is-active", j === i);
        b.setAttribute("aria-selected", String(j === i));
        b.tabIndex = j === i ? 0 : -1;
      });
      light(running || still ? i : -1);
    }
    function tap(i) {
      rows[i].classList.remove("is-tap");
      void rows[i].offsetWidth;
      rows[i].classList.add("is-tap");
    }
    // The turns go on only on screen, not paused, not held by the mouse.
    function turning() { return running && !paused && !hovered && !still; }
    function step() {
      t.clear();
      bar(turning());
      if (!turning()) return;
      var next = (index + 1) % ids.length;
      t.at(STEP - TAP, function () { tap(next); });
      t.at(STEP, function () { show(next); step(); });
    }
    function pick(i) {
      show(i);
      step();
    }

    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { pick(i); });
      b.addEventListener("keydown", function (e) {
        var n = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        if (n < 0) return;
        e.preventDefault();
        pick(n);
        tabs[n].focus();
      });
    });
    // The picker's rows on the phone pick their segment too (a pointer shortcut: the tabs are the
    // control for the keyboard and screen readers, the phone stays aria-hidden).
    rows.forEach(function (r) {
      var i = ids.indexOf(r.getAttribute("data-multi-row"));
      if (i < 0) return;
      r.addEventListener("click", function () { tap(i); pick(i); });
    });
    // The mouse on the text, or on the picker's list, holds the segment until it leaves.
    var list = texts.length && texts[0].parentNode;
    var pickerList = rows[0].parentNode;
    var over = 0;
    [list, pickerList].forEach(function (el) {
      if (!el) return;
      el.addEventListener("pointerenter", function (e) {
        if (e.pointerType !== "mouse") return;
        over++; hovered = true; step();
      });
      el.addEventListener("pointerleave", function (e) {
        if (e.pointerType !== "mouse" || !over) return;
        over--; hovered = over > 0;
        if (!hovered) step();
      });
    });

    function setPaused(value) {
      paused = value;
      root.classList.toggle("is-paused", paused);
      if (pause) {
        pause.setAttribute("aria-pressed", String(paused));
        pause.setAttribute("aria-label", paused ? "Riprendi il cambio automatico dei clienti" : "Metti in pausa il cambio automatico dei clienti");
      }
      step();
    }
    if (pause && !still) {
      pause.hidden = false;
      pause.addEventListener("click", function () { setPaused(!paused); });
    }

    function fromHash() {
      var i = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
      if (i < 0) return;
      show(i);
      if (!still) setPaused(true);
    }
    window.addEventListener("hashchange", fromHash);

    // Lit in the markup (no JavaScript, reduced motion); dark until the chapter shows, so the
    // first property lights up in front of the reader, and again every time it comes back.
    root.classList.add("is-live");
    show(0);
    fromHash();
    if (still) { light(index); bar(false); return; }
    whileOnScreen(root, function () {
      running = true;
      show(index);
      step();
    }, function () {
      running = false;
      t.clear();
      rows.forEach(function (r) { r.classList.remove("is-tap"); });
      if (!paused) index = 0;
      show(index);
      bar(false);
    });
  }

  function retro(root) {
    if (still) return;
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
