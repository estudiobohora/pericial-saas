import type { Borrador, Metodologia, DocumentoRev, Recomendaciones } from "./types";

// Sección 6.2: arma las recomendaciones marcadas + las adicionales.
export function recomendacionesAMarkdown(rec: Recomendaciones): string {
  const out: string[] = ["## 6.2 Recomendaciones al Tribunal"];
  const bloques: string[] = [];
  if (rec.seleccionadas.length) {
    bloques.push(rec.seleccionadas.map((r, i) => `${i + 1}. ${r}`).join("\n"));
  }
  if (rec.adicional.trim()) {
    bloques.push(rec.adicional.trim());
  }
  out.push(bloques.length ? bloques.join("\n\n") : "_[Pendiente: marcar las recomendaciones al Tribunal.]_");
  return out.join("\n\n");
}

// Sección 2: tabla de documentos con 4ta columna "Revisado", agrupada por
// categoría (legales / médicos / económicos) cuando los documentos la tienen.
const CATEGORIAS_DOC: { key: string; label: string }[] = [
  { key: "legales", label: "Documentos legales" },
  { key: "medicos", label: "Documentos médicos" },
  { key: "economicos", label: "Documentos económicos" },
];

function tablaDocs(rows: DocumentoRev[]): string {
  const filas = rows.map(
    (d) => `| ${esc(d.nombre)} | ${esc(d.tipo)} | ${esc(d.fecha)} | ${d.revisado ? "Sí" : "No"} |`
  );
  return ["| Nombre del documento | Tipo | Fecha | Revisado |", "|---|---|---|---|", ...filas].join("\n");
}

export function documentosAMarkdown(docs: DocumentoRev[]): string {
  const out: string[] = ["# SECCIÓN 2: DOCUMENTOS REVISADOS"];
  const list = docs.filter((d) => d.nombre || d.tipo || d.fecha);
  if (!list.length) {
    out.push("_[Pendiente: añadir los documentos sometidos para revisión.]_");
    return out.join("\n\n");
  }

  let agrupados = false;
  for (const c of CATEGORIAS_DOC) {
    const rows = list.filter((d) => d.categoria === c.key);
    if (rows.length) {
      out.push(`## ${c.label}`);
      out.push(tablaDocs(rows));
      agrupados = true;
    }
  }
  const sinCategoria = list.filter((d) => !CATEGORIAS_DOC.some((c) => c.key === d.categoria));
  if (sinCategoria.length) {
    if (agrupados) out.push("## Otros documentos");
    out.push(tablaDocs(sinCategoria));
  }
  return out.join("\n\n");
}

const esc = (s: string) => (s || "").replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();

// Calcula la edad a partir de una fecha de nacimiento ISO (yyyy-mm-dd).
// Si se pasa una fecha de referencia ISO, calcula la edad a esa fecha; si no, a hoy.
export function calcularEdad(nacimiento: string, referencia?: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nacimiento)) return null;
  const [ny, nm, nd] = nacimiento.split("-").map(Number);
  let ry: number, rm: number, rd: number;
  if (referencia && /^\d{4}-\d{2}-\d{2}$/.test(referencia)) {
    [ry, rm, rd] = referencia.split("-").map(Number);
  } else {
    const hoy = new Date();
    ry = hoy.getFullYear();
    rm = hoy.getMonth() + 1;
    rd = hoy.getDate();
  }
  let edad = ry - ny;
  if (rm < nm || (rm === nm && rd < nd)) edad--;
  return edad >= 0 ? edad : null;
}

// Convierte el formulario de Metodología (que llena la profesional) en markdown
// con sus tablas, para la vista previa y el Word.
export function metodologiaAMarkdown(m: Metodologia): string {
  const tec = m.tecnicas.filter((t) => t.tecnica || t.descripcion || t.observaciones);
  const ent = m.entrevistas.filter((e) => e.quien || e.rol || e.fecha || e.modalidad || e.lugar);
  const out: string[] = ["# SECCIÓN 3: METODOLOGÍA"];

  out.push("## Técnicas e instrumentos utilizados");
  if (tec.length) {
    const filas = tec.map((t) => `| ${esc(t.tecnica)} | ${esc(t.descripcion)} | ${esc(t.observaciones)} |`);
    out.push(["| Técnica / Herramienta | Descripción | Observaciones |", "|---|---|---|", ...filas].join("\n"));
  } else {
    out.push("_[Pendiente de completar por la profesional]_");
  }

  out.push("## Entrevistas realizadas");
  if (ent.length) {
    const filas = ent.map(
      (e) => `| ${esc(e.quien)} | ${esc(e.rol)} | ${esc(e.fecha)} | ${esc(e.modalidad)} | ${esc(e.lugar)} |`
    );
    out.push(["| Entrevistada/o | Rol / Relación | Fecha | Modalidad | Lugar |", "|---|---|---|---|---|", ...filas].join("\n"));
  } else {
    out.push("_[Pendiente de completar por la profesional]_");
  }

  if (m.observaciones.trim()) {
    out.push("## Observaciones realizadas");
    out.push(m.observaciones.trim());
  }
  return out.join("\n\n");
}

// Ensambla el borrador completo (las 6 secciones, con Análisis en sus 3 partes)
// en un solo documento markdown. Se usa para la vista previa y para exportar.
export function borradorAMarkdown(b: Borrador): string {
  return [
    `# Informe Socio-Económico Pericial`,
    `**${b.aviso}**`,
    b.identificacion,
    b.documentos_revisados,
    b.metodologia,
    b.transcripcion,
    `# 5. Análisis`,
    b.analisis.economico,
    b.analisis.salud,
    b.analisis.psicosocial,
    b.conclusiones,
  ].join("\n\n---\n\n");
}
