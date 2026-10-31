import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const tokensJsonPath = path.join(__dirname, 'evidence', '06-tokens-complete.json');
const outputCssPath = path.join(__dirname, 'tokens.css');

// Read JSON token file
const tokensRaw = fs.readFileSync(tokensJsonPath, 'utf8');
const tokensData = JSON.parse(tokensRaw);

// 1. Primitive Colors (--ref-*)
// Documented tonal scale values from docs/colour-roles.md (authoritative design system specification)
// paired with tokens extracted from 06-tokens-complete.json
const documentedPrimitives = {
  // Primary (Seed & Pinned Primary 40 = #00E676, Primary 10 = #052C26)
  'primary-0': '#000000',
  'primary-10': '#052c26',
  'primary-20': '#0a3d33',
  'primary-25': '#125245',
  'primary-30': '#006d34',
  'primary-40': '#00e676',
  'primary-50': '#01e888',
  'primary-60': '#33ee94',
  'primary-70': '#66f3af',
  'primary-80': '#99f7c9',
  'primary-90': '#d1fae5',
  'primary-95': '#ecfdf5',
  'primary-100': '#ffffff',

  // Secondary
  'secondary-0': '#000000',
  'secondary-10': '#002019',
  'secondary-20': '#01382c',
  'secondary-25': '#124438',
  'secondary-30': '#1f4f42',
  'secondary-40': '#386759',
  'secondary-50': '#518072',
  'secondary-60': '#6b9a8b',
  'secondary-70': '#85b5a5',
  'secondary-80': '#9fd1c0',
  'secondary-90': '#bbeddc',
  'secondary-95': '#c9fbea',
  'secondary-100': '#ffffff',

  // Tertiary
  'tertiary-0': '#000000',
  'tertiary-10': '#051b38',
  'tertiary-20': '#002f66',
  'tertiary-25': '#003a7a',
  'tertiary-30': '#004590',
  'tertiary-40': '#005cbc',
  'tertiary-50': '#1e83ff',
  'tertiary-60': '#448fff',
  'tertiary-70': '#7dabff',
  'tertiary-80': '#abc7ff',
  'tertiary-90': '#d7e2ff',
  'tertiary-95': '#ecf0ff',
  'tertiary-100': '#ffffff',

  // Neutral
  'neutral-0': '#000000',
  'neutral-10': '#0e0e0e',
  'neutral-20': '#313030',
  'neutral-25': '#3c3b3b',
  'neutral-30': '#3c4858',
  'neutral-40': '#605e5e',
  'neutral-50': '#64748b',
  'neutral-60': '#939090',
  'neutral-70': '#adaaaa',
  'neutral-80': '#c9c6c5',
  'neutral-90': '#e5e2e1',
  'neutral-95': '#f7fcff',
  'neutral-98': '#faf8f7',
  'neutral-99': '#f6feff',
  'neutral-100': '#ffffff',

  // Neutral Variant
  'neutral-variant-0': '#000000',
  'neutral-variant-10': '#161d17',
  'neutral-variant-20': '#2b322b',
  'neutral-variant-30': '#414941',
  'neutral-variant-40': '#596058',
  'neutral-variant-50': '#717970',
  'neutral-variant-60': '#8b938a',
  'neutral-variant-70': '#a6ada4',
  'neutral-variant-80': '#c1c9bf',
  'neutral-variant-90': '#dde5da',
  'neutral-variant-95': '#ebf3e8',
  'neutral-variant-100': '#ffffff',

  // Error
  'error-0': '#000000',
  'error-10': '#410002',
  'error-20': '#690005',
  'error-25': '#7e0007',
  'error-30': '#93000a',
  'error-40': '#ba1a1a',
  'error-50': '#de3730',
  'error-60': '#ff5449',
  'error-70': '#ff897d',
  'error-80': '#ffb4ab',
  'error-90': '#ffdad6',
  'error-95': '#ffedea',
  'error-100': '#ffffff',

  // Warning (Extended)
  'warning-10': '#451a03',
  'warning-30': '#92400e',
  'warning-50': '#b45309',
  'warning-90': '#fef3c7',

  // Base constants
  'white': '#ffffff',
  'black': '#000000'
};

// Also ingest any additional ref tokens present in JSON
const refGroup = tokensData.color?.['material-theme']?.ref || {};
for (const [groupName, groupObj] of Object.entries(refGroup)) {
  for (const [tokenName, tokenObj] of Object.entries(groupObj)) {
    // e.g. primary40 -> primary-40
    const match = tokenName.match(/^([a-zA-Z-]+?)(\d+)$/);
    if (match) {
      const formattedKey = `${match[1]}-${match[2]}`.toLowerCase();
      if (!documentedPrimitives[formattedKey] && tokenObj.value) {
        let hex = tokenObj.value;
        if (hex.length === 9 && hex.endsWith('ff')) {
          hex = hex.slice(0, 7);
        }
        documentedPrimitives[formattedKey] = hex.toLowerCase();
      }
    }
  }
}

