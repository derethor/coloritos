import { usePaletteStore } from '../store/PaletteContext.jsx';
import ColorPanel from './ColorPanel.jsx';
import GlobalPanel from './GlobalPanel.jsx';

export default function Panel() {
  const { store, render } = usePaletteStore();
  const { editorMode, selected } = store;

  const panelClass = [
    'panel',
    editorMode === 'global' ? 'global-panel' : '',
    editorMode === 'color' && selected.length > 0 ? 'color-panel' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass} id="panel">
      <div className="editor-switch">
        <button
          className={`btn ${editorMode === 'color' ? 'active' : ''}`}
          onClick={() => {
            store.editorMode = 'color';
            render();
          }}
        >
          Color
        </button>
        <button
          className={`btn ${editorMode === 'global' ? 'active' : ''}`}
          onClick={() => {
            store.editorMode = 'global';
            render();
          }}
        >
          Global
        </button>
      </div>

      {editorMode === 'global' ? <GlobalPanel /> : <ColorPanel />}
    </div>
  );
}
