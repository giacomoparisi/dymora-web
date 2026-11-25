/*
 * Site header (src/components/SiteHeader.astro).
 *
 * - .is-scrolled once the page has moved: on the home the bar turns from transparent to glass.
 * - "Funzioni" mega menu: opens on hover (with a short grace period) on fine pointers and on
 *   click everywhere; Escape, a click outside or following a link closes it.
 * - Burger (narrow screens): opens the navigation as a full panel and locks the page scroll.
 *   The mega menu inside it works as an accordion.
 */
(function () {
  "use strict";

  var header = document.querySelector("[data-sh]");
  if (!header) return;

  var mega = header.querySelector("[data-sh-mega]");
  var trigger = mega && mega.querySelector(".sh__trigger");
  var burger = header.querySelector(".sh__burger");
  var narrow = window.matchMedia("(max-width: 980px)");
  var hover = window.matchMedia("(hover: hover) and (pointer: fine)");
  var closeTimer = 0;
  var hoverOpened = 0; // when the pointer last opened the menu: a click right after keeps it open

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMega(open) {
    if (!mega) return;
    clearTimeout(closeTimer);
    mega.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (!narrow.matches) header.classList.toggle("is-open", open);
  }

  function setPanel(open) {
    header.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    document.documentElement.classList.toggle("sh-locked", open);
    if (!open) setMega(false);
  }

  if (mega) {
    trigger.addEventListener("click", function () {
      var open = mega.classList.contains("is-open");
      if (open && Date.now() - hoverOpened < 600) return;
      setMega(!open);
    });
    mega.addEventListener("mouseenter", function () {
      if (!hover.matches || narrow.matches) return;
      if (!mega.classList.contains("is-open")) hoverOpened = Date.now();
      setMega(true);
    });
    mega.addEventListener("mouseleave", function () {
      if (!hover.matches || narrow.matches) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { setMega(false); }, 180);
    });
    // Leaving the menu with Tab closes it.
    mega.addEventListener("focusout", function (e) {
      if (!narrow.matches && e.relatedTarget && !mega.contains(e.relatedTarget)) setMega(false);
    });
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setPanel(!header.classList.contains("is-open"));
    });
  }

  // A link in the header (an anchor on this page) closes everything.
  header.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      if (burger && header.classList.contains("is-open") && narrow.matches) setPanel(false);
      else setMega(false);
    }
  });

  document.addEventListener("click", function (e) {
    if (mega && mega.classList.contains("is-open") && !header.contains(e.target)) setMega(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (narrow.matches && header.classList.contains("is-open")) {
      setPanel(false);
      burger.focus();
    } else if (mega && mega.classList.contains("is-open")) {
      setMega(false);
      trigger.focus();
    }
  });

  narrow.addEventListener("change", function () {
    setMega(false);
    if (burger) setPanel(false);
  });
})();
