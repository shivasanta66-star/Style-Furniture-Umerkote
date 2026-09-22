/*
 * image-slot.js — <image-slot> custom element.
 *
 * A reserved, correctly-proportioned space for a photograph. Until a real
 * photo is dropped in it draws a labelled placeholder, so the layout never
 * shifts and it is obvious which shots the showroom still needs to take.
 *
 *   <image-slot ratio="4/3" label="Sofa set in the showroom"></image-slot>
 *   <image-slot ratio="4/3" label="Sofa set" src="assets/img/sofa.jpg"></image-slot>
 *
 * Attributes
 *   src      path to the photo; when absent the placeholder is shown
 *   alt      alternative text (falls back to `label`)
 *   ratio    aspect ratio, e.g. "4/3", "16/9", "1/1" (default 4/3)
 *   label    caption shown on the placeholder
 *   fit      object-fit for the photo: cover (default) | contain
 *   position object-position for the photo, e.g. "center top"
 *   eager    load immediately instead of lazily (use for above-the-fold art)
 */

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: var(--slot-ratio, 4 / 3);
      background: var(--slot-bg, #e8ddcd);
      border-radius: inherit;
      color: var(--slot-ink, #6f6158);
    }
    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: var(--slot-fit, cover);
      object-position: var(--slot-position, center);
      opacity: 0;
      transition: opacity 420ms ease;
    }
    img.is-loaded { opacity: 1; }
    .ph {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem;
      text-align: center;
      background-image:
        linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 55%),
        repeating-linear-gradient(
          45deg,
          var(--slot-stripe, rgba(122, 78, 45, 0.07)) 0 10px,
          transparent 10px 20px
        );
    }
    .ph svg { width: 30px; height: 30px; opacity: 0.55; }
    .ph span {
      font: 500 0.75rem/1.4 var(--slot-font, system-ui, sans-serif);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      max-width: 22ch;
      opacity: 0.8;
    }
    @media (prefers-reduced-motion: reduce) {
      img { transition: none; }
    }
  </style>
  <div class="ph" part="placeholder" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
         stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <circle cx="8.5" cy="9.5" r="1.6"/>
      <path d="M21 16l-5-5-5 5-2-2-6 6"/>
    </svg>
    <span part="label"></span>
  </div>
`;

class ImageSlot extends HTMLElement {
  static observedAttributes = ['src', 'alt', 'ratio', 'label', 'fit', 'position'];

  #img = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.#syncRatio();
    this.#syncLabel();
    this.#syncSrc();
  }

  attributeChangedCallback(name) {
    if (!this.shadowRoot) return;
    if (name === 'ratio') this.#syncRatio();
    else if (name === 'label') this.#syncLabel();
    else this.#syncSrc();
  }

  get #placeholder() {
    return this.shadowRoot.querySelector('.ph');
  }

  #syncRatio() {
    const ratio = (this.getAttribute('ratio') || '4/3').replace('/', ' / ');
    this.style.setProperty('--slot-ratio', ratio);
  }

  #syncLabel() {
    const label = this.getAttribute('label') || 'Photo';
    this.shadowRoot.querySelector('.ph span').textContent = label;
  }

  #syncSrc() {
    const src = this.getAttribute('src');

    if (!src) {
      this.#img?.remove();
      this.#img = null;
      this.#placeholder.hidden = false;
      return;
    }

    if (!this.#img) {
      this.#img = document.createElement('img');
      this.#img.decoding = 'async';
      this.shadowRoot.append(this.#img);
    }

    const img = this.#img;
    img.loading = this.hasAttribute('eager') ? 'eager' : 'lazy';
    if (this.hasAttribute('eager')) img.fetchPriority = 'high';
    img.alt = this.getAttribute('alt') ?? this.getAttribute('label') ?? '';
    this.style.setProperty('--slot-fit', this.getAttribute('fit') || 'cover');
    this.style.setProperty('--slot-position', this.getAttribute('position') || 'center');

    img.classList.remove('is-loaded');
    this.#placeholder.hidden = false;

    img.onload = () => {
      img.classList.add('is-loaded');
      this.#placeholder.hidden = true;
    };
    // A missing or broken file falls back to the placeholder rather than a
    // broken-image icon.
    img.onerror = () => {
      this.#placeholder.hidden = false;
      img.removeAttribute('src');
    };
    img.src = src;
  }
}

if (!customElements.get('image-slot')) {
  customElements.define('image-slot', ImageSlot);
}

export default ImageSlot;
