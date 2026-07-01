// Conteo de informes por código de acceso (para la prueba beta).
// Usa Supabase (tabla pericial_uso_beta) si está configurado; si no, respaldo en memoria (dev).
// Corre solo en rutas nodejs (NO importar desde el middleware/edge).
//
// Tabla requerida en Supabase (ejecutar una vez en el SQL editor):
//   create table if not exists pericial_uso_beta (
//     codigo text primary key,
//     informes int not null default 0,
//     actualizado timestamptz not null default now()
//   );
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const activo = Boolean(url && key);
const memoria = new Map<string, number>(); // respaldo local (dev o si Supabase no responde)

function admin() {
  return createClient(url as string, key as string, { auth: { persistSession: false } });
}

export function usoPersistente(): boolean {
  return activo;
}

export async function usoActual(codigo: string): Promise<number> {
  if (!activo) return memoria.get(codigo) || 0;
  try {
    const { data, error } = await admin()
      .from("pericial_uso_beta")
      .select("informes")
      .eq("codigo", codigo)
      .maybeSingle();
    if (error) throw error;
    return data?.informes ?? 0;
  } catch {
    // fail-open: no rompemos el flujo si la tabla no existe todavía
    return memoria.get(codigo) || 0;
  }
}

export async function incrementarUso(codigo: string): Promise<void> {
  if (!activo) {
    memoria.set(codigo, (memoria.get(codigo) || 0) + 1);
    return;
  }
  try {
    const actual = await usoActual(codigo);
    const { error } = await admin()
      .from("pericial_uso_beta")
      .upsert({ codigo, informes: actual + 1, actualizado: new Date().toISOString() });
    if (error) throw error;
  } catch {
    memoria.set(codigo, (memoria.get(codigo) || 0) + 1);
  }
}
