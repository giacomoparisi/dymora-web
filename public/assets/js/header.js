/*
 * Site header (src/components/SiteHeader.astro).
 *
 * - .is-scrolled once the page has moved: on the home the bar turns from transparent to glass.
 * - Burger (narrow screens): opens the navigation as a full panel and locks the page scroll.
 *   Escape or following a link closes it.
 */
(function () {
  "use strict";

  var header = document.querySelector("[data-sh]");
  if (!header) return;

  var burger = header.querySelector(".sh__burger");
  var narrow = window.matchMedia("(max-width: 1080px)");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setPanel(open) {
    header.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    document.documentElement.classList.toggle("sh-locked", open);
  }

  if (!burger) return;

  burger.addEventListener("click", function () {
    setPanel(!header.classList.contains("is-open"));
  });

  // A link in the header (an anchor on this page) closes the panel.
  header.addEventListener("click", function (e) {
    if (e.target.closest("a") && header.classList.contains("is-open")) setPanel(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !header.classList.contains("is-open")) return;
    setPanel(false);
    burger.focus();
  });

  narrow.addEventListener("change", function () {
    setPanel(false);
  });
})();
