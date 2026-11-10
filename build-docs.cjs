#!/usr/bin/env node
/* Genera los documentos de selección a partir de assets/data.js.
   Uso: node build-docs.cjs
   Salida: docs/ (Markdown, sin dependencias). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'assets/data.js'), 'utf8'), sandbox);
const DATA = sandbox.window.BRIGADA;
const MOTOR = require('./assets/engine.js');

const DIMS = (DATA.dimensiones || []).map((d) => d.id);
const dimName = (id) => DATA.dimensiones.find((d) => d.id === id).nombre;
const cultName = (id) => DATA.culturaEjes.find((c) => c.id === id).nombre;

const money = (n) => '$' + new Intl.NumberFormat('es-CO').format(n);
const nf = (n) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n);
const bar = (n) => {
  const filled = Math.round(n / 10);
  return '█'.repeat(filled) + '·'.repeat(10 - filled);
};
const KEEP = /^(Excel|Power BI|Google Sheets|FIFO|HACCP|BPM|SENA|Microsoft)\b/;
const joinItems = (arr) =>
  arr.map((x, i) => (i === 0 || KEEP.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1))).join(' · ');
const dot = (s) => (/[.!?]$/.test(s) ? s : s + '.');
const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const OUT = path.join(__dirname, 'docs');
const dirs = ['', 'puestos', 'perfiles', 'curriculos'];
dirs.forEach((d) => fs.mkdirSync(path.join(OUT, d), { recursive: true }));

const HOY = new Date(DATA.meta.actualizado + 'T12:00:00');
const fecha = HOY.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

const PUESTOS = DATA.puestos.map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0'), file: slug(p.nombre) }));
const CANDIDATOS = DATA.candidatos.map((c, i) => {
  const p = PUESTOS.find((x) => x.id === c.puestoAplicado);
  return { ...c, num: String(i + 1).padStart(2, '0'), file: slug(c.nombre), puesto: p };
});

const D = MOTOR.diagnosticar(DATA, { noNegociables: (DATA.noNegociables || []).slice(0, 1).map((n) => n.id) });
const filaDe = (id) => D.porId[id];

/* ------------------------------ descripción ------------------------------ */
function descripcion(p) {
  const ficha = [
    ['Área', p.area],
    ['Nivel', p.nivel],
    ['Reporta a', p.reporta],
    ['Supervisa', p.supervisa],
    ['Banda salarial', `${money(p.banda[0])} a ${money(p.banda[1])} mensuales`],
    ['Vacante abierta', `${p.vacanteDias} días`],
    ['Versión', `1.0 · ${fecha}`]
  ];

  const req = p.requisitos;
  return `# ${p.nombre}

**Casa Mirador** · Bogotá · ${p.area} · ${p.nivel}

> Descripción del puesto · versión 1.0 · ${fecha}
> Documento de demostración con datos ficticios.

## Ficha del cargo

| Dato | Detalle |
| --- | --- |
${ficha.map(([k, v]) => `| **${k}** | ${v} |`).join('\n')}

## 1. Propósito del puesto

> ${p.resumen}

**Misión:** ${p.mision}

## 2. Funciones esenciales

${p.funciones.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 3. Indicadores de desempeño

| Indicador | Meta |
| --- | --- |
${p.indicadores.map((x) => `| ${x.nombre} | ${x.meta} |`).join('\n')}

## 4. Relaciones de trabajo

**Internas**
${p.relaciones.internas.map((x) => `- ${x}`).join('\n')}

**Externas**
${p.relaciones.externas.map((x) => `- ${x}`).join('\n')}

## 5. Autoridad y alcance

${p.autoridad}

## 6. Requisitos

- **Formación:** ${dot(req.formacion)}
- **Experiencia:** ${dot(req.experiencia)}
- **Conocimientos técnicos:** ${joinItems(req.tecnicos)}.
- **Certificaciones:** ${joinItems(req.certificaciones)}.

## 7. Condiciones y beneficios

- **Jornada:** ${p.condiciones.jornada}.
- **Contrato:** ${p.condiciones.contrato}.
- **Beneficios:** ${joinItems(p.condiciones.beneficios)}.

## 8. Riesgos del puesto

${p.riesgosPuesto.map((x) => `- ${x}`).join('\n')}

## 9. Ruta de incorporación (primeros 90 días)

${p.incorporacion.map((x) => `- ${x}`).join('\n')}

## 10. Prueba técnica sugerida

${p.pruebaTecnica.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## 11. Perfil requerido

El detalle de competencias, formación y anti-perfil está en el documento
[Perfil del puesto](../perfiles/${p.num}-${p.file}.md).

---

*Por qué esta vacante importa: ${p.notaOperativa}*
`;
}

