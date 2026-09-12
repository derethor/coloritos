import { COLOR_GROUPS, SHADES, makeInitialBands } from '../data/colorDefs.js';

function emptyGlobalCurves() {
  return Object.fromEntries(
    COLOR_GROUPS.map(({ id }) => [id, { L: SHADES.map(() => 0), C: SHADES.map(() => 0) }]),
  );
}

function initialPaletteDisplay() {
  return Object.fromEntries(
    COLOR_GROUPS.map(({ id }) => [id, { showColorInfo: false, compact: true, hidden: false }]),
  );
}

export function createStore() {
  return {
    bands: makeInitialBands(),
    globalCurves: emptyGlobalCurves(),
    selected: [], // indices, in click order
    opts: { smooth: false, lockOrder: true, lockEnds: false },
    editorMode: 'rainbow',
    paletteDisplay: initialPaletteDisplay(),
    soloBand: null,
    rowImportText: '',
    rowImportStatus: '',
    brandRampHex: '#635BFF',
    brandRampAnchor: 'auto',
    brandRampTemplate: 'auto',
    brandRampStatus: '',
    cssExportFormat: 'theme',
    cssExportColorFormat: 'oklch',
    cssExportScope: 'all',
    cssExportSource: 'rendered',
    cssTokenPrefix: '--color-',
    cssImportText: '',
    cssImportMode: 'complete',
    cssImportPreview: null,
    cssTokenStatus: '',
    cssPreset: 'tailwind',
    cssPresetStatus: '',
    curveClipboard: null,
    curveTransferStatus: '',
    resampleStatus: Object.fromEntries(COLOR_GROUPS.map(({ id }) => [id, ''])),
  };
}
