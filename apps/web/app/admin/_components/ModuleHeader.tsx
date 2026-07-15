import { MODULES, type ModuleKey } from './modules';

// Cabecera estándar de cada módulo: ícono con su color, qué es el módulo
// y los pasos de cómo se usa. Hace que cualquier persona entienda la
// pantalla sin capacitación previa.
export function ModuleHeader({
  moduleKey,
  subtitle,
  children,
}: {
  moduleKey: ModuleKey;
  subtitle?: string; // reemplaza la descripción por una dinámica (ej. conteos)
  children?: React.ReactNode; // botones de acción (Nuevo…, etc.)
}) {
  const m = MODULES.find((x) => x.key === moduleKey);
  if (!m) return null;

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${m.color}1a`, color: m.color }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={m.icon} />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">{m.label}</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              {subtitle ?? m.desc}
            </p>
          </div>
        </div>
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>

      {m.steps && (
        <ol className="flex flex-wrap gap-2 mt-4">
          {m.steps.map((paso, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full pl-1.5 pr-3 py-1"
            >
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {i + 1}
              </span>
              {paso}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
