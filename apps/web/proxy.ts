import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'erp_token';

// Protege /admin: sin cookie de sesión, redirige al login.
// (La verificación real del JWT la hace la API en cada request.)
// En Next 16 esta convención se llama "proxy" (antes "middleware").
export function proxy(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si ya hay sesión y va al login, mándalo al panel.
  if (pathname === '/login' && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
