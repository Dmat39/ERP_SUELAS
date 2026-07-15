import { cookies } from 'next/headers';
import { API_BASE, TOKEN_COOKIE } from '@/lib/api';

// Proxy de descarga del PDF: el token JWT vive en una cookie httpOnly,
// así que el navegador no puede llamar a la API directamente con Bearer.
// Esta ruta lee la cookie en el servidor y transmite el PDF al navegador.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return new Response('No autorizado', { status: 401 });
  }

  const res = await fetch(`${API_BASE}/invoices/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok || !res.body) {
    return new Response('No se pudo generar el PDF del comprobante', {
      status: res.status || 502,
    });
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        res.headers.get('content-disposition') ?? 'inline; filename="comprobante.pdf"',
    },
  });
}
