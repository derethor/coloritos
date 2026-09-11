import { SHADES } from '../data/colorDefs.js';
import { usePaletteStore } from '../store/PaletteContext.jsx';
import { resampleUnlockedCurves } from '../lib/paletteLogic.js';
import CurveEditor from './CurveEditor.jsx';
import HueWheel from './HueWheel.jsx';

export default function GlobalPanel({ group }) {
  const { store, render } = usePaletteStore();
  const bands = store.bands.filter((band) => group.colors.includes(band.name));
  const globalCurves = store.globalCurves[group.id];

  function resetAdjustments() {
    store.globalCurves[group.id].L = SHADES.map(() => 0);
    store.globalCurves[group.id].C = SHADES.map(() => 0);
    render();
  }

  function resample() {
    const result = resampleUnlockedCurves(store, group.colors);
    store.resampleStatus[group.id] = result.error || `Resampled ${result.updated} unlocked rows from ${result.anchors} locked hue anchor${result.anchors === 1 ? '' : 's'}.`;
    render();
  }

  function applyCurves() {
    bands.forEach((b) => {
      if (b.locked) return;
      for (let i = 0; i < SHADES.length; i++) {
        b.L[i] = Math.min(1, Math.max(0, b.L[i] + globalCurves.L[i]));
        b.C[i] = Math.min(0.4, Math.max(0, b.C[i] + globalCurves.C[i]));
      }
    });
    store.globalCurves[group.id].L = SHADES.map(() => 0);
    store.globalCurves[group.id].C = SHADES.map(() => 0);
    render();
  }

  return (
    <>
      <div className="row-between">
        <h2>Global {group.name.toLowerCase()}</h2>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <button className="btn" title="Interpolate every unlocked L/C curve from the nearest locked rows around the hue wheel" onClick={resample}>
            Resample unlocked
          </button>
          <button className="btn" onClick={resetAdjustments}>
            Reset adjustments
          </button>
          <button className="btn" onClick={applyCurves}>
            Apply curves
          </button>
        </div>
      </div>

      <div className="sub">
        Preview additive L/C adjustments on {bands.filter((b) => !b.locked).length} unlocked rows, then apply them to bake the curves into those rows.
      </div>

      {store.resampleStatus[group.id] && <div className="curve-transfer-status">{store.resampleStatus[group.id]}</div>}

      <div className="global-controls-grid">
        <div className="section">
          <div className="section-title">
            OKLCH hue (H) <span>360°</span>
          </div>
          <HueWheel colorNames={group.colors} />
          <div className="curve-help">Drag a labeled marker around the wheel to adjust its hue. Locked colors stay fixed.</div>
        </div>

        <div className="global-curve-column">
          <div className="section">
            <div className="section-title">
              Global L adjustment<span>Bézier</span>
            </div>
            <CurveEditor
              getArr={() => globalCurves.L}
              setArr={(target) => (target === group.id ? globalCurves.L : null)}
              min={-0.25}
              max={0.25}
              targets={() => [group.id]}
            />
            <div className="curve-help">Drag pivots · double-click to add · Alt/right-click a pivot to remove</div>
          </div>

          <div className="section">
            <div className="section-title">
              Global C adjustment<span>Bézier</span>
            </div>
            <CurveEditor
              getArr={() => globalCurves.C}
              setArr={(target) => (target === group.id ? globalCurves.C : null)}
              min={-0.15}
              max={0.15}
              targets={() => [group.id]}
            />
            <div className="curve-help">Drag pivots · double-click to add · Alt/right-click a pivot to remove</div>
          </div>
        </div>
      </div>

      <div className="sub" style={{ marginTop: 14 }}>
        Zero leaves rows unchanged. Apply curves bakes the preview into every unlocked row and resets both global adjustments to zero.
      </div>
    </>
  );
}
