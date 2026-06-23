import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import mammoth from "mammoth";
import { extraerTextoDocumento } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300; // Vercel Pro: hasta 300s

const IMG: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

// POST /api/extract — recibe un ZIP, lee cada documento (txt, csv, docx, pdf,
// imágenes) y devuelve el texto consolidado para usar en la generación.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("No se recibió el archivo ZIP");

    const zip = await JSZip.loadAsync(Buffer.from(await file.arrayBuffer()));
    const entries = Object.values(zip.files).filter((f) => !f.dir);
    const partes: string[] = [];
    const documentos: { nombre: string; fecha: string }[] = [];

    for (const entry of entries) {
      const nombre = entry.name.split("/").pop() || entry.name;
      if (nombre.startsWith(".") || entry.name.includes("__MACOSX")) continue;
      const ext = (nombre.split(".").pop() || "").toLowerCase();
      const fecha = entry.date ? entry.date.toLocaleDateString("es-PR") : "";

      let contenido = "";
      try {
        if (ext === "txt" || ext === "md" || ext === "csv") {
          contenido = await entry.async("string");
        } else if (ext === "docx") {
          const buf = await entry.async("nodebuffer");
          contenido = (await mammoth.extractRawText({ buffer: buf })).value;
        } else if (ext === "pdf") {
          const b64 = await entry.async("base64");
          contenido = await extraerTextoDocumento({ base64: b64, tipo: "pdf", nombre });
        } else if (IMG[ext]) {
          const b64 = await entry.async("base64");
          contenido = await extraerTextoDocumento({ base64: b64, tipo: "imagen", mediaType: IMG[ext], nombre });
        } else {
          continue; // formato no soportado
        }
      } catch (e) {
        contenido = `[No se pudo leer este documento: ${e instanceof Error ? e.message : "error"}]`;
      }

      documentos.push({ nombre, fecha });
      partes.push(`### ${nombre}${fecha ? ` (${fecha})` : ""}\n${contenido.trim()}`);
    }

    if (!partes.length) {
      throw new Error("El ZIP no contenía documentos legibles (txt, pdf, docx o imágenes).");
    }
    return NextResponse.json({ ok: true, documentosTexto: partes.join("\n\n"), documentos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
