/*
 * "Cosa puoi fare con Dymora" (FeatureLinks.astro): while a card is hovered or
 * focused, its device switches on with the app's own clips, and switches off when
 * the pointer or the focus leaves. The scene is a sprite.js scene; this only edits
 * its data-layers, which sprite.js plays in and, when removed, back out.
 *
 * On the card's .flink__scene (data from features.ts, `scene`):
 *   data-fx-on    tokens added on enter
 *   data-fx-then  tokens added data-fx-wait frames (24 fps) later, once `on` has played
 *   data-fx-off   tokens added on leave, if `then` had started (the tap's water stopping)
 * The `flink--on` class on the card lights what is CSS (the thermostat's seam).
 * With prefers-reduced-motion sprite.js shows every layer's end state at once.
 */
(function () {
  "use strict";

  var FPS = 24;

  function parse(attr) {
    return (attr || "").split(/\s+/).filter(Boolean);
  }

  function edit(sprite, remove, add) {
    var tokens = parse(sprite.getAttribute("data-layers")).filter(function (t) {
      return remove.indexOf(t) === -1;
    });
    add.forEach(function (t) {
      if (tokens.indexOf(t) === -1) tokens.push(t);
    });
    sprite.setAttribute("data-layers", tokens.join(" "));
  }

  function Card(link) {
    this.link = link;
    this.box = link.querySelector(".flink__scene");
    this.sprite = this.box.querySelector(".sprite");
    this.on = parse(this.box.getAttribute("data-fx-on"));
    this.then = parse(this.box.getAttribute("data-fx-then"));
    this.off = parse(this.box.getAttribute("data-fx-off"));
    this.wait = parseInt(this.box.getAttribute("data-fx-wait") || "0", 10) * 1000 / FPS;
    this.active = false;
    this.timer = 0;
    this.thenStarted = false;
  }

  Card.prototype.enter = function () {
    if (this.active) return;
    this.active = true;
    this.link.classList.add("flink--on");
    var self = this;
    edit(this.sprite, this.off, this.on);
    if (this.then.length) {
      this.timer = setTimeout(function () {
        self.timer = 0;
        self.thenStarted = true;
        edit(self.sprite, self.off, self.then);
      }, this.wait);
    }
  };

  Card.prototype.leave = function () {
    if (!this.active) return;
    this.active = false;
    this.link.classList.remove("flink--on");
    if (this.timer) { clearTimeout(this.timer); this.timer = 0; }
    edit(this.sprite, this.on.concat(this.then), this.thenStarted ? this.off : []);
    this.thenStarted = false;
  };

  function init() {
    var links = document.querySelectorAll(".flink");
    Array.prototype.forEach.call(links, function (link) {
      if (!link.querySelector(".flink__scene .sprite")) return;
      var card = new Card(link);
      // On while the pointer is over the card or the keyboard focus is on it.
      var hovered = false, focused = false;
      function update() { if (hovered || focused) card.enter(); else card.leave(); }
      link.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") { hovered = true; update(); } });
      link.addEventListener("pointerleave", function () { hovered = false; update(); });
      link.addEventListener("focus", function () { focused = link.matches(":focus-visible"); update(); });
      link.addEventListener("blur", function () { focused = false; update(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
