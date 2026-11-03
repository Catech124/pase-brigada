#!/usr/bin/env node
/* Prueba de interfaz sin dependencias: Brave headless + CDP por WebSocket.
   Genera capturas por sección en shots/ y reporta errores de consola.
   Uso: node test-ui.cjs [url] */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 9400 + Math.floor(Math.random() * 400);
const PROFILE = '/tmp/pase-cdp-' + process.pid + '-' + Date.now();
const URL = process.argv[2] || 'file://' + path.join(__dirname, 'index.html') + '?tema=light';
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const get = (p) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
  }).on('error', rej);
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const proc = spawn('brave-browser', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + PROFILE, 'about:blank'
  ], { stdio: 'ignore', detached: true });

  let page = null;
  for (let i = 0; i < 60; i++) {
    try {
      const list = await get('/json/list');
      page = list.find((t) => t.type === 'page');
      if (page) break;
    } catch (e) { /* arrancando */ }
    await wait(200);
  }
  if (!page) { console.error('No se pudo abrir el navegador'); proc.kill(); process.exit(1); }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map();
  const events = [];
  let id = 0;
  let abierto = false;
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) events.push(m);
  };
  ws.onopen = () => { abierto = true; };
  while (!abierto) await wait(30);

  const send = (method, params) => new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params: params || {} }));
  });
  const evaluate = async (expression, awaitPromise) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: !!awaitPromise });
    if (r.result && r.result.exceptionDetails) return { error: r.result.exceptionDetails.text };
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  const capturar = async (name) => {
    const s = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(s.result.data, 'base64'));
  };
  const capturarEn = async (name, selector) => {
    await evaluate("(function(){document.documentElement.style.scrollBehavior='auto';var e=document.querySelector('" + selector + "');if(e){var y=e.getBoundingClientRect().top+window.scrollY-80;window.scrollTo(0,y);}})()");
    await wait(350);
    await capturar(name);
  };
  const errores = () => events.filter((e) =>
    e.method === 'Runtime.exceptionThrown' ||
    (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') ||
    (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
  ).map((e) => {
    if (e.method === 'Runtime.exceptionThrown') return (e.params.exceptionDetails.exception && e.params.exceptionDetails.exception.description) || e.params.exceptionDetails.text;
    if (e.method === 'Log.entryAdded') return e.params.entry.text;
    return (e.params.args || []).map((a) => a.value || a.description).join(' ');
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: URL });
  await wait(1200);

  const informe = {};
  informe.titulo = await evaluate('document.title');
  informe.empresa = await evaluate("document.getElementById('topEmpresa').textContent");
  informe.nav = await evaluate("document.querySelectorAll('#nav [data-nav]').length");
  informe.rank = await evaluate("document.querySelectorAll('.rank-row').length");
  informe.radar = await evaluate("document.querySelectorAll('svg.radar').length");
  informe.crit = await evaluate("document.querySelectorAll('.crit-row').length");
  informe.veredictos = await evaluate("document.querySelectorAll('.card-main, .card-mini').length");

  await capturar('01-resumen-top');
  await capturarEn('02-resumen-veredictos', '.veredictos');
  await capturarEn('03-resumen-ranking', '.rank');
  await capturarEn('04-resumen-detalle', '#plan');

  const vistas = ['puestos', 'candidatos', 'matriz', 'datos', 'metodo'];
  for (let i = 0; i < vistas.length; i++) {
    await evaluate("document.querySelector('#nav [data-nav=\"" + vistas[i] + "\"]').click()");
    await wait(500);
    informe[vistas[i]] = await evaluate("document.querySelectorAll('#vista .sec, #vista .hero').length");
    if (vistas[i] === 'matriz') informe.celdas = await evaluate("document.querySelectorAll('.matriz .cell').length");
    if (vistas[i] === 'candidatos') informe.cv = await evaluate("document.querySelectorAll('.cv').length");
    await capturar('0' + (i + 5) + '-' + vistas[i]);
  }

  await evaluate("document.querySelector('#nav [data-nav=\"resumen\"]').click()");
  await wait(300);
  await evaluate("var s=document.querySelector('[data-ctx=\"dolor\"]'); s.value='creatividad'; s.dispatchEvent(new Event('change',{bubbles:true}))");
  await wait(500);
  informe.dolor = await evaluate("document.querySelector('#brief select').value");
  informe.trasCambio = await evaluate("document.querySelector('.card-main h3').textContent");
  informe.criticaTrasCambio = await evaluate("document.querySelectorAll('.card-mini .who')[0].textContent");
  await capturarEn('10-resumen-creatividad', '.veredictos');

  await evaluate("document.querySelector('[data-tema]').click()");
  await wait(400);
  informe.tema = await evaluate("document.documentElement.getAttribute('data-theme')");
  await capturar('11-oscuro');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await wait(500);
  informe.movil = await evaluate("(function(){var r=document.querySelector('.rail'),t=document.querySelector('.top');var cs=getComputedStyle(r);return {scrollY:window.scrollY,rail:r.getBoundingClientRect().toJSON(),top:t.getBoundingClientRect().toJSON(),pos:cs.position,height:cs.height,flex:cs.flexDirection,vw:innerWidth};})()");
  await evaluate("window.scrollTo(0,0)");
  await wait(400);
  await capturar('12-movil');
  await capturarEn('13-movil-veredictos', '.veredictos');

  const mini = {
    meta: { version: 'test', actualizado: '2026-11-03', aviso: 'Conjunto de prueba.' },
    empresa: { nombre: 'Prueba Genérica', cultura: { a: 50, b: 50 } },
    dimensiones: [
      { id: 'tecnica', nombre: 'Técnica', corto: 'Téc', desc: 'x' },
      { id: 'orden', nombre: 'Orden', corto: 'Ord', desc: 'x' },
      { id: 'trato', nombre: 'Trato', corto: 'Tra', desc: 'x' }
    ],
    culturaEjes: [{ id: 'a', nombre: 'Eje A', desc: 'x' }, { id: 'b', nombre: 'Eje B', desc: 'x' }],
    dolores: [{ id: 'd1', nombre: 'Dolor uno', desc: 'x', pesos: { tecnica: 1.2, orden: 1 } }],
    noNegociables: [{ id: 'nn1', nombre: 'Requisito uno' }],
    puestos: [
      { id: 'p1', nombre: 'Puesto Uno', banda: [100, 200], perfil: { niveles: { tecnica: 80, orden: 60, trato: 50 } }, riesgoOperativo: 60, escasez: 40, vacanteDias: 10 },
      { id: 'p2', nombre: 'Puesto Dos', banda: [100, 200], perfil: { niveles: { tecnica: 40, orden: 80, trato: 70 } }, riesgoOperativo: 50, escasez: 60, vacanteDias: 20 }
    ],
    candidatos: [
      { id: 'c1', nombre: 'Candidato Uno', vector: { tecnica: 90, orden: 50, trato: 40 }, cultura: { a: 60, b: 40 }, expectativa: 150, entrevista: { evidencia: 70, trayectoria: 60, referencias: 80, disponibilidad: 90, riesgo: 30 }, banderas: { nn1: true } },
      { id: 'c2', nombre: 'Candidato Dos', vector: { tecnica: 30, orden: 90, trato: 80 }, cultura: { a: 40, b: 60 }, expectativa: 180, entrevista: { evidencia: 50, trayectoria: 70, referencias: 60, disponibilidad: 70, riesgo: 20 }, banderas: { nn1: true } }
    ],
    preguntas: { tecnica: ['¿Pregunta técnica?'] },
    preguntasCultura: { a: '¿Pregunta de cultura?' }
  };

  /* prueba de genericidad: importar un conjunto con otras dimensiones */
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await wait(300);
  await evaluate("document.querySelector('[data-nav=\"datos\"]').click()");
  await wait(300);
  await evaluate("(function(){var a=document.querySelector('#areaDatos');a.value=" + JSON.stringify(JSON.stringify(mini)) + ";document.querySelector('[data-datos=\"importar\"]').click();})()");
  await wait(700);
  informe.genericoEmpresa = await evaluate("document.getElementById('topEmpresa').textContent");
  informe.genericoOk = await evaluate("!!document.querySelector('.ok-msg')");
  await evaluate("document.querySelector('[data-nav=\"resumen\"]').click()");
  await wait(500);
  informe.genericoRank = await evaluate("document.querySelectorAll('.rank-row').length");
  informe.genericoRadar = await evaluate("document.querySelectorAll('svg.radar').length");
  informe.genericoVacios = await evaluate("document.querySelectorAll('.empty').length");
  await capturar('14-generico');

  /* importación inválida: debe mostrar errores y no romper */
  await evaluate("document.querySelector('[data-nav=\"datos\"]').click()");
  await wait(300);
  await evaluate("(function(){var a=document.querySelector('#areaDatos');a.value='{ roto';document.querySelector('[data-datos=\"importar\"]').click();})()");
  await wait(400);
  informe.erroresImport = await evaluate("document.querySelectorAll('.errores li').length");
  informe.empresaTrasError = await evaluate("document.getElementById('topEmpresa').textContent");

  informe.errores = errores();
  console.log(JSON.stringify(informe, null, 2));
  ws.close();
  try { process.kill(-proc.pid, 'SIGKILL'); } catch (e) { proc.kill('SIGKILL'); }
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* nada */ }
})().catch((e) => { console.error(e); process.exit(1); });