// 2. Semantic Roles Mapping
const semanticRoles = [
  // Primary
  { name: '--color-primary', ref: '--ref-primary-40' },
  { name: '--color-on-primary', ref: '--ref-primary-10' },
  { name: '--color-primary-container', ref: '--ref-primary-90' },
  { name: '--color-on-primary-container', ref: '--ref-primary-10' },
  { name: '--color-primary-text', ref: '--ref-primary-25' },
  { name: '--color-primary-hover', ref: '--ref-primary-30' },

  // Secondary
  { name: '--color-secondary', ref: '--ref-secondary-25' },
  { name: '--color-on-secondary', ref: '--ref-secondary-100' },
  { name: '--color-secondary-container', ref: '--ref-secondary-90' },
  { name: '--color-on-secondary-container', ref: '--ref-secondary-10' },

  // Tertiary
  { name: '--color-tertiary', ref: '--ref-tertiary-50' },
  { name: '--color-on-tertiary', ref: '--ref-tertiary-10' },
  { name: '--color-tertiary-container', ref: '--ref-tertiary-90' },
  { name: '--color-on-tertiary-container', ref: '--ref-tertiary-10' },

  // Surface & Neutral
  { name: '--color-surface', ref: '--ref-neutral-100' },
  { name: '--color-on-surface', ref: '--ref-neutral-10' },
  { name: '--color-surface-container', ref: '--ref-neutral-95' },
  { name: '--color-surface-container-low', ref: '--ref-neutral-98' },
  { name: '--color-surface-container-high', ref: '--ref-neutral-90' },
  { name: '--color-on-surface-variant', ref: '--ref-neutral-30' },
  { name: '--color-outline', ref: '--ref-neutral-50' },
  { name: '--color-outline-variant', ref: '--ref-neutral-80' },

  // Error
  { name: '--color-error', ref: '--ref-error-40' },
  { name: '--color-on-error', ref: '--ref-neutral-100' },
  { name: '--color-error-container', ref: '--ref-error-90' },
  { name: '--color-on-error-container', ref: '--ref-error-10' },

  // Warning
  { name: '--color-warning', ref: '--ref-warning-30' },
  { name: '--color-warning-container', ref: '--ref-warning-90' },
  { name: '--color-on-warning-container', ref: '--ref-warning-30' },

  // Success
  { name: '--color-success', ref: '--ref-primary-30' },
  { name: '--color-on-success', ref: '--ref-neutral-100' },
  { name: '--color-success-container', ref: '--ref-primary-90' },
  { name: '--color-on-success-container', ref: '--ref-primary-10' }
];

// 3. Brand-Tinted Shadows (Parsed from tokensData.effect.shadow and docs/shadows.md)
// Both derive from primary-10 (#052c26)
const shadows = {
  '--shadow-soft': '0 2px 6px 0 rgba(5, 44, 38, 0.08)',
  '--shadow-medium': '0 8px 20px -2px rgba(5, 44, 38, 0.12)',
  '--shadow-hard': '0 16px 36px -4px rgba(5, 44, 38, 0.18)'
};

