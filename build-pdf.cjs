#!/usr/bin/env node
/* Dossier imprimible: docs/completo.md -> HTML -> PDF.
   Uso:
     node build-pdf.cjs             dossier con un documento por página
     node build-pdf.cjs --compacto  versión continua, para leer de corrido
   Sin dependencias de npm. La tabla de contenido se resuelve en dos pasadas:
   se maqueta, se leen las páginas reales del PDF y se vuelve a maquetar. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const DOCS = path.join(__dirname, 'docs');
const MD_PATH = path.join(DOCS, 'completo.md');
const COMPACTO = process.argv.includes('--compacto');
const HTML_OUT = COMPACTO ? path.join(DOCS, '.compacto.html') : path.join(DOCS, 'imprimible.html');
const PDF_OUT = COMPACTO ? path.join(DOCS, 'dossier-compacto.pdf') : path.join(DOCS, 'dossier-brigada.pdf');
const TMP_PDF = path.join(DOCS, '.toc-pass.pdf');

/* datos, solo para saber qué título es puesto, perfil o hoja de vida */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'assets/data.js'), 'utf8'), sandbox);
const DATA = sandbox.window.BRIGADA;
const MOTOR = require('./assets/engine.js');
const DIAG = MOTOR.diagnosticar(DATA, {});
const SET_PUESTOS = new Set(DATA.puestos.map((p) => p.nombre));
const SET_CV = new Set(DATA.candidatos.map((c) => c.nombre));

const md = fs.readFileSync(MD_PATH, 'utf8');
const lines = md.split('\n');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

