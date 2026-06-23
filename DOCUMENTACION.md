# Pericial — Documentación del proyecto

> Herramienta SaaS que genera **borradores de informes socio-económicos periciales** para profesionales del área forense (trabajadoras sociales forenses) en Puerto Rico. La profesional mantiene autoría y responsabilidad total: la herramienta produce un borrador que ella revisa, adapta, firma y somete.
>
> _Nombre "Pericial" es provisional — pendiente sesión de naming._
> _Última actualización: junio 2026._

---

## 1. Accesos (en vivo)

| | |
|---|---|
| **App en producción** | https://pericial-saas.vercel.app |
| **Contraseña de la beta** | `Forense25` |
| **Repositorio** | https://github.com/estudiobohora/pericial-saas (privado, rama `main`) |
| **Hosting** | Vercel **Pro** (proyecto bajo cuenta `estudiobohora` / `hola-6211`) |

Para usar: abrir el link → entrar con la contraseña → trabajar el caso.

---

## 2. Qué hace (flujo completo)

```
Login (contraseña)
  → 🎙️ Sube el MP3 de la entrevista   → Whisper (OpenAI) transcribe solo
  → 📎 Sube el ZIP de documentos        → Claude lee PDF/Word/imágenes/escaneados (visión)
  → ⚙️ "Generar borrador"               → Claude redacta el informe (secciones de análisis)
  → ✏️ Edita por sección + formularios
  → 👁️ Vista previa formateada
  → 📄 Exporta a Word (.doc editable)
```

Caso típico: incapacidad y designación de tutor. Volumen estimado: 4-6 informes/mes por profesional.

---

## 3. Stack tecnológico

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS v4) |
| Hosting | Vercel Pro (timeout de funciones 300s) |
| Generación del borrador | Claude API — modelo `claude-sonnet-4-6` (structured outputs) |
| Lectura de documentos | Claude (visión) — lee PDF nativos y escaneados sin OCR aparte |
| Transcripción de audio | OpenAI Whisper (`whisper-1`, language=es) |
| Export | HTML compatible con Word → `.doc` (preserva tablas) |
| Base de datos | **Ninguna aún** — el estado vive en el navegador (no se guardan casos entre sesiones) |
| Auth | Contraseña simple vía middleware (no hay cuentas todavía) |

**Costo operativo:** ~$1 por informe (Whisper ~$0.54 + Claude ~$0.26-0.46).

---

## 4. Las 6 secciones del informe (quién las llena)

Principio de diseño: **dropdown/checklist para HECHOS, texto libre para JUICIO profesional.**

| Sección | Cómo se completa |
|---|---|
| **1. Identificación** | Formulario de datos: nombre del caso, número, persona evaluada, fecha de nacimiento (calendario → calcula edad), fecha de evaluación (calendario), profesional (se recuerda solo), tipo de evaluación (dropdown), región judicial PR (dropdown), peticionario + relación (dropdown). La IA arma la prosa de la sección con estos datos. |
| **2. Documentos Revisados** | **Formulario** (no IA): tabla con Nombre · Tipo (dropdown) · Fecha · **Revisado** (checkbox). Se auto-llena al subir el ZIP. |
| **3. Metodología** | **Formulario** (no IA): tabla de técnicas (dropdown) + tabla de entrevistas (con modalidad dropdown) + observaciones. |
| **4. Transcripción** | Texto de Whisper (o pegado a mano), editable. |
| **5. Análisis** | **IA, texto libre** — Económico / Salud / Psicosocial. Editable. Es el corazón del informe. |
| **6.1 Conclusiones** | **IA, texto libre.** Editable. |
| **6.2 Recomendaciones** | **Checklist** de 8 recomendaciones estándar + texto libre. |

**Regla anti-invención (crítica):** el Análisis y las Conclusiones se derivan ÚNICA y EXCLUSIVAMENTE de la transcripción y los documentos. Donde falta información, la IA marca `[PENDIENTE: la profesional debe verificar/completar]` en vez de inventar.

---

## 5. Estructura del código (archivos clave)

```
src/
  app/
    page.tsx                  # UI principal (formulario, generación, edición, export)
    acceso/page.tsx           # Pantalla de contraseña
    layout.tsx                # Fuentes (incl. Fraunces serif) + metadata
    globals.css               # Tema "Bufete" (@theme: ink/marfil/laton) + estilos del informe
    api/
      generate/route.ts       # POST → Claude genera el borrador (structured outputs)
      extract/route.ts        # POST → lee el ZIP (JSZip + mammoth + Claude visión)
      transcribe/route.ts     # POST → Whisper transcribe el MP3
      export/route.ts         # POST → arma el .doc de Word
      acceso/route.ts         # POST → valida la contraseña, deja cookie
  lib/
    prompt.ts                 # Prompt maestro + formato de fechas + cálculo de edad
    anthropic.ts              # Cliente Claude, generación, esquema JSON, extracción de docs
    report.ts                 # Ensambla markdown del informe (secciones-formulario → tablas)
    types.ts                  # Tipos compartidos (DatosCaso, Borrador, Metodologia, etc.)
  middleware.ts               # Gate de contraseña (se activa con BETA_PASSWORD)
scripts/
  test-generate.ts           # Prueba/calentamiento local: npx tsx scripts/test-generate.ts
```

