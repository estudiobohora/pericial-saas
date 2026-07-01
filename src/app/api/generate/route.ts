import { NextRequest, NextResponse } from "next/server";
import { generarBorrador } from "@/lib/anthropic";
import { esPro, trialLimite } from "@/lib/acceso";
import { usoActual, incrementarUso } from "@/lib/uso";

export const runtime = "nodejs";
export const maxDuration = 300; // Vercel Pro: hasta 300s (la generación tarda ~90-105s) // generar el informe puede tardar

// POST /api/generate
// Body: { datos, transcripcion, documentosTexto, adjuntos? }
// Devuelve el borrador estructurado en 6 secciones.
// Los códigos PRO son ilimitados; los códigos de prueba tienen un tope de informes.
export async function POST(req: NextRequest) {
  try {
    const codigo = req.cookies.get("beta_ok")?.value || "";
    const pro = esPro(codigo);

    // Tope de la prueba (solo para códigos que no son PRO).
    if (!pro) {
      const limite = trialLimite();
      const usados = await usoActual(codigo);
      if (usados >= limite) {
        return NextResponse.json({
          ok: false,
          limitReached: true,
          error: `Prueba completada: alcanzaste el límite de ${limite} informe${limite === 1 ? "" : "s"} de evaluación.`,
        });
      }
    }

    const body = await req.json();
    const borrador = await generarBorrador({
      datos: body.datos || {},
      transcripcion: body.transcripcion || "",
      documentosTexto: body.documentosTexto || "",
      adjuntos: body.adjuntos || [],
    });

    if (!pro) await incrementarUso(codigo); // cuenta el informe solo si se generó bien
    return NextResponse.json({ ok: true, borrador });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
