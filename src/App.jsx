import { useEffect } from 'react';
import { usePaletteStore } from './store/PaletteContext.jsx';
import Palette from './components/Palette.jsx';
import Panel from './components/Panel.jsx';
import PaletteDemo from './components/PaletteDemo.jsx';
import WordPressDemo from './components/WordPressDemo.jsx';

export default function App() {
  const { store, render } = usePaletteStore();

  useEffect(() => {
    function clearSelectionOutsideRows(event) {
      if (!store.selected.length || event.target.closest('.band, .panel, .demo-section, .wp-demo-section')) return;
      store.selected = [];
      render();
    }

    document.addEventListener('pointerdown', clearSelectionOutsideRows);
    return () => document.removeEventListener('pointerdown', clearSelectionOutsideRows);
  }, [store, render]);

  return (
    <>
      <div className="layout">
        <div className="workspace-main">
          <Palette />
          <PaletteDemo />
          <WordPressDemo />
        </div>
        <Panel />
      </div>
    </>
  );
}
