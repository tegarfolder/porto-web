/* Putra Tegar — shared front-end.
   No build step: every page pulls data/projects.json and renders from it. */

const ROOT = document.currentScript.dataset.root || './';
const N = 8;                       // frames per scrub strip
const C = 'currentColor';

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
  const sync = () => {
    const d = isDark();
    btn.textContent = d ? 'Light' : 'Dark';
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
   Stands in for real stills until the CMS has them. Draws in currentColor
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
function cardHTML(p, maxSeconds, hrefBase) {
  const vert = p.format === '4:5', W = 160, H = vert ? 200 : 90;
  /* A real still wins over the generated scrub art. With a poster the card
     shows the image (gentle zoom on hover); without one it falls back to the
     8-frame artwork that pointer-scrub animates. */
  const media = p.poster
    ? `<img class="poster" src="${esc(assetUrl(p.poster))}" alt="" loading="lazy">`
    : Array.from({ length: N }, (_, k) =>
        `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="${k === N-1 ? 'on' : ''}" aria-hidden="true">${art(p.category, .12 + .88 * k / (N-1), W, H)}</svg>`
      ).join('');
  const width = (p.seconds / maxSeconds * 100).toFixed(1);
  const cat = p.category[0].toUpperCase() + p.category.slice(1);
  return `<a class="card w${p.span} c-${p.category}" href="${hrefBase}?p=${p.slug}"
    aria-label="${esc(p.title)} — ${cat}, ${tc(p.seconds)}">
    <div class="frame" style="aspect-ratio:${vert ? '4/5' : '16/9'}">${media}</div>
    <div class="track"><span class="fill" style="width:${width}%"></span><span class="head" style="left:0"></span></div>
    <div class="meta"><h3>${esc(p.title)}</h3><span class="tc">${tc(p.seconds)}</span></div>
    <div class="under"><span class="cat">${cat}</span><span class="fmt">${p.format}</span></div>
  </a>`;
}

function wireCards(scope) {
  const mqHover = matchMedia('(hover:hover) and (pointer:fine)');
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hint = document.getElementById('hint');
  if (hint) {
    const setHint = () => hint.textContent =
      mqHover.matches ? 'Hover a card to scrub' : 'Tap a card to open';
    mqHover.addEventListener('change', setHint); setHint();
  }

  const cards = [...scope.querySelectorAll('.card')].map(card => {
    const svgs = card.querySelectorAll('svg');
    const head = card.querySelector('.head');
    const bar  = card.querySelector('.fill');
    const frame = card.querySelector('.frame');
    let cur = N - 1;
    const set = k => {
      k = Math.max(0, Math.min(N - 1, k));
      if (k === cur) return;
      if (svgs.length) {
        svgs[cur].classList.remove('on'); svgs[k].classList.add('on');
      }
      cur = k;
    };
    const seek = p => {
      set(Math.floor(p * N));
      head.style.left = (p * parseFloat(bar.style.width)) + '%';
      head.style.opacity = 1;
    };
    const rest = () => { set(N - 1); head.style.left = '0%'; head.style.removeProperty('opacity'); };

    /* Bound to pointerType, not a load-time media query — a tablet with a
       mouse attached still gets the scrub. */
    frame.addEventListener('pointermove', ev => {
      if (ev.pointerType !== 'mouse') return;
      const r = frame.getBoundingClientRect();
      seek(Math.min(.999, Math.max(0, (ev.clientX - r.left) / r.width)));
    });
    frame.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') rest(); });
    return { card, seek, rest, played: false };
  });

  /* Touch has no hover, so the build plays itself once as each card scrolls in. */
  if (!mqHover.matches && !still && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const c = cards.find(x => x.card === e.target);
      if (!e.isIntersecting || !c || c.played) return;
      c.played = true;
      const t0 = performance.now(), dur = 780;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        c.seek(p * .999);
        if (p < 1) requestAnimationFrame(step); else setTimeout(c.rest, 220);
      };
      requestAnimationFrame(step);
    }), { threshold: .45 });
    cards.forEach(c => io.observe(c.card));
  }
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
    const max = Math.max(...list.map(p => p.seconds));
    el.innerHTML = list.map(p => cardHTML(p, max, hrefBase)).join('');

    const count = document.getElementById('count');
    if (count) {
      const total = list.reduce((a, p) => a + p.seconds, 0);
      count.textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}, ${tc(total)} total`;
    }
    wireCards(el);
    watchPins(el);
  } catch (e) { fail(el, e); }
}

initTheme();
