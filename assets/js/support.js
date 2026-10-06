/*
 * support.js: the shop's settings and the page's small behaviours.
 *
 * Edit the three values in SITE below. Every Call and WhatsApp link, the
 * printed numbers and the offer banner read from them.
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

  /* -------------------------------------------------------------- open / closed now */

  // Shop hours: every day 9 AM to 9 PM except Wednesday. Uses the shop's
  // clock (India time) so a visitor abroad still sees the right answer.
  function openStatus() {
    const nodes = $$('[data-open-status]');
    if (!nodes.length) return;
    let day, mins;
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    } catch {
      return; // keep the static hours line
    }
    let text;
    if (day === 3) text = 'Closed today (Wednesday) · opens Thursday 9 AM';
    else if (mins >= 540 && mins < 1260) text = 'Open now · until 9 PM';
    else if (mins < 540) text = 'Opens today at 9 AM';
    else text = day === 2 ? 'Closed now · next open Thursday 9 AM' : 'Closed now · opens tomorrow 9 AM';
    nodes.forEach((n) => { n.textContent = text; });
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
        v('name') ? 'Name: ' + v('name') : null,
        'Village: ' + (v('village') || '-'),
        'Looking for: ' + v('item'),
        v('message') ? 'Details: ' + v('message') : null,
      ].filter(Boolean);
      window.open(wa(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* -------------------------------------------------------------- scroll reveal */

  // Products, sleep cards and reviews fade up and categories scale in as they enter the screen.
  function scrollReveal() {
    const items = document.querySelectorAll('.product, .cat-card, .sleep-card, .review, .faq');
    if (!items.length || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => {
      // Stagger neighbours that appear together.
      const sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--reveal-delay', Math.min(sibs, 5) * 70 + 'ms');
      io.observe(el);
    });
  }

  /* -------------------------------------------------------------- boot */

  function boot() {
    fillContactDetails();
    showOffer();
    syncHeader();
    highlightToday();
    openStatus();
    enquiryForm();
    scrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
