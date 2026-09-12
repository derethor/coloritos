import { SHADES } from '../data/colorDefs.js';
import { isOklchInSrgbGamut, srgbToOklch } from './colorMath.js';

function hueDelta(a, b) {
  return ((a - b + 540) % 360) - 180;
}

export function closestHueBand(bands, hue, names) {
  return bands
    .filter((band) => names.includes(band.name))
    .reduce((best, band) =>
      !best || Math.abs(hueDelta(band.default.hue, hue)) < Math.abs(hueDelta(best.default.hue, hue)) ? band : best,
    null);
}

function fitLightness(value, templateAnchor, targetAnchor) {
  if (value >= templateAnchor) {
    const span = 1 - templateAnchor;
    return span ? targetAnchor + ((value - templateAnchor) / span) * (1 - targetAnchor) : targetAnchor;
  }
  return templateAnchor ? targetAnchor + ((value - templateAnchor) / templateAnchor) * targetAnchor : targetAnchor;
}

function gamutMappedChroma(L, C, H) {
  if (isOklchInSrgbGamut(L, C, H)) return C;
  let low = 0;
  let high = C;
  for (let i = 0; i < 18; i++) {
    const mid = (low + high) / 2;
    if (isOklchInSrgbGamut(L, mid, H)) low = mid;
    else high = mid;
  }
  return low;
}

export function buildBrandRamp(template, rgb, requestedAnchor = 'auto') {
  const brand = srgbToOklch(rgb);
  const anchorIndex =
    requestedAnchor === 'auto'
      ? template.L.reduce(
          (best, value, i) => (Math.abs(value - brand.L) < Math.abs(template.L[best] - brand.L) ? i : best),
          0,
        )
      : SHADES.indexOf(Number(requestedAnchor));
  const safeAnchor = anchorIndex < 0 ? 5 : anchorIndex;
  const templateL = template.L;
  const templateC = template.C;
  const templateH = template.H;
  const anchorC = templateC[safeAnchor];
  const peakC = Math.max(...templateC);

  const L = templateL.map((value) => Math.min(1, Math.max(0, fitLightness(value, templateL[safeAnchor], brand.L))));
  const H = templateH.map((value) => (brand.H + hueDelta(value, templateH[safeAnchor]) + 360) % 360);
  const C = templateC.map((value, i) => {
    const ratio = anchorC > 0.005 ? value / anchorC : peakC ? value / peakC : 0;
    return gamutMappedChroma(L[i], Math.min(0.4, Math.max(0, brand.C * ratio)), H[i]);
  });

  // The source color is already in sRGB, so restoring it after gamut mapping
  // guarantees that the chosen shade is the exact supplied brand color.
  L[safeAnchor] = brand.L;
  C[safeAnchor] = brand.C;
  H[safeAnchor] = brand.H;

  return { L, C, H, hue: brand.H, anchorIndex: safeAnchor };
}
