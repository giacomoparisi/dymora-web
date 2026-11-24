/*
 * Scroll reveal: elements marked [data-reveal] fade and rise in when they enter the viewport.
 *
 * Loaded in <head> without defer so the hidden state (html.reveal-on, reveal.css) applies
 * before the first paint. Without JavaScript, without IntersectionObserver or with
 * prefers-reduced-motion, the class is never set and everything stays visible.
 * Stagger: [data-reveal-step="1..4"]. Panels: [data-reveal="panel"] also scale up.
 * Sections without explicit marks: each child of a .band__inner is marked in order,
 * so a section's blocks come in one after another.
 */
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.documentElement;
  root.classList.add("reveal-on");

  function autoMark() {
    Array.prototype.forEach.call(document.querySelectorAll("main .band__inner"), function (inner) {
      if (inner.querySelector("[data-reveal]")) return;
      Array.prototype.forEach.call(inner.children, function (el, i) {
        if (getComputedStyle(el).display === "contents") return;
        el.setAttribute("data-reveal", "");
        if (i) el.setAttribute("data-reveal-step", String(Math.min(i, 4)));
      });
    });
  }

  function init() {
    autoMark();
    var els = document.querySelectorAll("[data-reveal]");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Already scrolled past (an anchor jump, a reload mid-page): show it too.
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
