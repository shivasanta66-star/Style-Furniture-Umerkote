/*
 * image-slot.js — <image-slot>: a photo placeholder that becomes the photo.
 *
 * Production version of the Claude Design <image-slot>. Same attributes, and
 * the same empty state (faint fill, dashed ring, photo icon, caption), but
 * read-only: there is no drag-and-drop editor on the live site. To show a
 * real photograph, give the slot a `src`.
 *
 *   <image-slot shape="rect" placeholder="Fabric sofa set on the showroom floor"></image-slot>
 *   <image-slot shape="rect" placeholder="…" src="assets/img/sofa.webp"></image-slot>
 *
 * The slot fills its container (width and height 100%), so size it with the
 * wrapper — the page wraps each one in an aspect-ratio box.
 *
 * Attributes
 *   src          photo URL; when absent or broken, the placeholder shows
 *   alt          alternative text (defaults to `placeholder`)
 *   placeholder  caption for the empty state, and the default alt text
 *   shape        rect | rounded | circle | pill     (default rounded)
 *   radius       corner radius in px for `rounded`  (default 12)
 *   fit          cover | contain                    (default cover)
 *   eager        load immediately (use for the hero); otherwise lazy
 */
(() => {
  if (customElements.get('image-slot')) return;

  const ICON =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' +
    '<path d="m21 15-5-5L5 21"/></svg>';

  const STYLE =
    ':host{display:block;position:relative;font:13px/1.3 system-ui,-apple-system,sans-serif;' +
    '  width:100%;height:100%;aspect-ratio:3/2}' +
    '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)}' +
    'img{position:absolute;inset:0;width:100%;height:100%;display:block;' +
    '  object-fit:var(--fit,cover);opacity:0;transition:opacity .3s ease}' +
    ':host([data-filled]) img{opacity:1}' +
    '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' +
    '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box}' +
    '.empty svg{opacity:.45}' +
    '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em;opacity:.75}' +
    ':host([data-filled]) .empty{display:none}' +
    '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed currentColor;opacity:.35}' +
    ':host([data-filled]) .ring{display:none}' +
    '@media (prefers-reduced-motion:reduce){img{transition:none}}';

  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['src', 'alt', 'placeholder', 'shape', 'radius', 'fit'];
    }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<style>' + STYLE + '</style>' +
        '<div class="frame" part="frame"><img>' +
        '<div class="empty" part="empty">' + ICON + '<div class="cap"></div></div></div>' +
        '<div class="ring" aria-hidden="true"></div>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('img');
      this._cap = root.querySelector('.cap');

      this._img.decoding = 'async';
      this._img.addEventListener('load', () => this.toggleAttribute('data-filled', true));
      // A missing or broken file falls back to the placeholder.
      this._img.addEventListener('error', () => this.removeAttribute('data-filled'));
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    _render() {
      const placeholder = this.getAttribute('placeholder') || 'Photo';
      this._cap.textContent = placeholder;

      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';
      else if (shape === 'pill') radius = '9999px';
      else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = radius;
      this._ring.style.borderRadius = radius;

      this.style.setProperty('--fit', this.getAttribute('fit') === 'contain' ? 'contain' : 'cover');

      const img = this._img;
      img.alt = this.getAttribute('alt') ?? placeholder;
      img.loading = this.hasAttribute('eager') ? 'eager' : 'lazy';

      const src = this.getAttribute('src');
      if (!src) {
        img.removeAttribute('src');
        this.removeAttribute('data-filled');
        // With no photo, the slot is decoration; the caption is not content.
        img.setAttribute('aria-hidden', 'true');
        return;
      }
      img.removeAttribute('aria-hidden');
      if (img.getAttribute('src') !== src) {
        this.removeAttribute('data-filled');
        img.src = src;
      }
    }
  }

  customElements.define('image-slot', ImageSlot);
})();
