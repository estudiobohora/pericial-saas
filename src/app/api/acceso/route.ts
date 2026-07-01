import { NextRequest, NextResponse } from "next/server";
import { esValido } from "@/lib/acceso";

export const runtime = "nodejs";

// Verifica el código de acceso de la beta y, si es válido, deja una cookie httpOnly.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ password: "" }));
  const codigo = typeof body?.password === "string" ? body.password.trim() : "";

  if (!esValido(codigo)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("beta_ok", codigo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
