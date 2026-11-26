/*
 * Home opening (src/components/Opening.astro): the "Rientro" film behind the hook.
 *
 * - Loads the film once the page has loaded, so the title stays the first thing painted: the
 *   720p file on narrow screens, 1080p otherwise. With prefers-reduced-motion or Save-Data only
 *   the poster shows and no film is downloaded.
 * - The pause button appears once the film plays (WCAG 2.2.2: moving content over 5 s).
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-hv-root]");
  if (!root) return;
  var video = root.querySelector("[data-hv-video]");
  var pause = root.querySelector("[data-hv-pause]");
  if (!video) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  function load() {
    if (reduce || saveData) return;
    var small = window.matchMedia("(max-width: 899px)").matches;
    video.src = video.getAttribute(small ? "data-src-small" : "data-src-large");
    video.preload = "auto";
    var started = video.play();
    if (started && started.then) started.then(showPause, function () {});
    else showPause();
  }

  function showPause() {
    if (pause) pause.hidden = false;
  }

  if (pause) {
    pause.addEventListener("click", function () {
      var paused = !video.paused;
      if (paused) video.pause();
      else video.play();
      pause.setAttribute("aria-pressed", String(paused));
      pause.setAttribute("aria-label", paused ? "Riproduci il video" : "Metti in pausa il video");
    });
  }

  if (document.readyState === "complete") load();
  else window.addEventListener("load", load);
})();
