/* Putra Tegar — shared front-end.
   No build step: every page pulls data/projects.json and renders from it. */

const ROOT = document.currentScript.dataset.root || './';
const C = 'currentColor';

/* Card shapes. `css` drives the actual box; `w`/`h` are the viewBox the
   generated placeholder art is drawn into, so it stays in proportion at any
   ratio. Keep this list in step with FORMATS in admin/index.html. */
const FORMATS = {
  '21:9': { css: '21/9', w: 210, h: 90  },   // cinematic
  '16:9': { css: '16/9', w: 160, h: 90  },   // landscape
  '4:3':  { css: '4/3',  w: 160, h: 120 },   // standard
  '1:1':  { css: '1/1',  w: 120, h: 120 },   // square
  '4:5':  { css: '4/5',  w: 160, h: 200 },   // portrait
  '9:16': { css: '9/16', w: 90,  h: 160 }    // vertical
};
const shapeOf = f => FORMATS[f] || FORMATS['16:9'];

/* ---------- YouTube thumbnails ----------
   A project with a YouTube embed already has a still on Google's CDN, so it
   needs no poster of its own. maxresdefault only exists when the video was
   uploaded in HD — older uploads 404 — hence the fallback. Only maxresdefault
   (1280x720) and mqdefault (320x180) are true 16:9; hqdefault and sddefault
   are 4:3 with black bars baked in, so they are deliberately not used. */
const YT_ID = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:.*&)?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/;

function ytThumbs(url) {
  const m = url && String(url).match(YT_ID);
  if (!m) return null;
  return {
    best: 'https://img.youtube.com/vi/' + m[1] + '/maxresdefault.jpg',
    fallback: 'https://img.youtube.com/vi/' + m[1] + '/mqdefault.jpg'
  };
}

const tc  = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Resolve a content path stored in projects.json. Data keeps paths relative to
   the site root ("assets/x.jpg" or "https://…"), but pages live at different
   depths, so a relative path gets the page's ROOT prefix (./ ../ ../../). */
const assetUrl = path => {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path[0] === '/') return path;
  return ROOT + path;
};

/* ---------- theme ---------- */
function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById('mode');
  if (!btn) return;
  /* Light is the unconditional default, so dark is the only state to detect. */
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  const SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const sync = () => {
    const d = isDark();
    btn.innerHTML = d ? SUN : MOON;
    btn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
  };
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('pt-theme', next); } catch (e) {}
    sync();
  });
  sync();
}


/* ---------- placeholder frame art ----------
   Stands in for real stills until a project has a poster or a YouTube embed.
   A single static illustration per category, drawn at its fully-resolved
   state (t=1) — no build-on animation, no frame strip. Draws in currentColor
   so a card inherits its category accent and follows the theme. */
function art(kind, t, W, H) {
  const cx = W / 2, cy = H / 2, e = t * t * (3 - 2 * t), g = [];
  if (kind === 'explainer') {
    const n = [[.18,.32],[.42,.2],[.5,.62],[.76,.38],[.84,.74]];
    for (let i = 0; i < n.length - 1; i++) {
      const p = Math.max(0, Math.min(1, e * 4.4 - i));
      const x1 = n[i][0]*W, y1 = n[i][1]*H, x2 = n[i+1][0]*W, y2 = n[i+1][1]*H;
      g.push(`<line x1="${x1}" y1="${y1}" x2="${x1+(x2-x1)*p}" y2="${y1+(y2-y1)*p}" stroke="${C}" stroke-width=".8" opacity=".6"/>`);
    }
    n.forEach((p, i) => {
      const v = e * 5.2 - i; if (v <= 0) return;
      const r = Math.min(1, v) * (i === 2 ? 5.4 : 3.4);
      g.push(`<circle cx="${p[0]*W}" cy="${p[1]*H}" r="${r}" fill="${i===2?C:'none'}" stroke="${C}" stroke-width=".8" opacity="${i===2?1:.75}"/>`);
    });
  }
  if (kind === 'product') {
    for (let i = 0; i < 4; i++) {
      const k = Math.max(0, Math.min(1, e * 1.7 - i * .16));
      const sp = (1 - k) * (i % 2 ? 26 : -26);
      const w = W * (.5 - i * .055), h = H * (.5 - i * .055);
      g.push(`<rect x="${cx-w/2+sp}" y="${cy-h/2}" width="${w}" height="${h}" rx="1" fill="none" stroke="${C}" stroke-width=".8" opacity="${(.28+i*.2)*k}"/>`);
    }
    g.push(`<circle cx="${cx}" cy="${cy}" r="${2.4+e*2}" fill="${C}" opacity="${e}"/>`);
  }
  if (kind === 'event') {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
      const ph = Math.max(0, Math.min(1, e * 2.1 - (i % 5) * .13));
      const r0 = Math.min(W, H) * .12, r1 = r0 + Math.min(W, H) * .3 * ph;
      g.push(`<line x1="${cx+Math.cos(a)*r0}" y1="${cy+Math.sin(a)*r0}" x2="${cx+Math.cos(a)*r1}" y2="${cy+Math.sin(a)*r1}" stroke="${C}" stroke-width=".8" opacity=".65"/>`);
    }
    g.push(`<circle cx="${cx}" cy="${cy}" r="${Math.min(W,H)*(.06+e*.2)}" fill="none" stroke="${C}" stroke-width=".8" opacity="${.95-e*.55}"/>`);
    g.push(`<circle cx="${cx}" cy="${cy}" r="${Math.min(W,H)*.055}" fill="${C}" opacity=".95"/>`);
  }
  if (kind === 'brand') {
    const cols = 7, rows = Math.max(3, Math.round(7 * H / W));
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const px = W*(x+1)/(cols+1), py = H*(y+1)/(rows+1);
      const on = Math.hypot((px-cx)/W, (py-cy)/H) < .13 + e * .2;
      g.push(`<circle cx="${px}" cy="${py}" r="${on?1.9:1}" fill="${C}" opacity="${on?1:'var(--grain)'}"/>`);
    }
    const s = Math.min(W, H) * (.12 + e * .1);
    g.push(`<rect x="${-s}" y="${-s}" width="${s*2}" height="${s*2}" fill="none" stroke="${C}" stroke-width=".9" opacity=".85" transform="translate(${cx},${cy}) rotate(${e*90})"/>`);
  }
  return g.join('');
}

