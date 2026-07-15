// Nombre del cliente + su contacto accionable: teléfono con enlace de llamada
// y acceso directo a WhatsApp. Se usa en Pedidos, Boletas/Facturas y Entregas
// para poder llamar y validar el pedido antes de confirmarlo.
export function CustomerContact({
  name,
  phone,
  email,
}: {
  name: string;
  phone?: string | null;
  email?: string | null;
}) {
  const digits = phone?.replace(/\D/g, '') ?? '';
  // Solo los CELULARES peruanos tienen WhatsApp: 9 dígitos y empiezan con 9.
  // Los fijos (01-..., 084-...) solo muestran el enlace de llamada.
  const esCelular = digits.length === 9 && digits.startsWith('9');
  const wa = esCelular ? `51${digits}` : null;

  return (
    <div>
      <div className="font-medium">{name}</div>
      {phone ? (
        <div className="flex items-center gap-2 mt-0.5">
          <a
            href={`tel:${phone}`}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] tnum"
            title="Llamar"
          >
            📞 {phone}
          </a>
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener"
              className="badge badge-ok"
              title="Abrir chat de WhatsApp"
            >
              WhatsApp
            </a>
          )}
        </div>
      ) : (
        <div className="text-xs text-[var(--color-faint)] mt-0.5">Sin teléfono registrado</div>
      )}
      {email && <div className="text-xs text-[var(--color-muted)] mt-0.5">{email}</div>}
    </div>
  );
}
