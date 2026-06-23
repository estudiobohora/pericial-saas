import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300; // Vercel Pro: hasta 300s

// POST /api/transcribe — recibe un MP3 y devuelve la transcripción (Whisper).
// Requiere OPENAI_API_KEY. Whisper limita a 25 MB por archivo.
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Falta OPENAI_API_KEY en .env.local. La transcripción se activa al conectar OpenAI (Whisper)."
      );
    }
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("No se recibió el archivo de audio");
    if (file.size > 25 * 1024 * 1024) {
      throw new Error(
        "El audio supera los 25 MB (límite de Whisper). Próximamente lo partiremos automáticamente; por ahora usa un archivo más corto o comprimido."
      );
    }

    const openai = new OpenAI({ apiKey });
    const tr = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "es",
    });
    return NextResponse.json({ ok: true, transcripcion: tr.text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
