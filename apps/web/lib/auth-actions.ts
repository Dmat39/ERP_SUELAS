'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginResponse } from '@erp/shared-types';
import { API_BASE, TOKEN_COOKIE } from './api';

export type LoginState = { error?: string };

// Server action del login: valida contra la API, guarda el JWT en una cookie
// httpOnly (no accesible desde JS del navegador) y redirige al panel.
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    return { error: 'Correo o contraseña incorrectos' };
  }

  const data = (await res.json()) as LoginResponse;
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h, alineado con JWT_EXPIRES_IN
  });

  redirect('/admin');
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  redirect('/login');
}
