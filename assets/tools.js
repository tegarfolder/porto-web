/* Tool badges — used by the admin editor and the project detail page.

   Icons here are small generated monogram badges (a colour + a 1-2 letter
   abbreviation, rendered as real inline SVG), not brand logos. Reproducing
   exact trademarked software icons needs real source SVG files this project
   doesn't have — guessing at path data from memory would just render wrong
   or misrepresent a mark that isn't ours to redraw. This is a safe,
   original substitute: distinct per tool, swappable later if you want to
   drop in real brand assets.

   To use a real icon for a tool instead of the generated monogram, add an
   `svg` field with the raw <svg>...</svg> markup — toolBadgeSVG() uses it
   as-is when present, no other file to touch:

     aftereffects: {
       title: 'After Effects', short: 'Ae', color: '#9999FF',
       svg: '<svg viewBox="0 0 24 24">...</svg>'
     },

   The markup is dropped straight into the page, sized to a 20-22px circle
   by CSS (.tool-badge-svg) wherever it renders, so square/rect source art
   is fine — just keep the viewBox square-ish so it doesn't look stretched.
   `color`/`short` are ignored once `svg` is set (they only feed the
   fallback monogram) but leaving them in place is harmless.

   This file is the single source of truth for which tools are selectable in
   the admin panel. Both admin/index.html and works/project/index.html read
   TOOLS from here (loaded as a plain <script>, not fetched JSON, so it's
   available synchronously — same pattern as assets/social.js). Adding a
   tool means editing this one object and nothing else.

   p.tools itself stays a plain comma-separated string of *names* (matching
   however a `title` below is spelled) — this index doesn't change that
   format, it just makes picking from a list possible instead of typing
   freehand. A hand-typed name that isn't in this list still saves and still
   displays, just without a badge (see findTool()). */
const TOOLS = {
  aftereffects: {
    title: 'After Effects',   short: 'Ae', color: '#9999FF'
  },
  premiere:     { title: 'Premiere Pro',    short: 'Pr', color: '#9999FF' },
  photoshop:    { title: 'Photoshop',       short: 'Ps', color: '#31A8FF' },
  illustrator:  { title: 'Illustrator',     short: 'Ai', color: '#FF9A00' },
  cinema4d:     { title: 'Cinema 4D',       short: 'C4', color: '#011A6A' },
  blender:      { title: 'Blender',         short: 'Bl', color: '#E87D0D' },
  figma:        { title: 'Figma',           short: 'Fg', color: '#A259FF' },
  resolve:      { title: 'DaVinci Resolve', short: 'Dr', color: '#233A51' },
  houdini:      { title: 'Houdini',         short: 'Hd', color: '#FF4713' },
  nuke:         { title: 'Nuke',            short: 'Nk', color: '#FFC107' }
};

/* Insertion order of the object above doubles as display order (checklist
   in admin, badge order wherever it's rendered from a set). */
const TOOL_KEYS = Object.keys(TOOLS);

const toolEsc = s => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* White text reads on every colour above without per-entry tuning — they're
   all dark/saturated enough for that to stay legible. */
function toolBadgeSVG(tool) {
  if (tool.svg) {
    /* A real icon supplied via the `svg` field — wrapped so it gets the
       same circular, 20-22px sizing as the generated monogram, whatever
       size/viewBox the source markup itself uses. */
    return '<span class="tool-badge-svg tool-badge-custom">' + tool.svg + '</span>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true" class="tool-badge-svg">' +
    '<circle cx="12" cy="12" r="12" fill="' + tool.color + '"/>' +
    '<text x="12" y="12.5" text-anchor="middle" dominant-baseline="middle" ' +
    'font-size="10" font-weight="700" fill="#fff">' + toolEsc(tool.short) + '</text>' +
    '</svg>';
}

/* Matches a name from p.tools' comma-separated text against this index,
   case- and whitespace-insensitive. Returns the TOOLS entry, or null for a
   hand-typed tool that isn't indexed. */
function findTool(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  return TOOL_KEYS.map(k => TOOLS[k]).find(t => t.title.toLowerCase() === n) || null;
}
