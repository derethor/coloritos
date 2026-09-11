import { createContext, useContext, useReducer, useRef } from 'react';
import { createStore } from './createStore.js';

const PaletteContext = createContext(null);

export function PaletteProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createStore();
  const [, forceRender] = useReducer((n) => n + 1, 0);

  const value = { store: storeRef.current, render: forceRender };
  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePaletteStore() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('usePaletteStore must be used within a PaletteProvider');
  return ctx;
}
