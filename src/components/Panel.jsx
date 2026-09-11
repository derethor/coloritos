import { usePaletteStore } from '../store/PaletteContext.jsx';
import { COLOR_GROUPS } from '../data/colorDefs.js';
import ColorPanel from './ColorPanel.jsx';
import GlobalPanel from './GlobalPanel.jsx';

export default function Panel() {
  const { store, render } = usePaletteStore();
  const { editorMode, selected } = store;
  const activeGroup = COLOR_GROUPS.find((group) => group.id === editorMode);

  const panelClass = [
    'panel',
    activeGroup ? 'global-panel' : '',
    editorMode === 'row' && selected.length > 0 ? 'color-panel' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass} id="panel">
      <div className="editor-switch">
        {COLOR_GROUPS.map((group) => (
          <button
            className={`btn ${editorMode === group.id ? 'active' : ''}`}
            key={group.id}
            onClick={() => {
              store.editorMode = group.id;
              render();
            }}
          >
            {group.name}
          </button>
        ))}
        <button
          className={`btn ${editorMode === 'row' ? 'active' : ''}`}
          onClick={() => {
            store.editorMode = 'row';
            render();
          }}
        >
          Row
        </button>
      </div>

      {activeGroup ? <GlobalPanel group={activeGroup} /> : <ColorPanel />}
    </div>
  );
}
