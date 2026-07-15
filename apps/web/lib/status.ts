// Mapea cada estado de dominio a una clase de badge y una etiqueta legible.
// Centralizado para que los colores de estado sean consistentes en toda la app.

type Badge = { className: string; label: string };

const map: Record<string, Badge> = {
  // Pedidos
  PENDIENTE: { className: 'badge badge-warn', label: 'Pendiente' },
  CONFIRMADO: { className: 'badge badge-info', label: 'Confirmado' },
  DESPACHADO: { className: 'badge badge-info', label: 'Despachado' },
  ENTREGADO: { className: 'badge badge-ok', label: 'Entregado' },
  CANCELADO: { className: 'badge badge-danger', label: 'Cancelado' },
  // Producción
  PLANIFICADA: { className: 'badge badge-neutral', label: 'Planificada' },
  EN_PROCESO: { className: 'badge badge-warn', label: 'En proceso' },
  COMPLETADA: { className: 'badge badge-ok', label: 'Completada' },
  // Compras
  BORRADOR: { className: 'badge badge-neutral', label: 'Borrador' },
  ENVIADA: { className: 'badge badge-info', label: 'Enviada' },
  RECIBIDA: { className: 'badge badge-ok', label: 'Recibida' },
  // Envíos
  EN_RUTA: { className: 'badge badge-info', label: 'En ruta' },
  // SUNAT
  NO_ENVIADO: { className: 'badge badge-neutral', label: 'No enviado' },
  ACEPTADO: { className: 'badge badge-ok', label: 'Aceptado' },
  RECHAZADO: { className: 'badge badge-danger', label: 'Rechazado' },
  OBSERVADO: { className: 'badge badge-warn', label: 'Observado' },
};

export function statusBadge(status: string): Badge {
  return map[status] ?? { className: 'badge badge-neutral', label: status };
}
