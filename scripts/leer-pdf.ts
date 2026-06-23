// Lee un PDF y le pide a Claude que extraiga secciones específicas.
// Uso: npx tsx scripts/leer-pdf.ts "<ruta-al-pdf>"
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const pdfPath = process.argv[2];
const base64 = readFileSync(pdfPath).toString("base64");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function main() {
  const resp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
            title: "Código de Ética CPTSPR",
          },
          {
            type: "text",
            text: `Este es el Código de Ética del Colegio de Profesionales del Trabajo Social de Puerto Rico. Extrae y resume, CITANDO los artículos/incisos específicos cuando aparezcan, lo que diga sobre:
(1) Confidencialidad y secreto profesional.
(2) Consentimiento informado.
(3) Uso de tecnología, medios electrónicos o expedientes electrónicos.
(4) Grabación de entrevistas o sesiones (audio/video).
(5) Divulgación o manejo de información a terceros (incluyendo proveedores de servicios externos).
Si algo NO aparece explícito en el documento, dilo claramente. Responde en español, conciso y organizado por los 5 puntos.`,
          },
        ],
      },
    ],
  });
  console.log(
    resp.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n")
  );
}
main().catch((e) => {
  console.error("ERROR:", e instanceof Error ? e.message : e);
  process.exit(1);
});
