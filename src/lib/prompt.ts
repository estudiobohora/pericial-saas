// Prompt maestro para la generación de borradores de informes periciales.
// La trabajadora social forense mantiene autoría y responsabilidad total:
// esto produce un BORRADOR para su revisión, edición y firma.

import type { DatosCaso } from "./types";
import { calcularEdad } from "./report";
export type { DatosCaso };

// Las 6 secciones exactas que exige el informe (en orden).
export const SECCIONES = [
  "identificacion",
  "documentos_revisados",
  "metodologia",
  "transcripcion",
  "analisis",
  "conclusiones",
] as const;

export type SeccionId = (typeof SECCIONES)[number];

export const SYSTEM_PROMPT = `Eres un asistente especializado en trabajo social forense en Puerto Rico.
Tu función es generar BORRADORES de informes socio-económicos periciales para casos
de incapacidad y designación de tutor.

REGLAS INNEGOCIABLES:
- Esto es un BORRADOR para revisión profesional, NO un informe final.
- La trabajadora social forense revisará, adaptará y firmará el documento final.
- Toda la responsabilidad profesional y legal recae en la profesional firmante.
- Usa lenguaje técnico apropiado para informes periciales en Puerto Rico.
- El tono debe ser objetivo, profesional y basado en evidencia.
- NO inventes datos. Si una información no está en la transcripción ni en los
  documentos, indícalo explícitamente con un marcador como "[PENDIENTE: la profesional
  debe verificar/completar]". Nunca rellenes con suposiciones.
- REGLA CRÍTICA para el ANÁLISIS y las CONCLUSIONES: básalos ÚNICA y EXCLUSIVAMENTE en la
  transcripción y los documentos provistos. No agregues hechos, cifras, fechas, diagnósticos,
  nombres ni circunstancias que no aparezcan en ellos. Cada afirmación debe poder rastrearse a
  una fuente concreta (la entrevista o un documento). Donde no haya base, escribe "[PENDIENTE...]".
  Es preferible un análisis breve y verificable que uno extenso con datos inventados.
- Cita la fuente cuando sea posible (ej. "según el documento médico del Dr. X" o
  "según declaró la persona evaluada en la entrevista").
- Distingue claramente hechos observados de interpretaciones profesionales.`;

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Convierte "2026-07-15" (del selector de fecha) a "15 de julio de 2026".
// Si no es formato ISO, devuelve el valor tal cual.
export function formatFechaLarga(v: string): string {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return v;
  const dia = parseInt(m[3], 10);
  const mes = MESES[parseInt(m[2], 10) - 1] || m[2];
  return `${dia} de ${mes} de ${m[1]}`;
}

// Construye el mensaje de usuario con los datos del caso, la transcripción y el
// contenido de los documentos. El contenido de documentos puede incluir bloques de
// imagen/PDF aparte (ver lib/anthropic.ts); aquí va el texto.
export function construirPromptUsuario(args: {
  datos: DatosCaso;
  transcripcion: string;
  documentosTexto: string;
}): string {
  const { datos, transcripcion, documentosTexto } = args;
  return `Genera el borrador del informe pericial con la información de este caso.

═══════════════════════ INFORMACIÓN DEL CASO ═══════════════════════
- Nombre del caso: ${datos.nombreCaso || "[PENDIENTE]"}
- Número de caso/tribunal: ${datos.numeroCaso || "[PENDIENTE]"}
- Persona evaluada: ${datos.personaEvaluada || "[PENDIENTE]"}
- Fecha de nacimiento / edad: ${
    datos.fechaNacimiento
      ? `${formatFechaLarga(datos.fechaNacimiento)}${
          calcularEdad(datos.fechaNacimiento, datos.fechaEvaluacion) !== null
            ? ` (${calcularEdad(datos.fechaNacimiento, datos.fechaEvaluacion)} años a la fecha de evaluación)`
            : ""
        }`
      : "[PENDIENTE]"
  }
- Fecha de evaluación: ${datos.fechaEvaluacion ? formatFechaLarga(datos.fechaEvaluacion) : "[PENDIENTE]"}
- Profesional que rinde el informe: ${datos.profesional || "[PENDIENTE]"}
- Tipo de evaluación: ${datos.tipoEvaluacion || "[PENDIENTE]"}
- Región Judicial / Tribunal: ${datos.regionJudicial || "[PENDIENTE]"}
- Peticionario/a: ${datos.peticionario || "[PENDIENTE]"}
- Relación del peticionario con la persona evaluada: ${datos.relacionPeticionario || "[PENDIENTE]"}

═══════════════════════ TRANSCRIPCIÓN DE LA ENTREVISTA ═══════════════════════
${transcripcion || "[No se proporcionó transcripción]"}

═══════════════════════ CONTENIDO DE DOCUMENTOS REVISADOS ═══════════════════════
${documentosTexto || "[No se proporcionaron documentos en texto]"}

═══════════════════════ INSTRUCCIONES DE SALIDA ═══════════════════════
Devuelve EXCLUSIVAMENTE un objeto JSON válido (sin texto antes ni después, sin
bloques de código markdown) con esta forma exacta:

{
  "aviso": "BORRADOR PARA REVISIÓN PROFESIONAL",
  "identificacion": "texto markdown de la sección 1: Identificación del Caso",
  "transcripcion": "texto markdown de la sección 4: transcripción organizada por hablante cuando sea posible",
  "analisis": {
    "economico": "Análisis Económico de la persona evaluada (markdown)",
    "salud": "Análisis de Salud: condiciones incapacitantes e historial médico relevante extraído de los documentos (markdown)",
    "psicosocial": "Análisis Psicosocial (SECCIÓN PRINCIPAL, la más extensa): dinámica familiar, red de apoyo, funcionamiento psicosocial y necesidades identificadas (markdown)"
  },
  "conclusiones": "texto markdown SOLO de las Conclusiones (6.1) basadas en el análisis. NO incluyas recomendaciones — esas las marca la profesional aparte."
}

NOTA: Las Secciones 2 (Documentos Revisados) y 3 (Metodología) NO las generes — las completa la profesional directamente en la herramienta. No las incluyas en el JSON.

Recuerda: el Análisis (5) y las Conclusiones (6.1) deben derivarse SOLO de la transcripción y los documentos de arriba — no inventes absolutamente nada (ni hechos, ni cifras, ni fechas, ni diagnósticos, ni nombres). Usa "[PENDIENTE: ...]" donde falte información.`;
}
