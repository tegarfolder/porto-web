# Putra Tegar — portfolio site

Motion graphics portfolio. Plain HTML, CSS, and JavaScript — **no build step, no
framework, no dependencies to install.** Every page is a static file; all content
comes from one JSON file.

---

## 1. Run it on another PC

Copy the whole project folder across. You need **nothing installed** except a way
to serve files over HTTP.

> **Do not open `index.html` by double-clicking it.**
> The pages load content with `fetch()`, which browsers block on `file://` URLs
> for security. The layout appears but the work grid reads
> *"Work list unavailable"*. This is not a bug — it needs a server.

Pick whichever you already have. Run the command **inside the project folder**,
then open <http://localhost:5173>.

**Python** (pre-installed on most machines):

```bash
python -m http.server 5173
```

If `python` isn't recognised on Windows, try:

```bash
py -m http.server 5173
```

**Node.js**:

```bash
npx serve -l 5173
```

**VS Code** — install the *Live Server* extension, right-click `index.html` →
"Open with Live Server". It picks its own port.

Stop the server with `Ctrl+C`.

**Which one?** For a static site they are functionally identical — all three just
hand files to the browser. Practical differences:

| | Good | Watch out |
| --- | --- | --- |
| **Live Server** (VS Code) | Auto-reloads the page every time you save. Best for editing CSS/JS. | Also reloads on *any* file change — including when the admin panel saves `projects.json` (see below). |
| **Python** | Already installed, works offline, one command. | Caches aggressively: after editing `site.js` or `site.css` you may need `Ctrl+Shift+R` to see the change. |
| **Node** (`npx serve`) | Sensible caching headers. | Downloads the package on first run, so it needs internet once. |

Recommended: **Live Server while building, Python when using the admin panel.**

If you want Live Server for both, stop it reloading on content saves — add this
to VS Code settings (`Ctrl+,` → Open Settings JSON):

```json
"liveServer.settings.ignoreFiles": ["data/**", "**/*.json"]
```

### Checking it works

You should see, on the home page:

- A centred headline whose words rise into place out of a blur, one after
  another left to right (the last word lands about 1.4s in)
- 4 project cards below it
- The label "Selected work — 4 pieces, 4:05 total"

The hero video panel will be empty until `assets/hero1.mp4` exists — see §8.

If the count says "loading" forever, the server isn't serving `data/projects.json`
— confirm you started the server from the project root, not a parent folder.

---

## 2. What's where

```
index.html               Home
works/index.html         All work + category cards
works/explainer/         ┐
works/product/           │ one page per category
works/event/             │
works/brand/             ┘
works/project/           Project template — reads ?p=<slug>
services/index.html      Services
about/index.html         About

assets/site.css          All styling, design tokens, responsive rules
assets/site.js           Card rendering, hover-scrub, data loading
assets/theme.js          Restores light/dark choice before first paint
data/projects.json       ALL CONTENT LIVES HERE
admin/index.html         Local editor for projects.json (see §6)
.claude/launch.json      Dev-server config (editor tooling only)
```

Pages are directory `index.html` files so URLs stay clean: `/works/event/`
rather than `/works-event.html`.

---

## 3. Managing content

Everything is in **`data/projects.json`**. Either use the admin panel at
**`/admin/`** (§6 — a form, with validation) or edit the file by hand as below.
There is no build to run either way.

### Add a project

Add one object to the `projects` array:

```json
{
  "slug": "acme-launch",
  "title": "Acme Launch",
  "category": "product",
  "client": "Acme",
  "year": 2026,
  "seconds": 47,
  "format": "16:9",
  "span": 6,
  "featured": false,
  "role": "Design, animation",
  "tools": "After Effects",
  "summary": "A sentence or two about the brief and what you did.",
  "video": "",
  "embed": ""
}
```

One entry automatically produces all of this:

- A card on `/works/`
- A card on its category page
- Its own page at `/works/project/?p=acme-launch`
- Updated counts ("8 pieces, 6:19 total" and the per-category tallies)

### Remove a project

Delete its object from the array. Nothing else refers to it.

### Reorder

