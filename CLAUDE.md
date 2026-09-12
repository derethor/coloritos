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

`CurveEditor.jsx` additionally keeps its own local pivot-fitting state (`useState`) derived from the underlying array via Ramer–Douglas–Peucker simplification (`src/lib/curveMath.js`). It re-fits when the array reference changes (e.g. Reset/Import/Paste) or when its explicit `syncKey` changes. Direct swatch drags increment a band's `curveRevision` and pass that revision as the row editors' `syncKey`, keeping the visible curves synchronized with the edited swatch without changing the mutable-store architecture.

### Module layout

- `src/data/colorDefs.js` — canonical Tailwind CSS OKLCH ramp data (`TW_DATA`, compressed as `L×1000,C×1000,H×1000` strings) plus `makeBand`/`makeInitialBands`, which build each color band's mutable `{hue, H, L, C, locked, default}` shape.
- `src/lib/colorMath.js` — OKLCH ⟷ sRGB conversion and hex-parsing, pure functions, no store dependency.
- `src/lib/brandRamp.js` — brand-color ramp generation: selects/fits a Tailwind-shaped template, preserves an exact anchor color, and gamut-maps generated chroma into sRGB.
- `src/lib/cssTokens.js` — palette-wide CSS token serialization plus transactional parsing/application for `@theme` and `:root` workflows; supports OKLCH, hex, and RGB imports.
- The same token module owns palette preset application. Preset metadata/data lives in `src/data/presets.js`. Tailwind restores the 22 canonical families from each band's immutable `default` values; Custom desaturated supplies explicit hex ramps for all 26 rows. Chakra UI preserves its ten native ramps and fills additional chromatic rows with gamut-mapped OKLCH blends. Ant Design maps its native 10-step palettes to 50–900, derives a gamut-safe 950 endpoint, and blends missing families. IBM Carbon follows the same grade adaptation while preserving its native chromatic ramps and assigning `coolGray`, `gray`, and `warmGray` across the app's neutral families. All presets preserve locked rows and clear global preview curves.
- `src/lib/curveMath.js` — Bézier curve fitting/sampling used by `CurveEditor`.
- `src/lib/paletteLogic.js` — store-aware helpers (`swatchColor`, `selectBand`, `resampleUnlockedCurves`, etc.) that read/mutate a passed-in `store` object; kept separate from React components so the logic mirrors the original script closely.
- `src/components/` — `Palette` (band rows + swatches), `Panel` (mode switcher), `ColorPanel` (per-band hue/L/C curve editing and row tools), `CssTokenTools` (CSS import/export UI), `GlobalPanel` (hue wheel + global additive L/C curves), `CurveEditor` (reusable Bézier editor for both per-band and global curves), `HueWheel`, `PaletteDemo` (live product-component/theme gallery), and `WordPressDemo` (live editorial/content-widget preview).

### Editor modes, one underlying model

- **Color mode** edits a selected band's (or multi-selected bands') absolute `L`/`C`/`H` arrays directly.
- **Global mode** (`globalCurves.L/C`) previews an *additive* adjustment applied on top of every unlocked band's curves (see `swatchOklch` in `paletteLogic.js`), and "Apply curves" bakes that additive delta into each unlocked band's arrays and resets the global curves to zero.
- **Tokens mode** provides palette-wide CSS import/export in its own sticky panel. Export scope can be the full palette, Rainbow, Neutrals, locked colors, or selected rows. "Visible colors" includes global preview adjustments; "Row values only" excludes them. Importing remains transactional until the user previews and applies it.
- A band's `locked` flag excludes it from global curve effects, from "Resample unlocked", and from Reset/Paste/Import operations — locked bands also serve as interpolation anchors for `resampleUnlockedCurves` (interpolated around the hue wheel between the nearest two locked hues).

### Live component demo

`PaletteDemo.jsx` and `WordPressDemo.jsx` render beneath `Palette` in the same 1000px `.workspace-main` column. `Panel` remains their sticky sibling, so editor controls stay visible while scrolling through either preview. Interactions inside `.demo-section` or `.wp-demo-section` deliberately do not clear the selected row.

- Demo colors are computed on every store render through `swatchColor`, so in-place ramp edits and unapplied global adjustments appear immediately.
- Theme definitions map semantic roles (`primary`, `accent`, `success`, `warning`, `danger`, `neutral`, `gray`) to existing band names. Do not introduce separate hard-coded theme palettes.
- Dark themes use `invertShades` and `INVERSE_SHADE` to reverse the semantic scale. This keeps existing component CSS meaningful: a `50` surface becomes the band's actual `950`, while an `800` foreground becomes its actual `200`.
- The dark command-center specimen is intentionally different: it calls `color()` directly and always uses the bands' actual 700–950 shades, independent of theme inversion.
- Rainbow cards and tag-cloud items use individual named bands so editing colors outside the active semantic theme remains visible in the gallery.
- Small UI state local to the demo (currently theme and dialog visibility) uses React `useState`; this does not belong in the palette store because it does not affect palette data.
- `WordPressDemo` uses the `.wp-*` CSS namespace and its own local theme selector. Editorial Light, Midnight Reader, and Color Journal each map the existing bands to editorial surface, content, link, accent, action, and footer tokens; no palette values are duplicated in the component.

### Styling

Plain CSS in `src/index.css` (original editor rules were ported from the legacy file, with the demo styles appended), toggled via `document.body.classList` (`hide-color-info`, `compact-palette`) from `App.jsx` — not CSS Modules or Tailwind, despite the app's subject matter being Tailwind color ramps. Demo styles stay under the `.demo-*` namespace to avoid leaking component-preview rules into the editor UI.
