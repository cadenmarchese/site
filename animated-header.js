export class AnimatedHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        h1 {
          font-family: Source Code Pro;
          font-size: 3em;
          color: #000;
          margin: 1;
        }
      </style>
      <h1 part="text"></h1>
    `;
  }

  connectedCallback() {
    const text = this.getAttribute("text") || "";
    const el = this.shadowRoot.querySelector("h1");

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

    const shuffle = ({
      text = "",
      duration = 1,
      delay = 0,
      delayResolve = 0.2,
      fps = 60,
      glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|:;<>,.?/~`",
      direction = "right",
      onUpdate = null,
      onComplete = null,
    }) => {
      const _glyphs = glyphs.split("");
      const _text = text.split("");
      const _delta = 1000 / fps;
      let _now = Date.now();
      let _start = Date.now();
      let _tindices = _text.map((_, i) => i);
      if (direction === "left") _tindices.reverse();
      if (direction === "random") _tindices = random.shuffle(_tindices);
      const _onUpdate = () => {
        if (Date.now() - _now < _delta) {
          requestAnimationFrame(_onUpdate);
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
        if (!complete) requestAnimationFrame(_onUpdate);
        else output = text;
        if (onUpdate) onUpdate(output);
        if (complete && onComplete) onComplete(output);
      };
      _onUpdate();
    };

    shuffle({
      text,
      duration: 2,
      delay: 0,
      delayResolve: 0.3,
      direction: "right",
      onUpdate: (str) => (el.textContent = str),
    });
  }
}

customElements.define("animated-header", AnimatedHeader);
