(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- NAVBAR drawer ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  function isOpen(){ return drawer.classList.contains("open"); }
  function toggleMenu(open, returnFocus){
    nav.classList.toggle("open", open);
    drawer.classList.toggle("open", open);
    scrim.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    if(open){ var first = drawer.querySelector("a"); if(first) first.focus(); }
    else if(returnFocus){ burger.focus(); }
  }
  burger.addEventListener("click", function(){ toggleMenu(!isOpen(), true); });
  scrim.addEventListener("click", function(){ toggleMenu(false, true); });
  drawer.addEventListener("click", function(e){ if(e.target.closest("a")) toggleMenu(false, false); });
  document.addEventListener("keydown", function(e){
    if(!isOpen()) return;
    if(e.key === "Escape"){ toggleMenu(false, true); return; }
    if(e.key !== "Tab") return;
    // keep focus inside burger + drawer while the menu is open
    var stops = [burger].concat(Array.prototype.slice.call(drawer.querySelectorAll("a")));
    var i = stops.indexOf(document.activeElement);
    if(e.shiftKey && i <= 0){ e.preventDefault(); stops[stops.length-1].focus(); }
    else if(!e.shiftKey && i === stops.length-1){ e.preventDefault(); stops[0].focus(); }
  });
  window.matchMedia("(min-width: 821px)").addEventListener("change", function(m){ if(m.matches && isOpen()) toggleMenu(false, false); });

  /* ---------- HERO cables ---------- */
  var cluster = document.getElementById("cluster");
  var svg = document.getElementById("cables");
  var stage = svg.parentElement;
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".node"));
  var NS = "http://www.w3.org/2000/svg";
  var cablePairs = []; // {base, line, len, node}

  function clearCables(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    cablePairs = [];
  }
  function buildCables(){
    clearCables();
    var sb = stage.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + sb.width + " " + sb.height);
    var cb = cluster.getBoundingClientRect();
    var cx = cb.left - sb.left + cb.width/2;
    var cy = cb.top - sb.top + cb.height/2;
    nodes.forEach(function(node){
      var chip = node.querySelector(".chip").getBoundingClientRect();
      var ncx = chip.left - sb.left + chip.width/2;
      var ncy = chip.top - sb.top + chip.height/2;
      // start at the chip edge (toward cluster), so the cable never overlaps the cell
      var dx = cx - ncx, dy = cy - ncy;
      var dist = Math.hypot(dx, dy) || 1;
      var ux = dx/dist, uy = dy/dist;
      var r = Math.max(chip.width, chip.height)/2 + 6;
      var nx = ncx + ux*r, ny = ncy + uy*r;
      // control point: bow toward center vertically
      var mx = (nx + cx)/2;
      var my = (ny + cy)/2 + (ny < cy ? -30 : 30);
      var d = "M" + nx + " " + ny + " Q" + mx + " " + my + " " + cx + " " + cy;
      var base = document.createElementNS(NS, "path");
      base.setAttribute("class", "cable-base"); base.setAttribute("d", d);
      var line = document.createElementNS(NS, "path");
      line.setAttribute("class", "cable"); line.setAttribute("d", d);
      svg.appendChild(base); svg.appendChild(line);
      var len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      cablePairs.push({ base: base, line: line, len: len, node: node });
    });
  }

  /* ---------- scroll progress + animation loop ---------- */
  var heroWrap = document.querySelector(".hero-wrap");
  var glow = document.getElementById("glow");
  var hint = document.getElementById("hint");
  var beats = Array.prototype.slice.call(document.querySelectorAll(".beat"));
  var target = 0, current = 0;
  var raf = null;

  function computeTarget(){
    var r = heroWrap.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = total > 0 ? (-r.top) / total : 0;
    return Math.max(0, Math.min(1, p));
  }

  function rangeOpacity(p, s, e){
    var inE = s + (e - s) * 0.12, outS = e - (e - s) * 0.12;
    if(p <= s || p >= e) return 0;
    if(p < inE) return (p - s)/(inE - s);
    if(p > outS) return (e - p)/(e - outS);
    return 1;
  }

  function render(p){
    // glow intensity
    glow.style.opacity = (0.4 + p * 0.5).toFixed(3);

    // scroll hint fade within first 10%
    hint.style.opacity = p < 0.1 ? (1 - p/0.1).toFixed(3) : "0";

    // cables + nodes: reveal sequentially with scroll (nothing shows at p=0)
    cablePairs.forEach(function(cp, i){
      var seg = i / cablePairs.length;
      var eff = reduce ? 1 : Math.max(0, Math.min(1, (p - seg*0.5) / 0.35));
      cp.node.style.opacity = eff.toFixed(3);
      cp.base.style.opacity = (eff * 0.35).toFixed(3);
      cp.line.style.strokeDashoffset = (cp.len * (1 - eff)).toFixed(1);
      cp.node.classList.toggle("lit", eff > 0.55);
    });

    // beats: with reduced motion they swap by opacity only, no movement
    beats.forEach(function(b){
      var s = parseFloat(b.getAttribute("data-start"));
      var e = parseFloat(b.getAttribute("data-end"));
      var o = rangeOpacity(p, s, e);
      var inE = s + (e-s)*0.12, outS = e - (e-s)*0.12;
      var y = 20;
      if(p > s && p < e){
        if(p < inE) y = 20 * (1 - (p-s)/(inE-s));
        else if(p > outS) y = -20 * ((p-outS)/(e-outS));
        else y = 0;
      }
      if(reduce){ o = o > 0.5 ? 1 : 0; y = 0; }
      b.style.opacity = o.toFixed(3);
      b.style.transform = "translateY(" + y.toFixed(1) + "px)";
    });
  }

  function frame(){
    // damp toward target
    current += (target - current) * 0.09;
    render(current);
    raf = Math.abs(target - current) > 0.0005 ? requestAnimationFrame(frame) : null;
  }
  function onScroll(){
    target = computeTarget();
    if(reduce){ render(target); return; }
    if(!raf) raf = requestAnimationFrame(frame);
  }

  /* ---------- reveal on scroll (sections) ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  document.documentElement.classList.add("js");
  document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });

  /* ---------- resize handling (debounced) ---------- */
  var rt = null;
  function onResize(){
    clearTimeout(rt);
    rt = setTimeout(function(){ buildCables(); render(current); }, 160);
  }

  /* ---------- init ---------- */
  var started = false;
  function start(){
    if(started) return; started = true;
    buildCables();
    target = current = computeTarget();
    render(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  }
  // cables need final image/font layout
  if(document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
