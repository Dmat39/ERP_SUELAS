// Definición central de los módulos del panel: ícono, ruta, color de acento,
// nombre en lenguaje de planta, grupo (flujo de trabajo real) y pasos de uso.
// Se usa en el sidebar, el inicio y las cabeceras de cada módulo.
//
// IMPORTANTE: aquí solo cambia la PRESENTACIÓN. Las URLs y los módulos del
// backend conservan sus nombres técnicos (ventas -> SalesModule, etc.).

export type ModuleKey =
  | 'tablero'
  | 'ventas'
  | 'facturacion'
  | 'logistica'
  | 'produccion'
  | 'inventario'
  | 'compras'
  | 'materia-prima'
  | 'contactos'
  | 'usuarios';

export type ModuleGroup = 'vender' | 'fabricar' | 'almacen' | 'gestion';

export interface ModuleDef {
  key: ModuleKey;
  href: string;
  label: string; // como lo dice el personal de la fábrica
  desc: string; // qué es, en una línea entendible
  group: ModuleGroup;
  color: string; // color de acento (banda + ícono)
  icon: string; // path SVG (viewBox 0 0 24 24, stroke)
  steps?: string[]; // cómo se usa, en 2-3 pasos
}

// Íconos como paths SVG (stroke) — sin librerías externas.
export const ICONS: Record<string, string> = {
  inicio: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  tablero: 'M3 3v18h18M7 15l3-4 3 3 4-6',
  ventas: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  facturacion:
    'M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM9 9h6M9 13h6M9 17h4',
  logistica:
    'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  produccion:
    'M12 2v4M4.9 4.9l2.8 2.8M2 12h4M4.9 19.1l2.8-2.8M12 22v-4M19.1 19.1l-2.8-2.8M22 12h-4M19.1 4.9l-2.8 2.8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  // Silueta de suela con líneas de huella — el ícono insignia del producto.
  suela:
    'M12 2.5c2.6 0 4.8 2 5.1 4.9.2 1.9-.5 3.2-1 4.9-.5 1.5-.5 3-.2 4.6.4 2.4-1.1 4.6-3.9 4.6s-4.3-2.2-3.9-4.6c.3-1.6.3-3.1-.2-4.6-.5-1.7-1.2-3-1-4.9C7.2 4.5 9.4 2.5 12 2.5zM9.3 8.2h5.4M9.3 11.2h5.4M9.8 17.5h4.4',
  compras:
    'M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6',
  materia: 'M20 7 12 3 4 7v10l8 4 8-4zM4 7l8 4 8-4M12 21V11',
  contactos:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  usuarios:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 11h-6M19 8v6',
};

// Grupos = flujos de trabajo reales, con el nombre que usaría el personal.
export const GROUPS: { key: ModuleGroup; title: string; desc: string }[] = [
  { key: 'vender', title: 'Vender y entregar', desc: 'Del pedido del cliente a la entrega' },
  { key: 'fabricar', title: 'Fabricar', desc: 'De la receta a la suela terminada' },
  { key: 'almacen', title: 'Compras y almacén', desc: 'Qué tengo guardado y qué necesito pedir' },
  { key: 'gestion', title: 'Gestión', desc: 'Datos maestros y accesos' },
];

export const MODULES: ModuleDef[] = [
  {
    key: 'tablero',
    href: '/admin/tablero',
    label: 'Indicadores',
    desc: 'Números y gráficos de toda la fábrica',
    group: 'gestion',
    color: '#4338CA',
    icon: ICONS.tablero,
  },
  {
    key: 'ventas',
    href: '/admin/ventas',
    label: 'Pedidos de clientes',
    desc: 'Pedidos que entran: de la tienda web o registrados aquí',
    group: 'vender',
    color: '#2563EB',
    icon: ICONS.ventas,
    steps: [
      'Entra el pedido (tienda web) o créalo tú',
      'Llama al cliente para validar que lo quiere',
      'Confírmalo: se descuenta el stock y sigue a boleta y entrega',
    ],
  },
  {
    key: 'facturacion',
    href: '/admin/facturacion',
    label: 'Boletas y facturas',
    desc: 'Comprobantes de los pedidos confirmados',
    group: 'vender',
    color: '#7C3AED',
    icon: ICONS.facturacion,
    steps: [
      'Elige un pedido confirmado',
      'Emite boleta o factura',
      'La numeración es automática (B001 / F001)',
    ],
  },
  {
    key: 'logistica',
    href: '/admin/logistica',
    label: 'Entregas',
    desc: 'Despacho y entrega de los pedidos al cliente',
    group: 'vender',
    color: '#0891B2',
    icon: ICONS.logistica,
    steps: [
      'Crea la entrega con la dirección',
      'Márcala "en ruta" cuando salga',
      'Márcala "entregada" al llegar',
    ],
  },
  {
    key: 'produccion',
    href: '/admin/produccion',
    label: 'Producción',
    desc: 'Fabricar suelas usando recetas (LDM)',
    group: 'fabricar',
    color: '#D97706',
    icon: ICONS.produccion,
    steps: [
      'Crea la receta: qué insumos lleva 1 unidad',
      'Crea la orden: cuántas producir',
      'Complétala: consume insumos y suma suelas',
    ],
  },
  {
    key: 'inventario',
    href: '/admin/inventario',
    label: 'Catálogo de productos',
    desc: 'Modelos, tallas y stock listo para vender',
    group: 'fabricar',
    color: '#0D9488',
    icon: ICONS.suela,
    steps: [
      'Crea el modelo y sus tallas',
      'El stock sube al completar producción',
      'Baja cuando confirmas un pedido',
    ],
  },
  {
    key: 'compras',
    href: '/admin/compras',
    label: 'Compras a proveedores',
    desc: 'Qué necesito pedir para no quedarme sin insumos',
    group: 'almacen',
    color: '#059669',
    icon: ICONS.compras,
    steps: [
      'Crea la orden al proveedor',
      'Recíbela cuando llegue la mercadería',
      'El stock de insumos sube solo',
    ],
  },
  {
    key: 'materia-prima',
    href: '/admin/materia-prima',
    label: 'Almacén',
    desc: 'Lo que tengo guardado para producir: caucho, PU, pegamento…',
    group: 'almacen',
    color: '#EA580C',
    icon: ICONS.materia,
    steps: [
      'Registra cada material y su unidad (kg, lt)',
      'Define el stock mínimo',
      'El sistema avisa cuando falta',
    ],
  },
  {
    key: 'contactos',
    href: '/admin/contactos',
    label: 'Clientes y proveedores',
    desc: 'Todos los contactos de la empresa en un solo lugar',
    group: 'gestion',
    color: '#475569',
    icon: ICONS.contactos,
    steps: ['Registra clientes y proveedores', 'Un contacto puede ser ambos a la vez'],
  },
  {
    key: 'usuarios',
    href: '/admin/usuarios',
    label: 'Equipo y accesos',
    desc: 'Quién entra al sistema y con qué rol',
    group: 'gestion',
    color: '#DB2777',
    icon: ICONS.usuarios,
    steps: ['Cada persona tiene su cuenta', 'Roles: ADMIN, ALMACENERO o VENDEDOR'],
  },
];

// Orden del flujo de la fábrica (para la franja "línea de la fábrica").
export const FLOW: ModuleKey[] = [
  'compras',
  'materia-prima',
  'produccion',
  'inventario',
  'ventas',
  'facturacion',
  'logistica',
];
