class AnimatedHeader extends HTMLElement {
  static get observedAttributes() {
    return ["text"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          cursor: pointer;
        }
        h2 {
          font-family: "Source Code Pro", monospace;
          font-size: 1.8em;
          font-weight: normal;
          color: #000;
          margin: 0;
          padding: 0;
          cursor: pointer;
          user-select: none;
          letter-spacing: 0.1125em;
          text-align: center;
        }
        @media screen and (max-width: 768px) {
          h2 {
            font-size: 1.45em;
          }
        }
        @media screen and (max-width: 480px) {
          h2 {
            font-size: 1.25em;
          }
        }
      </style>
      <h2 part="text"></h2>
    `;
    this._h2 = this.shadowRoot.querySelector("h2");
    this._originalText = "";
    this._animationFrameId = null;
    this._observer = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "text" && oldValue !== newValue) {
      this._originalText = newValue;
      if (this._h2) {
        this._h2.textContent = newValue;
      }
    }
  }

  setText(newText) {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    if (this._h2) {
      this._h2.textContent = newText;
    }
  }

  getText() {
    return this._h2 ? this._h2.textContent : "";
  }

  getOriginalText() {
    return this._originalText;
  }

  playShuffle() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      if (this._h2) this._h2.textContent = this._originalText;
      return;
    }

    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }

    const text = this._originalText || this.getAttribute("text") || "";
    const el = this._h2;
    if (!el || !text) return;

    const math = {
      clamp01: (t) => Math.min(1, Math.max(0, t)),
    };
    const random = {
      pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
      shuffle: (arr) => [...arr].sort(() => Math.random() - 0.5),
    };
    const eases = {
      quartOut: (t) => 1 - --t * t * t * t,
      quadInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    };

    const _glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|:;<>,.?/~`".split("");
    const _text = text.split("");
    const _delta = 1000 / 60;
    let _now = Date.now();
    let _start = Date.now();
    let _tindices = _text.map((_, i) => i);
    const duration = 1.5;
    const delay = 0;
    const delayResolve = 0.3;

    const _onUpdate = () => {
      if (Date.now() - _now < _delta) {
        this._animationFrameId = requestAnimationFrame(_onUpdate);
        return;
      }
      _now = Date.now();
      let output = "";
      let t = ((_now - _start) * 0.001) / duration;
      let u = math.clamp01(t - delay);
      u = eases.quartOut(u);
      let v = math.clamp01(t - delay - delayResolve);
      v = v * (1 / (1 - delayResolve));
      v = eases.quadInOut(v);
      const uLen = Math.round(u * text.length);
      const vLen = Math.round(v * text.length);
      for (let i = 0; i < text.length; i++) {
        let tidx = _tindices[i];
        let glyph = _text[i];
        if (tidx >= uLen) glyph = " ";
        if (glyph !== " " && tidx >= vLen) glyph = random.pick(_glyphs);
        output += glyph;
      }
      const complete = u >= 1;
      if (!complete) {
        this._animationFrameId = requestAnimationFrame(_onUpdate);
      } else {
        output = text;
        this._animationFrameId = null;
      }
      if (el) el.textContent = output;
    };
    this._animationFrameId = requestAnimationFrame(_onUpdate);
  }

  connectedCallback() {
    this._originalText = this.getAttribute("text") || "pill super";
    if (this._h2) this._h2.textContent = this._originalText;

    if (typeof IntersectionObserver !== "undefined") {
      this._observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bio = document.getElementById("bio-container");
              if (!bio || bio.style.display === "none" || bio.style.display === "") {
                this.playShuffle();
              }
            }
          });
        },
        { threshold: 0.1 }
      );
      this._observer.observe(this);
    } else {
      this.playShuffle();
    }
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }
}

if (!customElements.get("animated-header")) {
  customElements.define("animated-header", AnimatedHeader);
}
