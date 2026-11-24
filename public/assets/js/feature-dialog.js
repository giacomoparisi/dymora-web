/*
 * Home detail popup (FeatureDialog.astro): the cards of "Cosa puoi fare con Dymora" marked
 * [data-feature] open the function's <dialog> instead of its page.
 *
 * - Links stay links: without JavaScript or <dialog> support, or with a modifier key or
 *   middle click, the browser follows them to the page as before.
 * - Opening from a card adds a history entry with #funzione-<slug>, so the back button closes
 *   the popup; moving to the previous/next function replaces it. /#funzione-luci, the cards'
 *   href (also from the other pages), opens that popup on load.
 * - html.fd-on turns off the no-JavaScript fallback of feature-dialog.css.
 * - On close the focus goes back to the card of the last function shown.
 */
(function () {
  "use strict";

  if (typeof HTMLDialogElement !== "function" || !HTMLDialogElement.prototype.showModal) return;

  var dialogs = {};
  Array.prototype.forEach.call(document.querySelectorAll("dialog[data-feature-dialog]"), function (d) {
    dialogs[d.getAttribute("data-feature-dialog")] = d;
  });
  if (!Object.keys(dialogs).length) return;
  document.documentElement.classList.add("fd-on");

  var PREFIX = "funzione-";

  var current = null; // the open dialog
  var pushed = false; // whether the open popup has a history entry of its own

  function slugOf(d) {
    return d.getAttribute("data-feature-dialog");
  }

  function hashSlug() {
    var hash = decodeURIComponent(location.hash.slice(1));
    if (hash.indexOf(PREFIX) !== 0) return null;
    var slug = hash.slice(PREFIX.length);
    return dialogs[slug] ? slug : null;
  }

  function show(slug) {
    var d = dialogs[slug];
    if (!d || d === current) return;
    var previous = current;
    current = d; // set first: the previous dialog's close event, fired later, is then a switch
    if (previous) previous.close();
    d.showModal();
    d.querySelector(".fdialog__panel").scrollTop = 0;
  }

  function hide() {
    if (current) current.close();
  }

  // The close event is queued, so it arrives after show() has moved on when switching.
  function onClose(e) {
    if (e.target !== current) return;
    var slug = slugOf(e.target);
    current = null;
    if (pushed) {
      pushed = false;
      history.back();
    } else if (hashSlug()) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    var card = document.querySelector('a[data-feature="' + slug + '"]');
    if (card) card.focus({ preventScroll: true });
  }

  function plainClick(e) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }

  Object.keys(dialogs).forEach(function (slug) {
    var d = dialogs[slug];
    d.addEventListener("close", onClose);
    // A click on the dialog box itself, outside the panel, is a click on the backdrop.
    d.addEventListener("click", function (e) {
      if (e.target === d) hide();
    });
  });

  document.addEventListener("click", function (e) {
    if (!plainClick(e)) return;
    var el = e.target.closest("a[data-feature], [data-fd-go], [data-fd-close]");
    if (!el) return;

    if (el.hasAttribute("data-fd-close")) {
      e.preventDefault();
      hide();
      return;
    }

    var slug = el.getAttribute("data-feature") || el.getAttribute("data-fd-go");
    if (!dialogs[slug]) return;
    e.preventDefault();

    if (current) {
      // Previous / next inside the popup: same history entry, new hash.
      history.replaceState(pushed ? { fd: slug } : null, "", "#" + PREFIX + slug);
    } else {
      history.pushState({ fd: slug }, "", "#" + PREFIX + slug);
      pushed = true;
    }
    show(slug);
  });

  window.addEventListener("popstate", function (e) {
    var slug = hashSlug();
    if (slug) {
      pushed = !!(e.state && e.state.fd);
      show(slug);
    } else {
      pushed = false;
      hide();
    }
  });

  var initial = hashSlug();
  if (initial) {
    var section = document.getElementById("funzioni");
    if (section) section.scrollIntoView();
    show(initial);
  }
})();
