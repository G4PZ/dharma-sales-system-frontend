import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'dharma_session';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Las llamadas a la API no deben ser bloqueadas por el proxy del frontend.
  // La seguridad de estos endpoints ya la controla FastAPI.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Con cookie activa intentando entrar a /login -> redirigir a /
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Sin cookie intentando acceder a ruta privada -> redirigir a /login
  if (!hasSession && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Excluye:
     * - /api/*
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - imágenes y archivos públicos
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};