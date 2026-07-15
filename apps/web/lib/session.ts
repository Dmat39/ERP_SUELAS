import 'server-only';
import { cookies } from 'next/headers';
import type { AuthUser } from '@erp/shared-types';
import { TOKEN_COOKIE } from './api';

// Decodifica el payload del JWT (sin verificar firma — solo para mostrar el
// usuario en la UI). La verificación real la hace la API en cada request.
export async function getSession(): Promise<AuthUser | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8'),
    );
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
