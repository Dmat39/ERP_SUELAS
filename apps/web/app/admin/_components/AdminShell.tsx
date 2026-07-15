'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AuthUser } from '@erp/shared-types';
import { Logo } from '@/components/Logo';
import { Sidebar } from './Sidebar';
import { logoutAction } from '@/lib/auth-actions';

function UserMenu({ session }: { session: AuthUser }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <div className="text-sm font-medium">{session.name}</div>
        <div className="text-xs text-[var(--color-muted)]">{session.role}</div>
      </div>
      <div className="h-8 w-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-hover)] flex items-center justify-center text-sm font-semibold">
        {session.name.charAt(0).toUpperCase()}
      </div>
      <form action={logoutAction}>
        <button type="submit" className="btn btn-ghost btn-sm" title="Cerrar sesión">
          Salir
        </button>
      </form>
    </div>
  );
}

export function AdminShell({
  session,
  children,
}: {
  session: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/admin';

  // INICIO: sin sidebar (los módulos ya están como cuadros). Solo barra superior.
  if (isHome) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-semibold">Suelas ZPT</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-secondary btn-sm">
              Ver storefront
            </Link>
            <UserMenu session={session} />
          </div>
        </header>
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    );
  }

  // DENTRO DE UN MÓDULO: sidebar + contenido.
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 sticky top-0 z-10">
          <Link
            href="/admin"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] flex items-center gap-1.5"
          >
            <span aria-hidden="true">←</span> Inicio
          </Link>
          <UserMenu session={session} />
        </header>
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
