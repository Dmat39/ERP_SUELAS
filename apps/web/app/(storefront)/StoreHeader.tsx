'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useCart } from '@/lib/cart';

export function StoreHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="font-semibold">Suelas ZPT</div>
            <div className="text-xs text-[var(--color-muted)]">Catálogo mayorista</div>
          </div>
        </Link>

        <Link href="/carrito" className="btn btn-secondary relative">
          Carrito
          {count > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold tnum">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
