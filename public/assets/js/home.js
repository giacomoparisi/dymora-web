(function () {
  "use strict";
  var root = document.documentElement;

  /* Tempi in U: 1 U = 1% dell'altezza del viewport. Corsa 470 U, traccia 570 U. */
  var TOTAL = 470;
  var T = {
    sheet: 130,
    link: [104, 134], linkStep: 4,
    hub: 146,
    feed: [146, 172],
    act: [186, 232, 278],
    w: { arrows: 312, step: 12, len: 24, title: 312, end: 424 },
    n: { act: [186, 240, 294], slide: [[208, 228], [262, 282]], out: [316, 336], arrows: 336, step: 8, len: 16, title: 330, symEnd: 410, back: [414, 434], end: 434 },
    ask: 112, easy: 178
  };
  var TAU_FINE = 170, TAU_TOUCH = 90, MAX_LAG = 36;
  var WIDE = 1180;

  var frame = document.querySelector(".frame");
  var open = document.querySelector(".open");
  var pin = open.querySelector(".pin");
  var st = open.querySelector(".st");
  var s1 = open.querySelector(".s1");
  var svgIn = open.querySelector(".ln-in");
  var svgOut = open.querySelector(".ln-out");
  var house = open.querySelector(".house");
  var hub = open.querySelector(".hub");
  var devsBox = open.querySelector(".devs");
  var devs = Array.prototype.slice.call(open.querySelectorAll(".dev"));
  var syms = Array.prototype.slice.call(open.querySelectorAll(".sy")).sort(function (a, b) { return a.getAttribute("data-o") - b.getAttribute("data-o"); });
  var frasi = Array.prototype.slice.call(open.querySelectorAll(".frase"));
  var pager = Array.prototype.slice.call(open.querySelectorAll(".pager i"));
  var dock = document.querySelector(".dock");
  var NS = "http://www.w3.org/2000/svg";

  /* Runtime values live in the external stylesheet's CSSOM. This keeps the
     animation compatible with the site's strict style-src CSP: element.style
     would create a blocked inline style attribute. */
  function findRule(selector) {
    function scan(rules) {
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.selectorText === selector) return rule;
        if (rule.cssRules) { var nested = scan(rule.cssRules); if (nested) return nested; }
      }
      return null;
    }
    for (var i = 0; i < document.styleSheets.length; i++) {
      try { var found = scan(document.styleSheets[i].cssRules); if (found) return found; }
      catch (_) { /* Cross-origin sheets are forbidden, but skip defensively. */ }
    }
    return null;
  }
  var openRule = findRule(".open");
  var pinRule = findRule(".pin");
  function openValue(name, value) { if (openRule) openRule.style.setProperty(name, value); }
  function pinValue(name, value) { if (pinRule) pinRule.style.setProperty(name, value); }
  function pinReset(name) { if (pinRule) pinRule.style.removeProperty(name); }

  var live = false, wide = false, H = 0, sheetH = 0, tgt = 0, cur = 0, raf = 0, last = 0;
  var tau = matchMedia("(pointer: coarse)").matches ? TAU_TOUCH : TAU_FINE;
  var cables = [], feed = null, leaders = [], headIn = null, centers = [0, 0, 0];
  var wasFrase = -2, wasHub = null, wasMoving = null, wasDone = null, wasPlay = null, wasSym = null, wasAct = [null, null, null], wasPage = -1;

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var prog = function (u, a, b) { return clamp((u - a) / (b - a), 0, 1); };
  var outQuart = function (t) { return 1 - Math.pow(1 - t, 4); };
  var inOutCubic = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* Il foglio: a 1:1 con lo scroll per 70 U, poi frena a decelerazione costante per 60 U. Fa 100 U di strada. */
  function sheet(u) {
    if (u <= 70) return u;
    if (u >= T.sheet) return 100;
    var x = u - 70;
    return 70 + x - x * x / 120;
  }

  function reduced() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function canLive() { return !reduced() && innerHeight >= 600; }

  /* ---------- La casa: gli strati dell'app su un solo canvas, HouseArt dal basso verso l'alto. ---------- */

  /* Scena 717×484, geometria da HouseSprites.kt. SpriteFps è 24, non 12 (SpritePlayback.kt). */
  var VARIANT = "_light", FRAME_MS = 1000 / 24;
  var LIT_LEVELS = [0, .45, .65, .75, .83, .9, .93, .95, .98, 1, 1, 1];
  function sheetOf(name, frames, cols, w, h, x, y) { return { name: name, f: frames, c: cols, w: w, h: h, x: x, y: y, img: null, p: null }; }
  var S = {
    still: sheetOf("still", 1, 1, 717, 484, 0, 0),
    lit: sheetOf("lit_off", 1, 1, 595, 272, 72, 138),
    balustrade: sheetOf("balustrade_off", 1, 1, 249, 88, 344, 177),
    door: sheetOf("door_led_off", 4, 3, 43, 69, 522, 231),
    waterOn: sheetOf("irrigation_on_off", 18, 3, 251, 159, 123, 232),
    waterRun: sheetOf("irrigation_run_off", 12, 3, 251, 160, 123, 231),
    camLOn: sheetOf("camera_left_on_off", 12, 4, 103, 130, 156, 165),
    camLScan: sheetOf("camera_left_scan_off", 49, 6, 165, 135, 125, 165),
    camROn: sheetOf("camera_right_on_off", 12, 4, 94, 133, 396, 258),
    camRScan: sheetOf("camera_right_scan_off", 49, 7, 134, 134, 389, 258)
  };
  var SCAN_LAST = 48, SCAN_CENTRE = 24;

  /* Come LazySpriteImage: un foglio si scarica e si decodifica la prima volta che serve. */
  function need(s) {
    if (s.p) return s.p;
    s.p = new Promise(function (ok, no) {
      var im = new Image();
      im.onload = function () {
        var done = function () { s.img = im; ok(im); };
        if (im.decode) im.decode().then(done, done); else done();
      };
      im.onerror = no;
      im.src = "/assets/house/device_house_" + s.name + VARIANT + ".webp";
    });
    return s.p;
  }
  function needBase() { return Promise.all([S.still, S.lit, S.balustrade, S.door, S.camLOn, S.camROn].map(need)).then(function () { dirty = true; kick(); }); }

  var cv = house.querySelector("canvas");
  var ctx = cv.getContext("2d");
  var dirty = true, shown = true, animRaf = 0;

  function blit(s, frame, alpha) {
    if (!s.img) return;
    var i = clamp(frame, 0, s.f - 1);
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.drawImage(s.img, (i % s.c) * s.w, Math.floor(i / s.c) * s.h, s.w, s.h, s.x, s.y, s.w, s.h);
    ctx.globalAlpha = 1;
  }

  /* Un clip: da from a to, a tempo, tenuto sull'ultimo fotogramma finché il prossimo non parte. Come SpritePlayback. */
  function play(l, clip, from, to, then) {
    l.clip = clip; l.from = from; l.to = to; l.dir = to >= from ? 1 : -1; l.count = (to - from) * l.dir + 1;
    l.t0 = performance.now(); l.frame = from; l.run = true; l.then = then; dirty = true; kick();
  }
  function stop(l) { l.clip = null; l.run = false; dirty = true; }

  /* HouseLights */
  var lights = { id: "lights", want: false, lit: false, clip: null, frame: 0, run: false };
  lights.step = function () {
    if (lights.lit === lights.want) return;
    var n = LIT_LEVELS.length - 1;
    play(lights, "fade", lights.want ? 0 : n, lights.want ? n : 0, function () { lights.lit = lights.to === n; stop(lights); lights.step(); });
  };
  function litLevel() { return lights.clip ? LIT_LEVELS[lights.frame] : lights.lit ? 1 : 0; }

  /* HouseIrrigation */
  var water = { id: "water", want: false, on: false, clip: null, frame: 0, run: false, wait: false };
  water.step = function () {
    if (water.wait || water.run) return;
    if (!S.waterOn.img || !S.waterRun.img) {
      if (!water.want && !water.on) return;
      water.wait = true;
      Promise.all([need(S.waterOn), need(S.waterRun)]).then(function () { water.wait = false; water.step(); });
      return;
    }
    if (water.want && !water.on) play(water, S.waterOn, 0, S.waterOn.f - 1, function () { water.on = true; water.step(); });
    else if (water.want) { if (shown) play(water, S.waterRun, 0, S.waterRun.f - 1, water.step); else water.run = false; }
    else if (water.on) play(water, S.waterOn, S.waterOn.f - 1, 0, function () { water.on = false; stop(water); });
  };

  /* HouseCamera, due in controfase */
  function camera(on, scan, sweep) {
    var c = { on: on, scan: scan, sweep: sweep, want: false, pose: false, position: SCAN_CENTRE, dirn: sweep, clip: null, frame: 0, run: false, wait: false };
    c.step = function () {
      if (c.wait || c.run) return;
      if (!scan.img || !on.img) {
        if (!c.want && !c.pose) return;
        c.wait = true;
        Promise.all([need(on), need(scan)]).then(function () { c.wait = false; c.step(); });
        return;
      }
      if (c.want && !c.pose) {
        play(c, on, 0, on.f - 1, function () { c.pose = true; c.position = SCAN_CENTRE; c.dirn = sweep; c.step(); });
      } else if (c.pose && (c.want || c.position !== SCAN_CENTRE)) {
        if (!shown) { c.run = false; return; }
        var end = c.dirn > 0 ? (c.position < SCAN_CENTRE ? SCAN_CENTRE : SCAN_LAST) : (c.position > SCAN_CENTRE ? SCAN_CENTRE : 0);
        play(c, scan, c.position + c.dirn, end, function () {
          c.position = end;
          if (end === 0 || end === SCAN_LAST) c.dirn = -c.dirn;
          c.step();
        });
      } else if (c.pose) {
        play(c, on, on.f - 1, 0, function () { c.pose = false; stop(c); });
      }
    };
    return c;
  }
  var camL = camera(S.camLOn, S.camLScan, 1), camR = camera(S.camROn, S.camRScan, -1);
  var layers = [lights, water, camL, camR];

  function drawWater() {
    if (water.clip) blit(water.clip, water.frame);
    else if (water.on) blit(S.waterRun, 0);
  }
  function drawCamera(c) {
    if (c.clip) blit(c.clip, c.frame);
    else if (c.pose) blit(c.scan, c.position);
    else blit(c.on, 0);
  }
  var litShown = -1;
  function paint() {
    if (!S.still.img) return;
    ctx.clearRect(0, 0, 717, 484);
    blit(S.still, 0);
    var lv = litLevel();
    if (lv > 0) blit(S.lit, 0, lv);
    blit(S.balustrade, 0);
    drawWater();
    drawCamera(camL);
    drawCamera(camR);
    blit(S.door, 0);
    if (lv !== litShown) { litShown = lv; openValue("--lit", lv.toFixed(2)); }
  }

  function anim(now) {
    animRaf = 0;
    var busy = false;
    layers.forEach(function (l) {
      if (!l.run) return;
      var i = Math.floor((now - l.t0) / FRAME_MS);
      if (i >= l.count) {
        l.frame = l.to; l.run = false; dirty = true;
        var then = l.then; l.then = null;
        if (then) then();
      } else {
        var f = l.from + i * l.dir;
        if (f !== l.frame) { l.frame = f; dirty = true; }
      }
      if (l.run) busy = true;
    });
    if (dirty) { dirty = false; paint(); }
    if (busy) kick();
  }
  function kick() { if (!animRaf) animRaf = requestAnimationFrame(anim); }

  /* Fuori vista i cicli si fermano alla fine del giro, e riprendono quando la scena torna. */
  function setShown(v) {
    if (v === shown) return;
    shown = v;
    if (v) { water.step(); camL.step(); camR.step(); }
  }

  function want(part, on) {
    if (part === "lights") { lights.want = on; if (!lights.run) lights.step(); }
    if (part === "water") { water.want = on; water.step(); }
    if (part === "cams") { camL.want = on; camR.want = on; camL.step(); camR.step(); }
  }
  /* Senza animazione: lo stato di riposo, subito. */
  function rest(part, on) {
    if (part === "lights") { lights.want = on; lights.lit = on; stop(lights); }
    if (part === "water") {
      water.want = on; water.on = on; stop(water);
      if (on) need(S.waterRun).then(function () { dirty = true; kick(); if (!reduced()) { need(S.waterOn).then(water.step); } });
    }
    if (part === "cams") {
      [camL, camR].forEach(function (c) {
        c.want = on; c.pose = on; c.position = SCAN_CENTRE; c.dirn = c.sweep; stop(c);
        if (on) need(c.scan).then(function () { dirty = true; kick(); if (!reduced()) c.step(); });
      });
    }
    dirty = true; kick();
  }

  /* ---------- I tre dispositivi ---------- */
  var PARTS = ["lights", "water", "cams"];
  var LABEL = { lights: ["Spente", "Accese"], water: ["Ferma", "Attiva"], cams: ["Chiuse", "Aperte"] };
  var state = { lights: false, water: false, cams: false };

  function mark(part, on) {
    state[part] = on;
    var d = devs[PARTS.indexOf(part)];
    d.setAttribute("aria-pressed", on ? "true" : "false");
    d.querySelector(".st8").textContent = LABEL[part][on ? 1 : 0];
  }

  var pulses = 0;
  /* La corrente: un punto sul cavo, dal dispositivo all'hub alla casa. */
  function pulse(i, then) {
    var a = cables[wide ? i : 0], b = feed;
    if (!a || !b) { then(); return; }
    var t0 = performance.now(), la = a.len, lb = b.len, total = wide ? 420 : 300, id = ++pulses;
    var share = la / (la + lb), kicked = false;
    headIn.setAttribute("opacity", "1");
    function go(now) {
      if (id !== pulses) return;
      var t = clamp((now - t0) / total, 0, 1), p;
      if (t < share) p = a.path.getPointAtLength(t / share * la);
      else {
        if (!kicked) { kicked = true; kickHub(); }
        p = b.path.getPointAtLength((t - share) / (1 - share) * lb);
      }
      headIn.setAttribute("cx", p.x.toFixed(1)); headIn.setAttribute("cy", p.y.toFixed(1));
      if (t < 1) requestAnimationFrame(go);
      else { headIn.setAttribute("opacity", "0"); then(); }
    }
    requestAnimationFrame(go);
  }
  function kickHub() { open.classList.add("hub-kick"); setTimeout(function () { open.classList.remove("hub-kick"); }, 380); }

  /* La sequenza: un'azione alla volta, anche se lo scroll corre più della scena. */
  var line = [], running = -1, timers = [];
  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  function clearGesture() {
    timers.forEach(clearTimeout); timers = [];
    devs.forEach(function (d) { d.classList.remove("g-in", "g-go", "g-press"); });
    pulses++;
    if (headIn) headIn.setAttribute("opacity", "0");
    running = -1;
  }
  function pump() {
    if (running >= 0 || !line.length) return;
    var i = line.shift(), part = PARTS[i], d = devs[i];
    running = i;
    /* Su telefono, se il suo dispositivo è già uscito resta solo la risposta della casa */
    if (!wide && page(cur) !== i) { mark(part, true); want(part, true); running = -1; pump(); return; }
    var walk = i === 1 ? 500 : 260;
    d.classList.add("g-in");
    later(function () { d.classList.add("g-go"); }, 30);
    later(function () {
      d.classList.add("g-press");
      mark(part, true);
      pulse(i, function () { want(part, true); later(function () { running = -1; pump(); }, 420); });
    }, walk);
    later(function () { d.classList.remove("g-press"); }, walk + 300);
    later(function () { d.classList.remove("g-in", "g-go"); }, walk + 560);
  }
  function scrollAct(i, on) {
    var part = PARTS[i];
    if (on) { line.push(i); pump(); return; }
    line = line.filter(function (x) { return x !== i; });
    if (running === i) clearGesture();
    mark(part, false);
    want(part, false);
    pump();
  }

  devs.forEach(function (d, i) {
    var part = PARTS[i];
    d.addEventListener("click", function () {
      if (live && !open.classList.contains("is-play")) return;
      var on = !state[part];
      mark(part, on);
      if (!wide) goPage(i);
      if (reduced()) { rest(part, on); return; }
      pulse(i, function () { want(part, state[part]); });
    });
    /* Tastiera: un dispositivo preso col Tab porta dove si può toccare */
    d.addEventListener("focusin", function () {
      var end = (wide ? T.w : T.n).end;
      if (live && cur < end) seek(end + 6);
      else if (!wide) goPage(i);
    });
  });

  /* ---------- Il palco: fili, frecce, carosello ---------- */
  function rel(el) {
    var r = el.getBoundingClientRect(), z = st.getBoundingClientRect();
    return { l: r.left - z.left, t: r.top - z.top, r: r.right - z.left, b: r.bottom - z.top, w: r.width, h: r.height, cx: r.left - z.left + r.width / 2, cy: r.top - z.top + r.height / 2 };
  }
  function el(name, cls, attrs, parent) {
    var e = document.createElementNS(NS, name);
    e.setAttribute("class", cls);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  function wire(d, cls, parent) {
    var ghost = cls === "wire" ? el("path", "ghost", { d: d }, parent) : null;
    var cs = cls === "lead" ? el("path", "case", { d: d, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, parent) : null;
    var path = el("path", cls, { d: d, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, parent);
    return { ghost: ghost, cs: cs, path: path, len: path.getTotalLength(), d: d, t: -1 };
  }
  function n(v) { return Math.round(v * 10) / 10; }
  function pt(p) { return n(p[0]) + " " + n(p[1]); }

  function build() {
    [svgIn, svgOut].forEach(function (s) { while (s.firstChild) s.removeChild(s.firstChild); });
    wide = frame.clientWidth >= WIDE;
    H = pin.clientHeight;
    sheetH = s1.offsetHeight;
    openValue("--dev-y", "0px");
    var zr = st.getBoundingClientRect();
    [svgIn, svgOut].forEach(function (s) { s.setAttribute("viewBox", "0 0 " + n(zr.width) + " " + n(zr.height)); });
    var hb = rel(house), hu = rel(hub);
    var at = function (x, y) { return [hb.l + hb.w * x / 717, hb.t + hb.h * y / 484]; };
    var hubAt = function (x, y) { return [hu.l + hu.w * x, hu.t + hu.h * y]; };
    var pads = devs.map(function (d) { return rel(d.querySelector(".pad")); });

    var tipLot = at(385, 445);
    if (wide) {
      cables = [
        wire("M" + pt([pads[0].cx, pads[0].cy]) + "L" + pt(hubAt(.96, .34)), "wire", svgIn),
        wire("M" + pt([pads[1].cx, pads[1].cy]) + "L" + pt(at(556, 362)) + "L" + pt(hubAt(.84, .16)), "wire", svgIn),
        wire("M" + pt([pads[2].cx, pads[2].cy]) + "L" + pt(hubAt(.06, .36)), "wire", svgIn)
      ];
      feed = wire("M" + pt(hubAt(.48, .06)) + "L" + pt(tipLot), "wire", svgIn);
    } else {
      var cx = hu.cx;
      var fy = pads[0].cy;
      cables = [wire("M" + pt([cx, fy]) + "L" + pt([cx, hu.b - 6]), "wire", svgIn)];
      feed = wire("M" + pt([cx, hu.t + 6]) + "L" + pt([cx, Math.min(tipLot[1], hu.t)]), "wire", svgIn);
    }
    headIn = el("circle", "head head--in", { r: 5, opacity: 0 }, svgIn);

    var cabs = syms.map(function (li) { return rel(li.parentNode); });
    var bottom = Math.max(cabs[0].b, cabs[1].b);
    leaders = syms.map(function (li, i) {
      var left = li.parentNode.classList.contains("cab--l");
      var c = cabs[i], b = rel(li), y = b.cy, d, e, tri;
      if (wide) {
        var tx = left ? c.r + 18 : c.l - 18, by = bottom - 7;
        var o = left ? at(27, 283) : at(690, 305);
        e = left ? c.r + 14 : c.l - 14;
        d = "M" + pt(o) + "L" + pt([tx, by]) + "L" + pt([tx, y]) + "L" + pt([e, y]);
        tri = left ? "M" + n(c.r + 4) + " " + n(y) + "l10 -5.5v11z" : "M" + n(c.l - 4) + " " + n(y) + "l-10 -5.5v11z";
      } else {
        var sx = hu.cx, sy = live ? Math.min(tipLot[1], hu.t) : Math.min(cabs[0].t, cabs[1].t) - 12;
        e = left ? c.r + 14 : c.l - 14;
        d = "M" + pt([sx, sy]) + "L" + pt([sx, y]) + "L" + pt([e, y]);
        tri = left ? "M" + n(c.r + 4) + " " + n(y) + "l10 -5.5v11z" : "M" + n(c.l - 4) + " " + n(y) + "l-10 -5.5v11z";
      }
      var w = wire(d, "lead", svgOut);
      w.li = li;
      w.tip = el("path", "tip", { d: tri, opacity: 0 }, svgOut);
      return w;
    });
    leaders.bases = wide ? [cabs[0].r + 18, cabs[1].l - 18].map(function (x) { return el("ellipse", "base", { cx: n(x), cy: n(bottom - 7), rx: 9, ry: 3 }, svgOut); }) : [];
    leaders.head = el("circle", "head", { r: 4, opacity: 0 }, svgOut);

    if (!wide) {
      var bx = devsBox.getBoundingClientRect();
      centers = devs.map(function (d) {
        var r = d.getBoundingClientRect();
        return devsBox.scrollLeft + r.left + r.width / 2 - bx.left - bx.width / 2;
      });
    }
  }

  function draw(w, t) {
    if (w.t === t) return;
    w.t = t;
    var o = (1 - t).toFixed(4), vis = t > 0 ? "visible" : "hidden";
    w.path.setAttribute("stroke-dashoffset", o);
    w.path.setAttribute("visibility", vis);
    if (w.cs) { w.cs.setAttribute("stroke-dashoffset", o); w.cs.setAttribute("visibility", vis); }
  }

  /* Su telefono, quale dispositivo sta sul pavimento a quest'altezza della corsa: 0, 1, 2 con le mezze vie. */
  function slot(u) {
    var L = T.n;
    if (u >= L.out[1]) return 0;
    return inOutCubic(prog(u, L.slide[0][0], L.slide[0][1])) + inOutCubic(prog(u, L.slide[1][0], L.slide[1][1]));
  }
  function page(u) { return Math.round(slot(u)); }
  function scrollTo2(pos) {
    var a = Math.floor(pos), b = Math.min(a + 1, 2);
    devsBox.scrollLeft = centers[a] + (centers[b] - centers[a]) * (pos - a);
  }
  function goPage(i) {
    devsBox.scrollTo({ left: centers[i], behavior: reduced() ? "auto" : "smooth" });
    setPage(i);
  }
  function setPage(i) {
    if (i === wasPage) return;
    wasPage = i;
    pager.forEach(function (p, k) { p.classList.toggle("on", k === i); });
  }

  var preBase = false, preWater = false, preScan = false;
  function render(u) {
    var L = wide ? T.w : T.n, act = wide ? T.act : T.n.act, end = L.end;
    var y = -sheet(u) / 100 * sheetH;
    pinValue("--y", y.toFixed(1) + "px");
    pinValue("--rail", (u / TOTAL).toFixed(4));

    if (!preBase && u > 1) { preBase = true; needBase(); }
    if (!preWater && u > act[1] - 60) { preWater = true; need(S.waterOn); need(S.waterRun); }
    if (!preScan && u > act[2] - 60) { preScan = true; need(S.camLScan); need(S.camRScan); }

    var play_ = u >= end;
    if (play_ !== wasPlay) { wasPlay = play_; open.classList.toggle("is-play", play_); }
    var sym = u >= L.title;
    if (sym !== wasSym) { wasSym = sym; open.classList.toggle("is-sym", sym); }

    if (!wide) {
      var a = inOutCubic(prog(u, L.out[0], L.out[1])), b = inOutCubic(prog(u, L.back[0], L.back[1]));
      var dv = 1 - a + b, ca = a - b;
      openValue("--dev-a", dv.toFixed(3));
      openValue("--cab-a", ca.toFixed(3));
      openValue("--dev-y", ((1 - dv) * 28).toFixed(1) + "px");
      if (!play_) { var pos = slot(u); scrollTo2(pos); setPage(Math.round(pos)); }
    }

    var moving = u > 2;
    if (moving !== wasMoving) { wasMoving = moving; open.classList.toggle("is-moving", moving); }
    var done = u >= end + 8;
    if (done !== wasDone) { wasDone = done; open.classList.toggle("is-done", done); }

    cables.forEach(function (c, i) {
      var s = T.link[0] + i * T.linkStep, e = T.link[1] + i * T.linkStep;
      draw(c, inOutCubic(prog(u, s, e)));
      if (c.ghost) c.ghost.setAttribute("opacity", u > 70 ? "1" : "0");
    });
    devs.forEach(function (d, i) {
      var on = wide ? u >= T.link[0] + i * T.linkStep
                    : i === 0 ? u >= T.link[0] : u >= L.slide[i - 1][0] - 4 || u >= L.out[1];
      if (d._on !== on) { d._on = on; d.classList.toggle("on", on); }
    });
    draw(feed, inOutCubic(prog(u, T.feed[0], T.feed[1])));
    feed.ghost.setAttribute("opacity", u > 70 ? "1" : "0");

    var hubOn = u >= T.hub;
    if (hubOn !== wasHub) {
      if (wasHub !== null && hubOn) kickHub();
      wasHub = hubOn;
      open.classList.toggle("hub-on", hubOn);
    }

    /* Le tre azioni: scattano a soglia, nei due sensi */
    act.forEach(function (s, i) {
      var past = u >= s;
      if (wasAct[i] === null) {
        wasAct[i] = past;
        if (state[PARTS[i]] !== past) { mark(PARTS[i], past); rest(PARTS[i], past); }
      } else if (past !== wasAct[i]) { wasAct[i] = past; scrollAct(i, past); }
    });

    /* Otto frecce, una alla volta */
    var head = -1;
    leaders.forEach(function (w, i) {
      var s = L.arrows + i * L.step;
      var t = outQuart(prog(u, s, s + L.len));
      draw(w, t);
      w.tip.setAttribute("opacity", t >= .96 ? "1" : "0");
      if (t > 0 && t < .96) head = i;
      w.li.classList.toggle("on", t >= .96);
    });
    leaders.bases.forEach(function (b) { b.setAttribute("visibility", u >= L.arrows ? "visible" : "hidden"); });
    if (head >= 0) {
      var w = leaders[head], p = w.path.getPointAtLength(w.t * w.len);
      leaders.head.setAttribute("cx", p.x.toFixed(1)); leaders.head.setAttribute("cy", p.y.toFixed(1));
      leaders.head.setAttribute("opacity", "1");
    } else leaders.head.setAttribute("opacity", "0");

    var fi = -1;
    [T.ask, T.easy, L.title].forEach(function (s, i) { if (u >= s) fi = i; });
    if (fi !== wasFrase) {
      wasFrase = fi;
      frasi.forEach(function (p, i) { p.classList.toggle("on", i === fi); p.classList.toggle("past", i < fi); });
    }
  }

  function target() {
    var r = open.getBoundingClientRect();
    var total = r.height - H;
    return total > 0 ? clamp(-r.top / total, 0, 1) * TOTAL : 0;
  }
  function tick(now) {
    var dt = Math.min(now - last, 50);
    last = now;
    cur += (tgt - cur) * (1 - Math.exp(-dt / tau));
    if (tgt - cur > MAX_LAG) cur = tgt - MAX_LAG;
    if (cur - tgt > MAX_LAG) cur = tgt + MAX_LAG;
    if (Math.abs(tgt - cur) < .04) cur = tgt;
    render(cur);
    raf = cur === tgt ? 0 : requestAnimationFrame(tick);
  }
  function onScroll() {
    if (dock) dock.classList.toggle("on", open.getBoundingClientRect().bottom < innerHeight * .5);
    if (!live) return;
    tgt = target();
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  /* Senza sequenza: la scena finale, ferma. Gli strati si decodificano quando la scena si avvicina. */
  function settle() {
    clearGesture(); line = [];
    open.classList.add("is-play", "is-sym", "hub-on");
    open.classList.remove("is-moving", "is-done");
    openValue("--dev-a", "1"); openValue("--cab-a", "1"); openValue("--dev-y", "0px");
    pinReset("--y");
    devs.forEach(function (d) { d._on = true; d.classList.add("on"); });
    syms.forEach(function (li) { li.classList.add("on"); });
    cables.concat([feed]).forEach(function (w) { draw(w, 1); if (w.ghost) w.ghost.setAttribute("opacity", "1"); });
    leaders.forEach(function (w) { draw(w, 1); w.tip.setAttribute("opacity", "1"); });
    leaders.bases.forEach(function (b) { b.setAttribute("visibility", "visible"); });
    frasi.forEach(function (p, i) { p.classList.toggle("on", i === frasi.length - 1); p.classList.remove("past"); });
    if (!wide) { devsBox.scrollLeft = centers[0]; setPage(0); }
    wasAct = [true, true, true];
  }
  var nearDone = false;
  function whenNear(first) {
    if (nearDone) { PARTS.forEach(function (p) { rest(p, state[p]); }); return; }
    if (!("IntersectionObserver" in window)) { nearDone = true; needBase(); first(); return; }
    var io2 = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      io2.disconnect(); nearDone = true; needBase(); first();
    }, { rootMargin: "60% 0px" });
    io2.observe(house);
  }

  function mode() {
    var want_ = canLive(), wasLive = live;
    live = want_;
    open.classList.toggle("live", live);
    if (live) open.classList.remove("hub-on");
    wasFrase = -2; wasHub = null; wasMoving = null; wasDone = null; wasPlay = null; wasSym = null; wasPage = -1;
    devs.forEach(function (d) { d._on = undefined; });
    build();
    if (live) {
      if (!wasLive) wasAct = [null, null, null];
      tgt = cur = target(); render(cur);
    } else {
      settle();
      var first = !nearDone;
      whenNear(function () { PARTS.forEach(function (p) { mark(p, true); rest(p, true); }); });
      if (first) PARTS.forEach(function (p) { mark(p, true); });
    }
  }

  /* Tastiera: un simbolo preso col Tab porta dove si vede */
  syms.forEach(function (li) {
    li.addEventListener("focusin", function () {
      if (!live) return;
      if (wide) { if (cur < T.w.end) seek(T.w.end + 6); }
      else if (cur < T.n.symEnd || cur >= T.n.back[0]) seek(T.n.symEnd);
    });
  });

  devsBox.addEventListener("scroll", function () {
    if (wide || !open.classList.contains("is-play")) return;
    var best = 0, bd = 1e9;
    centers.forEach(function (c, i) { var d = Math.abs(devsBox.scrollLeft - c); if (d < bd) { bd = d; best = i; } });
    setPage(best);
  }, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if (!reduced() && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { setShown(es[es.length - 1].isIntersecting); }).observe(house);
  }

  /* Solo la larghezza ricostruisce: la barra del browser su telefono non deve rifare i cavi */
  var rt = 0, lastW = 0;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (frame.clientWidth === lastW && live === canLive() && Math.abs(pin.clientHeight - H) < 2) { onScroll(); return; }
      lastW = frame.clientWidth;
      mode();
    }, 160);
  }

  function seek(u) {
    if (!live) return;
    var r = open.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + (r.height - H) * clamp(u / TOTAL, 0, 1));
    /* Un salto non recita: la casa è già nello stato di quel punto */
    clearGesture(); line = []; wasAct = [null, null, null];
    tgt = cur = u; render(cur);
  }
  function start() {
    lastW = frame.clientWidth;
    mode();
    if (live) { open.classList.add("boot"); setTimeout(function () { open.classList.remove("boot"); }, 1200); }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function () { mode(); onScroll(); });
    onScroll();
  }
  if (document.readyState === "complete") start(); else addEventListener("load", start);
})();
