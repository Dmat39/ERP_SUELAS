'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icon';
import { useCart } from '@/lib/cart';
import { useStoreUI } from './store-ui';

export function StoreHeader() {
  const { count } = useCart();
  const { query, setQuery } = useStoreUI();

  return (
    <header className="sticky top-0 z-20">
      {/* Barra promocional superior */}
      <div
        className="text-white text-xs"
        style={{ background: 'linear-gradient(90deg, #0f766e 0%, #0d9488 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-8 flex items-center justify-center gap-2 text-center">
          <Icon name="factory" size={14} />
          <span>Fabricación propia de suelas · Pedidos al por mayor a todo el país</span>
        </div>
      </div>

      {/* Header principal */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={36} />
            <div className="leading-tight hidden sm:block">
              <div className="font-semibold">Suelas ZPT</div>
              <div className="text-xs text-[var(--color-muted)]">Catálogo mayorista</div>
            </div>
          </Link>

          {/* Buscador */}
          <div className="relative flex-1 max-w-xl mx-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)] pointer-events-none">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar modelo o categoría…"
              aria-label="Buscar productos"
              className="input pl-9"
            />
          </div>

          <Link href="/carrito" className="btn btn-primary relative shrink-0">
            <Icon name="cart" size={18} />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-[var(--color-primary-hover)] text-xs font-semibold tnum">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
