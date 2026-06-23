"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import type { Borrador, DatosCaso, Metodologia, DocumentoRev, Recomendaciones } from "@/lib/types";
import {
  borradorAMarkdown,
  metodologiaAMarkdown,
  documentosAMarkdown,
  recomendacionesAMarkdown,
  calcularEdad,
} from "@/lib/report";

// ── Caso ficticio para probar de un click (no usa datos reales) ──
const CASO_DEMO = {
  datos: {
    nombreCaso: "In re: Tutela de la Sra. Carmen Rivera Soto",
    numeroCaso: "SJ2026CV00123",
    personaEvaluada: "Carmen Rivera Soto",
    fechaNacimiento: "1944-03-10",
    fechaEvaluacion: "2026-07-15",
    profesional: "Yeida [Apellido], TSF, Lic. #XXXX",
    tipoEvaluacion: "Designación de tutor",
  },
  transcripcion: `[Trabajadora Social]: Buenas tardes, ¿cómo se siente hoy doña Carmen?
[Carmen Rivera, 82 años]: Bien, gracias, aunque a veces se me olvidan las cosas. No sé qué día es hoy.
[TS]: ¿Quién la ayuda en el día a día?
[Carmen]: Mi hija Marta vive conmigo. Ella me da las medicinas y cocina. El otro hijo, Pedro, vive en Florida.
[TS]: ¿Maneja usted su dinero, sus cuentas?
[Carmen]: No... eso lo ve Marta. Yo ya no entiendo los papeles del banco.
[Marta (hija)]: Mami fue diagnosticada con demencia hace dos años. Ya no puede quedarse sola. Yo dejé mi trabajo a medio tiempo para cuidarla. Pedro ayuda con dinero a veces pero no está de acuerdo en que yo sea la tutora.
[TS]: ¿Hay conflicto entre ustedes los hermanos?
[Marta]: Sí, Pedro dice que yo uso el dinero de mami. No es cierto, yo guardo todos los recibos.`,
  documentosTexto: `1. Informe Médico (Dr. L. Méndez, Neurología, 03/2026): Diagnóstico de demencia tipo Alzheimer, etapa moderada. MMSE 14/30. Requiere supervisión constante.
2. Estado de cuenta bancario (Banco Popular, 06/2026): Cuenta de ahorros con balance de $8,450. Pensión de Seguro Social de $1,180/mes.
3. Lista de medicamentos: Donepezilo 10mg, Losartán 50mg, Metformina 500mg.`,
};

const SECCIONES_TOP: { key: keyof Borrador; label: string }[] = [
  { key: "identificacion", label: "1. Identificación del Caso" },
];

// Opciones del dropdown de tipo de documento (Sección 2 — la llena la profesional).
const TIPOS_DOC = [
  "Informe médico",
  "Informe psicológico / psiquiátrico",
  "Récord hospitalario",
  "Estado de cuenta bancario",
  "Lista de medicamentos",
  "Documento legal / judicial",
  "Identificación / documento personal",
  "Declaración jurada",
  "Foto / evidencia",
  "Otro",
];
const DOCS_INICIAL: DocumentoRev[] = [{ nombre: "", tipo: "", fecha: "", revisado: true }];

// Sección 1: dropdowns de Región Judicial (13 regiones de PR) y Relación del peticionario.
const REGIONES_JUDICIALES = [
  "Aguadilla", "Aibonito", "Arecibo", "Bayamón", "Caguas", "Carolina", "Fajardo",
  "Guayama", "Humacao", "Mayagüez", "Ponce", "San Juan", "Utuado",
];
const RELACIONES = [
  "Hijo/a", "Cónyuge", "Hermano/a", "Nieto/a", "Sobrino/a", "Padre/Madre",
  "Otro familiar", "Tutor/a propuesto (no familiar)", "Agencia gubernamental", "Otro",
];

