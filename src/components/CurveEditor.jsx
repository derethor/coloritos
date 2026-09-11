import { useRef, useState } from 'react';
import { SHADES } from '../data/colorDefs.js';
import { usePaletteStore } from '../store/PaletteContext.jsx';
import { controls, fitPivots, sampledValues } from '../lib/curveMath.js';

const N = SHADES.length;

export default function CurveEditor({ getArr, setArr, min = 0, max = 1, small = false, desc = false, targets }) {
  const { store, render } = usePaletteStore();
  const svgRef = useRef(null);

  const W = 300,
    H = small ? 90 : 130,
    PAD = 8;
  const xAt = (x) => PAD + x * (W - 2 * PAD);
  const yAt = (v) => H - PAD - v * (H - 2 * PAD);

  const normalize = (v) => (v - min) / (max - min);
  const denormalize = (v) => min + v * (max - min);
  const tolerance = max - min > 0.3 ? 0.025 : 0.018;

  const arr = getArr();
  const [pivots, setPivotsState] = useState(() => fitPivots(arr, normalize, tolerance));
  const prevArrRef = useRef(arr);
  let currentPivots = pivots;
  if (prevArrRef.current !== arr) {
    prevArrRef.current = arr;
    currentPivots = fitPivots(arr, normalize, tolerance);
    setPivotsState(currentPivots);
  }

  function commit(previousValues, nextPivots) {
    const nextValues = sampledValues(nextPivots, N, denormalize);
    const targetList = targets ? targets() : store.selected;
    targetList.forEach((target) => {
      const targetArr = setArr(target);
      if (!targetArr) return;
      for (let i = 0; i < N; i++) {
        targetArr[i] = Math.min(max, Math.max(min, targetArr[i] + nextValues[i] - previousValues[i]));
      }
      if (store.opts.lockOrder && desc) {
        for (let i = 1; i < N; i++) targetArr[i] = Math.min(targetArr[i], targetArr[i - 1]);
      }
    });
    render();
  }

  function dragPoint(ev, i) {
    ev.preventDefault();
    ev.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();

    function move(e) {
      const previous = sampledValues(currentPivots, N, denormalize);
      const relX = (e.clientX - rect.left) * (W / rect.width);
      const relY = (e.clientY - rect.top) * (H / rect.height);
      const next = currentPivots.map((p) => ({ ...p }));
      next[i].y = Math.min(1, Math.max(0, 1 - (relY - PAD) / (H - 2 * PAD)));
      if (i > 0 && i < next.length - 1) {
        const minX = next[i - 1].x + 0.015,
          maxX = next[i + 1].x - 0.015;
        next[i].x = Math.min(maxX, Math.max(minX, (relX - PAD) / (W - 2 * PAD)));
      }
      currentPivots = next;
      setPivotsState(next);
      commit(previous, next);
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function addPoint(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.min(0.999, Math.max(0.001, ((e.clientX - rect.left) * (W / rect.width) - PAD) / (W - 2 * PAD)));
    if (currentPivots.some((p) => Math.abs(p.x - x) < 0.02)) return;
    const previous = sampledValues(currentPivots, N, denormalize);
    const y = Math.min(1, Math.max(0, 1 - ((e.clientY - rect.top) * (H / rect.height) - PAD) / (H - 2 * PAD)));
    const next = [...currentPivots, { x, y }].sort((a, b) => a.x - b.x);
    setPivotsState(next);
    commit(previous, next);
  }

  function removePoint(i) {
    if (currentPivots.length <= 2 || i === 0 || i === currentPivots.length - 1) return;
    const previous = sampledValues(currentPivots, N, denormalize);
    const next = currentPivots.filter((_, idx) => idx !== i);
    setPivotsState(next);
    commit(previous, next);
  }

  let d = `M ${xAt(currentPivots[0].x)} ${yAt(currentPivots[0].y)}`;
  for (let i = 0; i < currentPivots.length - 1; i++) {
    const b = currentPivots[i + 1];
    const [c1, c2] = controls(currentPivots, i);
    d += ` C ${xAt(c1.x)} ${yAt(c1.y)}, ${xAt(c2.x)} ${yAt(c2.y)}, ${xAt(b.x)} ${yAt(b.y)}`;
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={'curve' + (small ? ' small' : '')}
      onDoubleClick={addPoint}
      onContextMenu={(e) => e.preventDefault()}
    >
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={yAt(f)} y2={yAt(f)} className="curve-guide" />
      ))}
      <path d={d} fill="none" stroke="#7dd3fc" strokeWidth="1.5" />
      {currentPivots.map((point, i) => {
        const locked = store.opts.lockEnds && (i === 0 || i === currentPivots.length - 1);
        return (
          <circle
            key={i}
            cx={xAt(point.x)}
            cy={yAt(point.y)}
            r={6}
            fill="#7dd3fc"
            stroke="#0a0a0a"
            strokeWidth="1"
            style={{ opacity: locked ? 0.4 : 1 }}
            aria-label={`Curve pivot ${i + 1}`}
            onPointerDown={(e) => {
              if (locked) return;
              if (e.altKey) {
                e.preventDefault();
                removePoint(i);
              } else {
                dragPoint(e, i);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!locked) removePoint(i);
            }}
          />
        );
      })}
    </svg>
  );
}
