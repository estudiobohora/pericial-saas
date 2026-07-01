// Validación de códigos de acceso. Edge-safe: solo usa process.env + strings
// (lo importa el middleware, que corre en el edge). No importar aquí nada de Node/Supabase.
//
// Modelo:
//  - CODIGOS_TRIAL: lista separada por comas de códigos con prueba limitada (N informes).
//  - CODIGOS_PRO:   lista separada por comas de códigos ilimitados (Ángel, Yeida, clientes que pagaron).
//  - BETA_PASSWORD: la contraseña original — se trata como PRO (ilimitado), por compatibilidad.
//  - TRIAL_LIMITE:  número de informes de la prueba (default 2).

function parse(v?: string): string[] {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function codigosTrial(): string[] {
  return parse(process.env.CODIGOS_TRIAL);
}

export function codigosPro(): string[] {
  const pro = parse(process.env.CODIGOS_PRO);
  const bp = process.env.BETA_PASSWORD?.trim();
  if (bp) pro.push(bp);
  return pro;
}

// ¿Hay algún código/gate configurado? Si no, la app queda abierta (útil en local).
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