/* ---------- cards ---------- */
function cardHTML(p, hrefBase, index = 99) {
  const shape = shapeOf(p.format), W = shape.w, H = shape.h;
  /* Card image, in order of preference: an explicit poster, then the YouTube
     still derived from the project's first YouTube block, then a single
     generated illustration. */
  const firstYt = (p.blocks || []).find(b => b.type === 'video' && b.provider === 'youtube');
  const yt = p.poster ? null : ytThumbs(firstYt && firstYt.url);
  /* The first cards are above the fold on every breakpoint; lazy-loading them
     delays the largest paint for no saving. */
  const eager = index < 2;
  const loadAttr = eager
    ? 'loading="eager"' + (index === 0 ? ' fetchpriority="high"' : '')
    : 'loading="lazy"';
  const media = p.poster
    ? `<img class="poster" src="${esc(assetUrl(p.poster))}" alt="" ${loadAttr}>`
    : yt
    ? `<img class="poster" src="${esc(yt.best)}" data-fallback="${esc(yt.fallback)}" alt="" ${loadAttr}>`
    : `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${art(p.category, 1, W, H)}</svg>`;
  const cat = p.category[0].toUpperCase() + p.category.slice(1);
  return `<a class="card w${p.span} c-${p.category}" href="${hrefBase}?p=${p.slug}"
    aria-label="${esc(p.title)} — ${cat}, ${tc(p.seconds)}">
    <div class="frame" style="aspect-ratio:${shape.css}">${media}</div>
    <div class="meta"><h3>${esc(p.title)}</h3><span class="tc">${tc(p.seconds)}</span></div>
    <div class="under"><span class="cat">${cat}</span><span class="fmt">${p.format}</span></div>
  </a>`;
}

function wireCards(scope) {
  /* Videos never uploaded in HD have no maxresdefault. YouTube signals that
     two different ways: sometimes a 404, but often a 200 carrying a 120x90
     grey placeholder — which fires `load`, not `error`. Listening for the
     error alone leaves that placeholder stretched across the card, so treat
     any implausibly small image as a miss too. */
  scope.querySelectorAll('img.poster[data-fallback]').forEach(img => {
    const swap = () => {
      if (!img.dataset.fallback) return;
      const next = img.dataset.fallback;
      delete img.dataset.fallback;
      img.src = next;
    };
    const check = () => { if (img.naturalWidth && img.naturalWidth <= 120) swap(); };
    img.addEventListener('error', swap);
    img.addEventListener('load', check);
    if (img.complete) img.naturalWidth === 0 ? swap() : check();
  });
}

/* ---------- packed grid ----------
   Gives each card a row span matching its own height, so a fixed-column grid
   packs like a pinboard. Cheap because card heights are already deterministic:
   .frame carries an explicit aspect-ratio, so a poster reserves its space
   before the image loads and nothing reflows. */
function layoutPins(grid) {
  if (!grid || !grid.classList.contains('pins')) return;
  grid.classList.remove('packed');            // measure against auto rows
  const row = 1;
  grid.querySelectorAll('.card').forEach(card => {
    card.style.gridRowEnd = 'auto';           // reset before measuring
    const h = card.getBoundingClientRect().height;
    if (!h) return;
    /* The card's own bottom margin is the visual gap — see site.css. */
    const gap = parseFloat(getComputedStyle(card).marginBottom) || 0;
    card.style.gridRowEnd = 'span ' + Math.ceil((h + gap) / row);
  });
  grid.classList.add('packed');
}

