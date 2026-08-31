/* Simple fade + slide-up transition between pages (plain multi-page site,
   no router). Must load synchronously in <head>, right after theme.js —
   it needs to mark the page hidden before first paint, or there's nothing
   for the fade-in to fade from (same reasoning as assets/theme.js re: a
   flash of the wrong state on navigation).

   Two halves:
   1. Entrance — every page starts hidden (site.css: html.pt-init body) and
      reveals itself via the .pt-in class once the DOM is ready.
   2. Exit — a delegated click handler intercepts plain same-tab,
      same-origin link clicks, plays the fade-out, then navigates. This is
      what makes every page's <a> tags transition, including ones rendered
      dynamically by site.js — nothing per-link to wire up. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // leave the page at CSS defaults: visible, no motion

  var root = document.documentElement;
  root.classList.add('pt-init');

  function reveal() {
    /* Double rAF so the initial (hidden) style is actually painted once
       before the class flip — otherwise some browsers coalesce both style
       changes into a single frame and skip the transition entirely. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('pt-in'); });
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    reveal();

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;
      if (a.target && a.target !== '_self') return;

      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return; // external / mailto: / tel:
      if (url.href.split('#')[0] === location.href.split('#')[0] && url.hash) return; // in-page anchor

      e.preventDefault();
      root.classList.remove('pt-in');
      root.classList.add('pt-out');
      setTimeout(function () { location.href = a.href; }, 220); // matches .pt-out duration in site.css
    });
  });

  /* A page restored from bfcache (browser back/forward) keeps its old
     classes frozen mid-animation in some browsers — force it back to the
     revealed state instead of replaying or staying hidden. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      root.classList.remove('pt-out');
      root.classList.add('pt-in');
    }
  });
})();
