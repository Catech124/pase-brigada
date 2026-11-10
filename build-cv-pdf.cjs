#!/usr/bin/env node
/* Genera una hoja de vida en PDF por candidato, en maqueta de documento real:
   una columna, blanco y negro, sin adornos. Salida: curriculos/
   Uso: node build-cv-pdf.cjs */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'assets/data.js'), 'utf8'), sandbox);
const DATA = sandbox.window.BRIGADA;

const OUT = path.join(__dirname, 'curriculos');
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n) => '$' + new Intl.NumberFormat('es-CO').format(n);
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function html(c) {
  const contacto = [c.titulo, c.ciudad, c.contacto.tel, c.contacto.mail, c.contacto.linkedin, c.contacto.instagram]
    .filter(Boolean).map(esc).join(' · ');

  const empleos = c.experiencia.map((e) => `
    <article class="job">
      <div class="job-head"><strong>${esc(e.cargo)}</strong><span>${esc(e.periodo.replace(' - ', ' – '))}</span></div>
      <p class="emp">${esc(e.empresa)}</p>
      <p class="ctx">${esc(e.contexto)}</p>
      <ul>${e.logros.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    </article>`).join('');

  const form = c.formacion.map((f) => `<li><b>${esc(f.titulo)}</b> · ${esc(f.institucion)} <span class="ano">${f.anio}</span></li>`).join('');
  const certs = c.certificaciones.map((x) => `<li>${esc(x.nombre)} · ${esc(x.estado)}</li>`).join('');
  const refs = c.referencias.length
    ? `<ul class="plain">${c.referencias.map((r) => `<li><b>${esc(r.nombre)}</b> · ${esc(r.cargo)} · ${esc(r.nota)}</li>`).join('')}</ul>`
    : '<p>Disponibles a solicitud.</p>';

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<title>${esc(c.nombre)} · hoja de vida</title>
<style>
  @font-face { font-family: 'Archivo'; font-weight: 400 700; font-display: block;
    src: url('../assets/fonts/Archivo-400-700-latin.woff2') format('woff2'); }
  @page { size: A4; margin: 16mm 17mm 15mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Archivo', 'Liberation Sans', Arial, sans-serif; font-size: 9.3pt; line-height: 1.36; color: #1a1a1a; }
  header { border-bottom: 1.1pt solid #1a1a1a; padding-bottom: 3mm; margin-bottom: 3.5mm; }
  h1 { font-size: 19pt; line-height: 1.05; letter-spacing: -.01em; margin: 0; font-weight: 700; }
  .role { font-size: 10.4pt; margin: 1.2mm 0 1.4mm; color: #222; }
  .contact { font-size: 8.6pt; color: #555; line-height: 1.4; }
  h2 { font-size: 8.4pt; text-transform: uppercase; letter-spacing: .13em; color: #222;
       border-bottom: .5pt solid #9a9a9a; padding-bottom: 1mm; margin: 3.6mm 0 1.8mm; break-after: avoid; }
  p { margin: 0 0 1.4mm; }
  ul { margin: 0.6mm 0 0; padding-left: 4mm; }
  li { margin: 0 0 .55mm; }
  .plain { list-style: none; padding-left: 0; }
  .plain li { margin-bottom: 1mm; }
  .job { margin-bottom: 3.2mm; break-inside: avoid; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm; }
  .job-head strong { font-size: 10pt; }
  .job-head span { font-size: 8.6pt; color: #555; white-space: nowrap; }
  .emp { font-size: 9.6pt; margin: .3mm 0 0; }
  .ctx { font-size: 8.7pt; color: #666; font-style: italic; margin: .6mm 0 1mm; }
  .ano { color: #777; float: right; font-size: 8.5pt; }
  .skills p { margin-bottom: 1.2mm; }
  .certs { margin-top: 1.4mm; }
  .skills b { font-weight: 650; }
  .foot { margin-top: 4mm; font-size: 8pt; color: #777; }
</style></head>
<body>
  <header>
    <h1>${esc(c.nombre)}</h1>
    <p class="role">${esc(c.titular)}</p>
    <p class="contact">${contacto}</p>
    <p class="contact">Disponibilidad ${esc(c.disponibilidad.texto.toLowerCase())} · Expectativa salarial ${money(c.expectativa)}</p>
  </header>

  <section>
    <h2>Perfil profesional</h2>
    <p>${esc(c.resumen)}</p>
  </section>

  <section>
    <h2>Experiencia profesional</h2>
    ${empleos}
  </section>

  <section>
    <h2>Formación y certificaciones</h2>
    <ul class="plain">${form}</ul>
    <p class="certs"><b>Certificaciones.</b> ${c.certificaciones.map((x) => esc(x.nombre) + ' (' + esc(x.estado) + ')').join(' · ')}</p>
  </section>

  <section class="skills">
    <h2>Habilidades e idiomas</h2>
    <p><b>Técnicas.</b> ${esc(c.habilidades.tecnicas.join(' · '))}</p>
    <p><b>Gestión.</b> ${esc(c.habilidades.gestion.join(' · '))}</p>
    <p><b>Herramientas.</b> ${esc(c.habilidades.herramientas.join(' · '))}</p>
    <p><b>Idiomas.</b> ${esc(c.idiomas.join(' · '))}</p>
  </section>

  <section>
    <h2>Referencias</h2>
    ${refs}
  </section>
</body></html>`;
}

function imprimir(htmlStr, pdfPath) {
  const tmp = path.join(OUT, '.tmp-cv.html');
  fs.writeFileSync(tmp, htmlStr, 'utf8');
  const browsers = ['brave-browser', 'chromium-browser', 'chromium'];
  for (const b of browsers) {
    try {
      execFileSync(b, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer',
        `--print-to-pdf=${pdfPath}`, 'file://' + tmp
      ], { stdio: 'ignore', timeout: 90000 });
      fs.unlinkSync(tmp);
      return true;
    } catch (e) { /* siguiente */ }
  }
  try { fs.unlinkSync(tmp); } catch (e) { /* nada */ }
  return false;
}

let ok = 0;
const lineas = [];
DATA.candidatos.forEach((c, i) => {
  const num = String(i + 1).padStart(2, '0');
  const file = path.join(OUT, `CV-${num}-${slug(c.nombre)}.pdf`);
  if (!imprimir(html(c), file)) { console.log('Falló:', c.nombre); return; }
  let paginas = '?';
  try {
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    const m = info.match(/^Pages:\s+(\d+)/m);
    paginas = m ? m[1] : '?';
  } catch (e) { /* sin pdfinfo */ }
  ok++;
  lineas.push(`| ${num} | [${c.nombre}](CV-${num}-${slug(c.nombre)}.pdf) | ${esc(c.titulo)} | ${paginas} |`);
  console.log(`CV-${num}-${slug(c.nombre)}.pdf · ${paginas} página(s) · ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
});

fs.writeFileSync(path.join(OUT, 'LEEME.md'), `# Currículas

**Casa Mirador** · ${DATA.meta.actualizado}

Cinco hojas de vida, una por persona. Una página cada una, sin anexos internos.
Los datos son ficticios.

| # | Candidato | Título | Páginas |
| ---: | --- | --- | ---: |
${lineas.join('\n')}

Las versiones editables están en \`docs/curriculos/\` y los datos de origen en
\`assets/data.js\`.
`, 'utf8');

console.log(`\n${ok} de ${DATA.candidatos.length} currículas generadas en curriculos/`);
