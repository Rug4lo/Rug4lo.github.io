// js/system/icons.js
// Inline SVG icons for the top bar.
//
// They are real elements and not emoji, an icon font or a data: URI, for three
// reasons: emoji render in colour on most platforms and break a monochrome bar,
// an icon font means a second download plus a blank gap while it loads, and a
// data: URI mask would force `img-src data:` into the CSP. An inline SVG needs
// none of that and takes its colour from `currentColor`, so the theme keeps
// owning it.

const SVG_NS = 'http://www.w3.org/2000/svg';

const svg = (viewBox, ...shapes) => {
  const root = document.createElementNS(SVG_NS, 'svg');
  root.setAttribute('viewBox', viewBox);
  root.setAttribute('class', 'icon');
  // Decorative: the label lives on the control that holds the icon.
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('focusable', 'false');
  for (const shape of shapes) root.appendChild(shape);
  return root;
};

const shape = (tag, attributes) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, String(value));
  }
  return node;
};

const stroked = (attributes) => ({
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.7,
  'stroke-linecap': 'round',
  ...attributes,
});

// IEC 5009: a broken ring with a stroke through the gap.
export const powerIcon = () => svg(
  '0 0 24 24',
  shape('path', stroked({ d: 'M7.7 5.9A7.5 7.5 0 1 0 16.3 5.9' })),
  shape('path', stroked({ d: 'M12 2.8V11.4' }))
);

// The lockscreen's three actions, drawn rather than typed. They were text --
// U+2298, U+21BB and U+23FB -- and JetBrains Mono has no U+23FB, so the
// shutdown button showed an empty box on the first screen every visitor sees.
// The shapes are the ones those characters drew, not new ones.
export const suspendIcon = () => svg(
  '0 0 24 24',
  shape('circle', stroked({ cx: 12, cy: 12, r: 8.2 })),
  shape('path', stroked({ d: 'M6.2 17.8L17.8 6.2' }))
);

export const restartIcon = () => svg(
  '0 0 24 24',
  shape('path', stroked({ d: 'M20 12a8 8 0 1 1-2.34-5.66' })),
  shape('path', stroked({ d: 'M20 4.2v4.6h-4.6' }))
);

// Three bars. SXMO reaches its menu from a hardware key; on a touch screen the
// honest equivalent is a button, and this is what a button like that wears.
export const menuIcon = () => svg(
  '0 0 24 24',
  shape('path', stroked({ d: 'M4 7h16M4 12h16M4 17h16', 'stroke-width': 1.9 }))
);

// `level` is 0..1 and drives the fill, so the icon cannot disagree with the
// number printed next to it.
export const batteryIcon = (level) => {
  const usable = 13;
  const clamped = Math.min(1, Math.max(0, Number(level) || 0));
  return svg(
    '0 0 24 24',
    shape('rect', stroked({ x: 1.6, y: 7.6, width: 16.8, height: 8.8, rx: 2.4 })),
    shape('rect', { x: 20, y: 10.4, width: 2.4, height: 3.2, rx: 1.1, fill: 'currentColor' }),
    shape('rect', {
      x: 3.4, y: 9.4, width: (usable * clamped).toFixed(2), height: 5.2,
      rx: 1, fill: 'currentColor',
    })
  );
};
