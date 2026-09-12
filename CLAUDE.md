# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (not npm/yarn — `pnpm-lock.yaml` is the source of truth).

```bash
pnpm install          # install dependencies
pnpm dev              # start Vite dev server (binds 0.0.0.0:4321, see vite.config.js/package.json)
pnpm build            # production build to dist/
pnpm preview          # preview the production build
```

There is no test suite, linter, or type checker configured in this repo.

## Architecture

This is a single-page React app (Vite + React 19) that reimplements a Tailwind CSS OKLCH color-ramp editor. The original vanilla-JS single-file version is preserved at `index.legacy.html` for reference — when in doubt about intended behavior of an interaction, that file is the ground truth the React version was ported from line-for-line.

### State management: mutable store + manual re-render, not React state

The app deliberately avoids `useState`/immutable updates for the core palette data. Instead:

- `src/store/createStore.js` creates one plain mutable JS object (`bands`, `globalCurves`, `selected`, `opts`, `editorMode`, etc.) — arrays inside `bands[i].L/C/H` are mutated in place.
- `src/store/PaletteContext.jsx` holds this store in a `useRef` and exposes it plus a `render()` function (a `useReducer` counter bump) via React Context (`usePaletteStore()`).
- Components read straight from `store.*` during render and, after mutating store fields directly in event handlers, call `render()` to force the whole tree to re-render.

This pattern exists because of high-frequency pointer-drag interactions (swatch drag, Bézier curve pivot drag, hue-wheel drag) where re-running full immutable-update/diff cycles per `pointermove` would be wasteful and where the original imperative logic mutates arrays in place. **Do not refactor this into `useState`/reducers piecemeal** — it would require rethinking the drag handlers together, not file-by-file.

`CurveEditor.jsx` additionally keeps its own local pivot-fitting state (`useState`) derived from the underlying array via Ramer–Douglas–Peucker simplification (`src/lib/curveMath.js`); it only re-fits pivots from scratch when the array *reference* changes (e.g. Reset/Import/Paste reassigns a new array), not on every in-place mutation during a drag — this distinction is load-bearing for drag smoothness.

### Module layout

- `src/data/colorDefs.js` — canonical Tailwind CSS OKLCH ramp data (`TW_DATA`, compressed as `L×1000,C×1000,H×1000` strings) plus `makeBand`/`makeInitialBands`, which build each color band's mutable `{hue, H, L, C, locked, default}` shape.
- `src/lib/colorMath.js` — OKLCH ⟷ sRGB conversion and hex-parsing, pure functions, no store dependency.
- `src/lib/curveMath.js` — Bézier curve fitting/sampling used by `CurveEditor`.
- `src/lib/paletteLogic.js` — store-aware helpers (`swatchColor`, `selectBand`, `resampleUnlockedCurves`, etc.) that read/mutate a passed-in `store` object; kept separate from React components so the logic mirrors the original script closely.
- `src/components/` — `Palette` (band rows + swatches), `Panel` (mode switcher), `ColorPanel` (per-band hue/L/C curve editing), `GlobalPanel` (hue wheel + global additive L/C curves), `CurveEditor` (reusable Bézier editor for both per-band and global curves), `HueWheel`.

### Two editing modes, one underlying model

- **Color mode** edits a selected band's (or multi-selected bands') absolute `L`/`C`/`H` arrays directly.
- **Global mode** (`globalCurves.L/C`) previews an *additive* adjustment applied on top of every unlocked band's curves (see `swatchOklch` in `paletteLogic.js`), and "Apply curves" bakes that additive delta into each unlocked band's arrays and resets the global curves to zero.
- A band's `locked` flag excludes it from global curve effects, from "Resample unlocked", and from Reset/Paste/Import operations — locked bands also serve as interpolation anchors for `resampleUnlockedCurves` (interpolated around the hue wheel between the nearest two locked hues).

### Styling

Plain CSS in `src/index.css` (ported verbatim from the legacy file's `<style>` block), toggled via `document.body.classList` (`hide-color-info`, `compact-palette`) from `App.jsx` — not CSS Modules or Tailwind, despite the app's subject matter being Tailwind color ramps.
