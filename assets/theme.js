/* Restores a stored theme choice before first paint.
   Must load synchronously in <head> — deferring it causes a flash of light
   on every navigation for anyone who picked dark. */
(function () {
  try {
    var t = localStorage.getItem('pt-theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) { /* private mode: fall back to the light default */ }
})();
