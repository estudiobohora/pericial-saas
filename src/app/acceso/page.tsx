"use client";

import { useState } from "react";

export default function Acceso() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* ── Panel de marca (tinta) ── */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-ink px-8 py-10 text-marfil sm:px-12 lg:min-h-dvh lg:px-20 lg:py-14 xl:px-28 2xl:px-36">
        {/* Acento superior latón */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-laton-dark via-laton to-laton-soft" />
        {/* Glifo decorativo sutil */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-16 select-none font-serif text-[22rem] leading-none text-white/[0.03]">
          P
        </div>
        {/* Resplandor sutil */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-laton/10 blur-3xl" />

        {/* Marca */}
        <div className="relative">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-semibold tracking-tight text-marfil">Pericial</span>
            <span className="rounded border border-laton/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-laton-soft">
              Beta
            </span>
          </div>
          <p className="mt-2 font-serif text-xs uppercase tracking-[0.22em] text-laton-soft">
            Informe Socio-Económico Forense
          </p>
        </div>

        {/* Propuesta de valor */}
        <div className="relative my-10 max-w-md lg:my-0">
          <h1 className="font-serif text-3xl font-medium leading-snug text-marfil lg:text-[2.6rem] lg:leading-[1.15]">
            El rigor de siempre,<br />en una fracción del tiempo.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-marfil/70">
            Herramienta digital asistida con IA para profesionales de la salud mental en el área
            forense. Usted dirige el informe; la herramienta redacta el borrador.
          </p>

          <div className="mt-8 h-px w-16 bg-laton/50" />

          {/* Señales de confianza (en escritorio; en móvil se prioriza el acceso) */}
          <ul className="mt-8 hidden space-y-5 lg:block">
            <Trust
              titulo="Confidencialidad"
              texto="El contenido de los documentos no se muestra ni se divulga sin su control."
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </Trust>
            <Trust
              titulo="Usted mantiene la autoría"
              texto="La IA produce un borrador; usted revisa, ajusta, firma y somete."
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </Trust>
            <Trust
              titulo="Sin invención de datos"
              texto="El análisis se basa solo en sus fuentes y marca lo que queda pendiente."
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.873V8.688ZM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.688Z" />
            </Trust>
          </ul>
        </div>

        {/* Pie */}
        <p className="relative text-[11px] leading-relaxed text-marfil/40">
          © 2026 ToolTank. Todos los derechos reservados.
          <span className="block">Hecho en Puerto Rico.</span>
        </p>
      </section>

      {/* ── Tarjeta de acceso (marfil) ── */}
      <section className="flex items-center justify-center px-6 py-12 lg:min-h-dvh lg:px-10">
        <div className="w-full max-w-sm">
          {/* Sello / candado */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-laton/40 bg-white shadow-sm">
            <svg aria-hidden="true" className="h-5 w-5 text-laton-dark" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">Acceso a la herramienta</h2>
          <p className="mt-1.5 text-sm text-slate-500">Beta privada · acceso por invitación.</p>

          <form onSubmit={entrar} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Código de acceso
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  aria-invalid={error}
                  placeholder="Ingrese su código de acceso"
                  className="w-full rounded-md border border-laton/40 bg-white px-4 py-3 pr-11 text-[15px] text-ink placeholder:text-slate-300 transition-colors focus:border-laton focus:outline-none focus:ring-2 focus:ring-laton/30"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-laton-dark"
                >
                  {show ? (
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Código incorrecto. Verifíquelo e intente de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              style={{ boxShadow: loading || !password ? "none" : "0 9px 22px -6px rgba(180,83,9,0.55)" }}
              className="w-full rounded-md bg-[#b45309] px-4 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:bg-[#97470a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-2 border-t border-[#e7decc] pt-5 text-[12px] leading-relaxed text-slate-500">
            <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-laton" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>Acceso restringido. Si necesita credenciales, contacte al administrador.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function Trust({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-laton/30 bg-white/5">
        <svg aria-hidden="true" className="h-[18px] w-[18px] text-laton-soft" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
          {children}
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold text-marfil">{titulo}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-marfil/60">{texto}</p>
      </div>
    </li>
  );
}
