/*
 * main.js — page wiring. Imported as a module by every page; each block
 * below no-ops unless the page contains the element it targets.
 */

import './image-slot.js';
import { $, $$, el, initSite, enquiryHref, SITE, fullAddress } from './support.js';
import { CATEGORIES, PRODUCTS, categoryName, featured } from './products.js';

/* ------------------------------------------------------------------ *
 * Product + category cards
 * ------------------------------------------------------------------ */

function productCard(product) {
  const slot = el('image-slot', {
    class: 'card__media',
    ratio: '4/3',
    label: product.name,
    alt: `${product.name} at ${SITE.name}, Umerkote`,
  });
  if (product.image) slot.setAttribute('src', product.image);

  return el('article', { class: 'card', dataset: { category: product.category } }, [
    el('div', { class: 'card__frame' }, [
      slot,
      product.badge ? el('span', { class: 'card__badge' }, product.badge) : null,
    ]),
    el('div', { class: 'card__body' }, [
      el('p', { class: 'card__eyebrow' }, categoryName(product.category)),
      el('h3', { class: 'card__title' }, product.name),
      el('p', { class: 'card__summary' }, product.summary),
      el(
        'ul',
        { class: 'card__specs' },
        product.specs.map((s) => el('li', {}, s))
      ),
      el('div', { class: 'card__foot' }, [
        el('a', {
          class: 'btn btn--ghost btn--sm',
          href: enquiryHref(product),
          target: '_blank',
          rel: 'noopener',
        }, 'Enquire on WhatsApp'),
      ]),
    ]),
  ]);
}

function categoryCard(category) {
  const count = PRODUCTS.filter((p) => p.category === category.id).length;
  return el(
    'a',
    { class: 'tile', href: `products.html#${category.id}` },
    [
      el('image-slot', {
        class: 'tile__media',
        ratio: '3/4',
        label: category.name,
        alt: `${category.name} furniture`,
      }),
      el('div', { class: 'tile__body' }, [
        el('h3', { class: 'tile__title' }, category.name),
        el('p', { class: 'tile__blurb' }, category.blurb),
        el('span', { class: 'tile__meta' }, `${count} ${count === 1 ? 'range' : 'ranges'} in store`),
      ]),
    ]
  );
}

function renderCategories() {
  const host = $('[data-categories]');
  if (!host) return;
  host.replaceChildren(...CATEGORIES.map(categoryCard));
}

function renderFeatured() {
  const host = $('[data-featured]');
  if (!host) return;
  host.replaceChildren(...featured(6).map(productCard));
}

/* ------------------------------------------------------------------ *
 * Products page: filter + search
 * ------------------------------------------------------------------ */

function initCatalogue() {
  const host = $('[data-catalogue]');
  if (!host) return;

  const filterBar = $('[data-filters]');
  const search = $('[data-search]');
  const status = $('[data-result-count]');
  const empty = $('[data-empty]');

  let active = 'all';
  let query = '';

  const filters = [{ id: 'all', name: 'Everything' }, ...CATEGORIES];
  filterBar?.replaceChildren(
    ...filters.map((f) =>
      el(
        'button',
        {
          class: 'chip',
          type: 'button',
          dataset: { filter: f.id },
          'aria-pressed': String(f.id === 'all'),
        },
        f.name
      )
    )
  );

  function apply() {
    const q = query.trim().toLowerCase();
    const matches = PRODUCTS.filter((p) => {
      const inCategory = active === 'all' || p.category === active;
      if (!inCategory) return false;
      if (!q) return true;
      return [p.name, p.summary, categoryName(p.category), ...p.specs]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    host.replaceChildren(...matches.map(productCard));
    if (empty) empty.hidden = matches.length > 0;
    if (status) {
      const label = active === 'all' ? 'all ranges' : categoryName(active);
      status.textContent = matches.length
        ? `Showing ${matches.length} of ${PRODUCTS.length} ranges — ${label}.`
        : `Nothing matches that search in ${label}.`;
    }
    $$('[data-filter]', filterBar || document).forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.filter === active))
    );
  }

  filterBar?.addEventListener('click', (e) => {
    const button = e.target.closest('[data-filter]');
    if (!button) return;
    active = button.dataset.filter;
    history.replaceState(null, '', active === 'all' ? location.pathname : `#${active}`);
    apply();
  });

  search?.addEventListener('input', (e) => {
    query = e.target.value;
    apply();
  });

  const fromHash = location.hash.slice(1);
  if (fromHash && CATEGORIES.some((c) => c.id === fromHash)) active = fromHash;

  apply();
}

/* ------------------------------------------------------------------ *
 * Contact form — hands the enquiry to WhatsApp, so the site needs no backend
 * ------------------------------------------------------------------ */

function initEnquiryForm() {
  const form = $('[data-enquiry-form]');
  if (!form) return;

  const note = $('[data-form-note]');
  const interest = form.elements.interest;
  if (interest && interest.tagName === 'SELECT') {
    interest.append(
      ...CATEGORIES.map((c) => el('option', { value: c.name }, c.name)),
      el('option', { value: 'Something else' }, 'Something else')
    );
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const lines = [
      `Hello ${SITE.name}!`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Looking for: ${data.get('interest') || 'Not specified'}`,
    ];
    const message = String(data.get('message') || '').trim();
    if (message) lines.push('', message);

    const url = `https://wa.me/${String(SITE.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(url, '_blank', 'noopener');
    if (note) {
      note.hidden = false;
      note.textContent = `Thanks ${name || 'there'} — WhatsApp should have opened with your enquiry. If it did not, call us on ${SITE.phoneDisplay}.`;
    }
  });
}

/* ------------------------------------------------------------------ *
 * Map + structured data
 * ------------------------------------------------------------------ */

function initMap() {
  const frame = $('[data-map]');
  if (frame && !frame.src) frame.src = SITE.mapsEmbed;
}

/** Local-business structured data, so the showroom can surface in map results. */
function initStructuredData() {
  if (!$('[data-structured-data]')) return;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: SITE.name,
    description: `Furniture showroom in ${SITE.address.line2}, ${SITE.address.state} — sofas, beds, wardrobes, dining sets, mattresses and office furniture.`,
    telephone: `+${SITE.phone}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.line2,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.pin,
      addressCountry: 'IN',
    },
    areaServed: 'Umerkote, Nabarangpur, Odisha',
    hasMap: SITE.mapsUrl,
  };
  const script = el('script', { type: 'application/ld+json' });
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

function boot() {
  initSite();
  renderCategories();
  renderFeatured();
  initCatalogue();
  initEnquiryForm();
  initMap();
  initStructuredData();

  // Keep the printed address in sync for anyone copying it.
  $$('[data-copy-address]').forEach((button) =>
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`${SITE.name}, ${fullAddress()}`);
        button.textContent = 'Address copied';
        setTimeout(() => (button.textContent = 'Copy address'), 2200);
      } catch {
        button.textContent = 'Press Ctrl/Cmd + C';
      }
    })
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
