// Prueba de generación con un CASO FICTICIO (no usa datos reales).
// Carga .env.local manualmente y llama a generarBorrador.
// Ejecutar: npx tsx scripts/test-generate.ts
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generarBorrador } from "../src/lib/anthropic";

// Carga .env.local a process.env (sin dependencias)
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const datos = {
  nombreCaso: "In re: Tutela de la Sra. Carmen Rivera Soto",
  numeroCaso: "SJ2026CV00123",
  fechaEvaluacion: "15 de julio de 2026",
  profesional: "Yeida [Apellido], TSF, Lic. #XXXX",
  tipoEvaluacion: "designacion_tutor",
};

const transcripcion = `
[Trabajadora Social]: Buenas tardes, gracias por recibirme. ¿Cómo se siente hoy doña Carmen?
[Carmen Rivera, 82 años]: Bien, gracias, aunque a veces se me olvidan las cosas. No sé qué día es hoy.
[TS]: ¿Quién la ayuda en el día a día?
[Carmen]: Mi hija Marta vive conmigo. Ella me da las medicinas y cocina. El otro hijo, Pedro, vive en Florida.
[TS]: ¿Maneja usted su dinero, sus cuentas?
[Carmen]: No... eso lo ve Marta. Yo ya no entiendo los papeles del banco.
[Marta (hija)]: Mami fue diagnosticada con demencia hace dos años. Ya no puede quedarse sola. Yo dejé mi trabajo a medio tiempo para cuidarla. Pedro ayuda con dinero a veces pero no está de acuerdo en que yo sea la tutora.
[TS]: ¿Hay conflicto entre ustedes los hermanos?
[Marta]: Sí, Pedro dice que yo uso el dinero de mami. No es cierto, yo guardo todos los recibos.
`.trim();

const documentosTexto = `
1. Informe Médico (Dr. L. Méndez, Neurología, 03/2026): Diagnóstico de demencia tipo Alzheimer, etapa moderada. MMSE 14/30. Paciente requiere supervisión constante.
2. Estado de cuenta bancario (Banco Popular, 06/2026): Cuenta de ahorros con balance de $8,450. Pensión de Seguro Social de $1,180/mes depositada.
3. Lista de medicamentos: Donepezilo 10mg, Losartán 50mg, Metformina 500mg.
`.trim();

async function main() {
  console.log("Generando borrador del caso ficticio con Claude...\n");
  const borrador = await generarBorrador({ datos, transcripcion, documentosTexto });

  console.log("=== AVISO ===\n" + borrador.aviso + "\n");
  console.log("=== 1. IDENTIFICACIÓN ===\n" + borrador.identificacion + "\n");
  console.log("=== 2. DOCUMENTOS REVISADOS ===\n" + borrador.documentos_revisados + "\n");
  console.log("=== 3. METODOLOGÍA ===\n" + borrador.metodologia + "\n");
  console.log("=== 4. TRANSCRIPCIÓN ===\n" + borrador.transcripcion.slice(0, 400) + "...\n");
  console.log("=== 5a. ANÁLISIS ECONÓMICO ===\n" + borrador.analisis.economico + "\n");
  console.log("=== 5b. ANÁLISIS DE SALUD ===\n" + borrador.analisis.salud + "\n");
  console.log("=== 5c. ANÁLISIS PSICOSOCIAL ===\n" + borrador.analisis.psicosocial + "\n");
  console.log("=== 6. CONCLUSIONES Y RECOMENDACIONES ===\n" + borrador.conclusiones + "\n");
  console.log("\n✅ Generación completada. Revisa que las secciones tengan sentido y que use [PENDIENTE] donde falte info.");
}

main().catch((e) => {
  console.error("ERROR:", e instanceof Error ? e.message : e);
  process.exit(1);
});
