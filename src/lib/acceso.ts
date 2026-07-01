// Validación de códigos de acceso. Edge-safe: solo usa process.env + strings
// (lo importa el middleware, que corre en el edge). No importar aquí nada de Node/Supabase.
//
// Modelo:
//  - PRO: códigos ILIMITADOS (Ángel/admin, clientes que pagaron). Default: Admin25.
//  - TRIAL: códigos con prueba limitada a TRIAL_LIMITE informes CADA UNO (uno por persona).
//  - Las env vars CODIGOS_PRO / CODIGOS_TRIAL / TRIAL_LIMITE sobreescriben los defaults.
//  - El conteo es POR CÓDIGO (ver lib/uso.ts) → un código = una persona.

// Código ilimitado del administrador (Ángel).
const DEFAULT_PRO = ["Admin25"];

// Tanda de códigos de prueba (uno por evaluador). 2 informes cada uno.
const DEFAULT_TRIAL = [
  "PRUEBA-QX41",
  "PRUEBA-KM73",
  "PRUEBA-ZP58",
  "PRUEBA-RT92",
  "PRUEBA-BV36",
  "PRUEBA-JD17",
  "PRUEBA-WL64",
  "PRUEBA-NC29",
  "PRUEBA-HF85",
  "PRUEBA-YT43",
  "PRUEBA-GM06",
  "PRUEBA-XP71",
];

function parse(v?: string): string[] {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function codigosTrial(): string[] {
  const env = parse(process.env.CODIGOS_TRIAL);
  return env.length ? env : DEFAULT_TRIAL;
}

export function codigosPro(): string[] {
  const env = parse(process.env.CODIGOS_PRO);
  return env.length ? env : DEFAULT_PRO;
}

// Siempre hay gate (hay defaults). Se mantiene por claridad/futuro.
export function gateActivo(): boolean {
  return codigosTrial().length > 0 || codigosPro().length > 0;
}

export function esValido(codigo: string): boolean {
  if (!codigo) return false;
  return codigosTrial().includes(codigo) || codigosPro().includes(codigo);
}

export function esPro(codigo: string): boolean {
  return !!codigo && codigosPro().includes(codigo);
}

export function trialLimite(): number {
  const n = Number(process.env.TRIAL_LIMITE);
  return Number.isFinite(n) && n >= 0 ? n : 2;
}
