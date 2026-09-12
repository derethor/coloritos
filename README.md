# Prismforge

Prismforge is a visual color-system studio for designing complete OKLCH palettes. Shape color ramps, build a scale around an exact brand color, compare the result in live product and editorial interfaces, and exchange the finished palette as CSS design tokens.

The editor includes 17 chromatic families and 9 neutral families, each with the familiar `50`–`950` shade range.

## Highlights

- Edit lightness and chroma directly by dragging swatches or Bézier curves.
- Adjust hues individually or arrange an entire color group on a hue wheel.
- Generate an 11-shade ramp from an exact brand color.
- Lock important rows so presets and bulk operations leave them untouched.
- Copy a row's lightness and chroma curves into one or several other rows.
- Preview global, additive curve adjustments before applying them.
- Interpolate unlocked ramps from locked color anchors.
- Import and export Tailwind `@theme` or standard `:root` CSS variables.
- Load palettes adapted from Tailwind CSS, Chakra UI, Ant Design, and IBM Carbon.
- Evaluate changes immediately in product UI and WordPress-style editorial previews.

## Getting started

### Requirements

- Node.js 18 or newer
- [pnpm](https://pnpm.io/)

### Install and run

```bash
pnpm install
pnpm dev
```

The development server listens on `http://localhost:4321` and is available on the local network.

### Production build

```bash
pnpm build
pnpm preview
```

The production bundle is written to `dist/`.

## Using the editor

### Work with palette rows

Click a row name to select it and open the **Row** editor. Hold Shift, Ctrl, or Command while clicking to select multiple rows. Row operations apply to the selected unlocked rows.

Each row contains 11 shades:

```text
50  100  200  300  400  500  600  700  800  900  950
```

Drag directly inside a swatch to edit that point in its row curve:

- Horizontal movement changes OKLCH chroma.
- Vertical movement changes OKLCH lightness.

The lightness and chroma graphs update with the swatch. Inside a graph, drag a pivot to reshape the curve, double-click to add a pivot, and Alt-click or right-click a pivot to remove it.

Use the controls beside a row name to:

- **Lock** the row against presets, imports, resets, resampling, and global changes.
- **Solo** the row and temporarily hide the rest of the palette.

The Rainbow and Neutrals headers can independently hide their group, switch between compact and comfortable layouts, and show exact color information.

### Generate a brand ramp

Select the destination row, then open **Generate ramp from a brand color** at the bottom of the Row panel.

1. Enter or pick a hex color.
2. Choose an anchor shade, or let Prismforge select it automatically.
3. Choose **Auto Tailwind** to use the closest standard ramp shape, or **Current row** to retain the selected row's character.
4. Select **Generate**.

The supplied color is preserved exactly at the anchor shade. The surrounding colors are generated in OKLCH and mapped into the sRGB gamut.

### Edit a complete color group

Choose **Rainbow** or **Neutrals** in the sticky control panel to work on a group:

- Drag labels around the hue wheel to change row hues.
- Shape additive lightness and chroma adjustment curves.
- Preview those adjustments everywhere without changing the underlying rows.
- Select **Apply curves** to bake the preview into every unlocked row.
- Select **Resample unlocked** to interpolate unlocked curves from nearby locked hue anchors.

Global adjustments are independent for the Rainbow and Neutrals groups. Resetting adjustments discards only the current preview.

### Copy, reset, and import a row

The Row tools can copy lightness and chroma curves from the primary selected row and paste them into all selected unlocked rows. **Reset row** restores the original built-in values.

For a quick row import, paste exactly 11 hex values in shade order from `50` through `950`. Three- and six-digit hex notation is accepted.

## Palette presets

Open **Tokens**, select a palette, and choose **Load preset**. Loading a preset replaces every unlocked row it supports and clears unapplied global curve adjustments.

Included presets:

- **Tailwind CSS standard** — restores the canonical Tailwind families.
- **Custom desaturated** — a complete softer palette across all 26 rows.
- **Chakra UI** — preserves its native scales and derives missing families with OKLCH blends.
- **Ant Design (AntD)** — adapts its 10-step scales to the app's 11-shade model.
- **IBM Carbon Design System** — adapts Carbon's 10–100 grades and its cool, standard, and warm grays.

For 10-step source palettes, the original colors occupy shades `50`–`900`; Prismforge derives a gamut-safe `950` endpoint. Families absent from a source system are produced with gamut-mapped OKLCH interpolation.

## CSS token import and export

The Tokens panel supports two wrappers:

```css
@theme {
  --color-blue-500: oklch(62.3% 0.214 259.815);
}
```

```css
:root {
  --color-blue-500: #3B82F6;
}
```

### Export options

- **Wrapper:** Tailwind `@theme` or CSS `:root`.
- **Colors:** OKLCH or hexadecimal.
- **Scope:** full palette, Rainbow, Neutrals, locked colors, or selected rows.
- **Values:** visible colors or stored row values.
- **Prefix:** configurable custom-property prefix; the default is `--color-`.

**Visible colors** includes global curve adjustments currently being previewed. **Row values only** excludes unapplied global adjustments.

Exported CSS can be copied to the clipboard or downloaded as `palette-tokens.css`.

### Import behavior

Paste CSS or choose a `.css` file, then preview it before applying. Prismforge recognizes hex, RGB/RGBA, and OKLCH values whose custom-property names match the configured prefix and a known row and shade.

- **Complete rows** applies only rows containing all 11 shades.
- **Merge tokens** updates the supplied shades and preserves the rest of each row.
- Unknown tokens are ignored and reported in the preview.
- Invalid recognized values prevent the import from being applied.
- Locked rows are always preserved.

## Live previews

Every palette change is reflected immediately in two galleries below the editor.

### Interface components

The product UI gallery includes navigation, dialogs, cards, forms, controls, calendars, sliders, charts, status panels, tag clouds, and rainbow-colored cards. Its themes map semantic roles such as primary, accent, success, warning, danger, and neutral onto the editable rows.

It includes light, colorful, neutral, and dark combinations such as Prism, Aurora, Botanical, Paper, Neon Night, Ember Dark, and Deep Sea.

### WordPress content theme

The editorial gallery demonstrates a publication homepage with navigation, feature content, article cards, long-form content, comments, sidebar widgets, and a footer. Available treatments include Editorial Light, Midnight Reader, Color Journal, Botanical Review, Newsprint, and Nocturne.

These previews contain no separate theme palettes: every displayed color is resolved from the rows being edited.

## Color model

Prismforge stores each shade as OKLCH:

- **L** controls perceptual lightness from `0` to `1`.
- **C** controls chroma from `0` to `0.4`.
- **H** controls hue from `0°` to `360°`.

OKLCH makes it practical to produce ramps with more consistent perceived brightness than direct RGB interpolation. Hex output is converted to sRGB, and generated or blended preset colors are gamut-mapped when necessary.

## Project structure

```text
src/
├── components/       React editor panels and live previews
├── data/             Built-in ramps, groups, and palette presets
├── lib/              Color math, curve logic, tokens, and ramp generation
├── store/            Mutable palette store and React context
├── App.jsx           Application layout
├── index.css         Editor and preview styles
└── main.jsx          Browser entry point
```

The palette uses a mutable store with an explicit render trigger. This is intentional: pointer-drag interactions update color arrays at high frequency. Small preview-only UI state, such as the chosen demo theme, remains local to its React component.

The original single-file implementation is retained in `index.legacy.html` as a behavioral reference.

## Development

Available scripts:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start Vite in development mode on port 4321 |
| `pnpm build` | Create a production bundle |
| `pnpm preview` | Serve the production bundle locally |

There is currently no automated test suite, linter, or type checker. Before submitting changes, run:

```bash
pnpm build
git diff --check
```

Preserve the existing mutable-store interaction model when extending editing behavior. New preview colors should resolve from palette rows rather than introducing hard-coded theme palettes.

## Data and privacy

Prismforge runs entirely in the browser and does not require a backend. Palette state is held in memory; export your CSS before refreshing or closing the page if you want to retain the current work.

## License

Prismforge is available under the [MIT License](LICENSE).

Copyright © 2026 Javier Loureiro.
