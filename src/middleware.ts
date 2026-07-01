import { NextRequest, NextResponse } from "next/server";
import { esValido, gateActivo } from "@/lib/acceso";

// Protege toda la app con códigos de acceso (beta privada).
// Se activa si hay códigos configurados (CODIGOS_TRIAL/CODIGOS_PRO/BETA_PASSWORD).
// En local, sin códigos, queda abierto.
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

  if (!gateActivo()) return NextResponse.next(); // sin códigos configurados → no bloquea

  const cookie = req.cookies.get("beta_ok")?.value || "";
  if (esValido(cookie)) return NextResponse.next();

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
