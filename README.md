# Style Furniture — Gulipatna, Umerkote

The website for **Style Furniture**, in front of the Block Office, Gulipatna
Main Road, Umerkote, Odisha 764073.

A plain HTML, CSS and JavaScript site. There is no build step and nothing to install.

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

At the top of `assets/js/support.js`. Every Call and WhatsApp button, the printed numbers and the
offer banner read from them:

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

## Before publishing: still to confirm with the owner

Unconfirmed details have been taken off the public page. Add them back once
the owner confirms (search `index.html` for `Not yet answered`):

- FAQ answers for EMI, exchange of old furniture, and made-to-order work
- The wording of the delivery and fitting claims ("Brought and set up",
  "Delivered to your house")
- Brand names for mattresses and water purifiers
- Any extra villages for "Furniture delivery around Umerkote"

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


## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, or ordinary
shared hosting. Upload the folder as it is.

## SEO and Google Business Profile

Search setup lives in the `<head>` of `index.html` (title, description,
canonical, Open Graph, geo tags, two JSON-LD blocks: `FurnitureStore` and
`FAQPage`), plus `robots.txt` and `sitemap.xml`. The share image is
`assets/img/og-share.jpg` (1200 × 630). If the opening hours, rating or
review count change, update the JSON-LD as well as the visible text.

See `GOOGLE-BUSINESS.md` for the checklist to do in the Google Business
Profile itself.

## Performance

The page is about 34 KB of HTML, 26 KB of CSS and 13 KB of script, with no
build step. Web fonts load without blocking first paint, the hero image is
preloaded, and the header spacer has a default height so nothing jumps when the
script runs. `_headers` sets caching and basic security headers on Netlify. The
share image is a 55 KB JPEG, small enough for WhatsApp link previews. When real
photos replace the illustrations, save them as WebP at about 1200 px wide for
the hero and 800 px for the rest, to keep the page light.
