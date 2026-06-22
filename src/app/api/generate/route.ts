import { NextRequest, NextResponse } from "next/server";
import { generarBorrador } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60; // Hobby de Vercel: máximo 60s // generar el informe puede tardar

// POST /api/generate
// Body: { datos, transcripcion, documentosTexto, adjuntos? }
// Devuelve el borrador estructurado en 6 secciones.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const borrador = await generarBorrador({
      datos: body.datos || {},
      transcripcion: body.transcripcion || "",
      documentosTexto: body.documentosTexto || "",
      adjuntos: body.adjuntos || [],
    });
    return NextResponse.json({ ok: true, borrador });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
