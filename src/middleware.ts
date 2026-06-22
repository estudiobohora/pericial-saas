import { NextRequest, NextResponse } from "next/server";

// Protege toda la app con una contraseña simple para la beta privada.
// Se activa SOLO si existe la variable BETA_PASSWORD (en local queda abierto).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas siempre permitidas (página de acceso, su API, assets).
  if (
    pathname.startsWith("/acceso") ||
    pathname.startsWith("/api/acceso") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const expected = process.env.BETA_PASSWORD;
  if (!expected) return NextResponse.next(); // sin contraseña configurada → no bloquea

  const cookie = req.cookies.get("beta_ok")?.value;
  if (cookie === expected) return NextResponse.next();

  // No autorizado: API → 401; páginas → redirige a /acceso.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/acceso";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