// Sección 6.2: recomendaciones estándar (checklist).
const REC_OPCIONES = [
  "Que el Honorable Tribunal declare la incapacidad legal de la persona evaluada.",
  "Que se designe un tutor/a legal para la persona y sus bienes.",
  "Que el tutor/a designado rinda cuentas periódicas al Tribunal.",
  "Que se ordene un plan formal de cuidado supervisado.",
  "Que se realicen evaluaciones médicas periódicas de seguimiento.",
  "Que se coordinen los servicios de apoyo comunitario y gubernamental disponibles.",
  "Que se evalúen las necesidades del cuidador/a principal.",
  "Que se investigue y supervise el manejo de los recursos económicos de la persona evaluada.",
];
const REC_INICIAL: Recomendaciones = { seleccionadas: [], adicional: "" };

// Opciones del dropdown de técnicas/instrumentos (Sección 3 — la llena la profesional).
const TECNICAS_OPCIONES = [
  "Entrevista directa con la persona evaluada",
  "Entrevista colateral",
  "Entrevista semiestructurada",
  "Observación clínica directa",
  "Visita domiciliaria / observación del hogar",
  "Revisión documental",
  "Historia social",
  "Genograma",
  "Ecomapa",
  "Escala de funcionamiento (AVD / AIVD)",
  "Otra (especificar en la descripción)",
];
const MODALIDADES = ["Presencial", "Videoconferencia", "Telefónica"];

const MET_INICIAL: Metodologia = {
  tecnicas: [{ tecnica: "", descripcion: "", observaciones: "" }],
  entrevistas: [{ quien: "", rol: "", fecha: "", modalidad: "", lugar: "" }],
  observaciones: "",
};