const h1 = lines
  .map((l) => l)
  .filter((l) => /^#\s+/.test(l))
  .map((l, i) => ({ n: i, title: l.replace(/^#\s+/, '').trim() }))
  .slice(1); // la portada no se indexa

const TOC_DEFS = [
  ['puestos', 'Descripciones de puesto'],
  ['perfiles', 'Perfiles de puesto'],
  ['cv', 'Hojas de vida']
];

function grupoDe(title) {
  if (/^Perfil del puesto/.test(title)) return 'perfiles';
  if (SET_CV.has(title)) return 'cv';
  return 'puestos';
}

const money = (n) => '$' + new Intl.NumberFormat('es-CO').format(n);
const nf = (n) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n);

/* --- hoja de vida de una página ----------------------------------------- */
function cv1(c) {
  const f = DIAG.porId[c.id];
  const contacto = [c.ciudad, c.contacto.tel, c.contacto.mail].filter(Boolean).join(' · ') +
    (c.contacto.linkedin ? `<br>${c.contacto.linkedin}` : '');
  const jobs = c.experiencia.map((e) => `
    <h3>${esc(e.cargo)}</h3>
    <p class="job-meta"><b>${esc(e.empresa)}</b> · ${esc(e.periodo.replace(' - ', ' – '))}</p>
    <p class="job-ctx">${esc(e.contexto)}</p>
    <ul>${e.logros.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`).join('');
  return `<section class="cv1">
  <header>
    <h1>${esc(c.nombre)}</h1>
    <p class="titular">${esc(c.titular)}</p>
    <p class="contacto">${contacto}</p>
  </header>
  <div class="cv-cols">
    <div class="cv-main">
      <h2>Perfil profesional</h2>
      <p>${esc(c.resumen)}</p>
      <h2>Experiencia profesional</h2>
      ${jobs}
    </div>
    <aside class="cv-side">
      <h2>Formación</h2>
      <ul class="plain">${c.formacion.map((x) => `<li><b>${x.anio}</b> ${esc(x.titulo)}<br><span class="muted">${esc(x.institucion)}</span></li>`).join('')}</ul>
      <h2>Certificaciones</h2>
      <ul class="plain">${c.certificaciones.map((x) => `<li>${esc(x.nombre)} · <span class="muted">${esc(x.estado)}</span></li>`).join('')}</ul>
      <h2>Habilidades</h2>
      <p class="skills"><b>Técnicas.</b> ${esc(c.habilidades.tecnicas.join(' · '))}</p>
      <p class="skills"><b>Gestión.</b> ${esc(c.habilidades.gestion.join(' · '))}</p>
      <p class="skills"><b>Herramientas.</b> ${esc(c.habilidades.herramientas.join(' · '))}</p>
      <h2>Idiomas</h2>
      <p>${esc(c.idiomas.join(' · '))}</p>
      <h2>Referencias</h2>
      <ul class="plain">${c.referencias.map((r) => `<li><b>${esc(r.nombre)}</b><br><span class="muted">${esc(r.cargo)}</span></li>`).join('')}</ul>
      <h2>Condiciones</h2>
      <p>Expectativa: <b>${money(c.expectativa)}</b><br>Disponibilidad: <b>${esc(c.disponibilidad.texto)}</b></p>
    </aside>
  </div>
  <div class="cv-annex">
    <p class="annex-title">Anexo del proceso · no forma parte de la hoja de vida</p>
    <div class="annex-cols">
      <div>
        <p class="annex-h">Logros a verificar</p>
        <ul>${c.logrosClave.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <p class="annex-h">Riesgos detectados</p>
        <ul>${c.riesgos.map((r) => `<li><b>${esc(r.tipo)}.</b> ${esc(r.texto)}</li>`).join('')}</ul>
      </div>
      <div>
        <p class="annex-h">Notas para el reclutador</p>
        <ul>${c.notas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <p class="annex-h">Verificación concreta</p>
        <p>${esc(c.verificacion)}</p>
        <p class="annex-h">Lectura del modelo · puesto ${esc(c.puestoAplicado === 'asistente-admin' ? 'Asistente de Chef Ejecutivo' : DATA.puestos.find((p) => p.id === c.puestoAplicado).nombre)}</p>
        <p>Encaje ${nf(f.fit)} · Cultura ${nf(f.cultura)} · Entrevista ${nf(f.prioridad)}. ${f.gaps.length ? 'Brechas: ' + f.gaps.map((g) => `${esc(DATA.dimensiones.find((d) => d.id === g.dim).nombre)} (${g.have}/${g.req})`).join(', ') + '.' : 'Sin brechas frente al perfil.'} ${f.salario.exceso > 0 ? 'Salario ' + nf(f.salario.exceso) + '% sobre el tope.' : 'Salario dentro de banda.'}</p>
      </div>
    </div>
  </section>`;
}

/* --- conversor mínimo de Markdown --------------------------------------- */
function toHtml(pages) {
  const out = [];
  let i = 0;
  let inList = null;
  let para = [];

  const flushPara = () => {
    if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
  };
  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
  const openList = (tag) => { if (inList !== tag) { closeList(); out.push(`<${tag}>`); inList = tag; } };

  const toc = () => {
    const grupos = { puestos: [], perfiles: [], cv: [] };
    h1.forEach((h) => {
      grupos[grupoDe(h.title)].push({ ...h, pagina: pages && pages[h.n] ? pages[h.n] : null });
    });
    return `<nav class="toc" aria-label="Contenido">
      <h2>Contenido</h2>
      ${TOC_DEFS.filter(([id]) => grupos[id].length).map(([id, nombre]) => `<div class="toc-group">
        <p class="toc-title">${nombre}</p>
        <ol>${grupos[id].map((it) => `<li><span class="t">${esc(it.title.replace(/^Perfil del puesto · /, ''))}</span><span class="dots"></span><span class="p">${it.pagina || '·'}</span></li>`).join('')}</ol>
      </div>`).join('')}
      <p class="toc-note">Cada documento empieza en una página nueva. Los anexos internos de las hojas de vida no se comparten con el candidato.</p>
    </nav>`;
  };

  while (i < lines.length) {
    const t = lines[i].trim();

    if (!t) { flushPara(); closeList(); i++; continue; }

    if (t === '<!-- TOC -->') { flushPara(); closeList(); out.push(toc()); i++; continue; }

    if (/^---+$/.test(t)) { flushPara(); closeList(); i++; continue; }

    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara(); closeList();
      const titulo = h[2].trim();
      if (h[1].length === 1 && SET_CV.has(titulo)) {
        const cand = DATA.candidatos.find((c) => c.nombre === titulo);
        out.push(cv1(cand));
        i++;
        while (i < lines.length && !/^#\s+/.test(lines[i])) i++;
        continue;
      }
      out.push(`<h${h[1].length}>${inline(titulo)}</h${h[1].length}>`);
      i++;
      continue;
    }

    if (t.startsWith('|')) {
      flushPara(); closeList();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const cells = rows.map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      const head = cells[0];
      const body = cells.slice(1).filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
      out.push('<table>');
      out.push('<thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead>');
      out.push('<tbody>' + body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody>');
      out.push('</table>');
      continue;
    }

    if (t.startsWith('> ')) {
      flushPara(); closeList();
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${buf.map((b) => `<p>${inline(b)}</p>`).join('')}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(t)) {
      flushPara(); openList('ul');
      out.push(`<li>${inline(t.replace(/^[-*]\s+/, ''))}</li>`);
      i++; continue;
    }

    if (/^\d+\.\s+/.test(t)) {
      flushPara(); openList('ol');
      out.push(`<li>${inline(t.replace(/^\d+\.\s+/, ''))}</li>`);
      i++; continue;
    }

    para.push(t);
    i++;
  }
  flushPara();
  closeList();
  return out.join('\n');
}

function css() {
  const compacto = COMPACTO ? `
  body { font-size: 10pt; }
  h1 { font-size: 17pt; margin-top: 9mm; margin-bottom: 3mm; padding-bottom: 2mm; break-before: auto; }
  h1:first-of-type { margin-top: 0; break-before: auto; }
  h2 { font-size: 11.6pt; margin-top: 5.5mm; }
  h3 { font-size: 10.2pt; margin-top: 3.5mm; }
  table { font-size: 8.7pt; margin: 1.5mm 0 3mm; }
  th, td { padding: 1.2mm 1.8mm; }
  blockquote { padding: 2mm 0 2mm 3.5mm; margin-bottom: 2.5mm; }
  .toc { break-before: page; }
` : '';
  return `
  @font-face { font-family: 'Archivo'; font-weight: 400 700; font-display: block;
    src: url('../assets/fonts/Archivo-400-700-latin.woff2') format('woff2'); }
  @font-face { font-family: 'Plex Mono'; font-weight: 400; font-display: block;
    src: url('../assets/fonts/IBMPlexMono-400-latin.woff2') format('woff2'); }
  @page { size: A4; margin: 18mm 16mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #14181a; font: 10.4pt/1.5 'Archivo', 'Liberation Sans', Arial, sans-serif; }
  .sheet { max-width: 174mm; margin: 0 auto; }
  h1 { font-size: 24pt; line-height: 1.05; letter-spacing: -.02em; margin: 0 0 4mm; padding-bottom: 3mm; border-bottom: 1.2pt solid #14181a; break-before: page; }
  h1:first-of-type { break-before: auto; }
  h2 { font-size: 12.5pt; margin: 7mm 0 2.5mm; letter-spacing: -.01em; break-after: avoid; }
  h3 { font-size: 10.6pt; margin: 4.5mm 0 1.5mm; break-after: avoid; }
  p { margin: 0 0 2.2mm; }
  strong { font-weight: 650; }
  em { color: #4a5152; }
  blockquote { margin: 0 0 3mm; padding: 3mm 0 3mm 4mm; border-left: 2pt solid #2c6a4e; background: #f4f6f3; }
  blockquote p { margin: 0; font-size: 11pt; }
  table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 9.2pt; break-inside: avoid; }
  th, td { text-align: left; vertical-align: top; padding: 1.6mm 2mm; border-bottom: .4pt solid #c8cdc6; }
  th { font-size: 8.2pt; text-transform: uppercase; letter-spacing: .08em; color: #5a6260; border-bottom: .8pt solid #14181a; }
  td:first-child { white-space: nowrap; }
  ul, ol { margin: 0 0 3mm; padding-left: 5mm; }
  li { margin: 0 0 1.1mm; }
  hr { border: 0; border-top: .4pt solid #c8cdc6; margin: 6mm 0; }
  code { font-family: 'Plex Mono', monospace; font-size: 9pt; }

  /* hoja de vida de una página */
  .cv1 { break-before: page; font-size: 9.3pt; line-height: 1.42; }
  .cv1 header { border-bottom: 1pt solid #14181a; padding-bottom: 2mm; margin-bottom: 3mm; }
  .cv1 h1 { font-size: 19pt; border: 0; margin: 0; padding: 0; break-before: auto; line-height: 1.05; letter-spacing: -.02em; }
  .cv1 .titular { font-size: 9.4pt; color: #3d4644; margin: 1mm 0 0; }
  .cv1 .contacto { font-family: 'Plex Mono', monospace; font-size: 7.5pt; color: #5b6462; margin-top: 1.2mm; }
  .cv-cols { display: grid; grid-template-columns: 1.55fr 1fr; gap: 7mm; }
  .cv1 h2 { font-family: 'Plex Mono', monospace; font-size: 7.2pt; letter-spacing: .12em; text-transform: uppercase; color: #5b6462; border-bottom: .4pt solid #c8cdc6; padding-bottom: .8mm; margin: 3.4mm 0 1.4mm; break-after: avoid; }
  .cv-main > h2:first-child, .cv-side > h2:first-child { margin-top: 0; }
  .cv1 h3 { font-size: 9.6pt; margin: 2.6mm 0 .4mm; break-after: avoid; }
  .cv1 p { margin: 0; font-size: 9.3pt; }
  .cv1 .job-meta { font-size: 8.6pt; color: #3d4644; }
  .cv1 .job-ctx { font-size: 8.2pt; color: #6b7370; margin-top: .4mm; }
  .cv1 ul { margin: .8mm 0 0; padding-left: 3.6mm; }
  .cv1 li { margin-bottom: .5mm; font-size: 9.1pt; }
  .cv1 .plain { list-style: none; padding-left: 0; }
  .cv1 .plain li { margin-bottom: 1mm; }
  .cv1 .muted { color: #6b7370; }
  .cv1 .skills { font-size: 8.8pt; margin-bottom: 1.2mm; }
  .cv-annex { margin-top: 3.5mm; border-top: .8pt solid #14181a; padding-top: 2mm; font-size: 7.6pt; }
  .annex-title { font-family: 'Plex Mono', monospace; font-size: 6.8pt; letter-spacing: .12em; text-transform: uppercase; color: #9c3d24; margin-bottom: 1.5mm; }
  .annex-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .annex-h { font-weight: 650; font-size: 7.4pt; margin-top: 1.4mm; }
  .cv-annex ul { margin: .5mm 0 0; padding-left: 3.2mm; }
  .cv-annex li { font-size: 7.4pt; margin-bottom: .4mm; }
  .cv-annex p { font-size: 7.4pt; }

  .toc { break-before: page; break-after: page; }
  .toc h2 { font-size: 20pt; letter-spacing: -.02em; border-bottom: 1.2pt solid #14181a; padding-bottom: 2.5mm; margin: 0 0 8mm; }
  .toc-group { margin-bottom: 7mm; }
  .toc-title { font-family: 'Plex Mono', monospace; font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: #5b6462; margin: 0 0 2mm; }
  .toc ol { list-style: none; padding: 0; margin: 0; }
  .toc li { display: flex; align-items: baseline; gap: 2mm; padding: 1.9mm 0; border-bottom: .3pt dotted #b9c0bb; font-size: 10.6pt; }
  .toc li .t { max-width: 128mm; }
  .toc li .dots { flex: 1; }
  .toc li .p { font-family: 'Plex Mono', monospace; font-size: 9.4pt; color: #2c6a4e; }
  .toc-note { margin-top: 8mm; font-size: 8.6pt; color: #6b7370; max-width: 120mm; }
  .foot { margin-top: 10mm; padding-top: 3mm; border-top: .4pt solid #c8cdc6; font-size: 8pt; color: #6b7370; }
${compacto}`;
}

function buildHtml(pages) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<title>Brigada de cocina · Casa Mirador</title>
<style>${css()}</style>
</head><body><div class="sheet">
${toHtml(pages)}
</div></body></html>`;
}

function render(htmlPath, pdfPath) {
  const browsers = ['brave-browser', 'chromium-browser', 'chromium'];
  for (const b of browsers) {
    try {
      execFileSync(b, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer',
        `--print-to-pdf=${pdfPath}`, 'file://' + htmlPath
      ], { stdio: 'ignore', timeout: 120000 });
      return true;
    } catch (e) { /* siguiente navegador */ }
  }
  return false;
}

function medirPaginas(pdf) {
  try {
    const txt = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    const paginas = txt.split('\f').map((p) => p.replace(/\s+/g, ' ').trim());
    const mapa = {};
    let cursor = 2; // salta portada e índice
    h1.forEach((h) => {
      const needle = h.title.replace(/\s+/g, ' ').trim();
      for (let i = cursor; i < paginas.length; i++) {
        if (paginas[i].indexOf(needle) !== -1) { mapa[h.n] = i + 1; cursor = i; break; }
      }
    });
    return mapa;
  } catch (e) {
    return {};
  }
}

/* pasada 1: maqueta sin números y mide sobre el PDF real */
fs.writeFileSync(HTML_OUT, buildHtml(null), 'utf8');
const ok = render(HTML_OUT, TMP_PDF);
const mapa = ok ? medirPaginas(TMP_PDF) : {};

/* pasada 2: maqueta final con los números */
fs.writeFileSync(HTML_OUT, buildHtml(mapa), 'utf8');
const ok2 = render(HTML_OUT, PDF_OUT);
if (!ok2) console.log('Sin navegador headless: abre ' + path.basename(HTML_OUT) + ' e imprime a PDF.');
else console.log('PDF: ' + path.relative(__dirname, PDF_OUT));
console.log('Índice: ' + Object.keys(mapa).length + ' de ' + h1.length + ' documentos con página.');
try { fs.unlinkSync(TMP_PDF); } catch (e) { /* nada */ }
if (COMPACTO) { try { fs.unlinkSync(HTML_OUT); } catch (e) { /* nada */ } }
