import { usePaletteStore } from '../store/PaletteContext.jsx';
import { PALETTE_PRESETS } from '../data/presets.js';
import { applyCssTokenImport, exportCssTokens, loadPalettePreset, parseCssTokens } from '../lib/cssTokens.js';

export default function CssTokenTools() {
  const { store, render } = usePaletteStore();
  const exportText = exportCssTokens(store, {
    format: store.cssExportFormat,
    colorFormat: store.cssExportColorFormat,
    scope: store.cssExportScope,
    source: store.cssExportSource,
    prefix: store.cssTokenPrefix || '--color-',
  });
  const preview = store.cssImportPreview;
  const eligibleRows = preview
    ? preview.summaries.filter((row) => !row.locked && (store.cssImportMode === 'merge' || row.missing.length === 0)).length
    : 0;
  const canApply = preview && preview.tokenCount > 0 && preview.invalid.length === 0 && eligibleRows > 0;

  function update(key, value) {
    store[key] = value;
    store.cssTokenStatus = '';
    render();
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportText);
      store.cssTokenStatus = `Copied ${exportText.split('\n').length - 3} CSS tokens.`;
    } catch {
      store.cssTokenStatus = 'Clipboard access failed; select and copy the CSS manually.';
    }
    render();
  }

  function downloadExport() {
    const url = URL.createObjectURL(new Blob([exportText], { type: 'text/css' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'palette-tokens.css';
    link.click();
    URL.revokeObjectURL(url);
    store.cssTokenStatus = 'Downloaded palette-tokens.css.';
    render();
  }

  function previewImport() {
    store.cssImportPreview = parseCssTokens(store.cssImportText, store.bands, store.cssTokenPrefix || '--color-');
    store.cssTokenStatus = '';
    render();
  }

  function applyImport() {
    if (!canApply) return;
    const result = applyCssTokenImport(store, preview, store.cssImportMode);
    store.cssTokenStatus = `Imported ${result.updated} row${result.updated === 1 ? '' : 's'}${result.skippedLocked ? `; skipped ${result.skippedLocked} locked` : ''}.`;
    store.cssImportPreview = null;
    render();
  }

  function loadFile(event) {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      store.cssImportText = String(reader.result);
      store.cssImportPreview = parseCssTokens(store.cssImportText, store.bands, store.cssTokenPrefix || '--color-');
      store.cssTokenStatus = `Loaded ${file.name}.`;
      render();
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function loadPreset() {
    const result = loadPalettePreset(store, store.cssPreset);
    store.cssImportPreview = null;
    store.cssPresetStatus = `Loaded ${result.label} into ${result.updated} row${result.updated === 1 ? '' : 's'}${result.skippedLocked ? `; preserved ${result.skippedLocked} locked` : ''}. Global adjustments were cleared.`;
    render();
  }

  return (
    <>
      <h2>CSS tokens</h2>
      <div className="sub">Import and export the complete palette for Tailwind or standard CSS.</div>
      <div className="css-preset-loader">
        <div><b>Palette preset</b><span>Replace standard color rows with a known palette.</span></div>
        <select value={store.cssPreset} onChange={(e) => update('cssPreset', e.target.value)} aria-label="Palette preset">
          {Object.entries(PALETTE_PRESETS).map(([id, preset]) => <option value={id} key={id}>{preset.label}</option>)}
        </select>
        <button className="btn" onClick={loadPreset}>Load preset</button>
        {store.cssPresetStatus && <span className="css-preset-status">{store.cssPresetStatus}</span>}
      </div>
      <div className="css-token-tools">
      <div className="section-title">Export CSS</div>
      <div className="css-token-options">
        <label>Wrapper<select value={store.cssExportFormat} onChange={(e) => update('cssExportFormat', e.target.value)}><option value="theme">Tailwind @theme</option><option value="root">:root</option></select></label>
        <label>Colors<select value={store.cssExportColorFormat} onChange={(e) => update('cssExportColorFormat', e.target.value)}><option value="oklch">OKLCH</option><option value="hex">Hex</option></select></label>
        <label>Scope<select value={store.cssExportScope} onChange={(e) => update('cssExportScope', e.target.value)}><option value="all">Full palette</option><option value="rainbow">Rainbow only</option><option value="neutrals">Neutrals only</option><option value="locked" disabled={!store.bands.some((band) => band.locked)}>Locked colors ({store.bands.filter((band) => band.locked).length})</option><option value="selected" disabled={!store.selected.length}>Selected rows ({store.selected.length})</option></select></label>
        <label>Values<select value={store.cssExportSource} onChange={(e) => update('cssExportSource', e.target.value)}><option value="rendered">Visible colors</option><option value="base">Row values only</option></select></label>
        <label>Prefix<input value={store.cssTokenPrefix} onChange={(e) => update('cssTokenPrefix', e.target.value)} /></label>
      </div>
      <div className="css-export-help">
        {store.cssExportSource === 'rendered'
          ? 'Visible colors includes any global curve adjustments currently previewed in the palette.'
          : 'Row values only exports the stored row curves and ignores unapplied global adjustments.'}
      </div>
      <textarea className="css-export-output" readOnly value={exportText} aria-label="Exported CSS tokens" />
      <div className="css-token-actions"><button className="btn" onClick={copyExport}>Copy CSS</button><button className="btn" onClick={downloadExport}>Download .css</button></div>

      <div className="css-token-divider" />
      <div className="css-import-heading"><b>Import CSS</b><label className="btn css-file-button">Choose file<input type="file" accept=".css,text/css,text/plain" onChange={loadFile} /></label></div>
      <textarea
        className="css-import-input"
        value={store.cssImportText}
        placeholder={'@theme {\n  --color-blue-500: oklch(62.3% 0.214 259.815);\n}'}
        onChange={(e) => {
          store.cssImportText = e.target.value;
          store.cssImportPreview = null;
          store.cssTokenStatus = '';
          render();
        }}
      />
      <div className="css-import-controls">
        <label>Mode<select value={store.cssImportMode} onChange={(e) => update('cssImportMode', e.target.value)}><option value="complete">Complete rows</option><option value="merge">Merge tokens</option></select></label>
        <button className="btn" onClick={previewImport}>Preview import</button>
        <button className="btn css-apply-import" disabled={!canApply} onClick={applyImport}>Apply {eligibleRows || ''} {eligibleRows === 1 ? 'row' : 'rows'}</button>
      </div>
      {preview && (
        <div className={`css-import-preview ${preview.invalid.length ? 'has-errors' : ''}`}>
          <b>{preview.tokenCount} valid tokens across {preview.summaries.length} rows</b>
          <span>{preview.summaries.map((row) => `${row.name}: ${row.count}/11${row.locked ? ' (locked)' : ''}`).join(' · ') || 'No recognized tokens'}</span>
          {!!preview.invalid.length && <span>{preview.invalid.length} invalid: {preview.invalid.join(', ')}</span>}
          {!!preview.unknown.length && <span>{preview.unknown.length} unknown tokens will be ignored.</span>}
          {store.cssImportMode === 'complete' && preview.summaries.some((row) => row.missing.length) && <span>Incomplete rows will not be applied in Complete rows mode.</span>}
        </div>
      )}
      {store.cssTokenStatus && <div className="css-token-status">{store.cssTokenStatus}</div>}
      </div>
    </>
  );
}
