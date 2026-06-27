# Manual de la Herramienta — Informe Socio-Económico Forense Asistido por IA

> **Pericial** *(nombre provisional)* — Herramienta digital asistida con IA para profesionales de la salud mental en el área forense en Puerto Rico.
>
> Propiedad y derechos: **Ángel Comas, Psicólogo I/O**. Hecho en Puerto Rico.
> Versión del manual: 1.0 — junio 2026.

---

## Índice

1. [Propósito y filosofía: la profesional lidera, la IA colabora](#1-propósito-y-filosofía)
2. [Qué es y qué NO es esta herramienta](#2-qué-es-y-qué-no-es)
3. [Acceso](#3-acceso)
4. [Guía de uso paso a paso](#4-guía-de-uso-paso-a-paso)
5. [La regla anti-invención y los marcadores PENDIENTE](#5-la-regla-anti-invención)
6. [Guardar, continuar y manejar varios casos](#6-guardar-continuar-y-manejar-varios-casos)
7. [Exportar el informe](#7-exportar-el-informe)
8. [Consideraciones éticas](#8-consideraciones-éticas)
9. [Consideraciones legales y de privacidad](#9-consideraciones-legales-y-de-privacidad)
10. [Manejo de datos y confidencialidad dentro de la herramienta](#10-manejo-de-datos-y-confidencialidad)
11. [Límites y alcance: responsabilidades de la profesional vs. la IA](#11-límites-y-alcance)
12. [Protocolo recomendado de grabación y consentimiento](#12-protocolo-recomendado)
13. [Checklist antes de firmar y someter](#13-checklist-antes-de-firmar)
14. [Limitaciones técnicas conocidas](#14-limitaciones-técnicas-conocidas)
15. [Descargo de responsabilidad](#15-descargo-de-responsabilidad)

---

## 1. Propósito y filosofía

Esta herramienta existe para **ahorrarle tiempo de redacción a la profesional forense**, no para sustituir su juicio clínico ni su responsabilidad profesional. El principio rector es simple:

> **La Trabajadora Social Forense (TSF) lidera el informe. La IA es un colaborador que redacta un borrador estructurado a partir de la información que la profesional provee.**

La herramienta toma la **entrevista** (transcrita) y los **documentos del caso** que la profesional ya recopiló, y produce un **borrador** organizado en las secciones de un informe pericial socio-económico. La profesional lo **revisa, corrige, completa, adapta, firma y somete**. La autoría intelectual y la responsabilidad profesional y legal del informe final recaen **íntegramente en la profesional firmante**.

El valor: pasar de ~2 días de redacción a unas pocas horas de revisión y ajuste, sin sacrificar rigor ni control profesional.

---

## 2. Qué es y qué NO es

**SÍ es:**
- Un asistente de redacción que organiza y analiza la información provista en las secciones de un informe pericial.
- Una herramienta que lee documentos (PDF, Word, imágenes, escaneados) y transcribe audio de entrevistas.
- Un punto de partida editable: cada sección se puede modificar libremente antes de exportar.

**NO es:**
- No es un perito ni un evaluador. No emite opiniones legales ni determina incapacidad: eso es competencia exclusiva del Tribunal y del juicio profesional.
- No sustituye la entrevista clínica, la observación, ni la aplicación de instrumentos por parte de la profesional.
- No inventa información. Si un dato no está en las fuentes provistas, lo marca como pendiente (ver Sección 5).
- No es, al día de hoy, una herramienta certificada HIPAA-compliant (ver Sección 9).

---

## 3. Acceso

| | |
|---|---|
| **Dirección** | https://pericial-saas.vercel.app |
| **Acceso de la beta** | mediante contraseña provista por el administrador |

Abra el enlace en un navegador, ingrese la contraseña y comience a trabajar el caso. El botón **Salir** (arriba a la derecha) cierra la sesión.

---

## 4. Guía de uso paso a paso

El flujo de trabajo va de arriba hacia abajo en la pantalla.

### 4.1 Datos del caso
Complete los campos de identificación:
- **Nombre del caso, Número de caso / tribunal, Persona evaluada.**
- **Fecha de nacimiento:** al seleccionarla, la herramienta **calcula la edad** automáticamente a la fecha de evaluación.
- **Fecha de evaluación.**
- **Profesional (nombre y licencia):** se **recuerda** entre informes para no reescribirlo.
- **Tipo de evaluación:** menú con opciones (Declaración de Incapacidad y Nombramiento de Tutor, asuntos de inmigración, familia/menores, daños, penal/forense, laboral, etc.). El análisis se adapta al tipo elegido.
- **Ubicación:** situación de vivienda de la persona evaluada (residencia propia, residencia de familia o pariente, hogar de cuidado prolongado, otro).
- **Peticionario/a y Relación con la persona evaluada.**

### 4.2 Entrevista (audio → transcripción)
- Pulse **"Subir audio(s) de la entrevista"**. Puede subir **uno o varios** archivos; cada uno se transcribe por separado y se va añadiendo, identificado por su nombre.
- La transcripción aparece en el recuadro editable. **Revísela y corríjala** (la transcripción automática puede tener errores de nombres, cifras o términos).
- También puede pegar texto directamente si ya tiene la transcripción.

### 4.3 Documentos del caso (por categoría)
Suba los documentos **del caso** organizados en tres categorías:
- **Documentos legales** (peticiones, órdenes, demandas, declaraciones juradas).
- **Documentos médicos** (informes médicos/psicológicos, récords, lista de medicamentos).
- **Documentos económicos** (estados de cuenta, ingresos, pensiones, gastos, deudas).

Cada categoría acepta un **ZIP** (varios documentos) o un **archivo suelto** (PDF, Word, imagen o texto). La herramienta lee incluso documentos **escaneados** o fotos (mediante visión por IA).

> **Importante (confidencialidad):** por diseño, el **contenido** de los documentos **no se muestra en pantalla** — solo aparece el **nombre del archivo** como etiqueta. El contenido se usa para generar el borrador y queda guardado (de forma no visible) en su propio navegador para que pueda regenerar. No suba aquí instrumentos de evaluación protegidos (ver Sección 8).

### 4.4 Generar el borrador
Pulse **"Generar borrador"**. La IA redacta el informe en ~80–105 segundos.

La herramienta **no permite generar un borrador vacío**: si faltan documentos por cargar, o no hay transcripción ni documentos, se lo indicará. **Mientras más material real del caso provea (entrevista + documentos), más profundo y específico será el análisis.**

### 4.5 Revisar y editar por sección
El borrador aparece dividido en secciones editables. Las que **redacta la IA** son borradores para su revisión; las que son **formularios** las completa la profesional:

| Sección | Quién la produce |
|---|---|
| **1. Identificación del Caso** | IA (a partir de los datos) — revisable |
| **2. Documentos Revisados** | Formulario / tabla (auto-llenada al subir; ajuste categoría, tipo y marque "Revisado") |
| **3. Metodología** | **Formulario que llena la profesional** (técnicas, entrevistas, observaciones) |
| **4. Transcripción** | IA / Whisper (organizada por hablante) — revisable |
| **5. Análisis (5.1 Económico, 5.2 Salud, 5.3 Psicosocial)** | IA — borrador a revisar |
| **6.1 Conclusiones** | IA — borrador a revisar |
| **6.2 Recomendaciones al Tribunal** | **Checklist + texto libre + fundamento**, que marca/escribe la profesional |

**Patrón de diseño:** los **hechos** se capturan con menús y casillas (para precisión); el **juicio profesional** (análisis, conclusiones) se redacta como texto que usted edita libremente.

Use **"Vista previa"** para ver el informe formateado, y **"Editar"** para volver a los campos.

---

## 5. La regla anti-invención

La herramienta está programada para **no inventar información**. El Análisis (Sección 5) y las Conclusiones (6.1) se derivan **única y exclusivamente** de la transcripción y los documentos que usted provee. Cada afirmación debe poder rastrearse a una fuente concreta (la entrevista o un documento), y la IA **cita la fuente** cuando es posible.

Donde no haya base en las fuentes, la herramienta inserta un marcador como:

> **[PENDIENTE: la profesional debe verificar/completar…]**

**Estos marcadores son intencionales.** Le indican exactamente qué falta investigar, verificar o redactar antes de firmar. **No deben quedar marcadores [PENDIENTE] en el informe final.**

---

## 6. Guardar, continuar y manejar varios casos

- **Auto-guardado:** su trabajo se guarda solo mientras escribe. El indicador muestra *"Guardado ✓ · hora"*.
- **Guardar y continuar:** puede cerrar y retomar el caso más tarde, en el mismo navegador y computadora.
- **Mis casos:** biblioteca de varios casos con nombre; cárguelos o bórrelos desde el menú.
- **+ Nuevo caso:** empieza un caso en blanco (conserva su nombre y licencia).
- **Borrar caso:** elimina el caso actual y limpia el formulario (con confirmación). Úselo si un caso se cancela, hubo un error, o desea **purgar la información** (recomendado en computadoras compartidas).

> **Nota de privacidad:** el guardado vive **solo en su navegador y computadora** (no en la nube, por ahora). Si limpia los datos del navegador o usa otro equipo, los casos no estarán allí. La versión multiusuario en la nube (con cuentas y seguridad reforzada) es un desarrollo futuro.

---

## 7. Exportar el informe

Desde la barra del borrador, **Exportar ▾** ofrece:
- **Word (.doc):** documento editable con tablas, listo para dar formato final y firmar.
- **Google Docs:** descarga el archivo y abre Google Docs para subirlo.
- **PDF:** mediante el diálogo de impresión del navegador.

El informe exportado **nunca incluye el texto crudo de los documentos** — solo la tabla de documentos revisados y el análisis profesional.

---

## 8. Consideraciones éticas

Esta herramienta se diseñó tomando como marco el **Código de Ética del Colegio de Profesionales del Trabajo Social de Puerto Rico (CPTSPR), revisión 2017/2021**. Hallazgos que fundamentan su uso:

- **Grabar entrevistas está permitido** con consentimiento informado y un protocolo adecuado — **Canon V, Art. 1(h)** (protocolo de grabación) y **Art. 1(i)** (consentimiento informado antes de grabar audio o video; que nadie ajeno acceda al material después).
- **El uso de tecnología y de la nube está contemplado**, con deberes de seguridad — **Canon V, Art. 1–4**: cifrado, contraseñas, informar los riesgos, acordar por escrito qué se transmite, y minimizar los identificadores.
- **La confidencialidad abarca la información electrónica** — **Canon III, Art. 1(b)**; se requiere autorización escrita para divulgar a terceros (Art. 1(c)).

**Sobre los instrumentos de evaluación:** la preocupación ética en torno a la protección de **tests estandarizados** aplica a esos instrumentos (que **no** se graban ni se suben a la herramienta), **no** a la entrevista, que es lo que la herramienta procesa. **No suba a la herramienta protocolos o tests psicométricos protegidos.**

---

## 9. Consideraciones legales y de privacidad

- **Estado actual (HIPAA):** la herramienta **no es HIPAA-compliant al día de hoy** (opera con APIs estándar, sin un Acuerdo de Asociado Comercial / BAA firmado). 
- **Aplicabilidad:** HIPAA puede **no aplicar** a evaluaciones forenses, ya que estas no constituyen "tratamiento" en el sentido de la ley. No obstante, el manejo prudente de la información sensible sigue siendo un deber ético.
- **Camino a producción:** el cumplimiento es **alcanzable**. Tanto Anthropic (Claude) como OpenAI (Whisper) ofrecen **BAA** para sus APIs y modalidades de retención cero de datos. La versión de producción contempla este paso junto con cuentas de usuario y almacenamiento en la nube seguro.
- **Responsabilidad del dato:** mientras tanto, la profesional es responsable de obtener los consentimientos correspondientes y de manejar el material conforme a su Código de Ética (ver Secciones 8, 10 y 12).

---

## 10. Manejo de datos y confidencialidad dentro de la herramienta

| Dato | Cómo se maneja |
|---|---|
| **Audio de la entrevista** | Se envía para transcripción y **no se almacena** en el servidor de la herramienta. **Recomendación: borre el MP3 de su equipo una vez transcrito y verificado.** |
| **Contenido de documentos** | Se usa para generar el borrador. **No se muestra en pantalla** (solo el nombre del archivo). Se guarda, de forma no visible, **solo en su navegador**. |
| **Caso completo (datos, transcripción, borrador)** | Se guarda **solo en su navegador/computadora** (almacenamiento local), no en la nube. |
| **Borrar / purgar** | Use **"Borrar caso"** para eliminar un caso y su contenido del navegador. Recomendado en equipos compartidos. |

**Buenas prácticas:** trabaje en un equipo de confianza, no comparta pantalla con el contenido a la vista, borre los audios tras transcribir, y purgue los casos que ya no necesite.

---

## 11. Límites y alcance: la profesional lidera, la IA colabora

Este es el corazón de la herramienta. Para preservar la validez del informe y la integridad profesional:

**Responsabilidades de la profesional (intransferibles):**
- Realizar la entrevista, la observación clínica y aplicar los instrumentos que correspondan.
- Obtener los consentimientos informados.
- **Verificar la exactitud** de la transcripción y de todo dato extraído de los documentos.
- **Revisar, corregir y completar** cada sección del borrador; resolver todos los [PENDIENTE].
- Aportar el **juicio clínico y profesional**: interpretación, conclusiones y recomendaciones.
- **Firmar y someter** el informe, asumiendo plena responsabilidad profesional y legal.

**Rol de la IA (colaborador, acotado):**
- Transcribir audio y leer documentos.
- Organizar la información en las secciones del informe.
- Redactar un **borrador** de análisis y conclusiones **basado solo en las fuentes provistas**.
- Señalar lo que falta con [PENDIENTE].

**La IA no:** entrevista, observa, aplica instrumentos, decide incapacidad, ni firma. Esas funciones son y seguirán siendo de la profesional. El informe que se somete al Tribunal es **un trabajo profesional de la TSF**, no un producto automatizado.

---

## 12. Protocolo recomendado de grabación y consentimiento

*(Resumen operativo; el documento formal de Consentimiento y Protocolo se provee aparte.)*

Antes de grabar y de usar la herramienta:
1. **Explique** a la persona evaluada (y a colaterales) que la entrevista será grabada y procesada con asistencia tecnológica para preparar el informe.
2. **Obtenga consentimiento informado por escrito** para grabar (audio/video) — Canon V, Art. 1(i).
3. **No grabe** la aplicación de tests estandarizados ni suba instrumentos protegidos.
4. **Borre el audio** una vez transcrito y verificado.
5. **Minimice identificadores** innecesarios en los documentos cuando sea posible.
6. **Resguarde** el equipo y los archivos conforme a su Código de Ética.

---

## 13. Checklist antes de firmar y someter

- [ ] La transcripción fue **revisada y corregida** (nombres, cifras, términos).
- [ ] La tabla de **Documentos Revisados** refleja correctamente lo que usted revisó.
- [ ] La **Metodología** (técnicas, entrevistas, observaciones) está completa y es exacta.
- [ ] Cada sección de **Análisis** refleja su criterio profesional y está respaldada por las fuentes.
- [ ] **No quedan marcadores [PENDIENTE]** sin resolver.
- [ ] Las **Conclusiones y Recomendaciones** son suyas y están fundamentadas.
- [ ] No se incluyó información inventada ni datos sin fuente.
- [ ] El documento final lleva su **firma y licencia**.

---

## 14. Limitaciones técnicas conocidas

- **Audio:** máximo 25 MB por archivo (límite de la transcripción). Entrevistas muy largas deben dividirse en varios archivos.
- **Tamaño de subida:** archivos individuales muy pesados (escaneados de alta resolución) pueden exceder el límite del servidor; suba menos a la vez o archivos más livianos por categoría.
- **Tiempo de generación:** ~80–105 segundos por informe.
- **Guardado local:** atado al navegador/computadora (no viaja entre equipos). La nube es un desarrollo futuro.
- **Integración con Google Drive:** la opción exporta el archivo y abre Google Docs; la creación directa en Drive con un clic está pendiente.

---

## 15. Descargo de responsabilidad

Esta herramienta produce **borradores** asistidos por inteligencia artificial. **No constituye asesoría legal ni una evaluación profesional por sí misma.** Todo informe generado debe ser revisado, adaptado, completado y firmado por una profesional de la salud mental en el área forense debidamente licenciada, quien asume la **total responsabilidad profesional y legal** del documento final. El uso de la herramienta no crea relación profesional alguna con el proveedor del software, y la profesional usuaria es responsable de cumplir con su Código de Ética y la normativa aplicable.

---

*© 2026 Ángel Comas, Psicólogo I/O. Todos los derechos reservados. Herramienta Digital Asistida con IA para Profesionales de la Salud Mental en el Área Forense. Hecho en Puerto Rico.*
