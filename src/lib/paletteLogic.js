import { SHADES, colorGroupFor } from '../data/colorDefs.js';
import { oklchToSrgb } from './colorMath.js';

export function swatchOklch(store, band, i) {
  const applyGlobal = !band.locked;
  const globalCurves = store.globalCurves[colorGroupFor(band.name).id];
  const L = Math.min(1, Math.max(0, band.L[i] + (applyGlobal ? globalCurves.L[i] : 0)));
  const C = Math.min(0.4, Math.max(0, band.C[i] + (applyGlobal ? globalCurves.C[i] : 0)));
  return { L, C, H: band.H[i] };
}

export function swatchColor(store, band, i) {
  const { L, C, H } = swatchOklch(store, band, i);
  return oklchToSrgb(L, C, H);
}

export function isSelected(store, i) {
  return store.selected.includes(i);
}

export function primaryIndex(store) {
  return store.selected.length ? store.selected[store.selected.length - 1] : null;
}

export function selectBand(store, i, additive) {
  if (additive) {
    const pos = store.selected.indexOf(i);
    if (pos >= 0) store.selected.splice(pos, 1);
    else store.selected.push(i);
  } else {
    store.selected = [i];
  }
  store.editorMode = 'row';
}

// Build periodic L(hue, shade) and C(hue, shade) surfaces from the locked rows.
// At each shade, values are interpolated along the neighboring arc on the hue wheel.
export function resampleUnlockedCurves(store, colorNames) {
  const bands = colorNames ? store.bands.filter((band) => colorNames.includes(band.name)) : store.bands;
  const anchors = bands.filter((b) => b.locked).slice().sort((a, b) => a.hue - b.hue);
  if (!anchors.length) return { updated: 0, error: 'Lock at least one color row to use as an interpolation anchor.' };

  bands.forEach((b) => {
    if (b.locked) return;
    if (anchors.length === 1) {
      b.L = anchors[0].L.slice();
      b.C = anchors[0].C.slice();
      return;
    }

    let upperIndex = anchors.findIndex((anchor) => anchor.hue >= b.hue);
    if (upperIndex < 0) upperIndex = 0;
    const upper = anchors[upperIndex];
    const lower = anchors[(upperIndex - 1 + anchors.length) % anchors.length];
    const span = (upper.hue - lower.hue + 360) % 360;
    const offset = (b.hue - lower.hue + 360) % 360;
    const t = span === 0 ? 0 : Math.min(1, Math.max(0, offset / span));
    b.L = SHADES.map((_, i) => lower.L[i] + (upper.L[i] - lower.L[i]) * t);
    b.C = SHADES.map((_, i) => lower.C[i] + (upper.C[i] - lower.C[i]) * t);
  });
  return { updated: bands.length - anchors.length, anchors: anchors.length };
}