/* -------------------------------- perfil -------------------------------- */
function perfil(p) {
  const niveles = DIMS.map((d) => {
    const v = p.perfil.niveles[d];
    return `| **${dimName(d)}** | ${v} | ${bar(v)} | ${p.anclas[d]} |`;
  }).join('\n');

  const competencias = p.perfil.competencias
    .map((c) => `- **${c.nombre}** (${c.nivel.toLowerCase()}). ${c.nota}`)
    .join('\n');

  return `# Perfil del puesto · ${p.nombre}

**Casa Mirador** · ${p.area} · ${p.nivel}

> Perfil del puesto · versión 1.0 · ${fecha}
> Este documento describe a la persona, no las tareas. La descripción del cargo está en
> [${p.nombre}](../puestos/${p.num}-${p.file}.md).

## 1. Resumen del perfil

${p.perfil.formacion} ${p.perfil.experiencia}

## 2. Competencias requeridas

Escala 0 a 100. El nivel es el mínimo aceptable para el puesto, no el ideal.

| Dimensión | Nivel | Escala | Qué significa en este puesto |
| --- | ---: | --- | --- |
${niveles}

## 3. Competencias conductuales

${competencias}

## 4. Rasgos observables

${p.perfil.rasgos.map((r) => `- ${r}`).join('\n')}

## 5. Lo que no buscamos

${p.perfil.antiPerfil.map((r) => `- ${r}`).join('\n')}

## 6. Cómo se evalúa

**Prueba técnica**
${p.pruebaTecnica.map((x, i) => `${i + 1}. ${x}`).join('\n')}

**Preguntas de entrevista por competencia**
${DIMS.filter((d) => p.perfil.niveles[d] >= 50)
  .map((d) => `- *${dimName(d)}:* ${DATA.preguntas[d][0]}`)
  .join('\n')}

**Pregunta de cultura**
- ${p.preguntaCultura}

## 7. Condiciones

- Banda: ${money(p.banda[0])} a ${money(p.banda[1])} mensuales.
- Reporta a: ${p.reporta}. Supervisa: ${p.supervisa.toLowerCase()}.
- Riesgo operativo de la vacante: ${p.riesgoOperativo}/100. Escasez de mercado: ${p.escasez}/100.
`;
}

/* ---------------------------------- CV ---------------------------------- */
function cv(c) {
  const exp = c.experiencia.map((e) => `### ${e.cargo}

**${e.empresa}** · ${e.periodo.replace(' - ', ' – ')}

*${e.contexto}*

${e.logros.map((l) => `- ${l}`).join('\n')}
`).join('\n');

  const form = c.formacion.map((f) => `| ${f.anio} | ${f.titulo} | ${f.institucion} |`).join('\n');
  const certs = c.certificaciones.map((x) => `- ${x.nombre}: ${x.estado}`).join('\n');
  const refs = c.referencias.length
    ? c.referencias.map((r) => `- **${r.nombre}** · ${r.cargo} · ${r.nota}`).join('\n')
    : 'Disponibles a solicitud.';
  const contacto = [c.titulo, c.ciudad, c.contacto.tel, c.contacto.mail, c.contacto.linkedin, c.contacto.instagram]
    .filter(Boolean).join(' · ');

  return `# ${c.nombre}

**${c.titular}**

${contacto}

---

## Perfil profesional

${c.resumen}

## Experiencia profesional

${exp}
## Formación

| Año | Título | Institución |
| ---: | --- | --- |
${form}

## Certificaciones

${certs}

## Habilidades

- **Técnicas:** ${joinItems(c.habilidades.tecnicas)}.
- **Gestión:** ${joinItems(c.habilidades.gestion)}.
- **Herramientas:** ${joinItems(c.habilidades.herramientas)}.

## Idiomas

${c.idiomas.join(' · ')}

## Referencias

${refs}

## Condiciones

| Dato | Detalle |
| --- | --- |
| Cargo al que aplica | ${c.puesto.nombre} |
| Expectativa salarial | ${money(c.expectativa)} mensuales |
| Disponibilidad | ${c.disponibilidad.texto} |
`;
}

