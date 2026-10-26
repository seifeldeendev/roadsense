// DESIGN.md as Tailwind theme. Colours are CSS variables set at the app root
// from src/theme/tokens.ts (light or dark), so classes follow the theme.
// Spacing, radii and type sizes come from the same scales file as tokens.ts.
const scales = require('./src/theme/scales.json');

const colorNames = [
  'primary', 'on-primary', 'primary-pressed', 'canvas', 'canvas-soft', 'canvas-softer', 'canvas-glass', 'canvas-frost',
  'surface-pressed', 'ink', 'body', 'hairline-mid', 'mute', 'hairline', 'inverse', 'on-inverse',
  'inverse-muted', 'backdrop', 'status-ok', 'status-near', 'status-over',
];

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // AppText builds text-<colour> from its color prop, so those classes are kept.
  safelist: colorNames.map((name) => `text-${name}`),
  theme: {
    extend: {
      colors: Object.fromEntries(colorNames.map((name) => [name, `var(--color-${name})`])),
      spacing: Object.fromEntries(Object.entries(scales.spacing).map(([k, v]) => [k, `${v}px`])),
      borderRadius: Object.fromEntries(Object.entries(scales.rounded).map(([k, v]) => [kebab(k), `${v}px`])),
      // font-inter, font-inter-medium, font-inter-bold (font-medium/bold stay font weights).
      fontFamily: Object.fromEntries(
        Object.entries(scales.fontFamily).map(([k, v]) => [k === 'regular' ? 'inter' : `inter-${k}`, [v]]),
      ),
      fontSize: Object.fromEntries(
        Object.entries(scales.typography).map(([k, t]) => [kebab(k), [`${t.fontSize}px`, { lineHeight: `${t.lineHeight}px` }]]),
      ),
      minHeight: { touch: `${scales.touch.min}px`, 'touch-lg': `${scales.touch.large}px` },
      minWidth: { touch: `${scales.touch.min}px` },
      height: { touch: `${scales.touch.min}px`, 'touch-lg': `${scales.touch.large}px` },
      width: { touch: `${scales.touch.min}px` },
    },
  },
  plugins: [],
};
