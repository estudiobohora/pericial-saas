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

// Lee un documento (por su buffer) y devuelve su texto. Soporta txt/md/csv,
// docx (mammoth), pdf e imágenes (visión de Claude). "" si no es soportado.
async function leerDocumento(nombre: string, ext: string, buf: Buffer): Promise<string> {
  if (ext === "txt" || ext === "md" || ext === "csv") {
    return buf.toString("utf8");
  }
  if (ext === "docx") {
    return (await mammoth.extractRawText({ buffer: buf })).value;
  }
  if (ext === "pdf") {
    return await extraerTextoDocumento({ base64: buf.toString("base64"), tipo: "pdf", nombre });
  }
  if (IMG[ext]) {
    return await extraerTextoDocumento({ base64: buf.toString("base64"), tipo: "imagen", mediaType: IMG[ext], nombre });
  }
  return "";
}

// POST /api/extract — recibe un ZIP o un archivo suelto (pdf, docx, imagen, txt),
// lee cada documento y devuelve el texto consolidado para usar en la generación.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("No se recibió ningún archivo");

    const nombreArchivo = file.name || "documento";
    const extArchivo = (nombreArchivo.split(".").pop() || "").toLowerCase();
    const partes: string[] = [];
    const documentos: { nombre: string; fecha: string }[] = [];

    if (extArchivo === "zip") {
      // ── Caso ZIP: leer cada documento dentro ──
      const zip = await JSZip.loadAsync(Buffer.from(await file.arrayBuffer()));
      const entries = Object.values(zip.files).filter((f) => !f.dir);

      for (const entry of entries) {
        const nombre = entry.name.split("/").pop() || entry.name;
        if (nombre.startsWith(".") || entry.name.includes("__MACOSX")) continue;
        const ext = (nombre.split(".").pop() || "").toLowerCase();
        const fecha = entry.date ? entry.date.toLocaleDateString("es-PR") : "";

        let contenido = "";
        try {
          const buf = await entry.async("nodebuffer");
          contenido = await leerDocumento(nombre, ext, buf);
          if (!contenido) continue; // formato no soportado
        } catch (e) {
          contenido = `[No se pudo leer este documento: ${e instanceof Error ? e.message : "error"}]`;
        }

        documentos.push({ nombre, fecha });
        partes.push(`### ${nombre}${fecha ? ` (${fecha})` : ""}\n${contenido.trim()}`);
      }

      if (!partes.length) {
        throw new Error("El ZIP no contenía documentos legibles (txt, pdf, docx o imágenes).");
      }
    } else {
      // ── Caso archivo suelto: pdf, docx, imagen o texto ──
      const buf = Buffer.from(await file.arrayBuffer());
      const fecha = file.lastModified ? new Date(file.lastModified).toLocaleDateString("es-PR") : "";
      let contenido = "";
      try {
        contenido = await leerDocumento(nombreArchivo, extArchivo, buf);
      } catch (e) {
        contenido = `[No se pudo leer este documento: ${e instanceof Error ? e.message : "error"}]`;
      }
      if (!contenido) {
        throw new Error(`Formato no soportado: .${extArchivo}. Usa PDF, Word (.docx), imagen o un ZIP.`);
      }
      documentos.push({ nombre: nombreArchivo, fecha });
      partes.push(`### ${nombreArchivo}${fecha ? ` (${fecha})` : ""}\n${contenido.trim()}`);
    }

    return NextResponse.json({ ok: true, documentosTexto: partes.join("\n\n"), documentos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
