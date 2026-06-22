import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, construirPromptUsuario } from "./prompt";
import type { Borrador, DatosCaso } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Falta ANTHROPIC_API_KEY en .env.local");
  return new Anthropic({ apiKey });
}

// La forma del borrador (Borrador) vive en ./types para compartir con el cliente.
export type { Borrador };

// Documento adjunto que Claude puede leer nativamente (PDF nativo o escaneado, e imágenes).
// Para PDFs escaneados/fotos, Claude usa visión — no hace falta OCR aparte.
export type DocumentoAdjunto =
  | { tipo: "pdf"; base64: string; nombre: string }
  | { tipo: "imagen"; base64: string; mediaType: string; nombre: string };

export async function generarBorrador(args: {
  datos: DatosCaso;
  transcripcion: string;
  documentosTexto: string;
  adjuntos?: DocumentoAdjunto[];
}): Promise<Borrador> {
  const { datos, transcripcion, documentosTexto, adjuntos = [] } = args;

  const content: Anthropic.ContentBlockParam[] = [];

  // Adjuntos primero (Claude los lee con visión: PDFs escaneados, fotos, etc.)
  for (const a of adjuntos) {
    if (a.tipo === "pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: a.base64 },
        title: a.nombre,
      });
    } else {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: a.mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: a.base64,
        },
      });
    }
  }

  content.push({
    type: "text",
    text: construirPromptUsuario({ datos, transcripcion, documentosTexto }),
  });

  // Structured outputs: la API obliga a que la respuesta cumpla el esquema y
  // devuelve JSON válido (con los saltos de línea del markdown escapados).
  const resp = await client().messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
    output_config: { format: { type: "json_schema", schema: BORRADOR_SCHEMA } },
  } as Anthropic.MessageCreateParamsNonStreaming);

  const texto = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const obj = JSON.parse(texto) as Borrador;
  // Metodología y Documentos los completa la profesional; valores por defecto.
  return { ...obj, metodologia: obj.metodologia ?? "", documentos_revisados: obj.documentos_revisados ?? "" };
}

// Esquema JSON que la API hace cumplir (structured outputs).
const seccion = (description: string) => ({ type: "string", description });
const BORRADOR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "aviso",
    "identificacion",
    "transcripcion",
    "analisis",
    "conclusiones",
  ],
  properties: {
    aviso: seccion("Siempre: 'BORRADOR PARA REVISIÓN PROFESIONAL'"),
    identificacion: seccion("Sección 1: Identificación del Caso (markdown)"),
    transcripcion: seccion("Sección 4: transcripción organizada por hablante (markdown)"),
    analisis: {
      type: "object",
      additionalProperties: false,
      required: ["economico", "salud", "psicosocial"],
      properties: {
        economico: seccion("Análisis Económico de la persona evaluada"),
        salud: seccion("Análisis de Salud: condiciones incapacitantes e historial médico"),
        psicosocial: seccion(
          "Análisis Psicosocial (sección principal y más extensa): dinámica familiar, red de apoyo, funcionamiento, necesidades"
        ),
      },
    },
    conclusiones: seccion("Conclusiones (6.1) basadas en el análisis, SIN recomendaciones (las marca la profesional)."),
  },
} as const;

// Extrae/transcribe el texto de un documento (PDF nativo o escaneado, o imagen)
// usando la visión de Claude. No requiere OCR aparte.
export async function extraerTextoDocumento(args: {
  base64: string;
  tipo: "pdf" | "imagen";
  mediaType?: string;
  nombre: string;
}): Promise<string> {
  const { base64, tipo, mediaType, nombre } = args;
  const content: Anthropic.ContentBlockParam[] = [];
  if (tipo === "pdf") {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
      title: nombre,
    });
  } else {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: (mediaType || "image/png") as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
        data: base64,
      },
    });
  }
  content.push({
    type: "text",
    text: `Transcribe fielmente TODO el texto y los datos relevantes de este documento ("${nombre}"). Si es un documento escaneado o una foto, léelo con cuidado. Devuelve únicamente el contenido extraído, sin comentarios ni explicaciones tuyas.`,
  });

  const resp = await client().messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: "Eres un asistente que transcribe y extrae texto de documentos con precisión.",
    messages: [{ role: "user", content }],
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
