import { COLOR_GROUPS, SHADES } from '../data/colorDefs.js';
import { oklchToSrgb, srgbToOklch } from './colorMath.js';
import { swatchOklch } from './paletteLogic.js';

function trimNumber(value, digits = 4) {
  return Number(value.toFixed(digits)).toString();
}

function tokenBands(store, scope) {
  if (scope === 'selected') return store.selected.map((index) => store.bands[index]);
  if (scope === 'locked') return store.bands.filter((band) => band.locked);
  const group = COLOR_GROUPS.find(({ id }) => id === scope);
  if (group) {
    return store.bands.filter((item) => group.colors.includes(item.name));
  }
  return store.bands;
}

export function exportCssTokens(store, options) {
  const { format = 'theme', colorFormat = 'oklch', scope = 'all', source = 'base', prefix = '--color-' } = options;
  const declarations = [];
  tokenBands(store, scope).forEach((band) => {
    SHADES.forEach((shade, index) => {
      const value = source === 'rendered' ? swatchOklch(store, band, index) : { L: band.L[index], C: band.C[index], H: band.H[index] };
      let cssColor;
      if (colorFormat === 'hex') {
        const { rgb } = oklchToSrgb(value.L, value.C, value.H);
        cssColor = '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase();
      } else {
        cssColor = `oklch(${trimNumber(value.L * 100, 3)}% ${trimNumber(value.C)} ${trimNumber(value.H, 3)})`;
      }
      declarations.push(`  ${prefix}${band.name}-${shade}: ${cssColor};`);
    });
  });
  const wrapper = format === 'root' ? ':root' : '@theme';
  return `${wrapper} {\n${declarations.join('\n')}\n}\n`;
}

function parseRgbChannel(value) {
  return value.endsWith('%') ? (Number.parseFloat(value) / 100) * 255 : Number.parseFloat(value);
}

export function parseCssColor(value) {
  const text = value.trim();
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3) digits = [...digits].map((char) => char + char).join('');
    return srgbToOklch([0, 2, 4].map((offset) => Number.parseInt(digits.slice(offset, offset + 2), 16)));
  }

  const rgb = text.match(/^rgba?\(\s*([^,\s/]+)[,\s]+([^,\s/]+)[,\s]+([^,\s/]+)(?:\s*\/[^)]+)?\s*\)$/i);
  if (rgb) {
    const channels = rgb.slice(1, 4).map(parseRgbChannel);
    if (channels.every((channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255)) return srgbToOklch(channels);
  }

  const oklch = text.match(/^oklch\(\s*([^\s/]+)\s+([^\s/]+)\s+([^\s/]+)(?:\s*\/[^)]+)?\s*\)$/i);
  if (oklch) {
    const L = Number.parseFloat(oklch[1]) / (oklch[1].endsWith('%') ? 100 : 1);
    const C = Number.parseFloat(oklch[2]) / (oklch[2].endsWith('%') ? 100 : 1);
    const H = ((Number.parseFloat(oklch[3]) % 360) + 360) % 360;
    if ([L, C, H].every(Number.isFinite) && L >= 0 && L <= 1 && C >= 0 && C <= 0.4) return { L, C, H };
  }
  return null;
}

export function parseCssTokens(text, bands, prefix = '--color-') {
  const knownNames = new Set(bands.map((band) => band.name));
  const rows = {};
  const invalid = [];
  const unknown = [];
  const declarationPattern = /(--[a-z0-9_-]+)\s*:\s*([^;{}]+)\s*;/gi;
  const css = text.replace(/\/\*[\s\S]*?\*\//g, '');
  let match;
  while ((match = declarationPattern.exec(css))) {
    const [token, rawValue] = [match[1], match[2].trim()];
    if (!token.startsWith(prefix)) continue;
    const suffix = token.slice(prefix.length);
    const shade = SHADES.find((candidate) => suffix.endsWith(`-${candidate}`));
    if (!shade) continue;
    const name = suffix.slice(0, -(String(shade).length + 1));
    if (!knownNames.has(name)) {
      unknown.push(token);
      continue;
    }
    const color = parseCssColor(rawValue);
    if (!color) {
      invalid.push(token);
      continue;
    }
    if (!rows[name]) rows[name] = {};
    rows[name][shade] = color;
  }

  const summaries = Object.entries(rows).map(([name, values]) => ({
    name,
    count: Object.keys(values).length,
    missing: SHADES.filter((shade) => !values[shade]),
    locked: bands.find((band) => band.name === name).locked,
  }));
  return { rows, summaries, invalid, unknown, tokenCount: summaries.reduce((total, row) => total + row.count, 0) };
}

export function applyCssTokenImport(store, parsed, mode = 'complete') {
  let updated = 0;
  let skippedLocked = 0;
  Object.entries(parsed.rows).forEach(([name, values]) => {
    const band = store.bands.find((item) => item.name === name);
    if (!band || (mode === 'complete' && SHADES.some((shade) => !values[shade]))) return;
    if (band.locked) {
      skippedLocked++;
      return;
    }
    const L = band.L.slice(), C = band.C.slice(), H = band.H.slice();
    SHADES.forEach((shade, index) => {
      if (!values[shade]) return;
      ({ L: L[index], C: C[index], H: H[index] } = values[shade]);
    });
    band.L = L;
    band.C = C;
    band.H = H;
    band.hue = H[5];
    band.curveRevision++;
    updated++;
  });
  return { updated, skippedLocked };
}
