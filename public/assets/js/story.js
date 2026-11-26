/*
 * Home scroll story (src/components/home/HouseStory.astro): under the pinned title, the pinned
 * house plays in the functions of each step (two at a time) as the step crosses the window.
 *
 * Markup:
 *   [data-story-house][data-ov-rest="tokens"]
 *     .sprite[data-sprite]                         played by sprite.js
 *     .ov-item[data-ov-item=id][data-ov-on][data-ov-off]
 *   .story__head                                   pinned title: its height → --story-head
 *   .story__step[data-story-step="id id"] …        in story order, the functions of each step
 *   .story__fill                                   the rail, filled through --story-p (0–1)
 *
 * Steps reached so far are on (cumulative): their `on` tokens join the
 * house's data-layers, their `off` tokens leave it, and sprite.js plays the difference in or out.
 * The latest step is .is-active (its tags light up), earlier ones .is-done.
 * On narrow screens the house sits above the steps: a step counts once it shows under it.
 * Without JavaScript the house rests and every step reads as plain text.
 */
(function () {
  "use strict";

  var LINE = 0.55; // share of the window height where a step counts as reached

  function parse(attr) {
    return (attr || "").split(/\s+/).filter(Boolean);
  }

  function init() {
    var stage = document.querySelector("[data-story-house]");
    if (!stage) return;
    var house = stage.querySelector(".sprite[data-sprite]");
    var section = stage.closest(".story");
    var list = section.querySelector(".story__steps");
    var steps = Array.prototype.slice.call(section.querySelectorAll("[data-story-step]"));
    var head = section.querySelector(".story__head");
    var pin = section.querySelector(".story__pin");
    var rest = parse(stage.getAttribute("data-ov-rest"));
    var items = {};
    Array.prototype.forEach.call(stage.querySelectorAll("[data-ov-item]"), function (el) {
      items[el.getAttribute("data-ov-item")] = el;
    });
    if (!house || !steps.length) return;
    section.classList.add("is-live");

    // The house pins under the title, whatever its height.
    if (head && window.ResizeObserver) {
      new ResizeObserver(function () {
        section.style.setProperty("--story-head", head.offsetHeight + "px");
      }).observe(head);
    }

    var reached = -1, last = "", ticking = false;

    function apply(n) {
      var tokens = rest.slice();
      steps.forEach(function (step, i) {
        var on = i <= n;
        step.classList.toggle("is-active", i === n);
        step.classList.toggle("is-done", i < n);
        parse(step.getAttribute("data-story-step")).forEach(function (id) {
          var el = items[id];
          if (!el) return;
          el.classList.toggle("is-active", i === n);
          el.classList.toggle("is-lit", on && i !== n);
          if (!on) return;
          var off = parse(el.getAttribute("data-ov-off"));
          tokens = tokens.filter(function (t) { return off.indexOf(t) === -1; });
          parse(el.getAttribute("data-ov-on")).forEach(function (t) {
            if (tokens.indexOf(t) === -1) tokens.push(t);
          });
        });
      });
      var value = tokens.join(" ");
      if (value !== last) {
        last = value;
        house.setAttribute("data-layers", value);
      }
    }

    function update() {
      ticking = false;
      var line = window.innerHeight * LINE;
      var box = list.getBoundingClientRect();
      var pb = pin.getBoundingClientRect();
      if (pb.left < box.right && pb.right > box.left) {
        // Stacked (narrow screens): measure in the window left under the pinned house.
        line = pb.bottom + (window.innerHeight - pb.bottom) * 0.5;
      }
      var n = -1;
      steps.forEach(function (step, i) {
        if (step.getBoundingClientRect().top < line) n = i;
      });
      var p = Math.min(1, Math.max(0, (line - box.top) / box.height));
      section.style.setProperty("--story-p", p.toFixed(4));
      if (n !== reached) {
        reached = n;
        apply(n);
      }
    }

    function request() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    // Listen only while the section is near the window.
    var near = false;
    new IntersectionObserver(function (entries) {
      var now = entries[0].isIntersecting;
      if (now === near) return;
      near = now;
      if (near) {
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        request();
      } else {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", request);
        request();
      }
    }, { rootMargin: "50% 0px" }).observe(section);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
