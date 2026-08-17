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

### Checking it works

You should see, on the home page:

- A centred headline that wipes in behind a thin vertical line
- 4 project cards below it
- The label "Selected work — 4 pieces, 4:05 total"

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
.claude/launch.json      Dev-server config (editor tooling only)
```

Pages are directory `index.html` files so URLs stay clean: `/works/event/`
rather than `/works-event.html`.

---

## 3. Managing content

Everything is in **`data/projects.json`**. Edit it in any text editor and refresh
the browser. There is no build to run.

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

If both `video` and `embed` are empty, the project page shows placeholder
artwork and the label "Video not uploaded yet". `embed` wins if both are filled.

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

The site is static files, so almost any host works. Two routes:

### Fastest — drag and drop (no accounts beyond the host)

1. Go to <https://app.netlify.com/drop> or Cloudflare Pages → Create → Direct Upload
2. Drag the whole project folder in
3. You get a live URL in about 30 seconds

Good for showing someone. To update, you drag the folder again — there's no
version history and no admin panel.

### Recommended — Cloudflare Pages + GitHub

1. Create a free GitHub account
2. Push this folder to a new repository
3. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
4. Pick the repo. **Leave the build command empty** and set the output directory
   to `/` — there is no build step
5. Deploy

After this, every change you push goes live automatically, and it's the
prerequisite for the admin panel below.

### Video hosting

Do **not** put large video files in the repository — GitHub caps individual files
at 100MB and a repo full of video becomes painful to clone.

Put full videos on **Cloudflare R2** (10GB free, and critically **zero egress
fees** — bandwidth, not storage, is what actually costs money with self-hosted
video). Paste the resulting URL into the `video` field. Long pieces can go to
Vimeo instead via `embed`.

---

## 6. Admin panel (not set up yet)

The plan is **Sveltia CMS** — free, open source, and it writes to this same
`projects.json`. You'd get `yoursite.com/admin`: log in, fill a form, upload a
still, publish. It requires the GitHub route above, because that's where it
stores and versions content.

Sveltia rather than the better-known Decap because Decap is barely maintained now;
Sveltia is a drop-in rewrite with a much better media library.

Not built yet — ask when you want it.

---

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
improvement.

---

## 8. Known gaps

Honest list of what isn't finished:

1. **No image field.** Card thumbnails are currently *generated by JavaScript* as
   placeholder artwork. There is nowhere to put a real still. `projects.json`
   needs a `poster` field and the card renderer needs to use it. **Do this before
   entering real projects**, or you'll be editing every entry twice.
2. **All content is placeholder.** The eight projects are invented. Client names,
   summaries, and runtimes are fake.
3. **`hello@putrategar.studio` is a guess.** Replace it with the real address —
   it appears on the home, works, services, and about pages.
4. **Project URLs use a query string** (`/works/project/?p=slug`) rather than
   `/works/acme-launch/`. That's the cost of having no build step. A small
   generator script could produce clean URLs later.
5. **Client-side rendering.** The work grid is built by JavaScript, so it's
   weaker for SEO than pre-rendered HTML. Google executes JS and will index it,
   but it's a real trade-off.
6. **`garskey-direction.html`** in the root is the superseded single-page mockup
   under the old studio name. Delete it before launching.
7. **The "Brand" category** exists as a fourth mode. The sitemap diagram only
   showed three (Explainer, Product, Event) — confirm whether Brand stays.

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
