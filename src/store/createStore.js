import { SHADES, makeInitialBands } from '../data/colorDefs.js';

export function createStore() {
  return {
    bands: makeInitialBands(),
    globalCurves: { L: SHADES.map(() => 0), C: SHADES.map(() => 0) },
    selected: [], // indices, in click order
    opts: { smooth: false, lockOrder: true, lockEnds: false },
    editorMode: 'color',
    showColorInfo: false,
    compactPalette: true,
    soloBand: null,
    rowImportText: '',
    rowImportStatus: '',
    curveClipboard: null,
    curveTransferStatus: '',
    resampleStatus: '',
  };
}
