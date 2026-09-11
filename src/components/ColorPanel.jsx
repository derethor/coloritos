import { SHADES } from '../data/colorDefs.js';
import { usePaletteStore } from '../store/PaletteContext.jsx';
import { isSelected, primaryIndex, swatchColor, swatchOklch } from '../lib/paletteLogic.js';
import { parseHexColors, srgbToOklch } from '../lib/colorMath.js';
import CurveEditor from './CurveEditor.jsx';

export default function ColorPanel() {
  const { store, render } = usePaletteStore();
  const { selected, bands } = store;

  if (selected.length === 0) {
    return (
      <div className="empty">
        Select a color band
        <br />
        to edit its ramp
      </div>
    );
  }

  const pi = primaryIndex(store);
  const band = bands[pi];
  const multi = selected.length > 1;
  const mid = 5; // shade 500 index
  const { rgb } = swatchColor(store, band, mid);
  const { L: actualL, C: actualC, H: actualH } = swatchOklch(store, band, mid);
  const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');

  function copyCurves() {
    store.curveClipboard = { source: band.name, L: band.L.slice(), C: band.C.slice() };
    store.curveTransferStatus = `Copied lightness and chroma curves from ${band.name}.`;
    render();
  }

  function pasteCurves() {
    if (!store.curveClipboard) return;
    const targets = selected.filter((bi) => !bands[bi].locked);
    targets.forEach((bi) => {
      bands[bi].L = store.curveClipboard.L.slice();
      bands[bi].C = store.curveClipboard.C.slice();
    });
    const skipped = selected.length - targets.length;
    store.curveTransferStatus = targets.length
      ? `Pasted curves from ${store.curveClipboard.source} into ${targets.map((bi) => bands[bi].name).join(', ')}${
          skipped ? `; skipped ${skipped} locked row${skipped === 1 ? '' : 's'}` : ''
        }.`
      : 'No curves pasted; unlock at least one selected row first.';
    render();
  }

  function resetSelected() {
    selected.forEach((bi) => {
      const b = bands[bi];
      if (b.locked) return;
      b.hue = b.default.hue;
      b.H = b.default.H.slice();
      b.L = b.default.L.slice();
      b.C = b.default.C.slice();
    });
    render();
  }

  function resetL() {
    selected.forEach((bi) => {
      if (!bands[bi].locked) bands[bi].L = bands[bi].default.L.slice();
    });
    render();
  }

  function resetC() {
    selected.forEach((bi) => {
      if (!bands[bi].locked) bands[bi].C = bands[bi].default.C.slice();
    });
    render();
  }

  function onHueChange(e) {
    const val = Number(e.target.value);
    const delta = val - band.hue;
    selected.forEach((bi) => {
      if (!bands[bi].locked) {
        bands[bi].hue = (bands[bi].hue + delta + 360) % 360;
        bands[bi].H = bands[bi].H.map((h) => (h + delta + 360) % 360);
      }
    });
    render();
  }

  function onImport() {
    const colors = parseHexColors(store.rowImportText);
    if (colors.length !== SHADES.length) {
      store.rowImportStatus = `Expected 11 hex values; found ${colors.length}.`;
      render();
      return;
    }
    if (band.locked) {
      store.rowImportStatus = `Unlock ${band.name} before importing.`;
      render();
      return;
    }
    const converted = colors.map(srgbToOklch);
    band.H = converted.map((color) => color.H);
    band.L = converted.map((color) => color.L);
    band.C = converted.map((color) => color.C);
    band.hue = band.H[5];
    store.rowImportStatus = `Imported ${colors.length} colors into ${band.name}, shades 50 → 950.`;
    render();
  }

  return (
    <>
      <div className="row-between">
        <h2>{multi ? `${selected.length} bands selected` : band.name}</h2>
        <div className="row-actions">
          <button className="btn" title={`Copy ${band.name}'s lightness and chroma curves`} onClick={copyCurves}>
            Copy curves
          </button>
          <button
            className="btn"
            disabled={!store.curveClipboard}
            title={store.curveClipboard ? `Paste curves from ${store.curveClipboard.source} into the selected unlocked rows` : 'Copy curves from a row first'}
            onClick={pasteCurves}
          >
            Paste curves
          </button>
          <button className="btn" onClick={resetSelected}>
            Reset
          </button>
        </div>
      </div>

      <div className="sub">
        {multi ? bands.filter((_, i) => isSelected(store, i)).map((b) => b.name).join(', ') : 'OKLCH ramp, shades 50 → 950'}
      </div>

      {store.curveTransferStatus && <div className="curve-transfer-status">{store.curveTransferStatus}</div>}

      <div className="section">
        <div className="section-title">
          OKLCH hue (H) <span>{band.hue.toFixed(3)}°</span>
        </div>
        <div className="hue-track" />
        <input type="range" min={0} max={360} step={0.001} value={band.hue} onChange={onHueChange} />
      </div>

      <div className="color-curves-grid">
        <div className="section">
          <div className="section-title">
            <span>OKLCH lightness (L) · 0–1</span>
            <button className="btn tiny" type="button" onClick={resetL}>
              Reset
            </button>
          </div>
          <CurveEditor
            getArr={() => band.L}
            setArr={(bi) => (bands[bi].locked ? null : bands[bi].L)}
            min={0}
            max={1}
            desc
            syncKey={band.curveRevision}
          />
          <div className="curve-help">Absolute row values · drag pivots · double-click to add · Alt/right-click to remove</div>
        </div>

        <div className="section">
          <div className="section-title">
            <span>OKLCH chroma (C) · 0–0.4</span>
            <button className="btn tiny" type="button" onClick={resetC}>
              Reset
            </button>
          </div>
          <CurveEditor
            getArr={() => band.C}
            setArr={(bi) => (bands[bi].locked ? null : bands[bi].C)}
            min={0}
            max={0.4}
            syncKey={band.curveRevision}
          />
          <div className="curve-help">Absolute row values · drag pivots · double-click to add · Alt/right-click to remove</div>
        </div>
      </div>

      <div className="num-grid">
        <div>
          H (500)
          <b>{actualH.toFixed(3)}°</b>
        </div>
        <div>
          L (500)
          <b>{actualL.toFixed(2)}</b>
        </div>
        <div>
          C (500)
          <b>{actualC.toFixed(3)}</b>
        </div>
        <div>
          Hex
          <b>{hex}</b>
        </div>
      </div>

      <div className="row-import">
        <textarea
          placeholder="Paste 11 hex colors in shade order: #fff #f5f5f5 … #111"
          defaultValue={store.rowImportText}
          onChange={(e) => {
            store.rowImportText = e.target.value;
          }}
        />
        <button className="btn" onClick={onImport}>
          Import 11 colors
        </button>
        <div className="import-status">{store.rowImportStatus}</div>
      </div>
    </>
  );
}
