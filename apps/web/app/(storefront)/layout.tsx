import { CartProvider } from '@/lib/cart';
import { StoreHeader } from './StoreHeader';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-muted)]">
          Suelas ZPT · Catálogo mayorista. El pago se coordina por separado tras confirmar el pedido.
        </footer>
      </div>
    </CartProvider>
  );
}
