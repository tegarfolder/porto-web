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
- A "Recent Works" heading, then a row of bento-style tiles — however many
  content blocks are currently marked `featured` (§3), up to 8. Each tile's
  title only shows on hover/focus; at rest they're plain images.

The hero video panel will be empty until `assets/hero1.mp4` exists — see §8.

If `/works/` shows "loading" forever instead of a piece count, the server
isn't serving `data/projects.json` — confirm you started the server from the
project root, not a parent folder.

---

## 2. What's where

```
index.html               Home
works/index.html         All work + category cards
works/explainer/         ┐
works/product/           │
works/event/             │ one page per category
works/brand/             │
works/exploration/       ┘
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
  "format": "16:9",
  "span": 6,
  "featured": false,
  "tags": "product, launch",
  "tools": "After Effects",
  "summary": "A sentence or two about the brief and what you did.",
  "poster": "",
  "blocks": []
}
```

One entry automatically produces all of this:

- A card on `/works/`
- A card on its category page
- Its own page at `/works/project/?p=acme-launch`
- An updated piece count on `/works/` and the per-category tallies

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
| `category` | Must be exactly `explainer`, `product`, `event`, `brand`, or `exploration`. A typo hides the piece from its category page. |
| `client` | Shown in the project specs. |
| `format` | Card and still aspect ratio. One of `21:9` (cinematic), `16:9` (landscape), `4:3` (standard), `1:1` (square), `4:5` (portrait), `9:16` (vertical). |
| `span` | Grid width on `/works/`: `8` wide, `6` half, `4` narrow. Ignored on phones, and irrelevant to the home page (its bento layout doesn't use `span`/`format` at all — see below). **`span` sets the width and `format` sets the height**, so a tall ratio in a wide slot makes a huge card — `9:16` at span 8 is about 802×1426px. The admin panel shows the resulting size and warns past 900px. |
| `featured` | Not currently used by anything rendered. What the home page shows is controlled per **content block**, not per project — see `featured` under "Content blocks" below. Left in place rather than stripped from existing data; harmless either way. |
| `tags` | Shown as "Hashtags" in the admin panel. Comma-separated, e.g. `"json, interactive, sport"` — rendered on the project page as `#json #interactive #sport` chips. |
| `tools` | e.g. "After Effects, Cinema 4D". |
| `summary` | Shown as "Overview" in the admin panel. One or two sentences on the project page. |
| `poster` | Shown as **Thumbnail** in the admin panel. Grid-card override — see "Card thumbnails" below for the full resolution order. Paths are **relative to the site root** (`assets/name.jpg`) or absolute URLs. An image (JPEG/PNG/WebP/GIF) shows as a still; a video (WebM/MP4/MOV, by file extension) plays muted and looping instead — a moving thumbnail. Must be hosted on R2 if it's a video; not committed to the repo. |
| `blocks` | The project page's content, in order — see "Content blocks" below. |

Content paths (`poster`, and any `blocks` entry using a site-relative path) are
written **relative to the site root**, not to the page — the renderer resolves
the correct depth automatically. In practice every block URL should just be a
full `https://` link (an R2 URL or a provider's embed link), which is passed
through unchanged.

If `blocks` is empty, the project page shows placeholder artwork and the label
"Video not uploaded yet". A `poster` wins over the generated card artwork, and
doubles as a self-hosted video block's own `poster` attribute.

### Card thumbnails

The `/works/` and category-page **grid card** for a project resolves its
thumbnail in this order:

1. The top-level `poster` field, if set (image or video, per the table above).
2. Otherwise, the **first block with `useAsThumbnail: true`** (admin panel:
   "Use as project thumbnail", under Content) — its own file if it's an
   image, its own `poster` still if it has one, a YouTube still if it's a
   YouTube block with neither, or — for a self-hosted R2 video with no
   still — the video file itself, played as a moving thumbnail.
3. Otherwise, generated placeholder art.

This is deliberately explicit rather than automatic: nothing becomes a card's
thumbnail just because it happens to be the first block. Pick which one (if
any) should represent the project on the grid.

### Content blocks

A project's page is a **stack of content blocks** — video and image, in the
order they're listed — not a single embed. This is what makes it a case study
rather than a one-clip player: a hero clip, then a couple of stills, then a
detail loop, each rendered full-width in sequence. Build the stack from the
admin panel (**Add block** → pick a type → fill it in) rather than by hand;
each entry looks like this:

**Page layout:** `#proj` caps out at 860px and centres itself — narrower than
the site's usual 1440px `.shell`, with visible margin on both sides at any
wider viewport, rather than running edge to edge like the rest of the site.
Above the block stack, `.pmeta` lists Description, Category, Hashtags, and
Tools, in that order, as stacked labelled rows (Category and each hashtag/tool
as its own pill) — `client` still exists in the data but isn't shown here.
A row is simply omitted when its value is empty, so an untagged
project doesn't show a bare "Tags" label over nothing.

**Aspect ratio:** an `image` block or an `r2` video block fits its own file's
real dimensions automatically — a 1:1 square, a 9:16 vertical clip, whatever
it actually is, full width, no cropping and no forced 16:9. This is genuine
browser-level detection (the element's own intrinsic size), not a guess, so
it needs no field to set. An iframe embed (`youtube`/`vimeo`/`mux`/`frameio`/
`custom`) stays fixed at 16:9 — a cross-origin iframe's *content* ratio isn't
something the page outside it can read at all, so there's nothing to detect
there; if a source is meaningfully non-16:9 (a vertical Short, say), it'll be
letterboxed within that fixed box. This only affects the project page's block
stack — grid-card and bento thumbnails keep their existing fixed/cropped
sizing (`format`/`span`, and `object-fit: cover`) unchanged.

```json
{
  "type": "video",
  "provider": "youtube",
  "url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "poster": "",
  "caption": "",
  "autoplay": false,
  "muted": false,
  "loop": true,
  "controls": true,
  "featured": false,
  "useAsThumbnail": false
}
```

| Field | Notes |
| --- | --- |
| `type` | `"video"` or `"image"`. |
| `provider` | `"youtube"`, `"vimeo"`, `"mux"`, `"frameio"`, `"custom"` (any iframe-embeddable URL), or `"r2"` (self-hosted — the only provider images use too). |
| `url` | Provider-specific — see the table below. |
| `poster` | Video only, every provider. Optional still shown before play (self-hosted), and also what this block contributes as a project thumbnail if `useAsThumbnail` is on (below) and it's needed. Leave empty on a `youtube` block and the YouTube still is used automatically instead. |
| `caption` | Optional line shown under the block, e.g. `"01, Logo animation"`. |
| `autoplay`, `muted`, `loop`, `controls` | Video only, and ignored for `frameio`/`custom` (no stable public param API to drive). **Autoplay forces `muted`** — browsers refuse unmuted autoplay outright, so the admin panel checks Muted automatically and locks it while Autoplay is on. |
| `featured` | `true` puts this block on the **home page's bento grid** — see "Home page — the bento grid" below. Video or image, either can be featured. Independent of `useAsThumbnail` (below) — a block can do either, both, or neither. |
| `useAsThumbnail` | `true` makes this block the source for the project's **grid-card thumbnail** on `/works/` and category pages, when the top-level `poster` field is empty — see "Card thumbnails" above. Independent of `featured`. |

| Provider | `url` is… |
| --- | --- |
| `youtube` | Any share/watch link — the admin panel converts it to the `youtube.com/embed/ID` form on save. |
| `vimeo` | Any share link — converted to `player.vimeo.com/video/ID`. |
| `mux` | A bare Playback ID, or a full `player.mux.com/…` link. |
| `frameio` | A share link with embedding allowed on it. |
| `custom` | Any iframe `src` — the escape hatch for a provider with no special handling. |
| `r2` (video) | A direct file URL, e.g. `https://media.putrategar.com/loop.mp4`. |
| `r2` (image) | A direct file URL, e.g. `https://media.putrategar.com/still.jpg`. |

**Every new video block — R2 included — defaults to sound-on, click-to-play,
controls visible.** R2 isn't always b-roll; it's just as often the main piece,
self-hosted instead of on YouTube/Vimeo, so there's no provider-tied default.
For the **"minimalist" treatment** — a silent, looping, chrome-free clip, the
style case-study sites use between the main pieces — check Autoplay, Loop, and
uncheck Controls on that one block (Muted checks and locks itself once
Autoplay is on). It's a combination you opt into per block, not a preset.

### Home page — the bento grid

The home page's featured section pulls individual **content blocks**, not
whole projects — check `featured` on a block (any project, any type) in the
admin panel and it appears there. This means two blocks from the *same*
project can both show up on the home page, e.g. a YouTube cut and a self-hosted
detail loop, each as its own tile.

The layout is a **fixed 8-cell template** (`.bento` in `site.css`, one tall
hero cell, one tall secondary cell, two small cells stacked beside them, and
four equal cells in a row underneath) — not a masonry that grows with however
much content exists. `featured` blocks fill it in the order their projects
appear in `data/projects.json`, then their own block order within that
project; the **9th featured block onward is simply not shown**. Fewer than 8
just leaves the template's later cells empty (nothing renders in them, no
visible gap). Whatever image lands in a cell is cropped (`object-fit: cover`)
to fill it regardless of the source's native aspect ratio — a portrait still
in a wide cell, a 21:9 frame in a tall one, both just fill the box.

A block with no derivable thumbnail (no `poster` set, and not a YouTube block)
falls back to the same generated placeholder art the project cards use
elsewhere.

Each tile is a plain image at rest; hovering (or keyboard focus) reveals the
project's title and its `tags` (§3's Hashtags field) as `#tag` chips over a
dark scrim. A project with no tags set just shows the title alone — no empty
row.

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

### Media hosting — Cloudflare R2

**Cloudflare rejects any deployed file over 25MB**, and `.gitignore` blocks
`*.mp4`/`*.mov` anyway, so video never ships as part of the site. Full videos —
and optionally the heavier images, like the hero loop's poster — live on
**Cloudflare R2** instead: 10GB free, and critically **zero egress fees**. With
self-hosted video, bandwidth is what actually costs money elsewhere; R2 removes
that cost entirely regardless of how much gets watched. (Verify the current
free-tier numbers on Cloudflare's own pricing page before relying on them —
limits change.)

No code changes are needed for any of this. `assetUrl()` in `assets/site.js`
already passes any `https://` URL straight through untouched — an R2 content
block just needs the URL pasted in via the admin panel, exactly like a
YouTube embed URL.

**1. Create the bucket**
Dashboard → **R2 Object Storage** → **Create bucket**. Name it something like
`putrategar-media`. Location: **Automatic**.

**2. Give it a real domain, not `r2.dev`**
The default `pub-xxxx.r2.dev` URL is explicitly rate-limited and not meant for
production traffic. Since `putrategar.com` is already on Cloudflare: bucket →
**Settings** → **Public access** → **Connect Domain** → enter something like
`media.putrategar.com`. Cloudflare creates the DNS record and issues the
certificate automatically — same mechanism as the site's own custom domain.

**3. Turn on edge caching**
This is the actual performance lever, and it's easy to skip by accident. R2
doesn't cache at the edge by default — every request can hit the bucket
directly. Dashboard → **Caching** → **Cache Rules** → create a rule matching
`media.putrategar.com/*` → **Cache eligibility: Eligible for cache** → set
**Edge TTL** to something long (a week or more works well, since filenames
below are effectively static). Once warm, repeat requests are served from
Cloudflare's edge, not from R2 — faster for visitors, and it keeps the bucket's
own request count low.

**4. Compress before uploading — this matters more than the free storage**
R2 removes the *cost* of a heavy file; it doesn't make a heavy file fast to
load. For hero loops and card backgrounds specifically:
- **H.264 MP4** is the safe universal choice — WebM/AV1 compress better but
  Safari support is inconsistent, and a background loop isn't worth a fallback
  chain. Target the lowest bitrate that still looks clean at the size it's
  actually displayed at (a hero loop rarely needs more than 1080p).
- A 3–8 second loop, muted, heavily compressed, is usually under 3–5MB.
  If a source export comes back at 40MB+, re-export at a lower bitrate before
  uploading rather than relying on R2/cache to absorb it.
- Poster stills: WebP over PNG/JPEG at equivalent quality, usually 30–50%
  smaller.

**5. Upload and wire it up**
For this project's scale (a handful of files, added one project at a time),
drag-and-drop in the R2 dashboard is genuinely the right tool — no need for
`rclone` or the S3-compatible API unless uploads become frequent enough to
script. After uploading, copy the object's public URL
(`https://media.putrategar.com/<path>`) and paste it into an **R2** content
block (video or image) in the admin panel (§6), or into the top-level
`poster` field for a grid-card override.

**6. Naming**
Flat and predictable beats clever: `hero-loop.mp4`, `<project-slug>.mp4`,
`<project-slug>-poster.webp`. Since the Edge TTL above caches aggressively,
**changing a file's content without changing its filename** means visitors may
keep seeing the old cached version for the TTL's duration — rename on
replacement (`hero-loop-v2.mp4`) rather than overwriting in place, or purge the
cache for that path after a swap.

Vimeo (or Mux, or Frame.io) remains the better fit for long-form pieces — R2
is for the video that needs to *be* the page (hero loops, minimalist b-roll
loops between the main pieces), not a general video host.

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

Opening a project splits it into two tabs:

- **Project Setting** — Title, Slug, Category, Format, Card width, Client,
  Hashtags, Tools, Overview (the project-page summary), and Thumbnail (the
  grid-card override — image or video, see "Card thumbnails" in §3), with a
  live preview underneath.
- **Content** — the case-study body (see "Content blocks" in §3): pick a
  type from the dropdown, click **+ Add block**, fill in its URL. Each block
  gets its own ↑ / ↓ / Delete, a **Show in Recent Works** checkbox (puts it
  on the home page's bento grid — "Home page — the bento grid" in §3), a
  **Use as project thumbnail** checkbox (supplies the grid-card thumbnail
  when Project Setting's Thumbnail is empty — the two are independent), and
  video blocks (other than Frame.io/Custom) also get Autoplay / Muted / Loop
  / Controls checkboxes.

### Publishing a new piece — start to finish

This is the loop for a real project, R2 upload through to a committed change.
One-time bucket/domain/cache setup is §5; this is what repeats every time.

1. **Export and compress the file(s)** — see "Compress before uploading" in
   §5. A loop should be a few MB; a still should be WebP.
2. **Upload to R2** — dashboard → **R2 Object Storage** → your bucket →
   **Objects** → drag the file(s) in.
3. **Copy the object's public URL** — `https://media.putrategar.com/<filename>`
   (your custom domain, never the rate-limited `r2.dev` one — §5).
4. **Open `/admin/`**, click the project to expand it (or **Add project** for
   a new one).
5. On the **Project Setting** tab, fill in title, category, client, hashtags,
   tools, Overview. Leave Thumbnail empty for now — step 8 covers it.
6. Switch to the **Content** tab, pick a type from the dropdown — **Video:
   R2** or **Image: R2** for something you just uploaded, or YouTube/Vimeo/
   Mux/Frame.io/Custom for something hosted elsewhere — and click **+ Add
   block**.
7. Paste the URL from step 3 into the block. For a video block, set
   Autoplay / Muted / Loop / Controls to taste (see "Content blocks" in §3
   for what each does, and the "minimalist" muted-loop combination).
8. Want it on the home page? Check **Show in Recent Works**. Want it to *be*
   the project's grid-card thumbnail on `/works/`? Check **Use as project
   thumbnail** instead (or as well — they're independent). Either way, give
   the block a `poster` first if it isn't a YouTube block, so there's
   something to show.
9. Repeat 6–8 for every clip/still in the case study, **in the order they
   should appear on the page** — reorder any block afterwards with its ↑ / ↓.
10. **Save.** The very first save ever asks which file to write — choose
    `data/projects.json`; every save after that is one click.
11. Commit in VS Code as usual (§4).

Two different thumbnails, easy to conflate — see "Card thumbnails" and "Home
page — the bento grid" in §3 for the full resolution order of each: the
`/works/` **grid-card** thumbnail comes from Project Setting's Thumbnail
field, or failing that a block with **Use as project thumbnail** checked; the
**home page bento** tile comes from whichever block(s) have **Show in Recent
Works** checked, each using its own thumbnail independently. The two
checkboxes don't affect each other.

### What it checks before saving

Save stays disabled while anything is wrong, and a panel lists every problem:

- Missing slug or title
- A slug that is duplicated, or not lowercase-with-hyphens
- A category outside the five valid ones
- A content block with no URL, or — for YouTube/Vimeo blocks — a non-embeddable
  one. Paste any normal share link (`watch?v=`, `youtu.be/`, `/shorts/`,
  `vimeo.com/123`) and it is **rewritten to the embeddable form** when you
  leave the field, and again on save. A `watch` page sends
  `X-Frame-Options: SAMEORIGIN`, so an iframe pointing at one renders nothing
  at all — no error, just a blank box. Anything that cannot be converted
  blocks the save

It also previews the grid-card poster image live and tells you if the path
resolves to nothing.

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
| `--exploration` | `#14713F` | `#5ED08C` |
| `--scrim` | `rgba(10,10,12,.72)` — same in both | |

Each accent is tuned separately per theme rather than inverted, so all text
passes WCAG AA contrast in both.

> **If you edit the palette:** the light values appear **once** in `:root`, and
> the dark values **once** in `:root[data-theme="dark"]`. Keep the two blocks in
> sync — if they drift, one theme ends up rendering its text on the other
> theme's background.

**Typeface** is General Sans (Fontshare), loaded via `@import` at the top of
`site.css`. It needs an internet connection; offline it falls back to the system
sans-serif and looks noticeably different. Self-hosting the font is a later
improvement — `@import` is also the slowest way to load a webfont, since the
browser must fetch and parse `site.css` before it even discovers the font.

General Sans only ships weights 400/500/600/700 — there is no 800 or 900. Every
`font-weight` in `site.css` (and the one inline in `services/index.html`) is
capped at `700` for exactly that reason; if you ever swap in a typeface that
does have heavier cuts, those are the declarations to raise back up.

### Motion

| Where | What |
| --- | --- |
| Hero headline | Per-word rise from blur. An inline script in `index.html` wraps each word in a `.wd` span (before first paint, so the plain headline never flashes); each animates `wd-in` — 0.72s, up from `translateY(.62em)` and `blur(14px)` — on an 80ms stagger. Word-level rather than per-letter, so a word can never break across two lines. |
| Hero background | Looping muted video, **full-bleed** — it breaks out of `.shell`'s 1440px cap with a `100vw` + `translateX(-50%)` centre-out, so it runs edge to edge on any screen while the text stays on the grid. `object-fit: cover` crops it. A `--scrim` overlay sits between video and text: the footage is unknown, so the scrim is what guarantees contrast rather than the frame. **The hero is a dark island in both themes** — `.hero.center` redefines `--fg`, `--dim`, `--dimmer`, `--ink`, `--line`, `--art` and the four accents for that subtree only, so the copy is white on a dark scrim even in light mode while the rest of the page follows the theme normally. Under `prefers-reduced-motion` the video pauses (not hidden) so its poster frame remains. |
| Cards without a poster | 8 generated SVG frames that pointer position scrubs through. |
| Card thumbnails | Resolution order documented in "Card thumbnails" in §3. YouTube stills come from `img.youtube.com/vi/<id>/maxresdefault.jpg`, falling back to `mqdefault.jpg`. Only those two are true 16:9 — `hqdefault` and `sddefault` are 4:3 with black bars. Videos never uploaded in HD return either a 404 **or a 200 carrying a 120×90 grey placeholder**, so the fallback triggers on both. |
| Card shapes | Six ratios, defined once in `FORMATS` in `assets/site.js` (mirrored in `admin/index.html`). Each entry carries the CSS ratio for the box and a viewBox for the generated art, so placeholder artwork stays in proportion at any shape. |
| Home-page grid | Fixed 8-cell bento template (`.bento`), not a masonry — see "Home page — the bento grid" in §3. `renderBento()` in `site.js` pulls `featured` **blocks**, not projects, so needs no layout math at render time, unlike the works/category pages' packed grid below. |
| Works/category grid | `.grid.pins` — a packed "pinboard" layout, fixed column count per breakpoint (4 / 3 / 2 / 1), each card given a row span matching its own height so cards pack instead of leaving ragged gaps. Currently unused (the home page moved to the bento grid above) but left intact in case a future page wants a masonry layout again. |
| Cards with a poster | Still image, gentle zoom on hover. |
| Touch devices | No hover, so each card plays its build once as it scrolls into view. |

The headline keeps working with JavaScript disabled — the split simply doesn't
happen and the sentence renders normally.

---

## 8. Known gaps

### Open bugs

1. **Missing media files.** `index.html` points at `assets/hero1.mp4` and
   `assets/hero-poster.jpg`; the `testing` project also carries
   `video: "assets/Nyawiji.mp4"`. **None of these files exist** — all three
   return 404, so the hero panel renders as an empty box.

   The `testing` project itself now plays, because its `embed` takes priority
   over `video` — but clear that embed and the dead path is exposed again.

   `.gitignore` also excludes `*.mp4`, so adding the files locally still won't
   get them to GitHub or Cloudflare. Resolve it one of two ways:
   - Host the videos on Cloudflare R2 or Vimeo and put the **URL** in
     `video` / `embed` (recommended — see §5), or
   - Keep them local and add a deliberate exception to `.gitignore`, accepting
     that they bloat the repo permanently.

   The hero loop in particular should be a heavily compressed 3–6 second file,
   not a full render — it downloads on every visit, including on mobile data.

2. **Content mismatch.** The `testing` project still carries Ledgerline's
   summary about reconciliation software.

3. **Partly inconsistent escaping.** The project page now escapes the player's
   `src`, `title`, `alt`, and each hashtag chip, but still interpolates
   `summary`, `client`, `format` and `tools` straight into `innerHTML`, while
   `cardHTML()` escapes everything. Harmless while you write the JSON yourself; a real hole
   if that file ever comes from somewhere else.

4. **No favicon** — every page load logs a 404.

5. **`document.body.className = 'c-' + p.category`** on the project page
   overwrites rather than adds, destroying any other body class.

### Deliberate trade-offs

7. **All content is placeholder** apart from the first entry. Client names
   and summaries are invented.

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
| Project page shows a broken block | An `r2` block's `url` points at a file that isn't there — check it resolves, and remember `.gitignore` excludes `*.mp4` (§8.1). |
| Card shows generated art, not my still | `poster` is empty and no block has `useAsThumbnail` on, or the path is wrong. The admin panel (§6) previews it and flags a bad path. |
| Admin panel's Save button stays greyed out | Something failed validation — the panel above the list names every problem. |
| Admin panel downloads a file instead of saving | Firefox or Safari. Use Chrome or Edge to write in place (§6). |
| Admin panel asks for the file every time | The handle could not be stored — private/incognito window, or site data was cleared. |
| Embedded video is a blank box, no error | A `watch?v=` or `youtu.be` link on a YouTube block. Those send `X-Frame-Options: SAMEORIGIN` and refuse to load in a frame; only `youtube.com/embed/ID` works. Re-save via the admin panel and it converts the link. |
| Video plays but fullscreen is missing | The iframe needs `allow` and `allowfullscreen` — present on the project page; check any player you hand-wrote. |
| Home page bento is missing a piece I expect | That block's `featured` checkbox isn't on (§3), or it's the 9th+ featured block found in `data/projects.json` order — the template only has 8 cells. |
| Home page bento tile shows generic art, not my thumbnail | The block has no `poster` and isn't a YouTube block, so there's nothing to auto-derive a still from — set `poster` on it (§3, §6). |