/* --------------------------------- índice -------------------------------- */
function indice() {
  const filas = PUESTOS.map((p) => {
    const cand = CANDIDATOS.find((c) => c.puestoAplicado === p.id);
    const f = filaDe(cand.id);
    return `| ${p.num} | [${p.nombre}](puestos/${p.num}-${p.file}.md) | [Perfil](perfiles/${p.num}-${p.file}.md) | ${money(p.banda[0])} a ${money(p.banda[1])} | ${cand.nombre} (${nf(f.fit)} de encaje) |`;
  }).join('\n');

  const cvs = CANDIDATOS.map(
    (c) => `| ${c.num} | [${c.nombre}](curriculos/${c.num}-${c.file}.md) | ${c.titulo || ''} | ${c.puesto.nombre} | ${money(c.expectativa)} | ${c.disponibilidad.texto} |`
  ).join('\n');

  return `# Brigada de cocina · documentos de selección

**Casa Mirador** · Bogotá · ${fecha}

Cinco puestos, cinco perfiles y cinco hojas de vida para una brigada de 12 personas.
Todo el contenido es **ficticio** y sirve como material de demostración para el
diagnóstico de contratación.

## Contenido

| # | Descripción del puesto | Perfil del puesto | Banda salarial | Mejor candidato |
| ---: | --- | --- | --- | --- |
${filas}

## Hojas de vida

| # | Candidato | Título | Aplica a | Expectativa | Disponibilidad |
| ---: | --- | --- | --- | --- | --- |
${cvs}

## Cómo leer estos documentos

- **Descripción del puesto**: qué hace la persona, de qué responde, con quién se
  relaciona y cuánto se le paga. Es el documento que se publica en la vacante.
- **Perfil del puesto**: cómo es la persona que necesitamos. Competencias con
  nivel mínimo, formación, rasgos y anti-perfil. Es el documento que usa quien
  entrevista, no se publica.
- **Hoja de vida**: el documento que se envía. Una página, sin anexos internos.
  Las notas del proceso y los riesgos viven en la aplicación, no en el CV.

## Resumen del contexto

- Operación: ${DATA.empresa.tipo}, ${DATA.empresa.cubiertos} cubiertos, brigada de ${DATA.empresa.brigada}.
- Ticket promedio: ${money(DATA.empresa.ticket)}. Food cost actual: ${nf(DATA.empresa.foodCost)}%. Merma: ${nf(DATA.empresa.merma)}%.
- Rotación anual: ${DATA.empresa.rotacion}%.
- Valores declarados: ${DATA.empresa.valores.join('; ')}.
- Dolor actual: costos fuera de control, con food cost y merma por encima del objetivo.

## Documentos de apoyo

- [Matriz comparativa de perfiles](matriz-perfiles.md): las cinco fichas en una sola tabla.
- **Hojas de vida en PDF**: una por persona, en la carpeta curriculos/ del proyecto.
`;
}

/* -------------------------------- matriz -------------------------------- */
function matriz() {
  const head = `| Dimensión | ${PUESTOS.map((p) => p.nombre).join(' | ')} |`;
  const sep = `| --- | ${PUESTOS.map(() => '---:').join(' | ')} |`;
  const body = DIMS.map((d) => `| ${dimName(d)} | ${PUESTOS.map((p) => p.perfil.niveles[d]).join(' | ')} |`).join('\n');

  const cult = DATA.culturaEjes
    .map((e) => `| ${e.nombre} | ${DATA.empresa.cultura[e.id]} | ${e.desc} |`)
    .join('\n');

  const bandas = PUESTOS.map(
    (p) => `| ${p.nombre} | ${money(p.banda[0])} | ${money(p.banda[1])} | ${p.vacanteDias} | ${p.riesgoOperativo} | ${p.escasez} |`
  ).join('\n');

  return `# Matriz comparativa de perfiles

**Casa Mirador** · ${fecha}

## Competencias por puesto (nivel mínimo 0 a 100)

${head}
${sep}
${body}

## Cultura de la empresa

| Eje | Nivel | Qué mide |
| --- | ---: | --- |
${cult}

## Bandas y riesgo de la vacante

| Puesto | Banda mínima | Banda máxima | Días abierta | Riesgo operativo | Escasez de mercado |
| --- | ---: | ---: | ---: | ---: | ---: |
${bandas}

## Cómo se interpreta

- Un nivel de 90 en **Orden** para el steward no significa que sea "mejor" que un
  62 del cocinero B: cada puesto pesa distinto.
- Las bandas salariales son mensuales, en pesos colombianos, y corresponden a la
  operación descrita. No incluyen bonificaciones variables.
- El **riesgo operativo** mide qué pasa si la vacante sigue abierta. La
  **escasez** mide qué tan difícil es reponer el perfil en el mercado local.
`;
}

/* ------------------------------- escribir ------------------------------- */
let escritos = [];
PUESTOS.forEach((p) => {
  const a = path.join(OUT, 'puestos', `${p.num}-${p.file}.md`);
  const b = path.join(OUT, 'perfiles', `${p.num}-${p.file}.md`);
  fs.writeFileSync(a, descripcion(p), 'utf8');
  fs.writeFileSync(b, perfil(p), 'utf8');
  escritos.push(a, b);
});
CANDIDATOS.forEach((c) => {
  const a = path.join(OUT, 'curriculos', `${c.num}-${c.file}.md`);
  fs.writeFileSync(a, cv(c), 'utf8');
  escritos.push(a);
});
fs.writeFileSync(path.join(OUT, 'README.md'), indice(), 'utf8');
fs.writeFileSync(path.join(OUT, 'matriz-perfiles.md'), matriz(), 'utf8');

console.log('Documentos generados en docs/');
escritos.concat([path.join(OUT, 'README.md'), path.join(OUT, 'matriz-perfiles.md')])
  .forEach((f) => console.log('  ' + path.relative(OUT, f) + ' · ' + fs.statSync(f).size + ' bytes'));