**Array order is display order.** The first entry appears top-left. Put your
strongest piece first.

### Field reference

| Field | Notes |
| --- | --- |
| `slug` | Becomes the URL. Unique, lowercase, hyphens, no spaces. Changing it breaks any existing link to that project. |
| `title` | Shown on the card and as the page heading. |
| `category` | Must be exactly `explainer`, `product`, `event`, or `brand`. A typo hides the piece from its category page. |
| `client` | Shown in the project specs. |
| `year` | Number, not a string. |
| `seconds` | Runtime in seconds. Sets the displayed timecode **and** the length of the duration bar, which is scaled against your longest piece. |
| `format` | `16:9` (landscape card) or `4:5` (portrait card). |
| `span` | Grid width: `8` wide, `6` half, `4` narrow. Ignored on phones. |
| `featured` | `true` makes it eligible for the home page, which shows the first 4 featured pieces. |
| `role` | e.g. "Script, design, animation". |
| `tools` | e.g. "After Effects, Cinema 4D". |
| `summary` | One or two sentences on the project page. |
| `video` | Direct URL to an MP4. Leave `""` if unused. |
| `embed` | Vimeo/YouTube embed URL. Leave `""` if unused. |
| `poster` | Thumbnail still, used on the card and as the video poster. Paths are **relative to the site root** (`assets/name.jpg`) or absolute URLs. Leave `""` for the generated placeholder art. |

Content paths (`video`, `poster`) are written **relative to the site root**, not
to the page — the renderer resolves the correct depth automatically, so
`"video": "assets/demo.mp4"` works on the home page, category pages, and the
project page alike.

If both `video` and `embed` are empty, the project page shows placeholder
artwork and the label "Video not uploaded yet". `embed` wins if both are filled.
A `poster` also wins over the generated card artwork, and doubles as the video's
`poster` attribute.

### Editing categories

Category names and descriptions live in the `categories` array at the top of the
same file. Changing a category **slug** also means renaming its folder under
`works/` and updating the links — don't rename slugs casually.

### JSON gotchas

JSON is strict. These will break the file and blank the work grid:

- A trailing comma after the last item in an array or object
- Smart/curly quotes (`"like this"`) instead of straight `"`
- Missing comma between two entries

If the grid stops loading after an edit, paste the file into
<https://jsonlint.com> — it will point at the line.

---

## 4. Git and GitHub from VS Code

Git identity on this machine is already set. To check or change it:

```bash
git config --global user.name
git config --global user.email
```

### First time — publish the folder

1. Open the project folder in VS Code (**File → Open Folder**, select the folder
   itself, not a parent)
2. Click the **Source Control** icon in the left bar (branching symbol, or
   `Ctrl+Shift+G`)
3. Click **Publish to GitHub**
4. Sign in when the browser opens, and authorise VS Code
5. Choose **private** or **public** repository, and confirm the name
6. VS Code initialises the repo, makes the first commit, creates the GitHub
   repository, and pushes — all in that one step

There is no need to run `git init` first. Doing so is fine too, but the button
handles it.

### Every time after that

1. Edit files as normal
2. **Source Control** panel — changed files appear under *Changes*
3. Type a short message in the box at the top (e.g. `Add Acme Launch project`)
4. Press `Ctrl+Enter`, or click **✓ Commit**
5. Click **Sync Changes** (or the ⟳ in the status bar) to push to GitHub

A commit only saves locally. **Nothing reaches GitHub until you sync/push.**

### Working across two PCs

On the second machine, get the folder with **Clone** instead of copying it:

1. `Ctrl+Shift+P` → **Git: Clone**
2. Paste the repository URL from GitHub (green **Code** button)
3. Pick a folder

