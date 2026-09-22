# Style Furniture — Umerkote

Website for **Style Furniture**, a furniture showroom in Umerkote, Nabarangpur,
Odisha. Four pages, no build step, no dependencies — plain HTML, CSS and ES
modules that can be dropped on any static host.

```
index.html          Home — hero, rooms, featured pieces, how it works, gallery, visit
products.html       Full catalogue with room filters, search and an FAQ
about.html          The showroom's story, how we work, the team
contact.html        Address, hours, map and a WhatsApp enquiry form
assets/css/styles.css
assets/js/support.js      Site config (phone, address, hours) + shared behaviour
assets/js/image-slot.js   <image-slot> custom element — photo placeholders
assets/js/products.js     The catalogue data
assets/js/main.js         Page wiring
assets/img/               Drop showroom photographs here
```

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

It must be served over HTTP rather than opened as a `file://` path, because the
pages load ES modules.

## Before this goes live — required edits

Everything marked `TODO` is a placeholder. Two files hold all of it.

**1. `assets/js/support.js` — the `SITE` object.** Every page reads from here,
so changing it once updates the whole site:

| Field | What to put |
|---|---|
| `phone`, `whatsapp` | Real numbers, digits only with country code (`91…`) |
| `phoneDisplay` | How the number should be printed |
| `email` | A real mailbox (currently an `.example` address) |
| `address` | Confirm street, landmark and PIN |
| `mapsUrl`, `mapsEmbed` | The showroom's own Google Maps links |
| `hours` | Real opening times |
| `social` | Facebook / Instagram / YouTube URLs |
| `established` | The year the showroom opened |

**2. `assets/js/products.js`** — the catalogue. The price ranges are
placeholders; replace them with the showroom's own. Add or remove items freely
— both the home page and the products page rebuild from this list.

**3. Sample reviews.** The three testimonials on the home page are marked
`SAMPLE CONTENT` in `index.html`. Replace them with real, permitted customer
reviews, or delete the section. Do not publish the samples as if they were
genuine.

## Adding photographs

Photos go in `assets/img/`, and each one is placed through an `<image-slot>`:

```html
<image-slot ratio="4/3" label="Showroom sofa display"
            alt="Sofa sets on display" src="assets/img/sofa-display.jpg"></image-slot>
```

For catalogue items, set the `image` field in `products.js` instead —
`image: 'assets/img/royal-sofa.jpg'`.

Until a `src` is given, the slot draws a labelled placeholder at the right
aspect ratio. That means the layout is already correct and it is obvious which
photographs still need taking. A broken or missing file falls back to the
placeholder rather than a broken-image icon.

Shots worth taking: the shop front, a wide view of the floor, one clean shot
per room category, and a few delivered sets in customers' homes.

## How the enquiry form works

There is no backend. The contact form packages what the visitor typed into a
WhatsApp message and opens it in a new tab, so enquiries land in the showroom's
normal WhatsApp inbox. If you later want them by email instead, point the form
at a form service and replace the submit handler in `main.js`.

## Notes

- **Theme** — follows the operating system, with a toggle in the header that is
  remembered per browser.
- **Accessibility** — skip link, visible focus rings, labelled controls, live
  region on the catalogue count, and `prefers-reduced-motion` respected.
- **SEO** — per-page titles and descriptions, Open Graph tags, and
  `FurnitureStore` structured data generated from `SITE` (helps the showroom
  surface in local and map results). Add a real `og:image` once there is a
  photograph worth sharing.
- **Fonts** — Fraunces and Inter from Google Fonts, with system-font fallbacks
  if they fail to load.

## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, or plain
shared hosting. There is nothing to build: upload the repository as-is.

---

### On the Claude Design import

This site was **not** generated from the `Style Furniture.dc.html` Claude Design
project. That project could not be read from this session — the design MCP
needs an authorization that `/design-login` cannot obtain in a remote Claude
Code session, and the project URL returns HTTP 403 without it.

The layout, palette and copy here are therefore an independent design, built to
the same brief. To bring the original design in, either run `/design-login` in
an interactive Claude Code session on a local machine, or use Claude Design's
**"Send to Claude Code Web"**, which seeds the project files into the workspace.
