/*
 * Sprite player for the device scenes exported from dymora-app
 * (scripts/sync-app-assets.py → /assets/sprites/<name>.json + sheets).
 *
 * Same model as the app runtime (dymora-app docs/ANIMATIONS.md §7): one canvas
 * per scene, the still at the bottom, patches drawn at their offset on top, frame
 * i = cell (i % columns, i / columns), 24 fps, a clip that ends holds its last frame.
 *
 * Markup (rendered by src/components/Sprite.astro):
 *   <div class="sprite" data-sprite="heat_pump" data-variant="dark"
 *        data-layers="start_base>running_base">
 *     <img src="…still…">  <canvas width height></canvas>
 *   </div>
 *
 * data-layers is a space-separated list, drawn in order:
 *   sheet        a still patch, or a loop when the sheet has more than one frame
 *   sheet!       plays once and holds the last frame
 *   a>b          plays a once, then b (looping if b has frames)
 *   a>b~N        as a>b, but b loops ping-pong (forward then reversed) entering at
 *                frame N (0-based, default 0); ~-N enters at N going backwards.
 *                Removed, it runs on to its next pass through N, then a reversed.
 * Removing a `sheet!` or `a>b` token plays its first clip backwards before it goes:
 * the part switches off the way it switched on. A loop just stops.
 *
 * data-order (optional) lists sheets in paint order, bottom to top.
 * data-play (optional): the starting layers play in once the scene is on screen,
 * instead of starting at rest.
 *
 * Buttons with data-sprite-target="<id>" and data-sprite-layer="<token> [token…]"
 * toggle those tokens on the target and keep aria-pressed in step.
 *
 * Sheets load when the scene comes near the viewport; the clock runs only while it
 * is visible. With prefers-reduced-motion every layer shows its end state at once.
 */