function watchPins(grid) {
  if (!grid.classList.contains('pins')) return;
  const run = () => layoutPins(grid);
  const debounced = () => {
    clearTimeout(watchPins._t);
    watchPins._t = setTimeout(run, 60);
  };
  run();
  addEventListener('load', run);
  /* ResizeObserver is the accurate signal, but it runs off the frame loop and
     can be starved in odd environments — the resize/orientation listeners are
     a cheap guarantee that a stale pack never survives a viewport change. */
  addEventListener('resize', debounced);
  addEventListener('orientationchange', debounced);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  /* Re-pack when the column count changes. Guarded on width: our own row-span
     edits change the grid's height, which would otherwise loop forever. */
  if ('ResizeObserver' in window) {
    let lastW = 0;
    new ResizeObserver(entries => {
      const w = Math.round(entries[0].contentRect.width);
      if (!w || w === lastW) return;
      lastW = w;
      debounced();
    }).observe(grid);
  }
}

/* ---------- data ---------- */
let _data = null;
async function data() {
  if (_data) return _data;
  const res = await fetch(ROOT + 'data/projects.json');
  if (!res.ok) throw new Error('Could not load projects.json (' + res.status + ')');
  _data = await res.json();
  return _data;
}

function fail(el, err) {
  el.innerHTML = `<p class="lab" style="color:var(--dim)">Work list unavailable — ${esc(err.message)}</p>`;
}

/* Renders a grid into #grid. `filter` narrows by category slug. */
async function renderGrid({ filter = null, limit = null, hrefBase = 'project/',
                            layout = null } = {}) {
  const el = document.getElementById('grid');
  if (!el) return;
  if (layout === 'pins') el.classList.add('pins');
  try {
    const d = await data();
    let list = d.projects;
    if (filter) list = list.filter(p => p.category === filter);
    if (limit)  list = list.filter(p => p.featured).slice(0, limit);
    el.innerHTML = list.map((p, i) => cardHTML(p, hrefBase, i)).join('');

    const count = document.getElementById('count');
    if (count) {
      const total = list.reduce((a, p) => a + p.seconds, 0);
      count.textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}, ${tc(total)} total`;
    }
    wireCards(el);
    watchPins(el);
  } catch (e) { fail(el, e); }
}

/* ---------- home page bento ----------
   Unlike renderGrid(), this pulls individual content blocks, not whole
   projects — a project with two blocks marked "Show in Recent Works" can put
   both on the home page. Cells fill a fixed template in order (see .bento in
   site.css); any blocks beyond the template's cell count are simply not
   shown, and a shorter list just leaves the template's later cells empty. */
function bentoThumb(p, b) {
  if (b.type === 'image') return { src: assetUrl(b.url), yt: null };
  if (b.poster) return { src: assetUrl(b.poster), yt: null };
  if (b.provider === 'youtube') {
    const yt = ytThumbs(b.url);
    if (yt) return { src: yt.best, yt };
  }
  return null; // no still available — falls back to generated art
}

function bentoCellHTML(p, b, hrefBase, index) {
  const cat = p.category[0].toUpperCase() + p.category.slice(1);
  const thumb = bentoThumb(p, b);
  const eager = index < 2;
  const loadAttr = eager
    ? 'loading="eager"' + (index === 0 ? ' fetchpriority="high"' : '')
    : 'loading="lazy"';
  const media = thumb
    ? `<img class="poster" src="${esc(thumb.src)}"${thumb.yt ? ` data-fallback="${esc(thumb.yt.fallback)}"` : ''} alt="" ${loadAttr}>`
    : `<svg viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">${art(p.category, 1, 160, 90)}</svg>`;
  return `<a class="cell c-${p.category}" href="${hrefBase}?p=${p.slug}"
    aria-label="${esc(p.title)} — ${cat}">
    <div class="media">${media}</div>
    <div class="meta"><h3>${esc(p.title)}</h3></div>
    <div class="under"><span class="cat">${cat}</span></div>
  </a>`;
}

/* Renders into #bento. cellCount must match the number of sized slots the
   .bento CSS template defines — see the nth-child rules in site.css. */
async function renderBento({ hrefBase = 'project/', cellCount = 8 } = {}) {
  const el = document.getElementById('bento');
  if (!el) return;
  try {
    const d = await data();
    const items = [];
    d.projects.forEach(p => (p.blocks || []).forEach(b => {
      if (b.featured) items.push({ p, b });
    }));
    const list = items.slice(0, cellCount);
    el.innerHTML = list.map(({ p, b }, i) => bentoCellHTML(p, b, hrefBase, i)).join('');
    wireCards(el);
  } catch (e) { fail(el, e); }
}

/* ---------- hero background ----------
   An autoplaying loop is exactly what prefers-reduced-motion exists to
   suppress. Pausing rather than hiding keeps the poster frame on screen, so
   the hero still has an image. */
function initHero() {
  const v = document.querySelector('.hero-bg video');
  if (!v) return;
  const still = matchMedia('(prefers-reduced-motion:reduce)');
  const apply = () => {
    if (still.matches) { v.autoplay = false; v.pause(); }
    else if (v.paused) { v.play().catch(() => {}); }
  };
  still.addEventListener('change', apply);
  apply();
}

initTheme();
initHero();
