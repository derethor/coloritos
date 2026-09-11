import { usePaletteStore } from '../store/PaletteContext.jsx';
import { COLOR_GROUPS, SHADES } from '../data/colorDefs.js';
import { isSelected, primaryIndex, selectBand, swatchColor, swatchOklch } from '../lib/paletteLogic.js';

export default function Palette() {
  const { store, render } = usePaletteStore();
  const { bands, soloBand } = store;
  const pi = primaryIndex(store);

  return (
    <div className="palette" id="palette">
      {COLOR_GROUPS.map((group) => {
        const groupBands = bands
          .map((band, bi) => ({ band, bi }))
          .filter(({ band, bi }) => group.colors.includes(band.name) && (soloBand === null || soloBand === bi));

        if (!groupBands.length) return null;

        return (
          <section className="palette-group" key={group.name}>
            <h2 className="palette-group-title">{group.name}</h2>
            {groupBands.map(({ band, bi }) => {
              const classes = [
                'band',
                pi === bi ? 'active' : '',
                isSelected(store, bi) && pi !== bi ? 'multiselected' : '',
                band.locked ? 'locked' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div className={classes} key={band.name}>
                  <div
                    className="band-label"
                    onClick={(e) => {
                      selectBand(store, bi, e.shiftKey || e.ctrlKey || e.metaKey);
                      render();
                    }}
                  >
                    {band.name}
                  </div>
                  <div className="swatches">
                    {SHADES.map((shade, si) => (
                      <Swatch key={shade} bi={bi} si={si} shade={shade} band={band} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      <div className="shade-row">
        <div className="band-label" />
        <div className="swatches">
          {SHADES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Swatch({ bi, si, shade, band }) {
  const { store, render } = usePaletteStore();

  const { rgb } = swatchColor(store, band, si);
  const { L, C, H } = swatchOklch(store, band, si);
  const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

  function startSwatchDrag(ev) {
    if (band.locked) return;
    ev.preventDefault();
    if (!isSelected(store, bi)) {
      selectBand(store, bi, ev.shiftKey || ev.ctrlKey || ev.metaKey);
      render();
    }

    const startX = ev.clientX,
      startY = ev.clientY;
    const startL = band.L[si],
      startC = band.C[si];

    function move(e) {
      const dx = e.clientX - startX,
        dy = e.clientY - startY;
      band.C[si] = Math.min(0.4, Math.max(0, startC + dx * 0.0012));
      band.L[si] = Math.min(1, Math.max(0, startL - dy * 0.002));
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
    <div
      className="swatch"
      style={{ background: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }}
      title={`${band.name}-${shade} · drag horizontally for OKLCH chroma, vertically for OKLCH lightness`}
      onPointerDown={startSwatchDrag}
    >
      <div className="swatch-info">
        {band.name}-{shade}
        <br />
        L&nbsp; {(L * 100).toFixed(1)}%<br />
        C&nbsp; {C.toFixed(3)}
        <br />
        H&nbsp; {H.toFixed(3)}°<br />
        {hex}
      </div>
      {si === 0 && (
        <button
          className="swatch-lock"
          title={band.locked ? `Unlock ${band.name}` : `Lock ${band.name}`}
          aria-label={band.locked ? `Unlock ${band.name}` : `Lock ${band.name}`}
          onClick={(e) => {
            e.stopPropagation();
            band.locked = !band.locked;
            render();
          }}
        >
          {band.locked ? '🔒' : '🔓'}
        </button>
      )}
    </div>
  );
}
