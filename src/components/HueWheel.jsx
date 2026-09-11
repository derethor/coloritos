import { usePaletteStore } from '../store/PaletteContext.jsx';
import { oklchToSrgb } from '../lib/colorMath.js';

function position(hue, r) {
  const angle = ((hue - 90) * Math.PI) / 180;
  return [150 + Math.cos(angle) * r, 150 + Math.sin(angle) * r];
}

function labelText(band) {
  return `${band.locked ? '🔒︎ ' : ''}${band.name} ${band.hue.toFixed(3)}°`;
}

function HueMarker({ band, bi }) {
  const { store, render } = usePaletteStore();
  const [x1, y1] = position(band.hue, 51);
  const [x2, y2] = position(band.hue, 116);
  const [lx, ly] = position(band.hue, 137);
  const { rgb } = oklchToSrgb(0.68, 0.3, band.hue);
  const brightest = Math.max(rgb[0], rgb[1], rgb[2]);
  const brightnessScale = brightest > 0 ? 255 / brightest : 1;
  const brightRgb = [Math.round(rgb[0] * brightnessScale), Math.round(rgb[1] * brightnessScale), Math.round(rgb[2] * brightnessScale)];

  function onPointerDown(ev) {
    if (band.locked) return;
    ev.preventDefault();
    const svg = ev.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();

    function move(e) {
      const x = ((e.clientX - rect.left) * 300) / rect.width - 150;
      const y = ((e.clientY - rect.top) * 300) / rect.height - 150;
      const nextHue = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
      const delta = ((nextHue - band.hue + 540) % 360) - 180;
      band.hue = nextHue;
      band.H = band.H.map((h) => (h + delta + 360) % 360);
      render();
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <>
      <line className="hue-spoke" x1={x1} y1={y1} x2={x2} y2={y2} />
      <circle
        className={'hue-marker' + (band.locked ? ' locked' : '')}
        r={9}
        cx={x2}
        cy={y2}
        stroke="#fff"
        strokeWidth="1.5"
        fill={`rgb(${brightRgb.join(',')})`}
        onPointerDown={onPointerDown}
        onClick={() => {
          if (!band.locked) {
            store.selected = [bi];
            render();
          }
        }}
      >
        <title>
          {band.name}: {band.hue.toFixed(3)}°{band.locked ? ' (locked)' : ''}
        </title>
      </circle>
      <text className="hue-label" x={lx} y={ly + 2.5}>
        {labelText(band)}
      </text>
    </>
  );
}

export default function HueWheel({ colorNames }) {
  const { store } = usePaletteStore();

  return (
    <div className="hue-wheel-wrap">
      <svg viewBox="0 0 300 300" className="hue-wheel">
        {store.bands.map((band, bi) =>
          colorNames.includes(band.name) ? <HueMarker key={band.name} band={band} bi={bi} /> : null,
        )}
      </svg>
      <div className="hue-center-label">
        OKLCH H
        <br />
        0–360°
      </div>
    </div>
  );
}
