# Style Furniture — Gulipatna, Umerkote

The website for **Style Furniture**, in front of the Block Office, Gulipatna
Main Road, Umerkote, Odisha 764073.

This is a production build of the Claude Design file **`Style Furniture.dc.html`**
(project "Single-page site built and ready"). Layout, colours, type, spacing
and every line of copy follow that design exactly. The prototype's inline
styles and design-tool runtime have been replaced by a plain stylesheet and a
small script. There is no build step and nothing to install.

```
index.html                The page
assets/css/styles.css     All styling (design tokens at the top)
assets/js/support.js      The three settings + page behaviour
assets/js/image-slot.js   <image-slot> photo placeholders
assets/img/               Shop photographs go here
```

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## The three settings

At the top of `assets/js/support.js`. These are the same three values the
Claude Design file exposes, and every Call and WhatsApp button, the printed
numbers and the offer banner all read from them:

```js
const SITE = {
  phone: '+91 99376 01505',   // as printed; Call links dial it without spaces
  whatsapp: '919937601505',   // digits only, with the 91 country code
  offerText: '',              // one offer line; empty hides the banner
};
```

The same numbers are also written directly into `index.html` (every
`tel:` and `wa.me` link, the printed numbers, and `"telephone"` in the JSON-LD
block), so the buttons work before the script loads and search engines read
the real number. **If the number ever changes, update both places:** search
`index.html` for `9937601505`.

## Before publishing — placeholders from the design

The design marks every unconfirmed detail in square brackets, and they appear
on the page as written. Search `index.html` for `[` to find them all:

- `[OWNER NAME]` in "One number for any problem"
- `[BRANDS]` on the mattress and water purifier cards
- `[OTHER CATEGORY]` — the eighth category tile and its WhatsApp message
- `[CONFIRM]` on Home delivery, and `[CONFIRM FREE RADIUS]` in "After you buy"
- `[MORE VILLAGES]` and `[CONFIRM AREA WITH OWNER]` in "Where we deliver"
- FAQ answers for EMI, exchange and made-to-order work

## Customer reviews

The four review cards quote the shop's Google Maps listing word for word, with
the reviewers' own spelling. Three show the reviewer's name as it appears on
Google. The fourth ("Water purifier best price in style furnutre") is a
highlight Google shows without naming its reviewer, so it is credited only to
"Google review".

Signed-out visitors to Google Maps see only three full reviews, which is why
those three are used. To feature others, copy them from the listing while
signed in and replace the text in the `review-grid` block of `index.html`.
If the review count changes from 26, update it in five places: the hero badge,
the reviews heading, the footer, the `og:description` tag and the JSON-LD
`reviewCount`.

## Adding photographs

**For now every slot shows a temporary illustration** from
`assets/img/illustrations/` — flat drawings in the site palette, one per slot,
matching each slot's caption. They are stand-ins for trying the site out and
are meant to be replaced with real shop photos.

To swap one, change its `src` to the photo. When all 15 are replaced, delete
the `illustrations` folder.

Every photo on the page is an `<image-slot>`. Its `placeholder` caption
describes the shot it needs, for example "Fabric sofa set on the showroom
floor". Point `src` at the photo:

```html
<image-slot shape="rect" placeholder="Fabric sofa set on the showroom floor"
            src="assets/img/sofa-set.webp"></image-slot>
```

The caption becomes the photo's alt text; add `alt="…"` to override it. A
missing or broken file falls back to the placeholder. The brief asks for real
shop photos (local buyers recognise stock photos), in WebP, keeping the whole
page under 1.5 MB.

## Differences from the design file

- **Bug fixed — the enquiry form lost "What are you looking for".** The design
  reads fields with `form.elements[name]`. The select is named `item`, and
  `elements.item` is a built-in method, so it returned that function instead
  of the field and every enquiry arrived with "Looking for:" blank. Fixed with
  `elements.namedItem()`.
- The design has no `<title>`. The page title is "Style Furniture – Furniture
  Shop in Umerkote, Nabarangpur", set by the owner.
- Added a favicon matching the SF badge, `lang="or"` on the Odia lines, and
  labels on the section navigation and the bottom bar for screen readers.

## Where the design differs from the written brief

The page follows the design file. The brief (`Style_Furniture_Umerkote_Website_Brief.pdf`)
asked for three things the design does not do. They are left out here so the
site matches the design, and can be added if wanted:

1. **Header on phones** — the brief asks for a hamburger menu under 768px and
   a header that shrinks on scroll. The design wraps the header instead: at
   phone width it is three rows (logo, Call/WhatsApp, links), about 208px tall
   and fixed, roughly a quarter of the screen.
2. **Desktop WhatsApp button** — the brief asks for a floating round WhatsApp
   button on desktop and the three-button bar on mobile only. The design shows
   the bar at every width.
3. **Category grid** — the brief asks for 2 columns on phones; the design's
   grid gives 1 column below about 540px.

## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, or ordinary
shared hosting. Upload the folder as it is.
