/* =========================================================================
   PASE · aplicación
   Genérica: todo sale del conjunto de datos (assets/data.js o uno importado).
   No hay puestos, candidatos ni dimensiones escritos en el código.
   ========================================================================= */
(function () {
  'use strict';

  var M = window.MOTOR;
  var DATA = null;
  var D = null;

  var LS_DATA = 'pase.dataset.v1';
  var LS_CTX = 'pase.ctx.v1';
  var LS_TEMA = 'pase.tema.v1';

  var state = {
    vista: 'resumen',
    cand: null,
    puesto: null,
    tab: 'descripcion',
    tabResumen: 'ranking',
    ctxOpen: false,
    matriz: null,
    ctx: {},
    errores: [],
    ok: ''
  };

  /* ------------------------------- helpers ------------------------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nf(n, d) {
    var v = typeof n === 'number' && isFinite(n) ? n : 0;
    return v.toLocaleString('es-CO', { minimumFractionDigits: d == null ? 1 : d, maximumFractionDigits: d == null ? 1 : d });
  }
  function ni(n) {
    var v = typeof n === 'number' && isFinite(n) ? n : 0;
    return v.toLocaleString('es-CO', { maximumFractionDigits: 0 });
  }
  function money(n) { return '$' + ni(n); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function dim(id) {
    return (DATA.dimensiones || []).filter(function (d) { return d.id === id; })[0] || { id: id, nombre: id, corto: id };
  }
  function eje(id) {
    return (DATA.culturaEjes || []).filter(function (e) { return e.id === id; })[0] || { id: id, nombre: id };
  }
  function candById(id) {
    return (DATA.candidatos || []).filter(function (c) { return c.id === id; })[0] || null;
  }
  function puestoById(id) {
    return (DATA.puestos || []).filter(function (p) { return p.id === id; })[0] || null;
  }
  function nombreCorto(n) {
    var p = String(n || '').split(' ').filter(Boolean);
    return p.length > 1 ? p[0] + ' ' + p[p.length - 1] : p[0] || '';
  }
  function fechaHoy() {
    return new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fecha() {
    var f = DATA.meta && DATA.meta.actualizado ? new Date(DATA.meta.actualizado + 'T12:00:00') : new Date();
    return f.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function pct(x) { return Math.round((x || 0) * 100) + '%'; }
  function cortoPuesto(n) { return String(n || '').replace(/\s*\(.*\)\s*/, '').trim(); }

  function leer(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin storage */ } }
  function borrar(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } }

  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* -------------------------------- datos -------------------------------- */
  function cargarDataset() {
    var g = leer(LS_DATA);
    if (g && M.validar(g).ok) return g;
    return window.BRIGADA;
  }

  function ctxInicial() {
    var d = (DATA.dolores || [])[0];
    var base = {
      dolor: d ? d.id : null,
      presupuesto: 'estandar',
      urgencia: 55,
      culturaPeso: 55,
      noNegociables: (DATA.noNegociables || []).length ? [DATA.noNegociables[0].id] : []
    };
    var g = leer(LS_CTX);
    if (g && typeof g === 'object') {
      if (g.dolor && (DATA.dolores || []).some(function (x) { return x.id === g.dolor; })) base.dolor = g.dolor;
      if (['ajustado', 'estandar', 'amplio'].indexOf(g.presupuesto) > -1) base.presupuesto = g.presupuesto;
      if (typeof g.urgencia === 'number') base.urgencia = clamp(g.urgencia, 0, 100);
      if (typeof g.culturaPeso === 'number') base.culturaPeso = clamp(g.culturaPeso, 0, 100);
      if (Array.isArray(g.noNegociables)) {
        base.noNegociables = g.noNegociables.filter(function (id) {
          return (DATA.noNegociables || []).some(function (n) { return n.id === id; });
        });
      }
    }
    return base;
  }

  function compute() { D = M.diagnosticar(DATA, state.ctx); }

  function asegurarSeleccion() {
    if (!state.cand || !candById(state.cand)) {
      state.cand = D && D.filas.length ? D.filas[0].id : ((DATA.candidatos || [])[0] || {}).id;
    }
    if (!state.puesto || !puestoById(state.puesto)) {
      state.puesto = D && D.rankingPuestos.length ? D.rankingPuestos[0].id : ((DATA.puestos || [])[0] || {}).id;
    }
  }
  function guardarCtx() { guardar(LS_CTX, state.ctx); }

  function resetSeleccion() {
    state.cand = null;
    state.puesto = null;
    state.matriz = null;
    state.tab = 'descripcion';
    state.ctx = ctxInicial();
  }

  /* -------------------------------- temas -------------------------------- */
  function temaInicial() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('tema'); } catch (e) { q = null; }
    if (q === 'light' || q === 'dark') { document.documentElement.setAttribute('data-theme', q); return; }
    var t = leer(LS_TEMA);
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  }
  function toggleTema() {
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    guardar(LS_TEMA, t);
  }

  /* ------------------------------- armazón ------------------------------- */
  function render() {
    $('#topEmpresa').textContent = (DATA.empresa && DATA.empresa.nombre) || 'Sin nombre';
    $('#wsMeta').textContent = DATA.puestos.length + ' puestos · ' + DATA.candidatos.length + ' candidatos';
    var badge = $('#wsBadge');
    if (badge) badge.textContent = leer(LS_DATA) ? 'Datos importados' : 'Datos de ejemplo';
    renderNav();
    var v = $('#vista');
    v.innerHTML = VISTAS[state.vista] ? VISTAS[state.vista]() : VISTAS.resumen();
    v.classList.remove('view-enter');
    void v.offsetWidth;
    v.classList.add('view-enter');
    window.scrollTo(0, 0);
  }

  function renderNav() {
    Array.prototype.forEach.call(document.querySelectorAll('#nav [data-nav], #navSub [data-nav]'), function (b) {
      if (b.getAttribute('data-nav') === state.vista) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  function pageHeadSimple(kicker, title, sub) {
    return '<div class="page-head"><div class="page-head-main">' +
      '<p class="page-kicker">' + esc(kicker) + '</p>' +
      '<h1>' + esc(title) + '</h1>' +
      (sub ? '<p class="page-sub">' + esc(sub) + '</p>' : '') +
      '</div></div>';
  }

  function pageHeadHTML() {
    if (!D || D.vacio) {
      return pageHeadSimple('Diagnóstico', 'Sin datos', 'Carga un conjunto con al menos un puesto y un candidato.');
    }
    var f = D.veredictos.contratacion;
    var margen = D.margenIndice < 3
      ? 'empate técnico con el segundo'
      : nf(D.margenIndice, 1) + ' puntos sobre el segundo';
    return '<div class="page-head" id="pageHead">' +
      '<div class="page-head-main">' +
      '<p class="page-kicker">Diagnóstico · ' + fechaHoy() + '</p>' +
      '<h1>Fichar a ' + esc(f.nombre) + '</h1>' +
      '<p class="page-sub">' + esc(f.puestoNombre) + ' · ' + margen + '</p>' +
      '</div>' +
      '<div class="page-actions">' +
      '<div class="head-score">' + ni(f.indice) + '<small>/100</small></div>' +
      '<button class="btn btn--solid" type="button" data-cand="' + esc(f.id) + '">Ver ficha</button>' +
      '</div></div>';
  }

  function chipsHTML() {
    var c = state.ctx;
    var dol = (DATA.dolores || []).filter(function (d) { return d.id === c.dolor; })[0] || {};
    var pres = { ajustado: 'Ajustado', estandar: 'Estándar', amplio: 'Amplio' }[c.presupuesto] || c.presupuesto;
    return '<div class="context-bar" id="ctxChips">' +
      '<button class="ctx-chip" type="button" data-ctx-toggle><span>Dolor</span><b>' + esc(dol.nombre || '—') + '</b></button>' +
      '<button class="ctx-chip" type="button" data-ctx-toggle><span>Presupuesto</span><b>' + esc(pres) + '</b></button>' +
      '<button class="ctx-chip" type="button" data-ctx-toggle><span>Urgencia</span><b>' + c.urgencia + '</b></button>' +
      '<button class="ctx-chip" type="button" data-ctx-toggle><span>Cultura</span><b>' + c.culturaPeso + '</b></button>' +
      '<button class="ctx-toggle btn btn--ghost btn--sm" type="button" data-ctx-toggle aria-expanded="' + (state.ctxOpen ? 'true' : 'false') + '">' +
      (state.ctxOpen ? 'Cerrar' : 'Ajustar') + '</button>' +
      '</div>';
  }

  function ctxPanelHTML() {
    var c = state.ctx;
    return '<div class="ctx-panel' + (state.ctxOpen ? ' open' : '') + '" id="ctxPanel">' +
      '<div class="ctx-head"><span>Contexto de la empresa</span>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-ctx-reset>Restablecer</button></div>' +
      '<div class="brief-grid">' +

      '<div class="field"><label for="selDolor">Dolor principal</label>' +
      '<select id="selDolor" data-ctx="dolor">' +
      (DATA.dolores || []).map(function (d) {
        return '<option value="' + esc(d.id) + '"' + (d.id === c.dolor ? ' selected' : '') + '>' + esc(d.nombre) + '</option>';
      }).join('') +
      '</select></div>' +

      '<div class="field"><span class="lab">Presupuesto</span><div class="seg">' +
      [['ajustado', 'Ajustado'], ['estandar', 'Estándar'], ['amplio', 'Amplio']].map(function (x) {
        return '<label><input type="radio" name="presupuesto" data-ctx="presupuesto" value="' + x[0] + '"' + (c.presupuesto === x[0] ? ' checked' : '') + '>' + x[1] + '</label>';
      }).join('') +
      '</div></div>' +

      '<div class="field"><span class="lab">Urgencia</span><div class="range">' +
      '<input type="range" min="0" max="100" step="5" value="' + c.urgencia + '" data-range="urgencia" aria-label="Urgencia">' +
      '<div class="range-out"><span>Puedo esperar</span><b data-out="urgencia">' + c.urgencia + '</b><span>Ya</span></div></div></div>' +

      '<div class="field"><span class="lab">Peso de la cultura</span><div class="range">' +
      '<input type="range" min="0" max="100" step="5" value="' + c.culturaPeso + '" data-range="culturaPeso" aria-label="Peso de la cultura">' +
      '<div class="range-out"><span>Puesto</span><b data-out="culturaPeso">' + c.culturaPeso + '</b><span>Cultura</span></div></div></div>' +

      '<div class="field field--wide"><span class="lab">Requisitos eliminatorios</span><div class="checks">' +
      (DATA.noNegociables || []).map(function (n) {
        return '<label class="check"><input type="checkbox" data-nn="' + esc(n.id) + '"' + (c.noNegociables.indexOf(n.id) > -1 ? ' checked' : '') + '>' + esc(n.nombre) + '</label>';
      }).join('') +
      '</div></div>' +

      '</div>' +
      '<div class="ctx-foot" id="pesosLinea">' + pesosLinea() + '</div>' +
      '</div>';
  }

  function pesosLinea() {
    return 'Pesos: impacto ' + pct(D.pesos.impacto) + ' · cultura ' + pct(D.pesos.cultura) +
      ' · potencial ' + pct(D.pesos.potencial) + ' · riesgo ' + pct(D.pesos.riesgo);
  }

  function toggleCtx() {
    state.ctxOpen = !state.ctxOpen;
    var p = $('#ctxPanel');
    if (p) p.classList.toggle('open', state.ctxOpen);
    var b = $('.ctx-toggle');
    if (b) {
      b.textContent = state.ctxOpen ? 'Cerrar' : 'Ajustar';
      b.setAttribute('aria-expanded', state.ctxOpen ? 'true' : 'false');
    }
  }

  /* -------------------------------- vistas -------------------------------- */
  var VISTAS = {};

  VISTAS.resumen = function () {
    return pageHeadHTML() + chipsHTML() + ctxPanelHTML() +
      '<div id="resultados">' + resultadosHTML() + '</div>';
  };

  function resultadosHTML() {
    if (!D || D.vacio) {
      return '<div class="empty"><h3>Faltan datos para diagnosticar</h3>' +
        '<p>' + esc(D ? D.motivo : 'No se pudo calcular el diagnóstico.') + '</p>' +
        '<button class="btn btn--solid" data-nav="datos">Ir a Datos</button></div>';
    }
    return decisionsHTML() + tieHTML() + tabsHTML();
  }

  function decisionsHTML() {
    var f = D.veredictos.contratacion;
    var p = D.veredictos.criticidad;
    var cul = D.veredictos.cultura;
    var ent = D.veredictos.entrevista;
    return '<div class="decisions">' +
      '<article class="decision decision--primary">' +
      '<span class="d-label">Fichaje recomendado</span>' +
      '<span class="d-name">' + esc(f.nombre) + '</span>' +
      '<span class="d-role">' + esc(f.puestoNombre) + (f.asignadoAuto ? ' · asignado automáticamente' : '') + '</span>' +
      '<span class="d-meta">Encaje ' + ni(f.fit) + ' · Cultura ' + ni(f.cultura) + ' · Entrevista ' + ni(f.prioridad) + '</span>' +
      '<span class="d-why">' + esc(razonCorta(f)) + '</span>' +
      '</article>' +
      decisionMini('Vacante crítica', p.nombre, p.criticidad, p.vacanteDias + ' días abierta', 'data-puesto="' + esc(p.id) + '"') +
      decisionMini('Match cultural', cul.nombre, cul.cultura, cul.puestoNombre, 'data-cand="' + esc(cul.id) + '"') +
      decisionMini('Entrevistar primero', ent.nombre, ent.prioridad, 'Expediente ' + ni(ent.potencial), 'data-cand="' + esc(ent.id) + '"') +
      '</div>';
  }

  function razonCorta(f) {
    var fort = f.fortalezas[0];
    return (fort ? dim(fort.dim).nombre + ' +' + fort.dif : 'Cumple el perfil') + ' · impacto ' + ni(f.impacto);
  }

  function decisionMini(label, name, score, meta, attr) {
    return '<article class="decision">' +
      '<span class="d-label">' + esc(label) + '</span>' +
      '<span class="d-name">' + esc(name) + '</span>' +
      '<span class="d-score">' + nf(score, 1) + '</span>' +
      '<span class="d-meta">' + esc(meta) + '</span>' +
      '<button class="d-link" type="button" ' + attr + '>Ver →</button>' +
      '</article>';
  }

  function tieHTML() {
    if (!D || D.vacio || D.filas.length < 2 || D.margenCultura >= 3) return '';
    var porCultura = D.filas.slice().sort(function (a, b) { return b.cultura - a.cultura; });
    return '<p class="note-tie"><b>Empate en cultura:</b> ' + esc(porCultura[0].nombre) + ' (' + nf(porCultura[0].cultura, 1) + ') y ' +
      esc(porCultura[1].nombre) + ' (' + nf(porCultura[1].cultura, 1) + ') están a ' + nf(D.margenCultura, 1) + ' puntos. Decide la entrevista.</p>';
  }

  function tabsHTML() {
    var tabs = [
      { id: 'ranking', label: 'Ranking', n: D.filas.length },
      { id: 'vacantes', label: 'Vacantes', n: D.rankingPuestos.length },
      { id: 'escenarios', label: 'Escenarios', n: (DATA.dolores || []).length }
    ];
    return '<div class="tabs-seg" role="tablist">' +
      tabs.map(function (t) {
        return '<button type="button" role="tab" aria-selected="' + (state.tabResumen === t.id) + '" data-tab-resumen="' + t.id + '">' +
          esc(t.label) + '<span>' + t.n + '</span></button>';
      }).join('') + '</div>' +
      '<div class="tab-panel" role="tabpanel">' + panelHTML(state.tabResumen) + '</div>';
  }

  function panelHTML(id) {
    if (id === 'vacantes') return panelVacantes();
    if (id === 'escenarios') return panelEscenarios();
    return panelRanking();
  }

  function panelRanking() {
    return '<div class="rank-head"><span></span><span>Candidato</span><span>Índice</span><span>Encaje</span><span>Cultura</span><span></span></div>' +
      '<ol class="rank">' + D.filas.map(function (x) {
        return '<li><button class="rank-row" data-cand="' + esc(x.id) + '">' +
          '<span class="pos">' + x.posicion + '</span>' +
          '<span class="who"><b>' + esc(x.nombre) + '</b><span>' + esc(x.puestoNombre) + '</span>' +
          '<span class="mini-bar"><i style="width:' + clamp(x.indice, 0, 100) + '%"></i></span></span>' +
          '<span class="metric"><b>' + nf(x.indice, 1) + '</b></span>' +
          '<span class="metric"><b>' + nf(x.fit, 1) + '</b></span>' +
          '<span class="metric"><b>' + nf(x.cultura, 1) + '</b></span>' +
          '<span class="arrow">→</span></button></li>';
      }).join('') + '</ol>';
  }

  function panelVacantes() {
    return '<div class="crit-list">' + D.rankingPuestos.map(function (x) {
      return '<button class="crit-row" data-puesto="' + esc(x.id) + '">' +
        '<span class="name"><b>' + esc(x.nombre) + '</b><span>' + x.vacanteDias + ' días abierta · ' + money(x.banda[0]) + ' a ' + money(x.banda[1]) + '</span></span>' +
        '<span class="track-wrap"><span class="track"><i style="width:' + clamp(x.criticidad, 0, 100) + '%"></i></span>' +
        '<span class="crit-comp"><span>alin ' + ni(x.critComponentes.alineacion) + '</span><span>riesgo ' + ni(x.critComponentes.riesgo) + '</span><span>escasez ' + ni(x.critComponentes.escasez) + '</span></span></span>' +
        '<span class="val">' + nf(x.criticidad, 1) + '</span></button>';
    }).join('') + '</div>';
  }

  function panelEscenarios() {
    return '<div class="sens">' + (DATA.dolores || []).map(function (d) {
      var r = d.id === state.ctx.dolor ? D : M.diagnosticar(DATA, Object.assign({}, state.ctx, { dolor: d.id }));
      var ff = r.veredictos && r.veredictos.contratacion;
      var pp = r.veredictos && r.veredictos.criticidad;
      return '<div class="sens-row' + (d.id === state.ctx.dolor ? ' top' : '') + '">' +
        '<span class="d"><b>' + esc(d.nombre) + '</b></span>' +
        '<span class="r">' + esc(ff ? ff.nombre : '—') + '<em>fichaje</em></span>' +
        '<span class="r">' + esc(pp ? pp.nombre : '—') + '<em>vacante crítica</em></span></div>';
    }).join('') + '</div>';
  }

  function razonFichaje(f) {
    var cand = candById(f.id);
    var fort = f.fortalezas[0];
    var s1 = fort
      ? 'Su ventaja es ' + dim(fort.dim).nombre.toLowerCase() + ', ' + fort.dif + ' puntos por encima del perfil.'
      : 'Cumple el perfil sin sobrecosto.';
    return s1 + ' Cubrir su vacante con él vale ' + ni(f.impacto) + ' de 100.';
  }

  function razonCultura(f) {
    var cand = candById(f.id);
    if (!cand) return '';
    var ids = Object.keys(f.culturaEje);
    if (!ids.length) return 'Sin ejes de cultura declarados.';
    var cerca = ids.slice().sort(function (a, b) { return Math.abs(f.culturaEje[a]) - Math.abs(f.culturaEje[b]); })[0];
    var lejos = ids.slice().sort(function (a, b) { return Math.abs(f.culturaEje[b]) - Math.abs(f.culturaEje[a]); })[0];
    var e = DATA.empresa || {};
    var ec = e.cultura || {};
    return 'Coincide en ' + esc(eje(cerca).nombre.toLowerCase()) + ' (' + Math.round(cand.cultura[cerca] || 0) + ' vs ' + Math.round(ec[cerca] || 50) + ') y se aleja en ' +
      esc(eje(lejos).nombre.toLowerCase()) + ' (' + Math.round(cand.cultura[lejos] || 0) + ' vs ' + Math.round(ec[lejos] || 50) + ').';
  }

  function razonEntrevista(f) {
    var c = candById(f.id);
    var e = c.entrevista || {};
    return 'Expediente ' + Math.round(e.evidencia || 0) + '/100 en evidencia, ' +
      (c.referencias || []).length + ' referencias y disponibilidad ' + esc((c.disponibilidad && c.disponibilidad.texto || 'sin dato').toLowerCase()) +
      '. Riesgo estimado ' + ni(f.riesgo) + '/100.';
  }

  function breakdownHTML(vector, req, compact) {
    return '<div class="breakdown">' + (DATA.dimensiones || []).map(function (d) {
      var have = Math.round((vector || {})[d.id] || 0);
      var need = Math.round((req || {})[d.id] || 0);
      return '<div class="row"><span>' + esc(d.corto || d.nombre) + '</span>' +
        '<span class="b"><i style="width:' + have + '%"></i><u style="left:' + need + '%"></u></span>' +
        '<b>' + have + (compact ? '/' + need : '') + '</b></div>';
    }).join('') + '</div>';
  }

  /* ------------------------------- bloques ------------------------------- */
  function gapsHTML(f) {
    if (!f.gaps.length) return '<p class="small muted">Sin brechas frente al perfil: cumple o supera todos los mínimos.</p>';
    return '<div class="gaps">' + f.gaps.map(function (g) {
      return '<div class="gap"><div class="t"><span>' + esc(dim(g.dim).nombre) + '</span><b>' + g.have + ' / ' + g.req + '</b></div>' +
        '<div class="bar"><i class="flag" style="width:' + clamp(g.have, 0, 100) + '%"></i><u style="left:' + g.req + '%"></u></div></div>';
    }).join('') + '</div>';
  }

  function planHTML(f) {
    var cand = candById(f.id);
    var p = puestoById(f.puesto);
    var items = [];
    var weak = Object.keys(f.detalle).map(function (id) {
      return { id: id, s: f.detalle[id], req: (p.perfil.niveles || {})[id] || 0 };
    }).filter(function (x) { return x.req >= 40; }).sort(function (a, b) { return a.s - b.s; }).slice(0, 2);
    weak.forEach(function (w) {
      var banco = (DATA.preguntas || {})[w.id];
      var q = (banco && banco[0]) || ('Cuéntame cómo resuelves ' + dim(w.id).nombre.toLowerCase() + ' en un servicio real.');
      items.push({ label: 'Competencia · ' + dim(w.id).nombre, q: q });
    });
    if (cand && cand.verificacion) items.push({ label: 'Verificación', q: cand.verificacion });
    var peor = Object.keys(f.culturaEje).sort(function (a, b) {
      return Math.abs(f.culturaEje[b]) - Math.abs(f.culturaEje[a]);
    })[0];
    var qc = (DATA.preguntasCultura || {})[peor];
    if (qc) items.push({ label: 'Cultura · ' + eje(peor).nombre, q: qc });
    if (!items.length) return '<p class="small muted">Sin preguntas configuradas. Añádelas en el conjunto de datos.</p>';
    return '<ol class="qlist">' + items.map(function (it) {
      return '<li><span class="qlabel">' + esc(it.label) + '</span>' + esc(it.q) + '</li>';
    }).join('') + '</ol>';
  }

  function riesgosHTML(f) {
    var cand = candById(f.id);
    var items = [];
    f.bloqueos.forEach(function (b) { items.push({ tipo: b.tipo, texto: b.texto }); });
    (cand && cand.riesgos || []).forEach(function (r) { items.push({ tipo: r.tipo, texto: r.texto }); });
    if (!cand) return '<p class="small muted">Sin datos.</p>';
    if (!items.length) return '<p class="small muted">Sin riesgos declarados en el expediente.</p>';
    return '<ul class="risk">' + items.map(function (r) {
      return '<li><span>' + esc(r.tipo) + '</span>' + esc(r.texto) + '</li>';
    }).join('') + '</ul>';
  }

  function salarioHTML(f, p, cand) {
    return '<div class="kv">' +
      '<div class="k"><span>Expectativa</span><b>' + money(cand.expectativa) + '</b></div>' +
      '<div class="k"><span>Banda del puesto</span><b>' + money(p.banda[0]) + ' a ' + money(p.banda[1]) + '</b></div>' +
      '<div class="k"><span>Tope con presupuesto ' + esc(state.ctx.presupuesto) + '</span><b>' + money(f.salario.cap) + '</b></div>' +
      '<div class="k total"><span>' + (f.salario.dentro ? 'Dentro de banda' : 'Sobre el tope') + '</span><b>' +
      (f.salario.exceso > 0 ? '+' + nf(f.salario.exceso, 1) + '%' : '0%') + '</b></div></div>';
  }

  /* -------------------------------- puestos ------------------------------- */
  VISTAS.puestos = function () {
    if (!DATA.puestos.length) return emptyView('No hay puestos cargados', 'Importa un conjunto de datos con al menos un puesto.');
    var sel = puestoById(state.puesto) || DATA.puestos[0];
    return pageHeadSimple('Puestos · ' + DATA.puestos.length, 'Puestos', 'Descripción y perfil de cada rol.') +
      '<div class="split"><div class="list">' + DATA.puestos.map(function (p) {
        var best = mejorDe(p.id);
        return '<button data-puesto="' + esc(p.id) + '" aria-current="' + (p.id === sel.id) + '">' +
          '<b>' + esc(p.nombre) + '</b><span>' + esc([p.area, p.nivel].filter(Boolean).join(' · ')) + '</span>' +
          '<span class="fit">' + (best ? 'Mejor: ' + esc(nombreCorto(best.nombre)) + ' · ' + nf(best.fit, 1) : 'Sin candidatos') + '</span></button>';
      }).join('') + '</div><div>' + puestoDetalle(sel) + '</div></div>';
  };

  function mejorDe(puestoId) {
    if (!D || D.vacio) return null;
    var p = D.puestos.filter(function (x) { return x.id === puestoId; })[0];
    if (!p || !p.mejorCandidato) return null;
    var c = candById(p.mejorCandidato.candidato);
    return { nombre: c ? c.nombre : '', fit: p.mejorCandidato.fit, id: c ? c.id : null };
  }

  function puestoDetalle(p) {
    var best = mejorDe(p.id);
    var perfil = p.perfil || {};
    var req = p.requisitos || {};
    var cond = p.condiciones || {};
    var tab = state.tab;
    return '<div class="job-head"><div><h2>' + esc(p.nombre) + '</h2>' +
      '<p class="sub">' + esc([p.area, p.nivel, p.reporta ? 'reporta a ' + p.reporta : '', p.supervisa].filter(Boolean).join(' · ')) + '</p></div>' +
      '<div class="job-score"><div class="big">' + (best ? nf(best.fit, 1) : '—') + '</div><div class="lbl">mejor encaje en la matriz</div>' +
      (best ? '<div class="tiny muted">' + esc(nombreCorto(best.nombre)) + '</div>' : '') + '</div></div>' +
      '<div class="tabs" role="tablist">' +
      '<button role="tab" aria-selected="' + (tab === 'descripcion') + '" data-tab="descripcion">Descripción del puesto</button>' +
      '<button role="tab" aria-selected="' + (tab === 'perfil') + '" data-tab="perfil">Perfil del puesto</button></div>' +
      (tab === 'descripcion' ? descripcionHTML(p, req, cond) : perfilHTML(p, perfil, best));
  }

  function descripcionHTML(p, req, cond) {
    return '<div class="prose">' +
      (p.resumen ? '<blockquote class="quote"><p>' + esc(p.resumen) + '</p></blockquote>' : '') +
      (p.mision ? '<p><strong>Misión.</strong> ' + esc(p.mision) + '</p>' : '') + '</div>' +
      bloques(p);
  }

  function bloques(p) {
    var req = p.requisitos || {}, cond = p.condiciones || {};
    var out = [];
    if ((p.funciones || []).length) out.push(bloqueLista('Funciones esenciales', p.funciones));
    if ((p.indicadores || []).length) out.push(bloqueTabla('Indicadores', p.indicadores));
    if (p.relaciones) out.push(bloqueRelaciones(p.relaciones));
    if (p.autoridad) out.push(bloqueTexto('Autoridad y alcance', p.autoridad));
    if (req.formacion || req.experiencia || (req.tecnicos || []).length || (req.certificaciones || []).length) out.push(bloqueRequisitos(req));
    if (cond.jornada || cond.contrato || (cond.beneficios || []).length || (p.banda || []).length) out.push(bloqueCondiciones(cond, p.banda));
    if ((p.riesgosPuesto || []).length) out.push(bloqueLista('Riesgos del puesto', p.riesgosPuesto));
    if ((p.incorporacion || []).length) out.push(bloqueLista('Ruta de incorporación (90 días)', p.incorporacion));
    if ((p.pruebaTecnica || []).length) out.push(bloqueLista('Prueba técnica sugerida', p.pruebaTecnica, true));
    return '<div class="blocks">' + out.join('') + '</div>';
  }

  function bloqueLista(t, items, ordered) {
    return '<div class="block"><h4>' + esc(t) + '</h4><' + (ordered ? 'ol' : 'ul') + '>' +
      items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</' + (ordered ? 'ol' : 'ul') + '></div>';
  }
  function bloqueTabla(t, rows) {
    return '<div class="block"><h4>' + esc(t) + '</h4><div class="meta-list">' +
      rows.map(function (r) { return '<div class="row"><span>' + esc(r.nombre) + '</span><b>' + esc(r.meta) + '</b></div>'; }).join('') +
      '</div></div>';
  }
  function bloqueRelaciones(r) {
    return '<div class="block"><h4>Relaciones de trabajo</h4><ul>' +
      (r.internas || []).map(function (x) { return '<li><b>Interna.</b> ' + esc(x) + '</li>'; }).join('') +
      (r.externas || []).map(function (x) { return '<li><b>Externa.</b> ' + esc(x) + '</li>'; }).join('') +
      '</ul></div>';
  }
  function bloqueTexto(t, txt) {
    return '<div class="block"><h4>' + esc(t) + '</h4><p class="small">' + esc(txt) + '</p></div>';
  }
  function bloqueRequisitos(r) {
    var items = [];
    if (r.formacion) items.push('<li><b>Formación.</b> ' + esc(r.formacion) + '</li>');
    if (r.experiencia) items.push('<li><b>Experiencia.</b> ' + esc(r.experiencia) + '</li>');
    if ((r.tecnicos || []).length) items.push('<li><b>Técnicos.</b> ' + esc(r.tecnicos.join(' · ')) + '</li>');
    if ((r.certificaciones || []).length) items.push('<li><b>Certificaciones.</b> ' + esc(r.certificaciones.join(' · ')) + '</li>');
    return '<div class="block"><h4>Requisitos</h4><ul>' + items.join('') + '</ul></div>';
  }
  function bloqueCondiciones(c, banda) {
    var items = [];
    if (c.jornada) items.push('<li><b>Jornada.</b> ' + esc(c.jornada) + '</li>');
    if (c.contrato) items.push('<li><b>Contrato.</b> ' + esc(c.contrato) + '</li>');
    if (banda && banda.length === 2) items.push('<li><b>Banda.</b> ' + money(banda[0]) + ' a ' + money(banda[1]) + '</li>');
    if ((c.beneficios || []).length) items.push('<li><b>Beneficios.</b> ' + esc(c.beneficios.join(' · ')) + '</li>');
    return '<div class="block"><h4>Condiciones</h4><ul>' + items.join('') + '</ul></div>';
  }

  function perfilHTML(p, perfil, best) {
    var niveles = perfil.niveles || {};
    var nivelesHTML = '<div class="levelbars">' + (DATA.dimensiones || []).map(function (d) {
      var v = Math.round(niveles[d.id] || 0);
      return '<div class="levelbar"><span>' + esc(d.nombre) + '</span><span class="b"><i style="width:' + v + '%"></i></span><b>' + v + '</b></div>';
    }).join('') + '</div>';

    return '<div class="prose"><p>' + esc([perfil.formacion, perfil.experiencia].filter(Boolean).join(' ')) + '</p></div>' +
      '<div class="blocks">' +
      '<div class="block"><h4>Competencias requeridas</h4>' + nivelesHTML + '</div>' +
      ((perfil.competencias || []).length ? '<div class="block"><h4>Competencias conductuales</h4><ul>' +
        perfil.competencias.map(function (c) { return '<li><b>' + esc(c.nombre) + '</b> (' + esc((c.nivel || '').toLowerCase()) + '). ' + esc(c.nota || '') + '</li>'; }).join('') + '</ul></div>' : '') +
      ((perfil.rasgos || []).length ? '<div class="block"><h4>Rasgos observables</h4><div class="chips">' +
        perfil.rasgos.map(function (r) { return '<span class="chip">' + esc(r) + '</span>'; }).join('') + '</div></div>' : '') +
      ((perfil.antiPerfil || []).length ? '<div class="block anti"><h4>Lo que no buscamos</h4><ul>' +
        perfil.antiPerfil.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' : '') +
      (p.preguntaCultura ? '<div class="block"><h4>Pregunta de cultura</h4><p class="small">' + esc(p.preguntaCultura) + '</p></div>' : '') +
      (best ? '<div class="block"><h4>Candidato que mejor encaja</h4><p class="small"><b>' + esc(best.nombre) + '</b> · encaje ' + nf(best.fit, 1) + ' de 100.</p>' +
        '<div class="btn-row"><button class="btn btn--sm" data-cand="' + esc(best.id) + '">Ver hoja de vida</button></div></div>' : '') +
      '</div>';
  }

  /* ------------------------------ candidatos ----------------------------- */
  VISTAS.candidatos = function () {
    if (!DATA.candidatos.length) return emptyView('No hay candidatos cargados', 'Importa un conjunto de datos con al menos un candidato.');
    var c = candById(state.cand) || DATA.candidatos[0];
    return pageHeadSimple('Candidatos · ' + DATA.candidatos.length, 'Candidatos', 'Hoja de vida y lectura del modelo.') +
      '<div class="split"><div class="list">' + D.filas.map(function (f) {
        return '<button data-cand="' + esc(f.id) + '" aria-current="' + (f.id === c.id) + '">' +
          '<b>' + esc(f.nombre) + '</b><span>' + esc(f.puestoNombre) + '</span>' +
          '<span class="fit">Índice ' + nf(f.indice, 1) + ' · encaje ' + nf(f.fit, 1) + '</span></button>';
      }).join('') + '</div><div>' + candidatoDetalle(c) + '</div></div>';
  };

  function candidatoDetalle(c) {
    var f = D.porId[c.id];
    return '<div class="cand-head"><div><h2>' + esc(c.nombre) + '</h2>' +
      '<p class="role">' + esc(c.titular || '') + '</p>' +
      (c.titulo ? '<p class="grado">' + esc(c.titulo) + '</p>' : '') +
      '<div class="contact">' + [c.ciudad, c.contacto && c.contacto.tel, c.contacto && c.contacto.mail, c.contacto && c.contacto.linkedin, c.contacto && c.contacto.instagram]
        .filter(Boolean).map(esc).join(' · ') + '</div></div>' +
      '<div class="cand-scores">' +
      '<div class="cs"><div class="v">' + nf(f.indice, 1) + '</div><div class="l">índice</div></div>' +
      '<div class="cs"><div class="v">' + nf(f.fit, 1) + '</div><div class="l">encaje</div></div>' +
      '<div class="cs"><div class="v">' + nf(f.cultura, 1) + '</div><div class="l">cultura</div></div>' +
      '<div class="cs"><div class="v">' + nf(f.prioridad, 1) + '</div><div class="l">entrevista</div></div>' +
      '</div></div>' +
      (f.asignadoAuto ? '<p class="note">Sin puesto asignado: se evalúa contra todos y el índice usa el de mayor encaje (' + esc(f.puestoNombre) + ').</p>' : '') +
      '<div class="dossier"><div>' + cvHTML(c) +
      '<div class="cv-actions"><button class="btn btn--sm" data-export-cv="' + esc(c.id) + '">Descargar hoja de vida (.md)</button>' +
      '<button class="btn btn--sm btn--ghost" data-puesto="' + esc(f.puesto) + '">Ver puesto</button></div></div>' +
      '<div class="dossier-side">' +
      '<div class="panel"><h3>Lectura</h3>' +
      '<div class="kv"><div class="k"><span>Índice de contratación</span><b>' + nf(f.indice, 1) + '</b></div>' +
      '<div class="k"><span>Impacto sobre la vacante</span><b>' + nf(f.impacto, 1) + '</b></div>' +
      '<div class="k"><span>Potencial de entrevista</span><b>' + nf(f.potencial, 1) + '</b></div>' +
      '<div class="k"><span>Riesgo</span><b>' + nf(f.riesgo, 1) + '</b></div></div>' +
      '<div class="mt-16">' + breakdownHTML(c.vector, (puestoById(f.puesto).perfil || {}).niveles || {}, true) + '</div>' +
      '<p class="note">Barra: la persona. Marca: el mínimo del puesto.</p>' +
      (f.fortalezas.length ? '<div class="chips mt-16">' + f.fortalezas.map(function (x) { return '<span class="chip chip--ok">' + esc(dim(x.dim).corto) + ' +' + x.dif + '</span>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="panel"><h3>Brechas</h3>' + gapsHTML(f) + '</div>' +
      '<div class="panel"><h3>Entrevista</h3>' + planHTML(f) +
      '<h4 class="tiny muted mt-16">Riesgos y bloqueos</h4>' + riesgosHTML(f) + '</div>' +
      '<div class="panel"><h3>Condiciones</h3>' + salarioHTML(f, puestoById(f.puesto), c) + '</div>' +
      '</div></div>';
  }

  function cvHTML(c) {
    var exp = (c.experiencia || []).map(function (e) {
      return '<div class="job"><div class="job-top"><b>' + esc(e.cargo) + '</b><span>' + esc(e.periodo || '') + '</span></div>' +
        '<p class="emp">' + esc(e.empresa || '') + '</p>' +
        (e.contexto ? '<p class="ctx">' + esc(e.contexto) + '</p>' : '') +
        ((e.logros || []).length ? '<ul>' + e.logros.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    }).join('');
    var form = (c.formacion || []).map(function (f) { return '<div class="mini"><span><b>' + esc(f.anio || '') + '</b> ' + esc(f.titulo || '') + '</span><span class="muted">' + esc(f.institucion || '') + '</span></div>'; }).join('');
    var certs = (c.certificaciones || []).map(function (x) { return '<div class="mini"><span>' + esc(x.nombre) + '</span><span class="muted">' + esc(x.estado || '') + '</span></div>'; }).join('');
    var refs = (c.referencias || []).map(function (r) { return '<div class="mini"><span><b>' + esc(r.nombre) + '</b></span><span class="muted">' + esc(r.cargo || '') + '</span></div>'; }).join('');
    var hab = c.habilidades || {};
    return '<article class="cv"><header><h3>' + esc(c.nombre) + '</h3>' +
      '<p class="titular">' + esc(c.titular || '') + '</p>' +
      (c.titulo ? '<p class="grado">' + esc(c.titulo) + '</p>' : '') +
      '<div class="datos">' + [c.ciudad, c.contacto && c.contacto.tel, c.contacto && c.contacto.mail, c.contacto && c.contacto.linkedin, c.contacto && c.contacto.instagram].filter(Boolean).map(esc).join('<br>') + '</div></header>' +
      (c.resumen ? '<section><h4>Perfil profesional</h4><p>' + esc(c.resumen) + '</p></section>' : '') +
      (exp ? '<section><h4>Experiencia profesional</h4>' + exp + '</section>' : '') +
      ((form || certs) ? '<section class="two"><div><h4>Formación</h4>' + form + '</div><div><h4>Certificaciones</h4>' + certs + '</div></section>' : '') +
      ((hab.tecnicas || hab.gestion || hab.herramientas) ? '<section><h4>Habilidades</h4>' +
        (hab.tecnicas ? '<div class="skill-group"><span class="l">Técnicas</span><p>' + esc(hab.tecnicas.join(' · ')) + '</p></div>' : '') +
        (hab.gestion ? '<div class="skill-group"><span class="l">Gestión</span><p>' + esc(hab.gestion.join(' · ')) + '</p></div>' : '') +
        (hab.herramientas ? '<div class="skill-group"><span class="l">Herramientas</span><p>' + esc(hab.herramientas.join(' · ')) + '</p></div>' : '') + '</section>' : '') +
      ((c.idiomas || refs) ? '<section class="two"><div><h4>Idiomas</h4><p>' + esc((c.idiomas || []).join(' · ')) + '</p></div><div><h4>Referencias</h4>' + refs + '</div></section>' : '') +
      '<div class="cv-foot"><span>Expectativa: <b>' + money(c.expectativa) + '</b></span><span>Disponibilidad: <b>' + esc((c.disponibilidad && c.disponibilidad.texto) || 'sin dato') + '</b></span></div>' +
      '</article>';
  }

  /* -------------------------------- matriz ------------------------------- */
  VISTAS.matriz = function () {
    if (D.vacio) return emptyView('Sin datos para cruzar', 'Carga al menos un puesto y un candidato.');
    if (!state.matriz) state.matriz = D.filas[0].id + '|' + (D.filas[0].puesto || D.puestos[0].id);
    var pos = DATA.puestos;
    var head = '<div class="h">Candidato / puesto</div>' + pos.map(function (p) { return '<div class="h">' + esc(p.nombre) + '</div>'; }).join('');
    var rows = D.filas.map(function (f) {
      return '<div class="rh">' + esc(f.nombre) + '</div>' + pos.map(function (p) {
        var ev = f.matriz[p.id];
        var a = clamp((ev.fit - 45) / 100, 0.03, 0.55);
        var low = ev.fit < 55 ? ' low' : '';
        return '<button class="cell' + low + '" style="--a:' + a.toFixed(2) + '" data-matriz="' + esc(f.id + '|' + p.id) + '" aria-pressed="' + (state.matriz === f.id + '|' + p.id) + '">' +
          '<span class="v">' + nf(ev.fit, 1) + '</span>' + (f.puesto === p.id ? '<span class="s">aplica</span>' : '') + '</button>';
      }).join('');
    }).join('');
    return pageHeadSimple('Matriz · ' + D.filas.length + ' × ' + pos.length, 'Matriz', 'Encaje de cada persona en cada puesto.') +
      '<div class="matriz-wrap"><div class="matriz" style="grid-template-columns: 168px repeat(' + pos.length + ', minmax(78px, 1fr))">' + head + rows + '</div></div>' +
      '<div class="matriz-legend"><span>45</span><span class="scale"></span><span>100</span><span>· rojo: por debajo de 55</span></div>' +
      matrizDetalle();
  };

  function matrizDetalle() {
    var parts = String(state.matriz || '').split('|');
    var f = D.porId[parts[0]];
    var p = puestoById(parts[1]);
    if (!f || !p) return '';
    var ev = f.matriz[p.id];
    var cand = candById(f.id);
    var brechas = (DATA.dimensiones || []).map(function (d) {
      return { id: d.id, have: cand.vector[d.id] || 0, req: (p.perfil.niveles || {})[d.id] || 0 };
    }).filter(function (x) { return x.req >= 25 && x.have < x.req; }).sort(function (a, b) { return (a.have - a.req) - (b.have - b.req); });
    return '<div class="matriz-detalle"><div class="head"><h3>' + esc(cand.nombre) + ' <span class="muted">para</span> ' + esc(p.nombre) + '</h3>' +
      '<span class="sub">Encaje ' + nf(ev.fit, 1) + ' · ' + (f.puesto === p.id ? 'es su puesto' : 'no es su puesto') + '</span></div>' +
      '<div class="cols"><div><h4 class="tiny muted">Brechas</h4>' + (ev.bloqueos.length ? '<p class="small">' + ev.bloqueos.map(function (b) { return esc(b.texto); }).join(' ') + '</p>' : '') +
      (brechas.length ? '<ul class="small">' + brechas.slice(0, 4).map(function (g) { return '<li>' + esc(dim(g.id).nombre) + ': ' + g.have + ' de ' + g.req + '</li>'; }).join('') + '</ul>' : '<p class="small muted">Sin brechas.</p>') + '</div>' +
      '<div><h4 class="tiny muted">Lectura</h4><p class="small">' + esc(lecturaCruce(f, p, ev)) + '</p></div>' +
      '<div><h4 class="tiny muted">Salario</h4><p class="small">Expectativa ' + money(cand.expectativa) + ' · banda ' + money(p.banda[0]) + ' a ' + money(p.banda[1]) + '.</p>' +
      '<div class="btn-row"><button class="btn btn--sm" data-cand="' + esc(cand.id) + '">Hoja de vida</button></div></div></div></div>';
  }

  function lecturaCruce(f, p, ev) {
    if (ev.bloqueos.length) return 'Tiene un requisito eliminatorio sin cumplir: revisar antes de avanzar.';
    if (ev.salario && ev.salario.exceso > 12) return 'Encaje técnico, pero su expectativa está ' + Math.round(ev.salario.exceso) + '% sobre el tope de la banda.';
    if (ev.fit >= 90) return 'Encaja por encima del mínimo en casi todas las dimensiones.';
    if (ev.fit >= 75) return 'Encaja bien; las brechas se cubren con inducción.';
    if (ev.fit >= 60) return 'Encaje parcial: sirve como plan B con formación.';
    return 'No es un encaje razonable para este puesto.';
  }

  /* -------------------------------- datos -------------------------------- */
  VISTAS.datos = function () {
    var origen = leer(LS_DATA) ? 'Importado en este navegador' : 'Ejemplo incluido en la aplicación';
    return pageHeadSimple('Datos · ' + esc(origen), 'Datos', 'Todo sale de un archivo JSON: expórtalo, edítalo y vuelve a cargarlo.') +
      '<section class="sec">' +
      '<div class="datos-grid"><div class="datos-card"><h3>' + esc((DATA.empresa && DATA.empresa.nombre) || 'Sin nombre') + '</h3>' +
      '<table class="mini-tabla"><tbody>' +
      '<tr><td>Puestos</td><td>' + DATA.puestos.length + '</td></tr>' +
      '<tr><td>Candidatos</td><td>' + DATA.candidatos.length + '</td></tr>' +
      '<tr><td>Dimensiones</td><td>' + (DATA.dimensiones || []).length + '</td></tr>' +
      '<tr><td>Ejes de cultura</td><td>' + (DATA.culturaEjes || []).length + '</td></tr>' +
      '<tr><td>Dolores</td><td>' + (DATA.dolores || []).length + '</td></tr>' +
      '<tr><td>Actualizado</td><td>' + fecha() + '</td></tr>' +
      '</tbody></table>' +
      '<div class="btn-row"><button class="btn btn--sm" data-datos="exportar">Exportar JSON</button>' +
      '<button class="btn btn--sm btn--ghost" data-datos="ejemplo">Volver al ejemplo</button></div></div>' +
      '<div class="datos-card"><h3>Cargar otro conjunto</h3>' +
      '<p>Sube un archivo <b>.json</b> con la misma estructura o pega el contenido abajo. Se guarda solo en este navegador.</p>' +
      '<input type="file" id="fileDatos" accept=".json,application/json">' +
      '<p class="note">o pega el JSON:</p>' +
      '<textarea class="area" id="areaDatos" spellcheck="false" placeholder=\'{ "empresa": {...}, "dimensiones": [...], "puestos": [...], "candidatos": [...] }\'></textarea>' +
      '<div class="btn-row"><button class="btn btn--solid btn--sm" data-datos="importar">Cargar JSON</button></div>' +
      (state.errores.length ? '<div class="errores"><b>No se pudo cargar:</b><ul>' + state.errores.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>' : '') +
      (state.ok ? '<div class="ok-msg">' + esc(state.ok) + '</div>' : '') +
      '</div></div></section>' +
      '<section class="sec"><div class="sec-head"><h2>Qué necesita el archivo</h2><span class="n">Esquema</span></div>' +
      '<div class="datos-card"><table class="mini-tabla mini-tabla--text"><thead><tr><th>Bloque</th><th>Obligatorio</th></tr></thead><tbody>' +
      '<tr><td><b>empresa</b></td><td>nombre · cultura con un valor 0-100 por cada eje</td></tr>' +
      '<tr><td><b>dimensiones</b></td><td>id · nombre · corto · desc</td></tr>' +
      '<tr><td><b>culturaEjes</b></td><td>id · nombre · desc (opcional: peso)</td></tr>' +
      '<tr><td><b>dolores</b></td><td>id · nombre · desc · pesos por dimensión</td></tr>' +
      '<tr><td><b>noNegociables</b></td><td>id · nombre</td></tr>' +
      '<tr><td><b>puestos</b></td><td>id · nombre · banda [mín, máx] · perfil.niveles (todas las dimensiones)</td></tr>' +
      '<tr><td><b>candidatos</b></td><td>id · nombre · vector (todas las dimensiones) · cultura (todos los ejes) · expectativa · entrevista</td></tr>' +
      '<tr><td><b>preguntas</b></td><td>opcional: una lista de preguntas por dimensión</td></tr>' +
      '<tr><td><b>preguntasCultura</b></td><td>opcional: una pregunta por eje</td></tr>' +
      '</tbody></table>' +
      '<p class="note">Los candidatos sin <b>puestoAplicado</b> se evalúan contra todos y se les asigna el de mayor encaje. Las dimensiones pueden ser otras: el motor se adapta a las que definas.</p></div></section>';
  };

  /* -------------------------------- método ------------------------------- */
  VISTAS.metodo = function () {
    var dims = (DATA.dimensiones || []).map(function (d) { return d.nombre; }).join(', ');
    return pageHeadSimple('Método', 'Método', 'Cómo se calcula y qué no hace.') +
      '<div class="metodo">' +
      '<div class="metodo-grid">' +
      '<div><h3>Puntaje por dimensión</h3>' +
      '<div class="formula"><b>100 × (tiene / pide)<sup>1,35</sup></b> si tiene &lt; pide<br><b>100 + (tiene − pide) × 0,12</b> si tiene ≥ pide</div>' +
      '<p class="small">Dimensiones: ' + esc(dims) + '. Por encima del mínimo suma poco: el sobreperfil también es un riesgo.</p></div>' +
      '<div><h3>Encaje del puesto</h3>' +
      '<div class="formula"><b>Σ (peso × puntaje) − bloqueos − exceso salarial</b></div>' +
      '<p class="small">El peso depende de la exigencia de cada dimensión y del dolor declarado. Los requisitos eliminatorios y el salario fuera de banda descuentan.</p></div>' +
      '<div><h3>Índice de contratación</h3>' +
      '<div class="formula"><b>' + pct(D.pesos.impacto) + '</b> impacto · <b>' + pct(D.pesos.cultura) + '</b> cultura · <b>' + pct(D.pesos.potencial) + '</b> potencial · <b>' + pct(D.pesos.riesgo) + '</b> riesgo</div>' +
      '<p class="small">El impacto es encaje × criticidad de la vacante. Los pesos cambian con la urgencia y con el peso de la cultura.</p></div>' +
      '<div><h3>Criticidad y cultura</h3>' +
      '<p class="small"><b>Criticidad</b> = 55% alineación con el dolor + 25% riesgo operativo + 20% escasez del perfil.</p>' +
      '<p class="small"><b>Match cultural</b> = 100 − diferencia media entre los ejes de la persona y los de la empresa.</p></div>' +
      '</div>' +
      '<div class="metodo-grid">' +
      '<div><h3>Lo que sí hace</h3><ul>' +
      '<li>Ordena la conversación y hace explícitos los supuestos.</li>' +
      '<li>Muestra brechas y preguntas para verificarlas.</li>' +
      '<li>Se recalcula con el contexto de la empresa.</li></ul></div>' +
      '<div><h3>Lo que no hace</h3><ul>' +
      '<li>No verifica documentos ni referencias.</li>' +
      '<li>No mide a la persona: mide lo que el expediente declara.</li>' +
      '<li>No decide por ti.</li></ul></div></div>' +
      '<div class="callout"><b>Datos de ejemplo.</b> Empresa, personas, teléfonos y cifras son ficticios. Si cargas datos reales, quedan guardados en este navegador.</div>' +
      '</div>';
  };

  /* ------------------------------- auxiliares ---------------------------- */
  function emptyView(t, s) {
    return pageHeadSimple('PASE', 'Sin datos', s) +
      '<div class="empty"><h3>' + esc(t) + '</h3><p>' + esc(s) + '</p>' +
      '<button class="btn btn--solid" data-nav="datos">Ir a Datos</button></div>';
  }

  /* -------------------------------- eventos ------------------------------ */
  function refresh() {
    compute();
    guardarCtx();
    var ph = $('#pageHead');
    if (ph) ph.outerHTML = pageHeadHTML();
    var ch = $('#ctxChips');
    if (ch) ch.outerHTML = chipsHTML();
    var box = $('#resultados');
    if (box) box.innerHTML = resultadosHTML();
    var pl = $('#pesosLinea');
    if (pl) pl.innerHTML = pesosLinea();
  }

  function resetCtx() {
    borrar(LS_CTX);
    state.ctx = ctxInicial();
    compute();
    guardarCtx();
    render();
    toast('Contexto restablecido');
  }

  function importar(texto) {
    var obj;
    try { obj = JSON.parse(texto); } catch (e) {
      state.errores = ['El texto no es JSON válido: ' + e.message];
      state.ok = '';
      render();
      return;
    }
    var v = M.validar(obj);
    if (!v.ok) {
      state.errores = v.errores;
      state.ok = '';
      render();
      return;
    }
    DATA = obj;
    guardar(LS_DATA, obj);
    resetSeleccion();
    state.errores = [];
    state.ok = 'Conjunto cargado: ' + obj.puestos.length + ' puestos y ' + obj.candidatos.length + ' candidatos.';
    compute();
    asegurarSeleccion();
    render();
    toast('Datos cargados');
  }

  function descargar(nombre, contenido, mime) {
    var blob = new Blob([contenido], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { toast('Informe copiado'); }, function () { copiarFallback(texto); });
    } else copiarFallback(texto);
  }
  function copiarFallback(texto) {
    var t = document.createElement('textarea');
    t.value = texto;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); toast('Informe copiado'); } catch (e) { toast('No se pudo copiar'); }
    document.body.removeChild(t);
  }

  /* ------------------------------- informes ------------------------------ */
  function informe() {
    if (!D || D.vacio) return '# Sin diagnóstico\n\nFaltan datos.';
    var e = DATA.empresa || {};
    var f = D.veredictos.contratacion;
    var p = D.veredictos.criticidad;
    var cul = D.veredictos.cultura;
    var ent = D.veredictos.entrevista;
    var l = [];
    l.push('# Diagnóstico de contratación · ' + (e.nombre || ''));
    l.push('');
    l.push(fecha() + ' · ' + DATA.puestos.length + ' puestos · ' + DATA.candidatos.length + ' candidatos');
    l.push('');
    l.push('Contexto: dolor "' + (D.dolor ? D.dolor.nombre : '') + '", presupuesto ' + state.ctx.presupuesto + ', urgencia ' + state.ctx.urgencia + '/100, peso de cultura ' + state.ctx.culturaPeso + '/100.');
    l.push('');
    l.push('## Veredictos');
    l.push('');
    l.push('- **Fichaje recomendado:** ' + f.nombre + ' para ' + f.puestoNombre + ' (índice ' + nf(f.indice) + ').');
    l.push('- **Vacante más crítica:** ' + p.nombre + ' (' + nf(p.criticidad) + ').');
    l.push('- **Mejor match cultural:** ' + cul.nombre + ' (' + nf(cul.cultura) + ').');
    l.push('- **Entrevistar primero:** ' + ent.nombre + ' (' + nf(ent.prioridad) + ').');
    l.push('');
    l.push('## Ranking');
    l.push('');
    l.push('| # | Candidato | Puesto | Índice | Encaje | Cultura | Entrevista |');
    l.push('| ---: | --- | --- | ---: | ---: | ---: | ---: |');
    D.filas.forEach(function (x) {
      l.push('| ' + x.posicion + ' | ' + x.nombre + ' | ' + x.puestoNombre + ' | ' + nf(x.indice) + ' | ' + nf(x.fit) + ' | ' + nf(x.cultura) + ' | ' + nf(x.prioridad) + ' |');
    });
    l.push('');
    l.push('## Vacantes por criticidad');
    l.push('');
    l.push('| Puesto | Criticidad | Alineación | Riesgo | Escasez |');
    l.push('| --- | ---: | ---: | ---: | ---: |');
    D.rankingPuestos.forEach(function (x) {
      l.push('| ' + x.nombre + ' | ' + nf(x.criticidad) + ' | ' + ni(x.critComponentes.alineacion) + ' | ' + ni(x.critComponentes.riesgo) + ' | ' + ni(x.critComponentes.escasez) + ' |');
    });
    l.push('');
    l.push('## Fichaje recomendado: ' + f.nombre);
    l.push('');
    l.push('**Por qué.** ' + razonFichaje(f).replace(/<[^>]+>/g, ''));
    l.push('');
    l.push('**Brechas.** ' + (f.gaps.length ? f.gaps.map(function (g) { return dim(g.dim).nombre + ' (' + g.have + ' de ' + g.req + ')'; }).join('; ') : 'ninguna.'));
    l.push('');
    l.push('**Riesgos.** ' + ((candById(f.id).riesgos || []).map(function (r) { return r.tipo + ': ' + r.texto; }).join(' ') || 'sin riesgos declarados.'));
    l.push('');
    l.push('**Plan de entrevista**');
    l.push('');
    var items = planItems(f);
    items.forEach(function (it, i) { l.push((i + 1) + '. [' + it.label + '] ' + it.q); });
    l.push('');
    l.push('---');
    l.push('');
    l.push('Modelo: ' + pct(D.pesos.impacto) + ' impacto · ' + pct(D.pesos.cultura) + ' cultura · ' + pct(D.pesos.potencial) + ' potencial · ' + pct(D.pesos.riesgo) + ' riesgo. Datos guardados en el navegador.');
    return l.join('\n');
  }

  function planItems(f) {
    var cand = candById(f.id);
    var p = puestoById(f.puesto);
    var items = [];
    var weak = Object.keys(f.detalle).map(function (id) {
      return { id: id, s: f.detalle[id], req: (p.perfil.niveles || {})[id] || 0 };
    }).filter(function (x) { return x.req >= 40; }).sort(function (a, b) { return a.s - b.s; }).slice(0, 2);
    weak.forEach(function (w) {
      var banco = (DATA.preguntas || {})[w.id];
      items.push({ label: 'Competencia · ' + dim(w.id).nombre, q: (banco && banco[0]) || ('Cuéntame cómo resuelves ' + dim(w.id).nombre.toLowerCase() + ' en un servicio real.') });
    });
    if (cand.verificacion) items.push({ label: 'Verificación', q: cand.verificacion });
    var peor = Object.keys(f.culturaEje).sort(function (a, b) {
      return Math.abs(f.culturaEje[b]) - Math.abs(f.culturaEje[a]);
    })[0];
    var qc = (DATA.preguntasCultura || {})[peor];
    if (qc) items.push({ label: 'Cultura · ' + eje(peor).nombre, q: qc });
    return items;
  }

  function cvMarkdown(c) {
    var l = [];
    l.push('# ' + c.nombre);
    l.push('');
    l.push('**' + (c.titular || '') + '**');
    l.push('');
    l.push([c.ciudad, c.contacto && c.contacto.tel, c.contacto && c.contacto.mail, c.contacto && c.contacto.linkedin].filter(Boolean).join(' · '));
    l.push('');
    if (c.resumen) { l.push('## Perfil profesional'); l.push(''); l.push(c.resumen); l.push(''); }
    if ((c.experiencia || []).length) {
      l.push('## Experiencia profesional'); l.push('');
      c.experiencia.forEach(function (e) {
        l.push('### ' + e.cargo); l.push('');
        l.push('**' + (e.empresa || '') + '** · ' + (e.periodo || '')); l.push('');
        if (e.contexto) { l.push('*' + e.contexto + '*'); l.push(''); }
        (e.logros || []).forEach(function (x) { l.push('- ' + x); });
        l.push('');
      });
    }
    if ((c.formacion || []).length) {
      l.push('## Formación'); l.push('');
      c.formacion.forEach(function (f) { l.push('- ' + (f.anio || '') + ' · ' + (f.titulo || '') + ' · ' + (f.institucion || '')); });
      l.push('');
    }
    if ((c.certificaciones || []).length) {
      l.push('## Certificaciones'); l.push('');
      c.certificaciones.forEach(function (x) { l.push('- ' + x.nombre + ': ' + (x.estado || '')); });
      l.push('');
    }
    var h = c.habilidades || {};
    if (h.tecnicas || h.gestion || h.herramientas) {
      l.push('## Habilidades'); l.push('');
      if (h.tecnicas) l.push('- **Técnicas:** ' + h.tecnicas.join(' · '));
      if (h.gestion) l.push('- **Gestión:** ' + h.gestion.join(' · '));
      if (h.herramientas) l.push('- **Herramientas:** ' + h.herramientas.join(' · '));
      l.push('');
    }
    if ((c.idiomas || []).length) { l.push('## Idiomas'); l.push(''); l.push(c.idiomas.join(' · ')); l.push(''); }
    if ((c.referencias || []).length) {
      l.push('## Referencias'); l.push('');
      c.referencias.forEach(function (r) { l.push('- **' + r.nombre + '** · ' + (r.cargo || '') + ' · ' + (r.nota || '')); });
      l.push('');
    }
    l.push('## Condiciones'); l.push('');
    l.push('- Expectativa: ' + money(c.expectativa));
    l.push('- Disponibilidad: ' + ((c.disponibilidad && c.disponibilidad.texto) || 'sin dato'));
    return l.join('\n');
  }

  /* ------------------------------- arranque ------------------------------ */
  function bind() {
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-nav],[data-cand],[data-puesto],[data-tab],[data-export],[data-export-cv],[data-datos],[data-tema],[data-ctx-toggle],[data-tab-resumen],[data-ctx-reset]');
      if (!t) return;

      if (t.hasAttribute('data-nav')) {
        state.vista = t.getAttribute('data-nav');
        render();
        var v = $('#vista'); if (v) v.focus({ preventScroll: true });
        return;
      }
      if (t.hasAttribute('data-tema')) { toggleTema(); return; }
      if (t.hasAttribute('data-ctx-toggle')) { toggleCtx(); return; }
      if (t.hasAttribute('data-ctx-reset')) { resetCtx(); return; }
      if (t.hasAttribute('data-tab-resumen')) {
        state.tabResumen = t.getAttribute('data-tab-resumen');
        var box = $('#resultados');
        if (box) box.innerHTML = resultadosHTML();
        var nb = document.querySelector('[data-tab-resumen="' + state.tabResumen + '"]');
        if (nb) nb.focus({ preventScroll: true });
        return;
      }
      if (t.hasAttribute('data-cand')) {
        state.cand = t.getAttribute('data-cand');
        state.vista = 'candidatos';
        render();
        return;
      }
      if (t.hasAttribute('data-puesto')) {
        state.puesto = t.getAttribute('data-puesto');
        state.vista = 'puestos';
        render();
        return;
      }
      if (t.hasAttribute('data-tab')) {
        state.tab = t.getAttribute('data-tab');
        render();
        return;
      }
      if (t.hasAttribute('data-export-cv')) {
        var c = candById(t.getAttribute('data-export-cv'));
        if (c) descargar('cv-' + c.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md', cvMarkdown(c), 'text/markdown;charset=utf-8');
        return;
      }
      if (t.hasAttribute('data-export')) {
        var modo = t.getAttribute('data-export');
        if (modo === 'copy') copiar(informe());
        else descargar('diagnostico-' + ((DATA.empresa && DATA.empresa.nombre) || 'pase').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md', informe(), 'text/markdown;charset=utf-8');
        return;
      }
      if (t.hasAttribute('data-datos')) {
        var acc = t.getAttribute('data-datos');
        if (acc === 'exportar') descargar('pase-datos.json', JSON.stringify(DATA, null, 2), 'application/json');
        if (acc === 'ejemplo') {
          borrar(LS_DATA);
          borrar(LS_CTX);
          DATA = window.BRIGADA;
          resetSeleccion();
          state.errores = []; state.ok = 'Se restauró el conjunto de ejemplo.';
          compute(); render(); toast('Ejemplo restaurado');
        }
        if (acc === 'importar') {
          var area = $('#areaDatos');
          importar(area ? area.value : '');
        }
        return;
      }
    });

    document.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.matches('[data-ctx]')) {
        state.ctx[t.getAttribute('data-ctx')] = t.value;
        refresh();
        return;
      }
      if (t.matches('[data-nn]')) {
        var id = t.getAttribute('data-nn');
        var i = state.ctx.noNegociables.indexOf(id);
        if (t.checked && i === -1) state.ctx.noNegociables.push(id);
        if (!t.checked && i > -1) state.ctx.noNegociables.splice(i, 1);
        refresh();
        return;
      }
      if (t.id === 'fileDatos' && t.files && t.files[0]) {
        var fr = new FileReader();
        fr.onload = function () { importar(String(fr.result)); };
        fr.readAsText(t.files[0]);
      }
    });

    var tmr = null;
    document.addEventListener('input', function (ev) {
      var t = ev.target;
      if (!t.matches('[data-range]')) return;
      var k = t.getAttribute('data-range');
      state.ctx[k] = Number(t.value);
      var out = document.querySelector('[data-out="' + k + '"]');
      if (out) out.textContent = t.value;
      clearTimeout(tmr);
      tmr = setTimeout(refresh, 110);
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    DATA = cargarDataset();
    var v = M.validar(DATA);
    if (!v.ok) {
      document.getElementById('vista').innerHTML = '<section class="sec"><div class="empty"><h3>El conjunto de datos no es válido</h3><ul>' +
        v.errores.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div></section>';
      return;
    }
    resetSeleccion();
    temaInicial();
    compute();
    asegurarSeleccion();
    bind();
    render();
  });
})();