(function () {
  "use strict";

  var FPS = 24;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var manifests = {};

  function manifest(name) {
    if (!manifests[name]) {
      manifests[name] = fetch("/assets/sprites/" + name + ".json").then(function (r) {
        if (!r.ok) throw new Error("sprite manifest " + name + ": " + r.status);
        return r.json();
      });
    }
    return manifests[name];
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.decoding = "async";
      im.onload = function () { resolve(im); };
      im.onerror = function () { reject(new Error("sprite sheet " + src)); };
      im.src = src;
    });
  }

  function parse(attr) {
    return (attr || "").split(/\s+/).filter(Boolean);
  }

  function Scene(el) {
    this.el = el;
    this.canvas = el.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.name = el.getAttribute("data-sprite");
    this.variant = el.getAttribute("data-variant") || "light";
    this.spec = null;
    this.images = {};
    this.layers = [];      // { token, seq: [sheet…], once, step, t0, reverse, gone }
    this.clock = 0;        // ms, advances only while visible
    this.visible = false;
    this.loading = null;
  }

  Scene.prototype.load = function () {
    var self = this;
    if (this.loading) return this.loading;
    this.loading = manifest(this.name).then(function (spec) {
      self.spec = spec;
      var files = spec.variants[self.variant] || spec.variants[Object.keys(spec.variants)[0]];
      self.files = files;
      var wanted = { still: true };
      parse(self.el.getAttribute("data-layers")).forEach(function (t) {
        self.sheetsOf(t).forEach(function (s) { wanted[s] = true; });
      });
      return Promise.all(Object.keys(wanted).map(function (s) { return self.image(s); }));
    }).then(function () {
      // data-play: the starting layers play in when the scene shows; otherwise they start at rest.
      self.sync(!self.el.hasAttribute("data-play"));
      self.el.classList.add("is-live");
      self.draw();
    }).catch(function (e) {
      // The still <img> stays: the scene is just not animated.
      if (window.console) console.warn(e);
    });
    return this.loading;
  };

  Scene.prototype.image = function (sheet) {
    var self = this;
    if (this.images[sheet]) return this.images[sheet].ready;
    var src = this.files[sheet];
    if (!src) return Promise.reject(new Error(this.name + ": no sheet " + sheet));
    var entry = { img: null, ready: null };
    entry.ready = loadImage(src).then(function (im) { entry.img = im; return im; });
    this.images[sheet] = entry;
    return entry.ready;
  };

  Scene.prototype.sheetsOf = function (token) {
    return token.replace(/!$/, "").replace(/~-?\d*$/, "").split(">");
  };

  /* `~N` / `~-N` at the end of a token: the last sheet loops ping-pong. */
  function bounceOf(token) {
    var m = /~(-?)(\d*)$/.exec(token);
    return m ? { at: parseInt(m[2] || "0", 10), back: m[1] === "-" } : null;
  }

  /* Position in the ping-pong cycle (0 … 2n-3) of frame f counted from the loop's start. */
  function bouncePos(b, n, f) {
    var p = Math.max(1, 2 * n - 2);
    var off = b.back && b.at > 0 ? p - b.at : b.at;
    return (f + off) % p;
  }

  Scene.prototype.frames = function (sheet) {
    return this.spec.sheets[sheet] ? this.spec.sheets[sheet].frames : 1;
  };

  /* Reconcile the layer list with data-layers. `instant` skips the clips in. */
  Scene.prototype.sync = function (instant) {
    var self = this;
    var tokens = parse(this.el.getAttribute("data-layers"));
    var now = this.clock;
    var still = reduced.matches || instant;

    this.layers.forEach(function (l) {
      if (l.gone || tokens.indexOf(l.token) !== -1) return;
      var held = l.once || l.seq.length > 1;
      if (l.bounce && l.seq.length > 1 && l.step === l.seq.length - 1 && !reduced.matches && !l.pending) {
        // Ping-pong loop: run on to the next pass through the entry frame, where the first clip ends.
        var bn = self.frames(l.seq[l.step]);
        var p = Math.max(1, 2 * bn - 2);
        var fNow = Math.floor((now - l.t0) * FPS / 1000);
        var c = bouncePos(l.bounce, bn, fNow);
        var wait = p;
        [l.bounce.at, p - l.bounce.at].forEach(function (target) {
          var w = ((target % p) - c + p) % p;
          if (w < wait) wait = w;
        });
        l.exitAt = fNow + wait; l.gone = true;
      } else if (held && !reduced.matches && !l.pending) {
        // Still inside the first clip: turn back from the frame on screen, no jump.
        var n = self.frames(l.seq[0]);
        var back = 0;
        if (l.step === 0) back = n - 1 - Math.min(n - 1, Math.floor((now - l.t0) * FPS / 1000));
        l.seq = [l.seq[0]]; l.step = 0; l.reverse = true; l.t0 = now - back * 1000 / FPS; l.gone = true;
      } else {
        l.drop = true;
      }
    });
    this.layers = this.layers.filter(function (l) { return !l.drop; });

    tokens.forEach(function (t) {
      var existing = self.layers.filter(function (l) { return l.token === t; })[0];
      if (existing && !existing.gone) return;
      if (existing) self.layers.splice(self.layers.indexOf(existing), 1);
      var seq = self.sheetsOf(t);
      var layer = { token: t, seq: seq, once: /!$/.test(t), bounce: bounceOf(t), step: 0, t0: now, reverse: false, gone: false, pending: true };
      // A layer whose sheets are in flight joins when they arrive.
      Promise.all(seq.map(function (s) { return self.image(s); })).then(function () {
        layer.pending = false;
        layer.t0 = self.clock;
        if (still) self.settle(layer);
        self.kick();
      });
      // Keep the token order of the attribute.
      self.layers.push(layer);
    });
    // data-order fixes the paint order by sheet (the scene's draw order in the app);
    // without it, the order of the attribute. A layer going out keeps its place.
    var order = parse(this.el.getAttribute("data-order"));
    var rank = function (l) {
      var i = order.indexOf(l.seq[0]);
      if (i === -1) i = order.length + tokens.indexOf(l.token);
      return i;
    };
    this.layers.sort(function (a, b) { return rank(a) - rank(b); });
    this.kick();
  };

  /* Jump a layer to where it rests: last clip, last frame for a one-shot, first for a loop. */
  Scene.prototype.settle = function (l) {
    l.step = l.seq.length - 1;
    l.t0 = l.once ? this.clock - this.frames(l.seq[l.step]) * 1000 / FPS : this.clock;
  };

  /* Frame of a layer at the current clock, advancing its sequence. null = nothing to draw. */
  Scene.prototype.frameOf = function (l) {
    for (;;) {
      var sheet = l.seq[l.step];
      var n = this.frames(sheet);
      var f = Math.floor((this.clock - l.t0) * FPS / 1000);
      var last = l.step === l.seq.length - 1;
      if (l.reverse) {
        if (f >= n) { l.dead = true; return null; }
        return { sheet: sheet, i: n - 1 - f };
      }
      if (!last) {
        if (f < n) return { sheet: sheet, i: f };
        l.t0 += n * 1000 / FPS; l.step++;
        continue;
      }
      if (l.once || n === 1) return { sheet: sheet, i: Math.min(f, n - 1) };
      if (l.exitAt != null && f >= l.exitAt) {
        // Back at the entry frame: the first clip plays out backwards from there.
        l.t0 += l.exitAt * 1000 / FPS; l.exitAt = null;
        l.seq = [l.seq[0]]; l.step = 0; l.reverse = true;
        continue;
      }
      if (l.bounce) {
        var pos = bouncePos(l.bounce, n, f);
        return { sheet: sheet, i: pos < n ? pos : 2 * n - 2 - pos };
      }
      return { sheet: sheet, i: f % n };
    }
  };

  Scene.prototype.animating = function () {
    var self = this;
    return this.layers.some(function (l) {
      if (l.pending) return false;
      if (l.reverse) return true;
      var last = l.step === l.seq.length - 1;
      var n = self.frames(l.seq[l.step]);
      if (!last) return true;
      if (l.once) return (self.clock - l.t0) * FPS / 1000 < n;
      return n > 1;
    });
  };

  Scene.prototype.draw = function () {
    if (!this.spec) return;
    var ctx = this.ctx, spec = this.spec, self = this;
    var drawn = [];
    this.layers.forEach(function (l) {
      if (l.pending) return;
      var fr = self.frameOf(l);
      if (fr) drawn.push(fr);
    });
    this.layers = this.layers.filter(function (l) { return !l.dead; });

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // A clip as big as the scene replaces the still (a pose change), as in the app.
    var replaces = drawn.some(function (fr) {
      var s = spec.sheets[fr.sheet];
      return s.offset[0] === 0 && s.offset[1] === 0 && s.frame[0] === spec.scene[0] && s.frame[1] === spec.scene[1];
    });
    if (!replaces) this.cell("still", 0);
    drawn.forEach(function (fr) { self.cell(fr.sheet, fr.i); });
  };

  Scene.prototype.cell = function (sheet, i) {
    var entry = this.images[sheet];
    var s = this.spec.sheets[sheet];
    if (!entry || !entry.img || !s) return;
    var w = s.frame[0], h = s.frame[1];
    this.ctx.drawImage(entry.img, (i % s.columns) * w, Math.floor(i / s.columns) * h, w, h, s.offset[0], s.offset[1], w, h);
  };

  /* One rAF loop for every scene on the page. */
  var scenes = [], raf = 0, last = 0;

  Scene.prototype.kick = function () { start(); };

  function tick(now) {
    var dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    var more = false;
    scenes.forEach(function (s) {
      if (!s.spec) return;
      if (s.visible) s.clock += dt;
      if (s.visible || s.dirty) { s.draw(); s.dirty = false; }
      if (s.visible && s.animating()) more = true;
    });
    raf = more ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  }

  function start() {
    scenes.forEach(function (s) { s.dirty = true; });
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function init() {
    var els = document.querySelectorAll(".sprite[data-sprite]");
    if (!els.length || !window.fetch) return;

    var near = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.__scene.load(); near.unobserve(e.target); }
      });
    }, { rootMargin: "400px 0px" });

    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.__scene.visible = e.isIntersecting;
        if (e.isIntersecting) start();
      });
    });

    var changed = new MutationObserver(function (records) {
      records.forEach(function (r) {
        var s = r.target.__scene;
        if (s && s.spec) s.sync(false);
      });
    });

    Array.prototype.forEach.call(els, function (el) {
      var s = new Scene(el);
      el.__scene = s;
      scenes.push(s);
      near.observe(el);
      seen.observe(el);
      changed.observe(el, { attributes: true, attributeFilter: ["data-layers"] });
    });

    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest("[data-sprite-target][data-sprite-layer]");
      if (!btn) return;
      var target = document.getElementById(btn.getAttribute("data-sprite-target"));
      if (!target) return;
      var mine = parse(btn.getAttribute("data-sprite-layer"));
      var tokens = parse(target.getAttribute("data-layers"));
      var on = btn.getAttribute("aria-pressed") !== "true";
      tokens = tokens.filter(function (t) { return mine.indexOf(t) === -1; });
      if (on) tokens = tokens.concat(mine);
      target.setAttribute("data-layers", tokens.join(" "));
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
