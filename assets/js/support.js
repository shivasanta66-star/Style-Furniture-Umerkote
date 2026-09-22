/*
 * support.js — shared configuration and helpers for the Style Furniture site.
 *
 * EDIT THE `SITE` OBJECT BELOW and every page updates: phone numbers, address,
 * opening hours, map link and social links are all read from here at runtime.
 * Anything written as "XXXXX" or marked TODO is a placeholder that must be
 * replaced with the showroom's real details before the site goes live.
 */

export const SITE = {
  name: 'Style Furniture',
  tagline: 'Umerkote',
  // TODO: replace with the showroom's real number (digits only, with country code).
  phone: '919999999999',
  phoneDisplay: '+91 99999 99999',
  // TODO: replace with the WhatsApp business number if it differs from the above.
  whatsapp: '919999999999',
  email: 'hello@stylefurniture.example',
  address: {
    line1: 'Main Road, near Bus Stand',   // TODO: confirm
    line2: 'Umerkote, Nabarangpur',
    state: 'Odisha',
    pin: '764073',
  },
  // TODO: paste the showroom's own Google Maps share link.
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Style+Furniture+Umerkote',
  mapsEmbed: 'https://www.google.com/maps?q=Umerkote,+Odisha+764073&output=embed',
  hours: [
    { days: 'Monday – Saturday', time: '9:00 am – 8:30 pm' },
    { days: 'Sunday', time: '10:00 am – 6:00 pm' },
  ],
  social: {
    facebook: '',   // TODO
    instagram: '',  // TODO
    youtube: '',    // TODO
  },
  established: 2012, // TODO: confirm the year the showroom opened.
};

/* ------------------------------------------------------------------ *
 * Tiny DOM helpers
 * ------------------------------------------------------------------ */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/* ------------------------------------------------------------------ *
 * Formatting + links
 * ------------------------------------------------------------------ */

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Price ranges are indicative; the showroom quotes the final price in store. */
export function formatPrice(from, to) {
  if (!from) return 'Price on request';
  if (to && to !== from) return `${rupees.format(from)} – ${rupees.format(to)}`;
  return `From ${rupees.format(from)}`;
}

export function telHref(number = SITE.phone) {
  return `tel:+${String(number).replace(/\D/g, '')}`;
}

export function whatsappHref(message = "Hello! I'd like to know more about your furniture.") {
  const number = String(SITE.whatsapp).replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function enquiryHref(product) {
  if (!product) return whatsappHref();
  return whatsappHref(
    `Hello ${SITE.name}! I'm interested in the "${product.name}". Could you share availability and the best price?`
  );
}

export function fullAddress() {
  const a = SITE.address;
  return `${a.line1}, ${a.line2}, ${a.state} ${a.pin}`;
}

/* ------------------------------------------------------------------ *
 * Behaviour shared by every page
 * ------------------------------------------------------------------ */

/** Mobile nav drawer. */
function initNav() {
  const toggle = $('[data-nav-toggle]');
  const menu = $('[data-nav-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    document.body.classList.toggle('is-locked', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  // Reset when we cross back to the desktop layout.
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/** Sticky header gets a shadow once the page scrolls. */
function initHeaderState() {
  const header = $('[data-header]');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  update();
  addEventListener('scroll', update, { passive: true });
}

/** Light/dark toggle, remembered per browser. Falls back to the OS setting. */
function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem('sf-theme');
  } catch {
    /* private mode / blocked storage — stay on the OS preference */
  }
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.dataset.theme = stored;
  }

  $$('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const isDark =
        document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme &&
          matchMedia('(prefers-color-scheme: dark)').matches);
      const next = isDark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('sf-theme', next);
      } catch {
        /* ignore */
      }
    });
  });
}

/** Fade sections in as they scroll into view (skipped for reduced motion). */
function initReveal() {
  // Tells the head-script failsafe that the reveal animation is alive, so it
  // does not strip `has-js` and show everything at once.
  document.documentElement.setAttribute('data-reveal-ready', '');

  const targets = $$('[data-reveal]');
  if (!targets.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );
  targets.forEach((t) => io.observe(t));
}

/** Fill every [data-site="..."] slot from SITE, and point contact links at it. */
function initSiteDetails() {
  const values = {
    name: SITE.name,
    phone: SITE.phoneDisplay,
    email: SITE.email,
    address: fullAddress(),
    'address-line1': SITE.address.line1,
    'address-line2': `${SITE.address.line2}, ${SITE.address.state} ${SITE.address.pin}`,
    year: String(new Date().getFullYear()),
    established: String(SITE.established),
  };
  $$('[data-site]').forEach((node) => {
    const value = values[node.dataset.site];
    if (value) node.textContent = value;
  });

  $$('[data-link="tel"]').forEach((a) => (a.href = telHref()));
  $$('[data-link="whatsapp"]').forEach((a) => (a.href = whatsappHref(a.dataset.message || undefined)));
  $$('[data-link="maps"]').forEach((a) => (a.href = SITE.mapsUrl));
  $$('[data-link="email"]').forEach((a) => (a.href = `mailto:${SITE.email}`));

  $$('[data-hours]').forEach((list) => {
    list.replaceChildren(
      ...SITE.hours.map((h) =>
        el('div', { class: 'hours__row' }, [
          el('span', { class: 'hours__days' }, h.days),
          el('span', { class: 'hours__time' }, h.time),
        ])
      )
    );
  });
}

/** Mark the current page in the nav. */
function initActiveNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('[data-nav-menu] a[href]').forEach((a) => {
    const target = a.getAttribute('href').split('#')[0];
    if (target && target === here) a.setAttribute('aria-current', 'page');
  });
}

export function initSite() {
  initTheme();
  initNav();
  initHeaderState();
  initSiteDetails();
  initActiveNav();
  initReveal();
}
