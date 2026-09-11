import { COLOR_GROUPS, SHADES, makeInitialBands } from '../data/colorDefs.js';

function emptyGlobalCurves() {
  return Object.fromEntries(
    COLOR_GROUPS.map(({ id }) => [id, { L: SHADES.map(() => 0), C: SHADES.map(() => 0) }]),
  );
}

export function createStore() {
  return {
    bands: makeInitialBands(),
    globalCurves: emptyGlobalCurves(),
    selected: [], // indices, in click order
    opts: { smooth: false, lockOrder: true, lockEnds: false },
    editorMode: 'rainbow',
    showColorInfo: false,
    compactPalette: true,
    soloBand: null,
    rowImportText: '',
    rowImportStatus: '',
    curveClipboard: null,
    curveTransferStatus: '',
    resampleStatus: Object.fromEntries(COLOR_GROUPS.map(({ id }) => [id, ''])),
  };
}
