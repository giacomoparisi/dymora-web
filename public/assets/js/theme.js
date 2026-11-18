(function () {
  'use strict';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function apply(value) {
    var theme = value || (media.matches ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var next = theme === 'dark' ? 'chiaro' : 'scuro';
      button.setAttribute('aria-label', 'Passa al tema ' + next);
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  }
  apply(null);
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  });
  media.addEventListener('change', function () { apply(null); });
}());
