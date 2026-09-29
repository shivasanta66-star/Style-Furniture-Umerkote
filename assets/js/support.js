/*
 * support.js — settings and behaviour for the Style Furniture page.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ EDIT THESE THREE VALUES. They are the same three settings the    │
 * │ Claude Design file exposes, and every Call / WhatsApp link, the  │
 * │ printed numbers and the offer banner on the page read from them. │
 * └──────────────────────────────────────────────────────────────────┘
 */
const SITE = {
  // Shop phone, as it should be printed. Call links dial it with the spaces removed.
  phone: '+91 99376 01505',
  // WhatsApp number, digits only, with the 91 country code.
  whatsapp: '919937601505',
  // One festival or seasonal offer line. Leave empty to hide the banner.
  offerText: '',
};

(() => {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------------------------------------------------- links */

  function wa(message) {
    const digits = String(SITE.whatsapp).replace(/\D/g, '');
    // Until a real number is set, fall back to WhatsApp's own "choose a
    // chat" link so the buttons still open WhatsApp with the text typed.
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
  }

  const telHref = () => 'tel:' + String(SITE.phone).replace(/\s+/g, '');

  // '919937601505' -> '+91 99376 01505' (Indian mobile); anything else as given.
  function formatWhatsapp(value) {
    const d = String(value).replace(/\D/g, '');
    return d.length === 12 && d.startsWith('91')
      ? '+91 ' + d.slice(2, 7) + ' ' + d.slice(7)
      : String(value);
  }

  function fillContactDetails() {
    $$('[data-wa]').forEach((a) => {
      a.href = wa(a.dataset.wa);
    });
    $$('[data-tel]').forEach((a) => {
      a.href = telHref();
    });
    $$('[data-phone-label]').forEach((n) => {
      n.textContent = SITE.phone;
    });
    $$('[data-whatsapp-label]').forEach((n) => {
      n.textContent = formatWhatsapp(SITE.whatsapp);
    });
    $$('[data-year]').forEach((n) => {
      n.textContent = String(new Date().getFullYear());
    });

    // Keep the structured data's phone in step with the page.
    const ld = document.querySelector('script[type="application/ld+json"]');
    if (ld) {
      try {
        const data = JSON.parse(ld.textContent);
        data.telephone = SITE.phone;
        ld.textContent = JSON.stringify(data);
      } catch {
        /* leave it as written */
      }
    }
  }

  /* -------------------------------------------------------------- offer banner */

  function showOffer() {
    const banner = document.querySelector('[data-offer]');
    if (!banner) return;
    const offer = String(SITE.offerText || '').trim();
    banner.hidden = offer.length === 0;
    const line = banner.querySelector('[data-offer-text]');
    if (line) line.textContent = offer;
  }

  /* -------------------------------------------------------------- fixed header */

  // The header wraps to two or three rows depending on width, so size the
  // spacer below it (and the anchor-jump offset) to its real height.
  function syncHeader() {
    const header = document.querySelector('[data-header]');
    const spacer = document.querySelector('[data-header-spacer]');
    if (!header || !spacer) return;
    const targets = $$('main section[id]');
    const sync = () => {
      const h = header.offsetHeight;
      spacer.style.height = h + 'px';
      targets.forEach((t) => {
        t.style.scrollMarginTop = h + 16 + 'px';
      });
    };
    sync();
    if (window.ResizeObserver) new ResizeObserver(sync).observe(header);
    window.addEventListener('resize', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  }

  /* -------------------------------------------------------------- opening hours */

  function highlightToday() {
    const row = document.querySelector('[data-hours] tr[data-day="' + new Date().getDay() + '"]');
    if (!row) return;
    row.classList.add('is-today');
    const th = row.querySelector('th');
    if (th) {
      const tag = document.createElement('span');
      tag.className = 'hours__today';
      tag.textContent = ' · today';
      th.append(tag);
    }
  }

  /* -------------------------------------------------------------- scroll reveal */

  // Content is visible from the start; the rise only plays as each block
  // arrives, so nothing can be left hidden if this never runs.
  function reveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.style.animation = 'rise 300ms ease-out both';
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    $$('[data-reveal]').forEach((n) => io.observe(n));
  }

  /* -------------------------------------------------------------- enquiry form */

  // No backend: the form writes a WhatsApp message and opens it.
  function enquiryForm() {
    const form = document.querySelector('[data-enquiry]');
    if (!form) return;
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // namedItem(), not elements[n]: the select is called "item", and
      // elements.item is a built-in method, so elements['item'] would return
      // that function instead of the field and the choice would be lost.
      const v = (n) => {
        const field = form.elements.namedItem(n);
        return ((field && field.value) || '').trim();
      };
      const lines = [
        'Hello Style Furniture,',
        'Name: ' + v('name'),
        'Phone: ' + v('phone'),
        'Village: ' + (v('village') || '-'),
        'Looking for: ' + v('item'),
        v('message') ? 'Details: ' + v('message') : null,
      ].filter(Boolean);
      window.open(wa(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* -------------------------------------------------------------- boot */

  function boot() {
    fillContactDetails();
    showOffer();
    syncHeader();
    highlightToday();
    reveal();
    enquiryForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
