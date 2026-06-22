import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { borradorAMarkdown } from "@/lib/report";
import type { Borrador } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/export → devuelve un .doc (Word) con el informe ensamblado.
// Usa HTML compatible con Word: preserva tablas, encabezados y formato, y
// queda totalmente editable en Microsoft Word.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const borrador = body.borrador as Borrador;
    if (!borrador) throw new Error("Falta el borrador");

    const html = await marked.parse(borradorAMarkdown(borrador));
    const doc = documentoWord(html);

    const nombre = String(body?.datos?.numeroCaso || "borrador").replace(/[^\w.-]+/g, "_");
    return new NextResponse(doc, {
      headers: {
        "Content-Type": "application/msword;charset=utf-8",
        "Content-Disposition": `attachment; filename="Informe_${nombre}.doc"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

function documentoWord(inner: string): string {
  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Informe Pericial</title>
<style>
@page WordSection1 { size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.0in; }
div.WordSection1 { page: WordSection1; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.5; }
h1 { font-size: 16pt; } h2 { font-size: 14pt; } h3 { font-size: 12pt; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #000000; padding: 4px 6px; vertical-align: top; }
th { background: #e6e6e6; }
blockquote { border-left: 3px solid #888888; padding-left: 10px; color: #333333; }
</style></head><body><div class="WordSection1">${inner}</div></body></html>`;
}
