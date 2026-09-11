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
        const display = store.paletteDisplay[group.id];
        const groupClass = [
          'palette-group',
          display.compact ? 'compact-palette' : '',
          display.showColorInfo ? '' : 'hide-color-info',
          display.hidden ? 'is-hidden' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <section className={groupClass} key={group.name}>
            <div className="palette-group-header">
              <h2 className="palette-group-title">{group.name}</h2>
              <div className="palette-group-actions">
                <button
                  className="btn tiny"
                  aria-expanded={!display.hidden}
                  onClick={() => {
                    display.hidden = !display.hidden;
                    render();
                  }}
                >
                  {display.hidden ? 'Show' : 'Hide'}
                </button>
                <button
                  className="btn tiny"
                  aria-pressed={display.compact}
                  onClick={() => {
                    display.compact = !display.compact;
                    render();
                  }}
                >
                  {display.compact ? 'Compact' : 'Confort'}
                </button>
                <button
                  className="btn tiny"
                  aria-pressed={display.showColorInfo}
                  onClick={() => {
                    display.showColorInfo = !display.showColorInfo;
                    render();
                  }}
                >
                  {display.showColorInfo ? 'Hide info' : 'Show info'}
                </button>
              </div>
            </div>
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
                    <span>{band.name}</span>
                    <button
                      className={`band-control band-lock ${band.locked ? 'active' : ''}`}
                      title={band.locked ? `Unlock ${band.name}` : `Lock ${band.name}`}
                      aria-label={band.locked ? `Unlock ${band.name}` : `Lock ${band.name}`}
                      aria-pressed={band.locked}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        band.locked = !band.locked;
                        render();
                      }}
                    >
                      <LockIcon locked={band.locked} />
                    </button>
                    <button
                      className={`band-control band-solo ${store.soloBand === bi ? 'active' : ''}`}
                      title={store.soloBand === bi ? `Show all color rows` : `Solo ${band.name}`}
                      aria-label={store.soloBand === bi ? `Show all color rows` : `Solo ${band.name}`}
                      aria-pressed={store.soloBand === bi}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        store.soloBand = store.soloBand === bi ? null : bi;
                        render();
                      }}
                    >
                      <SoloIcon />
                    </button>
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
      band.curveRevision++;
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
    </div>
  );
}

function LockIcon({ locked }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" />
      <path d={locked ? 'M5.5 7V5a2.5 2.5 0 0 1 5 0v2' : 'M10.5 7V5a2.5 2.5 0 0 0-4.8-1'} />
    </svg>
  );
}

function SoloIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 5V2.5H5M11 2.5h2.5V5M13.5 11v2.5H11M5 13.5H2.5V11" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}
