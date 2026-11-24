/*
 * PREVIEW ONLY (/anteprima-funzioni/): interactions of the five candidate designs of the
 * "Funzioni" section. Scenes follow feature-fx.js: data-fx-on tokens are added to the
 * sprite's data-layers when its card is on, data-fx-then after data-fx-wait frames,
 * data-fx-off on the way out.
 */
(function () {
  "use strict";

  var FPS = 24;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function parse(attr) { return (attr || "").split(/\s+/).filter(Boolean); }

  function edit(sprite, remove, add) {
    var tokens = parse(sprite.getAttribute("data-layers")).filter(function (t) { return remove.indexOf(t) === -1; });
    add.forEach(function (t) { if (tokens.indexOf(t) === -1) tokens.push(t); });
    sprite.setAttribute("data-layers", tokens.join(" "));
  }

  // One device scene (FxScene.astro) inside a [data-fx-card].
  function Scene(box) {
    this.box = box;
    this.card = box.closest("[data-fx-card]") || box;
    this.sprite = box.querySelector(".sprite");
    this.on = parse(box.getAttribute("data-fx-on"));
    this.then = parse(box.getAttribute("data-fx-then"));
    this.off = parse(box.getAttribute("data-fx-off"));
    this.wait = parseInt(box.getAttribute("data-fx-wait") || "0", 10) * 1000 / FPS;
    this.active = false;
    this.timer = 0;
    this.thenStarted = false;
  }
  Scene.prototype.set = function (on) {
    if (on === this.active || !this.sprite) return;
    this.active = on;
    var self = this;
    this.card.classList.toggle("is-on", on);
    this.card.classList.toggle("flink--on", on); // lights the thermostat's seam (feature-links.css)
    if (on) {
      edit(this.sprite, this.off, this.on);
      if (this.then.length) {
        this.timer = setTimeout(function () {
          self.timer = 0; self.thenStarted = true;
          edit(self.sprite, self.off, self.then);
        }, this.wait);
      }
    } else {
      if (this.timer) { clearTimeout(this.timer); this.timer = 0; }
      edit(this.sprite, this.on.concat(this.then), this.thenStarted ? this.off : []);
      this.thenStarted = false;
    }
  };

  function sceneOf(el) {
    var box = el.querySelector(".pfx");
    if (!box) return null;
    if (!box._scene) box._scene = new Scene(box);
    return box._scene;
  }

  // Calls cb(true) while the pointer or keyboard focus is on el.
  function onHover(el, cb) {
    var hovered = false, focused = false;
    function update() { cb(hovered || focused); }
    el.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") { hovered = true; update(); } });
    el.addEventListener("pointerleave", function () { hovered = false; update(); });
    el.addEventListener("focus", function () { focused = el.matches(":focus-visible"); update(); });
    el.addEventListener("blur", function () { focused = false; update(); });
  }

  function whenVisible(el, cb) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting); });
    }, { threshold: 0.35 });
    io.observe(el);
  }

  // Tabs with hover/focus/click selection, arrow keys, and an automatic tour while on
  // screen that stops for good at the first interaction.
  function tabs(root, tabSel, panelSel, onSelect, period) {
    var list = Array.prototype.slice.call(root.querySelectorAll(tabSel));
    var panels = Array.prototype.slice.call(root.querySelectorAll(panelSel));
    var current = -1, touched = false, timer = 0, visible = false;

    function select(i, focus) {
      if (i === current) return;
      var prev = current;
      current = i;
      list.forEach(function (t, k) {
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach(function (p, k) {
        p.classList.toggle("is-active", k === i);
        if (k === i) p.removeAttribute("inert"); else p.setAttribute("inert", "");
      });
      if (focus) list[i].focus();
      onSelect(i, prev);
    }
    function stop() { touched = true; if (timer) { clearInterval(timer); timer = 0; } }
    function tick() { select((current + 1) % list.length); }
    list.forEach(function (t, i) {
      t.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") { stop(); select(i); } });
      t.addEventListener("click", function () { stop(); select(i); });
      t.addEventListener("focus", function () { if (t.matches(":focus-visible")) { stop(); select(i); } });
      t.addEventListener("keydown", function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === "Home") d = -current; else if (e.key === "End") d = list.length - 1 - current;
        if (d === undefined) return;
        e.preventDefault(); stop();
        select((current + d + list.length) % list.length, true);
      });
    });
    whenVisible(root, function (v) {
      visible = v;
      if (current === -1 && v) select(0);
      if (reduced || touched) return;
      if (v && !timer) timer = setInterval(tick, period);
      if (!v && timer) { clearInterval(timer); timer = 0; }
    });
  }

  function init() {
    // 1 · List + stage
    var pv1 = document.querySelector("[data-pv1]");
    if (pv1) {
      var panels1 = pv1.querySelectorAll(".pv1__panel");
      tabs(pv1, ".pv1__tab", ".pv1__panel", function (i, prev) {
        if (prev >= 0) { var p = sceneOf(panels1[prev]); if (p) p.set(false); }
        var s = sceneOf(panels1[i]); if (s) s.set(true);
      }, 3600);
    }

    // 2, 3 · cards on while hovered or focused
    Array.prototype.forEach.call(document.querySelectorAll("[data-fx-hover]"), function (card) {
      var s = sceneOf(card);
      if (!s) return;
      onHover(card, function (on) { if (!card._wave) s.set(on); else if (on) s.set(true); card._hover = on; });
    });

    // 3 · the floating render follows the pointer along the row
    Array.prototype.forEach.call(document.querySelectorAll(".pv3__row"), function (row) {
      row.addEventListener("pointermove", function (e) {
        var r = row.getBoundingClientRect();
        var x = Math.min(Math.max(e.clientX - r.left, r.width * 0.3), r.width * 0.85);
        row.style.setProperty("--px", x + "px");
      });
    });

    // 4 · interactive house
    var pv4 = document.querySelector("[data-pv4]");
    if (pv4) {
      var house = pv4.querySelector(".sprite");
      var rest = parse(pv4.getAttribute("data-pv4-rest"));
      var tags4 = pv4.querySelectorAll(".pv4__tag");
      tabs(pv4, ".pv4__tag", ".pv4__panel", function (i) {
        var t = tags4[i];
        var off = parse(t.getAttribute("data-off"));
        var tokens = rest.filter(function (x) { return off.indexOf(x) === -1; }).concat(parse(t.getAttribute("data-on")));
        house.setAttribute("data-layers", tokens.join(" "));
      }, 4200);
    }

    // 5 · a slow wave: two scenes on at a time while the grid is on screen; hover wins
    var pv5 = document.querySelector("[data-pv5]");
    if (pv5) {
      var cards5 = Array.prototype.slice.call(pv5.querySelectorAll(".pv5__card"));
      cards5.forEach(function (c) { c._wave = true; });
      var k = 0, wtimer = 0;
      function step() {
        var on = [k % cards5.length, (k + 1) % cards5.length];
        cards5.forEach(function (c, i) { var s = sceneOf(c); if (s) s.set(on.indexOf(i) !== -1 || !!c._hover); });
        k += 1;
      }
      whenVisible(pv5, function (v) {
        if (reduced) { if (v) cards5.forEach(function (c) { var s = sceneOf(c); if (s) s.set(true); }); return; }
        if (v && !wtimer) { step(); wtimer = setInterval(step, 2200); }
        if (!v && wtimer) { clearInterval(wtimer); wtimer = 0; }
      });
      cards5.forEach(function (c) {
        c.addEventListener("pointerleave", function () { c._hover = false; });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