Then the rhythm is: **Sync** before you start (pull others' changes), commit as
you go, **Sync** when you finish. If you edit the same file on both machines
without syncing between, git will report a conflict and ask you to merge.

### What is deliberately not committed

See `.gitignore`. The important entries are video and editing-project files.
Git keeps every version of every file forever, so committing a 40MB render five
times leaves 200MB in history permanently — it cannot be removed without
rewriting the repo. Videos go to Cloudflare R2 or Vimeo (§5); only the URL goes
in `data/projects.json`.

Poster stills and other images are small and **should** be committed.

---

## 5. Deploying

The site is static files, so hosting is free — permanently, not as a trial.

### Which host

**Cloudflare Pages.** For a motion portfolio the deciding factor is bandwidth,
and Pages does not meter it on the free plan. Video is heavy; a 100GB/month cap
is one moderately popular project away from being a problem.

| Host | Free tier | Custom domain | Catch |
| --- | --- | --- | --- |
| **Cloudflare Pages** | Unmetered bandwidth, 500 builds/mo | Free, with SSL | **25MB max per file** — video must live elsewhere |
| Netlify | ~100GB/mo bandwidth | Free, with SSL | Bandwidth cap; large media needs Git LFS |
| GitHub Pages | ~100GB/mo soft cap | Free, with SSL | Free plan only serves **public** repos |
| Vercel | ~100GB/mo | Free, with SSL | Hobby plan is for non-commercial use — a portfolio that wins work is arguable |

Limits change; check the current pages before relying on a number.

### Deploy, step by step

1. Push the repo to GitHub (§4)
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**
3. Authorise GitHub, pick the repository
4. Build settings — this is the step people get wrong:
   - Framework preset: **None**
   - Build command: **leave empty**
   - Build output directory: **`/`**

   There is no build step. Anything in the build command field will fail.
5. **Save and Deploy.** You get a `*.pages.dev` URL in under a minute.

Every push to `main` redeploys automatically. Pull requests get their own preview
URL, which is a good way to check a change before it goes live.

### Custom domain

Buy the domain anywhere — **Cloudflare Registrar** sells at wholesale with no
markup and no first-year-cheap/renewal-expensive trick, which is the thing to
watch elsewhere. Compare the **renewal** price, not the first year.

Then: Pages project → **Custom domains** → **Set up a domain** → enter it. If the
domain uses Cloudflare DNS, the record is created for you and SSL is issued
automatically within minutes. If it is registered elsewhere, either point its
nameservers at Cloudflare or add the CNAME they show you.

### Free email on your domain

**Cloudflare Email Routing** forwards `hello@yourdomain.com` to your Gmail for
free — which replaces the placeholder address in §8. Receiving and forwarding is
free and takes about two minutes. *Sending* as that address needs an SMTP
provider (Zoho Mail's free tier is the usual choice) — set it up only if replying
from your personal Gmail address bothers you.

### Video hosting

**Cloudflare Pages rejects any file over 25MB**, and `.gitignore` blocks `*.mp4`
anyway, so video never ships with the site.

Put it on **Cloudflare R2** — 10GB free and, critically, **zero egress fees**.
With self-hosted video, bandwidth is the cost that bites, not storage. Upload the
file, copy its public URL, paste it into the `video` field. Long pieces can go to
Vimeo via `embed` instead.

### Before the first deploy

- [ ] Delete `garskey-direction.html` (old mockup, wrong studio name)
- [ ] Upload `hero1.mp4`, `hero-poster.jpg` and `Nyawiji.mp4` to R2 and replace
      the paths with their URLs — right now all three 404 (§8.1)
- [ ] Replace `hello@putrategar.studio` with the real address
- [ ] Add a favicon
- [ ] Decide whether `/admin/` should ship (harmless and `noindex`, but it is a
      public URL)

---

## 6. Admin panel

Open **`/admin/`** in the browser (with the local server running, that's
<http://localhost:5173/admin/>). It is a single file with no dependencies, no
account, and no server — it edits `data/projects.json` directly on your disk.

### Using it

1. Open `/admin/` — **the content loads by itself**, no dialog
2. Click any row to expand its form; edit the fields
3. **Save** — the first time ever, it asks which file to write (choose
   `data/projects.json`) and then grants write permission. It remembers the
   file from then on, so later saves are one click
4. Commit in VS Code as usual (§4)

**Reload from disk** re-reads the file, discarding unsaved edits — useful after
a `git pull`. **Choose file…** is only for when the automatic load fails, or to
point at a different copy.

The file is remembered in IndexedDB, not the file *contents* — nothing about your
work is stored in the browser.

Rows can be reordered with ↑ / ↓ (array order is display order), copied with
**Duplicate**, or removed with **Delete**. **Add project** puts a new blank entry
at the top.

### What it checks before saving

Save stays disabled while anything is wrong, and a panel lists every problem:

- Missing slug or title
- A slug that is duplicated, or not lowercase-with-hyphens
- A category outside the four valid ones
- Runtime that is not a whole number above zero, or a year that is not four digits
- A YouTube **watch** link in the embed field — an iframe needs the `/embed/`
  form, so it warns rather than letting you ship a blank player

It also previews the poster image live and tells you if the path resolves to
nothing.

### Browser support

Writing in place uses the File System Access API — **Chrome or Edge**. Firefox
and Safari still work, but **Save** downloads `projects.json` and you replace
the file in `data/` yourself. The page detects this and says so.

### Notes

- Saving reformats the file with 2-space indentation. The **first** save will
  therefore produce a large diff; every one after that is clean.
- The `categories` array is preserved untouched — edit it by hand for now.
- Deploying `/admin/` publicly is harmless (it can only write to a file you pick
  in a dialog, and it carries `noindex`), but you can exclude it if you'd rather.
- The page makes **no network requests at all** — it only reads the file you
  choose in the dialog. So it also works by opening `admin/index.html` directly
  from disk, without a server. (The rest of the site does not; it needs one.)
- **If you use VS Code Live Server**, saving from the panel changes
  `projects.json`, which makes Live Server reload the page — and the reload
  drops the open file, so you have to pick it again. Either use the Python
  server for content work, or add the `ignoreFiles` setting shown in §1.

## 7. Design system quick reference

All tokens are CSS custom properties at the top of `assets/site.css`.

**Light is the default**, unconditionally — it does not follow the operating
system's dark-mode setting. Dark is opt-in via the header toggle and is
remembered in `localStorage` under `pt-theme`.

| Token | Light | Dark |
| --- | --- | --- |
| `--ink` (page) | `#F4F4F7` | `#0B0B0D` |
| `--fg` (text) | `#121216` | `#EDEDF0` |
| `--explainer` | `#8A6A00` | `#E8C547` |
| `--product` | `#136D7B` | `#56C5D0` |
| `--event` | `#A82F60` | `#E0609B` |
| `--brand` | `#5040A8` | `#8B7BE8` |

Each accent is tuned separately per theme rather than inverted, so all text
passes WCAG AA contrast in both.

> **If you edit the palette:** the light values appear **once** in `:root`, and
> the dark values **once** in `:root[data-theme="dark"]`. Keep the two blocks in
> sync — if they drift, one theme ends up rendering its text on the other
> theme's background.

**Typeface** is Inter Tight, loaded from Google Fonts via `@import` at the top of
`site.css`. It needs an internet connection; offline it falls back to the system
sans-serif and looks noticeably different. Self-hosting the font is a later
improvement — `@import` is also the slowest way to load a webfont, since the
browser must fetch and parse `site.css` before it even discovers the font.

### Motion

| Where | What |
| --- | --- |
| Hero headline | Per-word rise from blur. An inline script in `index.html` wraps each word in a `.wd` span (before first paint, so the plain headline never flashes); each animates `wd-in` — 0.72s, up from `translateY(.62em)` and `blur(14px)` — on an 80ms stagger. Word-level rather than per-letter, so a word can never break across two lines. |
| Hero background | Looping muted video behind the text at 50% opacity. |
| Cards without a poster | 8 generated SVG frames that pointer position scrubs through. |
| Home-page grid | Packed "pinboard" layout (`layout: 'pins'`). Fixed column count per breakpoint — 4 / 3 / 2 / 1 — with each card given a row span matching its own height, so cards pack instead of aligning into ragged rows. Reading order stays left-to-right. |
| Cards with a poster | Still image, gentle zoom on hover. |
| Touch devices | No hover, so each card plays its build once as it scrolls into view. |

The headline keeps working with JavaScript disabled — the split simply doesn't
happen and the sentence renders normally.

---

## 8. Known gaps

### Open bugs

1. **Missing media files.** `index.html` points at `assets/hero1.mp4` and
   `assets/hero-poster.jpg`; the `testing` project points at
   `assets/Nyawiji.mp4`. **None of these files exist** — all three return 404, so
   the hero panel is empty and that project page shows a dead player.

   Worse, `.gitignore` excludes `*.mp4`, so adding them locally still won't get
   them to GitHub or Cloudflare. Resolve it one of two ways:
   - Host the videos on Cloudflare R2 or Vimeo and put the **URL** in
     `video` / `embed` (recommended — see §5), or
   - Keep them local and add a deliberate exception to `.gitignore`, accepting
     that they bloat the repo permanently.

   The hero loop in particular should be a heavily compressed 3–6 second file,
   not a full render — it downloads on every visit, including on mobile data.

2. **Content mismatch.** The `testing` project still carries Ledgerline's
   summary about reconciliation software.

3. **Inconsistent escaping.** `cardHTML()` escapes everything through `esc()`,
   but `works/project/index.html` interpolates `p.embed`, `p.title`, `p.summary`,
   `p.client`, `p.role` and `p.tools` straight into `innerHTML`. Harmless while
   you write the JSON by hand; a real hole if that file ever comes from elsewhere.

4. **The hero video ignores `prefers-reduced-motion`.** An autoplaying loop is
   exactly what that setting exists to suppress. There is also no scrim behind
   the hero text, so legibility depends entirely on the footage.

5. **No favicon** — every page load logs a 404.

6. **`document.body.className = 'c-' + p.category`** on the project page
   overwrites rather than adds, destroying any other body class.

### Deliberate trade-offs

7. **All content is placeholder** apart from the first entry. Client names,
   summaries and runtimes are invented.

8. **`hello@putrategar.studio` is a guess.** Replace it — it appears on the home,
   works, services and about pages.

9. **Project URLs use a query string** (`/works/project/?p=slug`) rather than
    `/works/acme-launch/`. The cost of having no build step; a small generator
    could produce clean URLs later.

10. **Client-side rendering.** The work grid is built by JavaScript, so it is
    weaker for SEO than pre-rendered HTML. Google executes JS and will index it,
    but it is a real trade-off.

11. **Header and footer are duplicated across 9 pages.** Changing a nav item
    means 9 edits. Fine at this size; the first thing that will decay.

12. **Generated card art is heavy.** With no posters, `/works/` ships 64 inline
    SVGs (~986 nodes, ~120KB of grid HTML). Each real `poster` removes one
    card's worth.

13. **`garskey-direction.html`** in the root is the superseded mockup under the
    old studio name. Delete it before launching.

16. **The "Brand" category** exists as a fourth mode, but the sitemap only showed
    three (Explainer, Product, Event). Confirm whether it stays.

---

## 9. Troubleshooting

| Symptom | Cause |
| --- | --- |
| "Work list unavailable" | Opened via `file://`, or the server isn't running from the project root. Use a local server (§1). |
| Count stuck on "loading" | Same as above, or `projects.json` has a syntax error. |
| A project is missing from its category page | `category` value doesn't exactly match a category slug — check spelling and case. |
| Cards look plain / wrong font | `site.css` didn't load, or no internet for Google Fonts. |
| Theme toggle resets when navigating | `theme.js` isn't loading — it must be in `<head>` on every page, before the stylesheet renders. |
| Clicking a card 404s | `slug` doesn't match, or you're viewing a stale copy of `projects.json` — hard-refresh with `Ctrl+Shift+R`. |
| Hero area is an empty panel | `assets/hero1.mp4` is missing (§8.1). |
| Project page shows a broken player | The `video` path points at a file that isn't there — check it resolves, and remember `.gitignore` excludes `*.mp4` (§8.1). |
| Card shows generated art, not my still | `poster` is empty, or the path is wrong. The admin panel (§6) previews it and flags a bad path. |
| Admin panel's Save button stays greyed out | Something failed validation — the panel above the list names every problem. |
| Admin panel downloads a file instead of saving | Firefox or Safari. Use Chrome or Edge to write in place (§6). |
