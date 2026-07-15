'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { GROUPS, ICONS, MODULES } from './modules';

// El sidebar se construye desde modules.ts: una sola fuente de nombres y grupos.
const TOP_ITEMS = [
  { href: '/admin', label: 'Inicio', icon: ICONS.inicio },
  { href: '/admin/tablero', label: 'Indicadores', icon: ICONS.tablero },
];

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
      active
        ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-hover)] font-medium'
        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
    }`;

  return (
    <aside className="w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col h-screen sticky top-0">
      <Link
        href="/admin"
        className="h-14 flex items-center gap-2.5 px-5 border-b border-[var(--color-border)]"
      >
        <Logo size={32} />
        <span className="font-semibold">Suelas ZPT</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        <ul className="space-y-0.5">
          {TOP_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass(isActive(item.href))}>
                <NavIcon path={item.icon} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {GROUPS.map((group) => {
          const mods = MODULES.filter((m) => m.group === group.key && m.key !== 'tablero');
          if (mods.length === 0) return null;
          return (
            <div key={group.key}>
              <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                {group.title}
              </div>
              <ul className="space-y-0.5">
                {mods.map((m) => (
                  <li key={m.key}>
                    <Link href={m.href} className={linkClass(isActive(m.href))} title={m.desc}>
                      <NavIcon path={m.icon} />
                      {m.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--color-border)]">
        <Link href="/" className="btn btn-secondary btn-sm w-full">
          Ver storefront
        </Link>
      </div>
    </aside>
  );
}