// 4. Typography Scale (15 styles across 5 roles x 3 sizes from docs/type-scale.md & docs/divergences.md)
const typographyScale = [
  {
    role: 'display',
    size: 'lg',
    className: 'type-display-lg',
    fontSize: '56px',
    remSize: '3.5rem',
    fontWeight: '600',
    lineHeight: '78px',
    remLineHeight: '4.875rem',
    letterSpacing: '-0.02em'
  },
  {
    role: 'display',
    size: 'md',
    className: 'type-display-md',
    fontSize: '45px',
    remSize: '2.8125rem',
    fontWeight: '600',
    lineHeight: '63px',
    remLineHeight: '3.9375rem',
    letterSpacing: '-0.02em'
  },
  {
    role: 'display',
    size: 'sm',
    className: 'type-display-sm',
    fontSize: '36px',
    remSize: '2.25rem',
    fontWeight: '600',
    lineHeight: '50px',
    remLineHeight: '3.125rem',
    letterSpacing: '-0.015em'
  },
  {
    role: 'headline',
    size: 'lg',
    className: 'type-headline-lg',
    fontSize: '32px',
    remSize: '2.0rem',
    fontWeight: '600',
    lineHeight: '45px',
    remLineHeight: '2.8125rem',
    letterSpacing: '-0.015em'
  },
  {
    role: 'headline',
    size: 'md',
    className: 'type-headline-md',
    fontSize: '28px',
    remSize: '1.75rem',
    fontWeight: '600',
    lineHeight: '39px',
    remLineHeight: '2.4375rem',
    letterSpacing: '-0.01em'
  },
  {
    role: 'headline',
    size: 'sm',
    className: 'type-headline-sm',
    fontSize: '24px',
    remSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '34px',
    remLineHeight: '2.125rem',
    letterSpacing: '-0.01em'
  },
  {
    role: 'title',
    size: 'lg',
    className: 'type-title-lg',
    fontSize: '22px',
    remSize: '1.375rem',
    fontWeight: '600',
    lineHeight: '31px',
    remLineHeight: '1.9375rem',
    letterSpacing: '0em'
  },
  {
    role: 'title',
    size: 'md',
    className: 'type-title-md',
    fontSize: '16px',
    remSize: '1.0rem',
    fontWeight: '500',
    lineHeight: '22px',
    remLineHeight: '1.375rem',
    letterSpacing: '0.005em'
  },
  {
    role: 'title',
    size: 'sm',
    className: 'type-title-sm',
    fontSize: '14px',
    remSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '20px',
    remLineHeight: '1.25rem',
    letterSpacing: '0.005em'
  },
  {
    role: 'body',
    size: 'lg',
    className: 'type-body-lg',
    fontSize: '16px',
    remSize: '1.0rem',
    fontWeight: '400',
    lineHeight: '26px',
    remLineHeight: '1.625rem',
    letterSpacing: '0em'
  },
  {
    role: 'body',
    size: 'md',
    className: 'type-body-md',
    fontSize: '14px',
    remSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '22px',
    remLineHeight: '1.375rem',
    letterSpacing: '0.005em'
  },
  {
    role: 'body',
    size: 'sm',
    className: 'type-body-sm',
    fontSize: '12px',
    remSize: '0.75rem',
    fontWeight: '400',
    lineHeight: '18px',
    remLineHeight: '1.125rem',
    letterSpacing: '0.01em'
  },
  {
    role: 'label',
    size: 'lg',
    className: 'type-label-lg',
    fontSize: '14px',
    remSize: '0.875rem',
    fontWeight: '600',
    lineHeight: '20px',
    remLineHeight: '1.25rem',
    letterSpacing: '0.01em'
  },
  {
    role: 'label',
    size: 'md',
    className: 'type-label-md',
    fontSize: '12px',
    remSize: '0.75rem',
    fontWeight: '500',
    lineHeight: '17px',
    remLineHeight: '1.0625rem',
    letterSpacing: '0.02em'
  },
  {
    role: 'label',
    size: 'sm',
    className: 'type-label-sm',
    fontSize: '11px',
    remSize: '0.6875rem',
    fontWeight: '500',
    lineHeight: '15px',
    remLineHeight: '0.9375rem',
    letterSpacing: '0.03em'
  }
];

// Generate CSS
let css = `/**
 * Tekrise Academy Design System - Generated Tokens
 * Auto-generated by convert-tokens.mjs from 06-tokens-complete.json & docs/
 * DO NOT EDIT MANUALLY
 */

:root {
  /* ==========================================================================
     1. Internal Primitive Color Tones (--ref-*)
     INTERNAL USE ONLY INSIDE :root. Application stylesheets must consume semantic roles.
     ========================================================================== */
`;

// Output primitive colors
for (const [name, hex] of Object.entries(documentedPrimitives)) {
  css += `  --ref-${name}: ${hex};\n`;
}

css += `\n  /* ==========================================================================
     2. Semantic Color Roles (--color-*)
     Exposed semantic roles mapping directly to internal primitives via var()
     ========================================================================== */\n`;

for (const role of semanticRoles) {
  css += `  ${role.name}: var(${role.ref});\n`;
}

css += `\n  /* ==========================================================================
     3. Brand-Tinted Shadows (primary-10 base #052C26)
     ========================================================================== */\n`;

for (const [name, value] of Object.entries(shadows)) {
  css += `  ${name}: ${value};\n`;
}

css += `\n  /* ==========================================================================
     4. Typography Custom Properties (Inter with tabular numbers)
     ========================================================================== */
  --type-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
\n`;

for (const t of typographyScale) {
  css += `  --${t.className}-font-family: var(--type-font-family);\n`;
  css += `  --${t.className}-font-size: ${t.remSize};\n`;
  css += `  --${t.className}-font-weight: ${t.fontWeight};\n`;
  css += `  --${t.className}-line-height: ${t.remLineHeight};\n`;
  css += `  --${t.className}-letter-spacing: ${t.letterSpacing};\n\n`;
}

css += `}\n\n/* ==========================================================================
   5. Typography Utility Classes (.type-display-lg through .type-label-sm)
   ========================================================================== */\n`;

for (const t of typographyScale) {
  css += `.${t.className} {
  font-family: var(--${t.className}-font-family);
  font-size: var(--${t.className}-font-size);
  font-weight: var(--${t.className}-font-weight);
  line-height: var(--${t.className}-line-height);
  letter-spacing: var(--${t.className}-letter-spacing);
}\n\n`;
}

css += `/* Global tabular numerals utility for currency columns and statistics */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
`;

fs.writeFileSync(outputCssPath, css, 'utf8');
console.log(`Successfully generated tokens.css at ${outputCssPath}`);
console.log(`- ${Object.keys(documentedPrimitives).length} primitive --ref-* variables`);
console.log(`- ${semanticRoles.length} semantic --color-* variables`);
console.log(`- ${Object.keys(shadows).length} brand-tinted shadows`);
console.log(`- ${typographyScale.length} typography styles & utility classes`);

