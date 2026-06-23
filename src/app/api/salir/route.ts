import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Cierra la sesión borrando la cookie del gate.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("beta_ok", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
