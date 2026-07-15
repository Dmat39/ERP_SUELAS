import 'server-only';
import { cookies } from 'next/headers';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const TOKEN_COOKIE = 'erp_token';

// Cliente HTTP de servidor. Lee el JWT desde la cookie httpOnly y lo adjunta
// como Bearer. Nunca expone el token al navegador (requisito: sin localStorage).
export async function apiFetch<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    // Revalidación de caché de Next; por defecto no cachear (datos de ERP).
    cache?: RequestCache;
    auth?: boolean;
  } = {},
): Promise<T> {
  const { method = 'GET', body, cache = 'no-store', auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = (await cookies()).get(TOKEN_COOKIE)?.value;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      // La API devuelve { message } (ValidationPipe) o { error } (filtro Prisma).
      message = Array.isArray(data.message)
        ? data.message.join('. ')
        : data.message ?? data.error ?? message;
    } catch {
      /* respuesta sin JSON */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { BASE as API_BASE };
