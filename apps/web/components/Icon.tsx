// Íconos SVG de trazo (stroke, viewBox 0 0 24 24), sin librerías externas.
// Mismo estilo que los íconos del panel. Reemplazan a los emojis de la tienda.

const PATHS = {
  // Lupa de búsqueda
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  // Carrito de compras
  cart: 'M8 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM2 2h2l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.6l1.7-7.4H5',
  // Camión de envíos
  truck:
    'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  // Etiqueta de precio (mayorista)
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  // Globo de chat (atención)
  chat: 'M7.9 20A9 9 0 1 0 4 16.1L2 22z',
  // Fábrica (barra promocional)
  factory:
    'M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM7 18h.01M12 18h.01M17 18h.01',
  // Suela con huella — ícono insignia del producto
  sole: 'M12 2.5c2.6 0 4.8 2 5.1 4.9.2 1.9-.5 3.2-1 4.9-.5 1.5-.5 3-.2 4.6.4 2.4-1.1 4.6-3.9 4.6s-4.3-2.2-3.9-4.6c.3-1.6.3-3.1-.2-4.6-.5-1.7-1.2-3-1-4.9C7.2 4.5 9.4 2.5 12 2.5zM9.3 8.2h5.4M9.3 11.2h5.4M9.8 17.5h4.4',
  // Check
  check: 'M20 6 9 17l-5-5',
  // Tacho de basura (quitar del carrito)
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6',
  // Equis (cerrar)
  x: 'M18 6 6 18M6 6l12 12',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
