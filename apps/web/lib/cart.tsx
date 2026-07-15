'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { CartLine } from '@erp/shared-types';

// Carrito del storefront: estado EN MEMORIA (React state), sin localStorage
// ni sessionStorage (requisito del proyecto). Se pierde al recargar, lo cual
// es aceptable para este MVP sin pago.
type CartCtx = {
  items: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQty: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart fuera de CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const add: CartCtx['add'] = (line, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === line.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === line.variantId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...line, quantity }];
    });
  };

  const setQty: CartCtx['setQty'] = (variantId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
    );
  };

  const remove: CartCtx['remove'] = (variantId) =>
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const clear = () => setItems([]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    return { items, count, total, add, setQty, remove, clear };
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
