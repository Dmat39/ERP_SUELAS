import { CartProvider } from '@/lib/cart';
import { StoreHeader } from './StoreHeader';
import { StoreUIProvider } from './store-ui';
import { Icon, type IconName } from '@/components/Icon';

const BENEFICIOS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'truck', title: 'Envíos a todo el país', desc: 'Coordinamos la entrega contigo' },
  { icon: 'tag', title: 'Precios mayoristas', desc: 'Mejores precios por volumen' },
  { icon: 'chat', title: 'Atención personalizada', desc: 'Te ayudamos con tu pedido' },
];

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <StoreUIProvider>
        <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
          <StoreHeader />

          {/* Franja de beneficios */}
          <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BENEFICIOS.map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <span className="shrink-0 grid place-items-center w-10 h-10 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-hover)]">
                    <Icon name={b.icon} size={20} />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">{b.title}</div>
                    <div className="text-xs text-[var(--color-muted)]">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>

          {/* Footer */}
          <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="font-semibold mb-2">Suelas ZPT</div>
                <p className="text-sm text-[var(--color-muted)]">
                  Fabricación y venta mayorista de suelas para calzado. Calidad de planta,
                  directo a tu negocio.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-2 text-sm">Cómo comprar</div>
                <ul className="text-sm text-[var(--color-muted)] space-y-1.5">
                  <li>1. Elige tus modelos y tallas</li>
                  <li>2. Arma tu pedido en el carrito</li>
                  <li>3. Confírmalo y coordinamos pago y entrega</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-2 text-sm">Atención</div>
                <ul className="text-sm text-[var(--color-muted)] space-y-1.5">
                  <li>Lun a Sáb · 8:00 a 18:00</li>
                  <li>Pedidos al por mayor</li>
                  <li>Sin pago en línea — pago coordinado</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-muted)]">
              © {new Date().getFullYear()} Suelas ZPT · Catálogo mayorista. El pago se coordina por
              separado tras confirmar el pedido.
            </div>
          </footer>
        </div>
      </StoreUIProvider>
    </CartProvider>
  );
}
