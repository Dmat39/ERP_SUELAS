'use client';

import { createContext, useContext, useState } from 'react';

// Estado de interfaz de la tienda compartido entre el header (buscador) y el
// catálogo (grilla de productos). Mantiene el término de búsqueda en un solo lugar.
type StoreUICtx = {
  query: string;
  setQuery: (value: string) => void;
};

const StoreUIContext = createContext<StoreUICtx | null>(null);

export function StoreUIProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  return (
    <StoreUIContext.Provider value={{ query, setQuery }}>{children}</StoreUIContext.Provider>
  );
}

export function useStoreUI() {
  const ctx = useContext(StoreUIContext);
  if (!ctx) throw new Error('useStoreUI debe usarse dentro de <StoreUIProvider>');
  return ctx;
}
