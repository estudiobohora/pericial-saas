// Tipos compartidos entre cliente y servidor (sin dependencias de servidor,
// para poder importarlos desde componentes del navegador).

export type DatosCaso = {
  nombreCaso?: string;
  numeroCaso?: string;
  fechaEvaluacion?: string;
  profesional?: string;
  tipoEvaluacion?: "incapacidad" | "designacion_tutor" | string;
  personaEvaluada?: string;
  fechaNacimiento?: string;
  regionJudicial?: string;
  peticionario?: string;
  relacionPeticionario?: string;
};

export type Borrador = {
  aviso: string;
  identificacion: string;
  documentos_revisados: string;
  metodologia: string;
  transcripcion: string;
  analisis: { economico: string; salud: string; psicosocial: string };
  conclusiones: string;
};

// Sección 3: Metodología — la completa la profesional directamente en la app.
export type TecnicaMet = { tecnica: string; descripcion: string; observaciones: string };
export type EntrevistaMet = {
  quien: string;
  rol: string;
  fecha: string;
  modalidad: string;
  lugar: string;
};
export type Metodologia = {
  tecnicas: TecnicaMet[];
  entrevistas: EntrevistaMet[];
  observaciones: string;
};

// Sección 2: Documentos Revisados — la completa/ajusta la profesional.
// `categoria` agrupa el documento en legales / medicos / economicos.
export type DocumentoRev = {
  nombre: string;
  tipo: string;
  fecha: string;
  revisado: boolean;
  categoria?: string;
};

// Sección 6.2: Recomendaciones al Tribunal — checklist + texto libre.
export type Recomendaciones = {
  seleccionadas: string[];
  adicional: string;
};