**Decisiones técnicas importantes:**
- **Structured outputs** (`output_config.format` con json_schema) garantiza JSON válido — sin esto, los saltos de línea del markdown rompen el parseo.
- Las secciones 2 y 3 se sacaron de la generación de IA (las llena la profesional); la app las inyecta en el informe en la vista previa y el export.
- El esquema JSON se "compila" en Anthropic la primera vez (~24h de caché). Por eso la 1ª generación tras un cambio de esquema tarda más (~90-105s); las siguientes ~80s.

---

## 6. Variables de entorno

Definidas en `.env.local` (local, **NO** en git) y en **Vercel → Settings → Environment Variables**:

| Variable | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | Claude (generación + lectura de docs) |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` |
| `OPENAI_API_KEY` | Whisper (transcripción de audio) |
| `BETA_PASSWORD` | Contraseña del gate (`Forense25`). Si no está definida, la app queda abierta (útil en local). |

> ⚠️ Las API keys reales NO viven en este repo — solo en `.env.local` y en Vercel. Cambiar una env var en Vercel **requiere un re-deploy** para que tome efecto.

---

## 7. Correr en local

```bash
cd pericial-saas
npm install
npm run dev          # → http://localhost:3000
```

En local, sin `BETA_PASSWORD` en `.env.local`, no pide contraseña. Botón "Cargar caso de prueba" llena un caso ficticio (doña Carmen) para probar rápido.

Prueba del motor de generación (sin la UI): `npx tsx scripts/test-generate.ts`

---

## 8. Desplegar / actualizar

El deploy es automático: **cualquier push a `main` → Vercel re-deploya solo.**

```bash
git add -A
git commit -m "..."
git push
```

- Cambios de código → push (auto-deploy).
- Cambios de env vars → ponerlos en Vercel → **Deployments → ⋯ → Redeploy** (no es automático).

---

## 9. Modelo de costos / negocio

- **Precio meta:** $49/mes por usuario.
- **Costo por informe:** ~$1 (Whisper $0.54 + Claude ~$0.30).
- **Costo variable:** ~$5/usuario/mes (5 informes).
- **Costos fijos:** Vercel Pro $20 + Claude Max (herramienta de Ángel) $100 ≈ $120-145/mes.
- **Punto de equilibrio:** ~3 usuarios de pago.
- **Margen a escala:** ~80-85%.
- Whisper es el mayor costo por informe → a escala se puede bajar con Groq/Deepgram (~10× más barato).
- **Yeida borra los audios ella misma** → el storage se mantiene mínimo (indicar en el manual).

---

## 10. Decisiones clave (log)

- **Marca:** los SaaS van bajo una marca-paraguas propia, NO bajo Estudio Bohöra (es servicios, no producto). Naming pendiente.
- **Stack:** Next.js + Vercel (no Lovable) para poder editar/deployar desde local.
- **Secciones estructuradas:** dropdowns/checklist para hechos; texto libre para análisis y conclusiones (criterio profesional).
- **Anti-invención:** reforzado — preferible análisis breve y verificable que extenso e inventado.
- **Hobby → Pro:** la generación tarda ~90-105s; Vercel Hobby corta a 60s, por eso se subió a Pro (300s).
- **Beta:** hasta 4-5 personas funcionan sin login (cada quien en su navegador). Login/cuentas es para cuando se venda.
- **Footer/posicionamiento:** "Herramienta para Profesionales en el Área Forense" (amplía más allá de trabajadoras sociales).
- **Look "Bufete":** tinta + marfil + latón + serif (Fraunces) para proyectar alto ticket ($50+/mes).

---

## 11. Pendientes / roadmap

**Para la beta (ya listo) → recoger feedback de Yeida + 2da beta.**

Luego:
1. **Manual de uso + Términos y Condiciones** (incluir: "borrar el MP3 tras transcribir", aviso de IA, consentimiento informado del cliente es responsabilidad de la TS).
2. **Sesión de naming** → marca + nombre real + dominio (ej. `pericial.estudiobohora.com` o dominio propio).
3. **Login + cuentas + guardar casos** (Supabase) → multiusuario, para anunciar/vender.
4. **Cobro/suscripción** $49/mes (Stripe/Squarespace).
5. **Export a PDF** (además de Word).
6. **Corte automático de audios >25 MB** (límite de Whisper).
7. **Borrado automático del MP3** tras transcribir.

**Deadline duro:** Congreso de TS Forense, Puerto Rico, **7 de agosto de 2026** (Yeida presenta como early adopter).

---

## 12. Notas de mantenimiento / gotchas

- **Env vars en Vercel:** cambiarlas requiere re-deploy manual.
- **Primera generación más lenta** (~90-105s) tras un cambio de esquema o cada ~24h (recompila/cachea el esquema en Anthropic). Las siguientes ~80s.
- **OneDrive** a veces bloquea archivos (`.env.local`) — cerrar editores antes de escribir.
- **Whisper:** límite 25 MB por archivo; `secure` en la cookie solo aplica en producción (https).
- **Aviso de IA dentro del informe** (no el de la app, que se quitó): se mantiene en el documento generado — es importante para el tribunal.
- **Rotación de keys:** si una key se expone, crear nueva en la consola, actualizar `.env.local` + Vercel, y revocar la vieja.
