'use client';

import { useActionState } from 'react';
import { Logo } from '@/components/Logo';
import { loginAction, type LoginState } from '@/lib/auth-actions';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={44} />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Suelas ZPT</h1>
            <p className="text-sm text-[var(--color-muted)]">Panel de fábrica</p>
          </div>
        </div>

        <form action={formAction} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              defaultValue="admin@erp.com"
              className="input"
              placeholder="tu@empresa.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              defaultValue="admin123"
              className="input"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-soft)] rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 text-xs text-[var(--color-muted)] card p-3">
          <p className="font-medium text-[var(--color-ink)] mb-1">Usuarios de prueba</p>
          <p>admin@erp.com · almacen@erp.com · ventas@erp.com</p>
          <p>Contraseña: admin123</p>
        </div>
      </div>
    </main>
  );
}