export default function Home() {
  const [datos, setDatos] = useState<DatosCaso>({});
  const [transcripcion, setTranscripcion] = useState("");
  const [documentosTexto, setDocumentosTexto] = useState("");
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verPreview, setVerPreview] = useState(false);
  const [subiendoAudio, setSubiendoAudio] = useState(false);
  const [subiendoDocs, setSubiendoDocs] = useState(false);
  const [met, setMet] = useState<Metodologia>(MET_INICIAL);
  const [docs, setDocs] = useState<DocumentoRev[]>(DOCS_INICIAL);
  const [rec, setRec] = useState<Recomendaciones>(REC_INICIAL);

  // Recuerda los datos de la profesional entre informes (se llena solo).
  useEffect(() => {
    const saved = localStorage.getItem("pericial_profesional");
    if (saved) setDatos((d) => ({ ...d, profesional: d.profesional || saved }));
  }, []);
  useEffect(() => {
    if (datos.profesional) localStorage.setItem("pericial_profesional", datos.profesional);
  }, [datos.profesional]);

  const previewHtml = useMemo(() => {
    if (!borrador) return "";
    const b = {
      ...borrador,
      documentos_revisados: documentosAMarkdown(docs),
      metodologia: metodologiaAMarkdown(met),
      conclusiones: `${borrador.conclusiones}\n\n${recomendacionesAMarkdown(rec)}`,
    };
    return marked.parse(borradorAMarkdown(b)) as string;
  }, [borrador, met, docs, rec]);

  function setCampoDatos(k: keyof DatosCaso, v: string) {
    setDatos((d) => ({ ...d, [k]: v }));
  }
  function setSeccion(k: keyof Borrador, v: string) {
    setBorrador((b) => (b ? { ...b, [k]: v } : b));
  }
  function setAnalisis(k: keyof Borrador["analisis"], v: string) {
    setBorrador((b) => (b ? { ...b, analisis: { ...b.analisis, [k]: v } } : b));
  }

  function cargarDemo() {
    setDatos(CASO_DEMO.datos);
    setTranscripcion(CASO_DEMO.transcripcion);
    setDocumentosTexto(CASO_DEMO.documentosTexto);
  }

  async function salir() {
    await fetch("/api/salir", { method: "POST" });
    window.location.href = "/acceso";
  }

  async function generar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, transcripcion, documentosTexto }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error generando el borrador");
      setBorrador(data.borrador);
      setVerPreview(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function subirAudio(file: File) {
    setSubiendoAudio(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || "Error transcribiendo el audio");
      setTranscripcion(d.transcripcion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubiendoAudio(false);
    }
  }

  async function subirDocs(file: File) {
    setSubiendoDocs(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || "Error leyendo los documentos");
      setDocumentosTexto(d.documentosTexto);
      if (Array.isArray(d.documentos) && d.documentos.length) {
        setDocs(
          d.documentos.map((x: { nombre: string; fecha: string }) => ({
            nombre: x.nombre,
            tipo: "",
            fecha: x.fecha || "",
            revisado: true,
          }))
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubiendoDocs(false);
    }
  }

  async function exportarWord() {
    const b = {
      ...borrador,
      documentos_revisados: documentosAMarkdown(docs),
      metodologia: metodologiaAMarkdown(met),
      conclusiones: `${borrador?.conclusiones ?? ""}\n\n${recomendacionesAMarkdown(rec)}`,
    };
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datos, borrador: b }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Informe_${(datos.numeroCaso || "borrador").replace(/[^\w.-]+/g, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const edad = calcularEdad(datos.fechaNacimiento || "", datos.fechaEvaluacion);

  return (
    <div className="min-h-screen">
      {/* Encabezado */}
      <header className="bg-ink text-marfil">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-semibold tracking-tight text-marfil">Pericial</span>
            <span className="hidden font-serif text-xs tracking-[0.12em] text-laton-soft sm:inline">
              INFORMES SOCIO-ECONÓMICOS FORENSES
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded border border-laton/40 px-2 py-1 text-[10px] uppercase tracking-wider text-laton-soft">
              Beta · nombre provisional
            </span>
            <button
              onClick={salir}
              className="rounded border border-laton/60 px-3 py-1 text-xs font-medium text-marfil transition-colors hover:bg-laton hover:text-ink"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* 1. Datos del caso */}
        <section className="rounded-lg border border-[#e7decc] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-ink">
              Datos del caso
            </h2>
            <button onClick={cargarDemo} className="text-xs text-laton-dark hover:underline">
              Cargar caso de prueba
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Nombre del caso" value={datos.nombreCaso || ""} onChange={(v) => setCampoDatos("nombreCaso", v)} />
            <Campo label="Número de caso / tribunal" value={datos.numeroCaso || ""} onChange={(v) => setCampoDatos("numeroCaso", v)} />
            <Campo label="Persona evaluada (nombre)" value={datos.personaEvaluada || ""} onChange={(v) => setCampoDatos("personaEvaluada", v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">
                Fecha de nacimiento
                {edad !== null ? <span className="font-normal text-slate-400"> · {edad} años</span> : null}
              </label>
              <input
                type="date"
                value={datos.fechaNacimiento || ""}
                onChange={(e) => setCampoDatos("fechaNacimiento", e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
              />
            </div>
            <Campo label="Fecha de evaluación" type="date" value={datos.fechaEvaluacion || ""} onChange={(v) => setCampoDatos("fechaEvaluacion", v)} />
            <Campo label="Profesional (nombre y licencia)" value={datos.profesional || ""} onChange={(v) => setCampoDatos("profesional", v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Tipo de evaluación</label>
              <select
                value={datos.tipoEvaluacion || ""}
                onChange={(e) => setCampoDatos("tipoEvaluacion", e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
              >
                <option value="">Seleccionar…</option>
                <optgroup label="Capacidad y tutela">
                  <option value="Incapacidad">Incapacidad</option>
                  <option value="Designación de tutor">Designación de tutor</option>
                  <option value="Capacidad para tomar decisiones">Capacidad para tomar decisiones</option>
                </optgroup>
                <optgroup label="Inmigración">
                  <option value="Inmigración — Dificultad extrema (hardship/waiver)">Dificultad extrema (hardship / waiver)</option>
                  <option value="Inmigración — VAWA (víctima de violencia)">VAWA (víctima de violencia)</option>
                  <option value="Inmigración — Visa U (víctima de crimen)">Visa U (víctima de crimen)</option>
                  <option value="Inmigración — Visa T (víctima de trata humana)">Visa T (víctima de trata humana)</option>
                  <option value="Inmigración — Asilo">Asilo</option>
                  <option value="Inmigración — Cancelación de remoción / deportación">Cancelación de remoción / deportación</option>
                </optgroup>
                <optgroup label="Familia y menores">
                  <option value="Custodia de menores">Custodia de menores</option>
                  <option value="Patria potestad">Patria potestad</option>
                  <option value="Adopción">Adopción</option>
                  <option value="Maltrato o negligencia de menores">Maltrato o negligencia de menores</option>
                </optgroup>
                <optgroup label="Daños y violencia">
                  <option value="Daños y perjuicios (daño emocional)">Daños y perjuicios (daño emocional)</option>
                  <option value="Violencia doméstica (Ley 54)">Violencia doméstica (Ley 54)</option>
                </optgroup>
                <optgroup label="Penal / forense">
                  <option value="Competencia para ser procesado">Competencia para ser procesado</option>
                  <option value="Responsabilidad criminal (inimputabilidad)">Responsabilidad criminal (inimputabilidad)</option>
                  <option value="Evaluación de riesgo / peligrosidad">Evaluación de riesgo / peligrosidad</option>
                </optgroup>
                <optgroup label="Laboral">
                  <option value="Incapacidad laboral / compensación">Incapacidad laboral / compensación</option>
                </optgroup>
                <option value="Otro">Otro (especificar en el caso)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Región Judicial / Tribunal</label>
              <select
                value={datos.regionJudicial || ""}
                onChange={(e) => setCampoDatos("regionJudicial", e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
              >
                <option value="">Seleccionar…</option>
                {REGIONES_JUDICIALES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <Campo label="Peticionario/a (nombre)" value={datos.peticionario || ""} onChange={(v) => setCampoDatos("peticionario", v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Relación del peticionario</label>
              <select
                value={datos.relacionPeticionario || ""}
                onChange={(e) => setCampoDatos("relacionPeticionario", e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
              >
                <option value="">Seleccionar…</option>
                {RELACIONES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 2. Entradas */}
        <section className="rounded-lg border border-[#e7decc] bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-serif text-lg text-ink">
            Entrevista y documentos
          </h2>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <input
                  type="file"
                  accept="audio/*,.mp3,.m4a,.wav"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && subirAudio(e.target.files[0])}
                />
                <svg aria-hidden="true" className="h-4 w-4 text-laton-dark" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                <span>{subiendoAudio ? "Transcribiendo…" : "Subir audio (MP3) de la entrevista"}</span>
              </label>
              <span className="text-xs text-slate-400">Whisper transcribe el audio automáticamente.</span>
            </div>
            <AreaTexto
              label="Transcripción de la entrevista"
              hint="(Se llena al subir el audio. Revísala y corrige lo necesario.)"
              value={transcripcion}
              onChange={setTranscripcion}
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && subirDocs(e.target.files[0])}
                />
                <svg aria-hidden="true" className="h-4 w-4 text-laton-dark" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
                <span>{subiendoDocs ? "Leyendo documentos…" : "Subir documentos (ZIP)"}</span>
              </label>
              <span className="text-xs text-slate-400">Lee PDF, Word, imágenes y escaneados automáticamente.</span>
            </div>
            <AreaTexto
              label="Contenido de documentos revisados"
              hint="(Sube el ZIP arriba, o pega el texto.)"
              value={documentosTexto}
              onChange={setDocumentosTexto}
              rows={5}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generar}
              disabled={loading}
              className="rounded bg-[#b45309] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#97470a] disabled:opacity-50"
            >
              {loading ? "Generando borrador…" : "Generar borrador"}
            </button>
            {loading && <span className="text-xs text-slate-500">Esto puede tomar ~30–60 segundos.</span>}
          </div>
          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}
        </section>

        {/* 3. Borrador editable */}
        {borrador && (
          <section className="rounded-lg border border-[#e7decc] bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">
                Borrador editable
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVerPreview((v) => !v)}
                  className="rounded border border-laton/50 px-3 py-1.5 text-sm text-ink hover:bg-[#efe9dc]"
                >
                  {verPreview ? "Editar" : "Vista previa"}
                </button>
                <button
                  onClick={exportarWord}
                  className="rounded bg-ink px-4 py-1.5 text-sm font-medium text-marfil hover:bg-ink-soft"
                >
                  Exportar a Word
                </button>
              </div>
            </div>

            {verPreview ? (
              <div className="reporte rounded border border-slate-200 bg-white p-6" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <div className="space-y-5">
                {SECCIONES_TOP.map((s) => (
                  <SeccionEdit
                    key={s.key}
                    label={s.label}
                    value={String(borrador[s.key] ?? "")}
                    onChange={(v) => setSeccion(s.key, v)}
                  />
                ))}

                <DocumentosForm docs={docs} onChange={setDocs} />

                <MetodologiaForm met={met} onChange={setMet} />

                <SeccionEdit
                  label="4. Transcripción"
                  value={borrador.transcripcion}
                  onChange={(v) => setSeccion("transcripcion", v)}
                />

                <div className="space-y-4">
                  <h3 className="font-serif text-base text-ink">5. Análisis</h3>
                  <SeccionEdit label="5.1 Análisis Económico" value={borrador.analisis.economico} onChange={(v) => setAnalisis("economico", v)} />
                  <SeccionEdit label="5.2 Análisis de Salud" value={borrador.analisis.salud} onChange={(v) => setAnalisis("salud", v)} />
                  <SeccionEdit label="5.3 Análisis Psicosocial" value={borrador.analisis.psicosocial} onChange={(v) => setAnalisis("psicosocial", v)} />
                </div>
                <SeccionEdit label="6.1 Conclusiones" value={borrador.conclusiones} onChange={(v) => setSeccion("conclusiones", v)} />
                <RecomendacionesForm rec={rec} onChange={setRec} />
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-[#9c8f76]">
        <p className="font-serif text-xs tracking-wide">
          © 2026 The Lab. Todos los derechos reservados.
        </p>
        <p className="mx-auto mt-1.5 max-w-2xl text-[11px] leading-relaxed">
          Herramienta Digital Asistida con IA para Profesionales de la Salud Mental en el Área Forense. Hecho en Puerto Rico.
        </p>
      </footer>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
      />
    </div>
  );
}

function AreaTexto({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">
        {label} {hint && <span className="font-normal text-slate-400">{hint}</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="resize-y rounded border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
      />
    </div>
  );
}

function SeccionEdit({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[140px] resize-y rounded border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-[13px] leading-relaxed text-slate-800 focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
      />
    </div>
  );
}

const INPUT_CLS =
  "w-full rounded border border-slate-300 px-2 py-1.5 text-[13px] focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton";

function MetodologiaForm({ met, onChange }: { met: Metodologia; onChange: (m: Metodologia) => void }) {
  const updTec = (i: number, campo: keyof Metodologia["tecnicas"][number], v: string) =>
    onChange({ ...met, tecnicas: met.tecnicas.map((t, idx) => (idx === i ? { ...t, [campo]: v } : t)) });
  const addTec = () =>
    onChange({ ...met, tecnicas: [...met.tecnicas, { tecnica: "", descripcion: "", observaciones: "" }] });
  const delTec = (i: number) => onChange({ ...met, tecnicas: met.tecnicas.filter((_, idx) => idx !== i) });

  const updEnt = (i: number, campo: keyof Metodologia["entrevistas"][number], v: string) =>
    onChange({ ...met, entrevistas: met.entrevistas.map((e, idx) => (idx === i ? { ...e, [campo]: v } : e)) });
  const addEnt = () =>
    onChange({
      ...met,
      entrevistas: [...met.entrevistas, { quien: "", rol: "", fecha: "", modalidad: "", lugar: "" }],
    });
  const delEnt = (i: number) => onChange({ ...met, entrevistas: met.entrevistas.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-[#fbf7ee] p-4">
      <div>
        <h3 className="font-serif text-base text-ink">3. Metodología</h3>
        <p className="text-xs text-slate-500">
          Esta sección la completas tú. Selecciona la técnica en la primera columna y llena el resto.
        </p>
      </div>

      {/* Técnicas e instrumentos */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600">Técnicas e instrumentos utilizados</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-600">
                <th className="border border-slate-200 px-2 py-1 font-medium">Técnica / Herramienta</th>
                <th className="border border-slate-200 px-2 py-1 font-medium">Descripción</th>
                <th className="border border-slate-200 px-2 py-1 font-medium">Observaciones</th>
                <th className="border border-slate-200 px-1 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {met.tecnicas.map((t, i) => (
                <tr key={i}>
                  <td className="w-[30%] border border-slate-200 px-2 py-1 align-top">
                    <select value={t.tecnica} onChange={(e) => updTec(i, "tecnica", e.target.value)} className={INPUT_CLS}>
                      <option value="">Seleccionar…</option>
                      {TECNICAS_OPCIONES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <input
                      value={t.descripcion}
                      onChange={(e) => updTec(i, "descripcion", e.target.value)}
                      className={INPUT_CLS}
                      placeholder="Describe cómo se aplicó…"
                    />
                  </td>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <input
                      value={t.observaciones}
                      onChange={(e) => updTec(i, "observaciones", e.target.value)}
                      className={INPUT_CLS}
                      placeholder="Observaciones…"
                    />
                  </td>
                  <td className="border border-slate-200 px-1 py-1 text-center align-top">
                    <button onClick={() => delTec(i)} className="text-slate-400 hover:text-red-600" title="Eliminar fila">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addTec} className="text-xs font-medium text-laton-dark hover:underline">
          + Añadir técnica
        </button>
      </div>

      {/* Entrevistas realizadas */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600">Entrevistas realizadas</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-600">
                <th className="border border-slate-200 px-2 py-1 font-medium">Entrevistada/o</th>
                <th className="border border-slate-200 px-2 py-1 font-medium">Rol / Relación</th>
                <th className="border border-slate-200 px-2 py-1 font-medium">Fecha</th>
                <th className="border border-slate-200 px-2 py-1 font-medium">Modalidad</th>
                <th className="border border-slate-200 px-2 py-1 font-medium">Lugar</th>
                <th className="border border-slate-200 px-1 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {met.entrevistas.map((e, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <input value={e.quien} onChange={(ev) => updEnt(i, "quien", ev.target.value)} className={INPUT_CLS} />
                  </td>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <input value={e.rol} onChange={(ev) => updEnt(i, "rol", ev.target.value)} className={INPUT_CLS} />
                  </td>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <input value={e.fecha} onChange={(ev) => updEnt(i, "fecha", ev.target.value)} className={INPUT_CLS} placeholder="dd/mm/aaaa" />
                  </td>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <select value={e.modalidad} onChange={(ev) => updEnt(i, "modalidad", ev.target.value)} className={INPUT_CLS}>
                      <option value="">—</option>
                      {MODALIDADES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-slate-200 px-2 py-1 align-top">
                    <input value={e.lugar} onChange={(ev) => updEnt(i, "lugar", ev.target.value)} className={INPUT_CLS} />
                  </td>
                  <td className="border border-slate-200 px-1 py-1 text-center align-top">
                    <button onClick={() => delEnt(i)} className="text-slate-400 hover:text-red-600" title="Eliminar fila">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addEnt} className="text-xs font-medium text-laton-dark hover:underline">
          + Añadir entrevista
        </button>
      </div>

      {/* Observaciones */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-600">Observaciones realizadas</label>
        <textarea
          value={met.observaciones}
          onChange={(e) => onChange({ ...met, observaciones: e.target.value })}
          className="min-h-[80px] resize-y rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
          placeholder="Notas u observaciones del proceso de evaluación…"
        />
      </div>
    </div>
  );
}

function DocumentosForm({ docs, onChange }: { docs: DocumentoRev[]; onChange: (d: DocumentoRev[]) => void }) {
  const upd = (i: number, campo: keyof DocumentoRev, v: string | boolean) =>
    onChange(docs.map((d, idx) => (idx === i ? { ...d, [campo]: v } : d)));
  const add = () => onChange([...docs, { nombre: "", tipo: "", fecha: "", revisado: true }]);
  const del = (i: number) => onChange(docs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-[#fbf7ee] p-4">
      <div>
        <h3 className="font-serif text-base text-ink">2. Documentos Revisados</h3>
        <p className="text-xs text-slate-500">
          Se llenan solos al subir el ZIP. Ajusta el tipo y marca cuáles revisaste.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-600">
              <th className="border border-slate-200 px-2 py-1 font-medium">Nombre del documento</th>
              <th className="border border-slate-200 px-2 py-1 font-medium">Tipo</th>
              <th className="border border-slate-200 px-2 py-1 font-medium">Fecha</th>
              <th className="border border-slate-200 px-2 py-1 text-center font-medium">Revisado</th>
              <th className="border border-slate-200 px-1 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i}>
                <td className="border border-slate-200 px-2 py-1 align-top">
                  <input value={d.nombre} onChange={(e) => upd(i, "nombre", e.target.value)} className={INPUT_CLS} />
                </td>
                <td className="w-[24%] border border-slate-200 px-2 py-1 align-top">
                  <select value={d.tipo} onChange={(e) => upd(i, "tipo", e.target.value)} className={INPUT_CLS}>
                    <option value="">Seleccionar…</option>
                    {TIPOS_DOC.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-slate-200 px-2 py-1 align-top">
                  <input
                    value={d.fecha}
                    onChange={(e) => upd(i, "fecha", e.target.value)}
                    className={INPUT_CLS}
                    placeholder="dd/mm/aaaa"
                  />
                </td>
                <td className="border border-slate-200 px-2 py-1 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={d.revisado}
                    onChange={(e) => upd(i, "revisado", e.target.checked)}
                    className="h-4 w-4 accent-ink"
                  />
                </td>
                <td className="border border-slate-200 px-1 py-1 text-center align-top">
                  <button onClick={() => del(i)} className="text-slate-400 hover:text-red-600" title="Eliminar fila">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={add} className="text-xs font-medium text-laton-dark hover:underline">
        + Añadir documento
      </button>
    </div>
  );
}

function RecomendacionesForm({ rec, onChange }: { rec: Recomendaciones; onChange: (r: Recomendaciones) => void }) {
  const toggle = (op: string) => {
    const has = rec.seleccionadas.includes(op);
    const next = REC_OPCIONES.filter((o) => (o === op ? !has : rec.seleccionadas.includes(o)));
    onChange({ ...rec, seleccionadas: next });
  };

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-[#fbf7ee] p-4">
      <div>
        <h3 className="font-serif text-base text-ink">6.2 Recomendaciones al Tribunal</h3>
        <p className="text-xs text-slate-500">
          Marca las recomendaciones que apliquen y añade las específicas del caso abajo.
        </p>
      </div>
      <div className="space-y-2">
        {REC_OPCIONES.map((op) => (
          <label key={op} className="flex items-start gap-2 text-[13px] text-slate-700">
            <input
              type="checkbox"
              checked={rec.seleccionadas.includes(op)}
              onChange={() => toggle(op)}
              className="mt-0.5 h-4 w-4 accent-ink"
            />
            <span>{op}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-600">Recomendaciones adicionales (específicas del caso)</label>
        <textarea
          value={rec.adicional}
          onChange={(e) => onChange({ ...rec, adicional: e.target.value })}
          className="min-h-[90px] resize-y rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
          placeholder="Recomendaciones específicas que no estén en la lista…"
        />
      </div>
    </div>
  );
}
