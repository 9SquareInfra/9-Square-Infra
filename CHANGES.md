# Changes in this package (site update 1.1.0)

Prepared for manual upload to `https://github.com/9squareinfra/9-Square-Infra` (GitHub Pages).  
Unzip so these files land at the **repo root** (same level as today’s `index.html`).

## New files

| File | Purpose |
|------|---------|
| `apps-script/Code.gs` | Google Apps Script web app: appends consultation + newsletter rows to a Sheet and emails `9squareinfra9@gmail.com` |
| `SETUP.md` | Step-by-step deploy instructions; where to paste the Web App URL in `app.js` |
| `privacy.html` | Privacy policy page (matches site styling) |
| `robots.txt` | Allows crawlers; points to sitemap |
| `sitemap.xml` | Home + privacy URLs |
| `CHANGES.md` | This file |

## Modified files

| File | What changed |
|------|----------------|
| `index.html` | SEO (title, description, canonical, Open Graph, Twitter, LocalBusiness JSON-LD); Real Estate service card; form dropdown + plot category; neutral placeholders; success modal default “Thank you!”; founder block (Er. Rahel Shaik); corrected Eluru address + map iframe + Get directions; philosophy centre labelled **05. Identity**; removed Facebook/YouTube `#` icons; Privacy Policy → `privacy.html`; newsletter form id (no fake alert); cache bust `?v=1.1.0` |
| `app.js` | Shared `LEAD_CAPTURE_URL` (paste once); consultation POSTs `type:"consultation"` as `text/plain` JSON when URL set; WhatsApp handoff unchanged; works with empty URL; success copy “Thank you!”; newsletter handler `type:"newsletter"` |
| `styles.css` | Founder card, map wrap, directions link, newsletter status, identity label; services grid `auto-fit` for five cards |

## Unchanged (copied from live site)

All `assets/images/*` (14 PNGs).

## Upload checklist

1. Replace repo root files with this package (keep or overwrite images — same assets).
2. Follow `SETUP.md` to deploy Apps Script and paste URL into `LEAD_CAPTURE_URL` in `app.js`.
3. Commit & push; wait for GitHub Pages to refresh (hard-refresh if CSS/JS cached).
