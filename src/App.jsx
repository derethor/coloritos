import { useEffect } from 'react';
import { usePaletteStore } from './store/PaletteContext.jsx';
import Palette from './components/Palette.jsx';
import Panel from './components/Panel.jsx';

export default function App() {
  const { store } = usePaletteStore();

  useEffect(() => {
    document.body.classList.toggle('hide-color-info', !store.showColorInfo);
    document.body.classList.toggle('compact-palette', store.compactPalette);
  });

  return (
    <div className="layout">
      <Palette />
      <Panel />
    </div>
  );
}
