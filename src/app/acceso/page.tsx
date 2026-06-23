"use client";

import { useState } from "react";

export default function Acceso() {
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-lg border border-[#e7decc] bg-white p-6 shadow-sm">
        <div className="mb-1 font-serif text-2xl font-semibold tracking-tight text-ink">Pericial</div>
        <p className="mb-5 text-sm text-laton-dark">Acceso beta privado</p>

        <label className="mb-1 block text-xs font-medium text-slate-600">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-laton focus:outline-none focus:ring-1 focus:ring-laton"
        />

        {error && <p className="mt-2 text-sm text-red-700">Contraseña incorrecta.</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded bg-ink px-4 py-2.5 text-sm font-medium text-marfil hover:bg-ink-soft disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
