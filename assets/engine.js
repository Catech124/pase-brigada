/* =========================================================================
   PASE · motor de diagnóstico
   Genérico: las dimensiones, ejes de cultura, puestos y candidatos salen del
   conjunto de datos. No asume cuántos hay ni cómo se llaman.
   Funciones puras, sin DOM.
   ========================================================================= */
(function (global) {
  'use strict';

  var CTX_BASE = {
    dolor: null,
    presupuesto: 'estandar',
    urgencia: 55,
    culturaPeso: 55,
    noNegociables: []
  };

  var MULT_PRESUPUESTO = { ajustado: 0.9, estandar: 1.0, amplio: 1.12 };

  /* pesos de cultura por defecto; un eje puede traer su propio `peso` */
  var PESOS_CULTURA = {
    rigor: 1.3, ritmo: 1.0, hospitalidad: 1.1,
    estructura: 1.2, creatividad: 0.9, estabilidad: 1.0
  };

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function num(v, def) { return typeof v === 'number' && isFinite(v) ? v : def; }
  function arr(v) { return Array.isArray(v) ? v : []; }

  function dimsOf(data) { return arr(data.dimensiones).map(function (d) { return d.id; }); }
  function ejesOf(data) { return arr(data.culturaEjes).map(function (c) { return c.id; }); }

  /* Puntaje de una dimensión: por debajo del requisito castiga con curva;
     por encima suma poco (el sobreperfil no es oro, es riesgo de fuga). */
  function scoreDim(have, need) {
    if (!need) return 100;
    if (have >= need) return Math.min(104, 100 + (have - need) * 0.12);
    return 100 * Math.pow(Math.max(0, have) / need, 1.35);
  }

  function pesosPuesto(puesto, dolor, dims) {
    var prio = (dolor && dolor.pesos) || {};
    var w = {};
    var total = 0;
    dims.forEach(function (d) {
      var req = num(puesto.perfil && puesto.perfil.niveles[d], 0);
      var base = 0.35 + Math.pow(req / 100, 1.2);
      w[d] = base * (num(prio[d], 1));
      total += w[d];
    });
    if (total > 0) dims.forEach(function (d) { w[d] = w[d] / total; });
    return w;
  }

  function evaluarPuesto(puesto, cand, cfg) {
    var dims = cfg.dims;
    var w = pesosPuesto(puesto, cfg.dolorObj, dims);
    var suma = 0;
    var detalle = {};
    dims.forEach(function (d) {
      var s = scoreDim(num(cand.vector[d], 0), num(puesto.perfil && puesto.perfil.niveles[d], 0));
      detalle[d] = s;
      suma += (w[d] || 0) * s;
    });
    var bruto = suma;

    var bloqueos = [];
    var castigo = 0;
    arr(cfg.noNegociables).forEach(function (nn) {
      var estado = (cand.banderas || {})[nn];
      var nota = (cand.banderasNota || {})[nn];
      if (estado === false || estado === 'no') {
        castigo += 14;
        bloqueos.push({ id: nn, tipo: 'bloqueo', texto: nota || 'No cumple el requisito eliminatorio.' });
      } else if (estado === 'vence') {
        castigo += 4;
        bloqueos.push({ id: nn, tipo: 'aviso', texto: nota || 'Documento próximo a vencer.' });
      }
    });

    var tope = num(puesto.banda && puesto.banda[1], 0);
    var cap = tope > 0 ? tope * (MULT_PRESUPUESTO[cfg.presupuesto] || 1) : 0;
    var exp = num(cand.expectativa, 0);
    var exceso = cap > 0 && exp > cap ? (exp - cap) / cap : 0;
    var castigoSalario = Math.min(12, exceso * 90);

    var sobre = [];
    dims.forEach(function (d) {
      var req = num(puesto.perfil && puesto.perfil.niveles[d], 0);
      var dif = num(cand.vector[d], 0) - req;
      if (req >= 50 && dif >= 22) sobre.push({ dim: d, dif: dif });
    });

    return {
      fit: r1(clamp(bruto - castigo - castigoSalario, 0, 100)),
      bruto: r1(bruto),
      detalle: detalle,
      pesos: w,
      bloqueos: bloqueos,
      castigo: r1(castigo),
      castigoSalario: r1(castigoSalario),
      sobreperfil: sobre,
      salario: { cap: Math.round(cap), exceso: r1(exceso * 100), dentro: exceso <= 0 }
    };
  }

  function matchCultura(empresa, cand, ejes, defs) {
    var suma = 0, pt = 0;
    ejes.forEach(function (id) {
      var def = (defs || []).filter(function (c) { return c.id === id; })[0] || {};
      var w = num(def.peso, PESOS_CULTURA[id] || 1);
      suma += w * Math.abs(num(empresa.cultura && empresa.cultura[id], 50) - num(cand.cultura && cand.cultura[id], 50));
      pt += w;
    });
    var brecha = pt ? suma / pt : 0;
    return {
      score: r1(clamp(100 - brecha * 1.05, 0, 100)),
      brecha: r1(brecha),
      porEje: ejes.reduce(function (acc, id) {
        acc[id] = Math.round(num(cand.cultura && cand.cultura[id], 50) - num(empresa.cultura && empresa.cultura[id], 50));
        return acc;
      }, {})
    };
  }

  function entrevista(cand, fit, impacto) {
    var e = cand.entrevista || {};
    var potencial = 0.35 * num(e.evidencia, 50) + 0.25 * num(e.trayectoria, 50) +
      0.20 * num(e.referencias, 50) + 0.20 * (100 - num(e.riesgo, 30));
    var prioridad = 0.42 * potencial + 0.22 * fit + 0.24 * (impacto || 0) + 0.12 * num(e.disponibilidad, 60);
    return { potencial: r1(potencial), prioridad: r1(clamp(prioridad, 0, 100)) };
  }

  function criticidad(puesto, cfg) {
    var prio = (cfg.dolorObj && cfg.dolorObj.pesos) || {};
    var nume = 0, den = 0;
    cfg.dims.forEach(function (d) {
      var w = num(prio[d], 0);
      nume += w * num(puesto.perfil && puesto.perfil.niveles[d], 0);
      den += w;
    });
    var alineacion = den ? nume / den : 0;
    var score = 0.55 * alineacion + 0.25 * num(puesto.riesgoOperativo, 50) + 0.20 * num(puesto.escasez, 50);
    return {
      score: r1(clamp(score, 0, 100)),
      alineacion: r1(alineacion),
      riesgo: num(puesto.riesgoOperativo, 50),
      escasez: num(puesto.escasez, 50)
    };
  }

  function gaps(puesto, cand, dims) {
    return dims.map(function (d) {
      var req = num(puesto.perfil && puesto.perfil.niveles[d], 0);
      var have = num(cand.vector[d], 0);
      return { dim: d, req: req, have: have, dif: have - req };
    }).filter(function (g) { return g.req >= 40 && g.dif <= -3; })
      .sort(function (a, b) { return (a.dif * a.req) - (b.dif * b.req); });
  }

  function fortalezas(puesto, cand, dims) {
    return dims.map(function (d) {
      var req = num(puesto.perfil && puesto.perfil.niveles[d], 0);
      var have = num(cand.vector[d], 0);
      return { dim: d, req: req, have: have, dif: have - req };
    }).filter(function (g) { return g.req >= 50 && g.dif >= 3; })
      .sort(function (a, b) { return (b.dif * b.req) - (a.dif * a.req); }).slice(0, 3);
  }

  /* ------------------------------ validación ----------------------------- */
  function validar(data) {
    var errores = [];
    function req(cond, msg) { if (!cond) errores.push(msg); }

    req(data && typeof data === 'object', 'El archivo no contiene un objeto JSON.');
    if (!data || typeof data !== 'object') return { ok: false, errores: errores };

    req(data.empresa && typeof data.empresa.nombre === 'string', 'Falta empresa.nombre.');
    req(arr(data.dimensiones).length > 0, 'Falta dimensiones (al menos una).');
    req(arr(data.culturaEjes).length > 0, 'Falta culturaEjes (al menos uno).');
    req(arr(data.dolores).length > 0, 'Falta dolores (al menos uno).');
    req(arr(data.puestos).length > 0, 'Falta puestos (al menos uno).');
    req(arr(data.candidatos).length > 0, 'Falta candidatos (al menos uno).');
    if (errores.length) return { ok: false, errores: errores };

    var dims = dimsOf(data);
    var ejes = ejesOf(data);
    var idsP = {};
    var idsC = {};

    dims.forEach(function (id, i) {
      req(!!id, 'dimensiones[' + i + '].id vacío.');
      req(dims.indexOf(id) === i, 'Dimensión repetida: ' + id + '.');
      var d = data.dimensiones[i];
      req(typeof d.nombre === 'string' && d.nombre, 'dimensiones[' + i + '].nombre vacío.');
    });
    ejes.forEach(function (id, i) {
      req(!!id, 'culturaEjes[' + i + '].id vacío.');
      req(ejes.indexOf(id) === i, 'Eje de cultura repetido: ' + id + '.');
    });

    data.dolores.forEach(function (d, i) {
      req(typeof d.id === 'string' && d.id, 'dolores[' + i + '].id vacío.');
      req(d.pesos && typeof d.pesos === 'object', 'dolores[' + i + '] (' + (d.nombre || d.id) + ') no tiene pesos.');
    });

    data.puestos.forEach(function (p, i) {
      var et = 'puestos[' + i + '] (' + (p.nombre || p.id || 'sin nombre') + ')';
      req(typeof p.id === 'string' && p.id, et + ': falta id.');
      req(typeof p.nombre === 'string' && p.nombre, et + ': falta nombre.');
      if (p.id) { req(!idsP[p.id], et + ': id repetido.'); idsP[p.id] = 1; }
      req(p.perfil && p.perfil.niveles, et + ': falta perfil.niveles.');
      if (p.perfil && p.perfil.niveles) {
        dims.forEach(function (d) {
          req(typeof p.perfil.niveles[d] === 'number', et + ': falta el nivel de la dimensión "' + d + '".');
        });
      }
      req(Array.isArray(p.banda) && p.banda.length === 2, et + ': banda debe ser [mínimo, máximo].');
    });

    data.candidatos.forEach(function (c, i) {
      var et = 'candidatos[' + i + '] (' + (c.nombre || c.id || 'sin nombre') + ')';
      req(typeof c.id === 'string' && c.id, et + ': falta id.');
      req(typeof c.nombre === 'string' && c.nombre, et + ': falta nombre.');
      if (c.id) { req(!idsC[c.id], et + ': id repetido.'); idsC[c.id] = 1; }
      req(c.vector && typeof c.vector === 'object', et + ': falta vector.');
      if (c.vector) {
        dims.forEach(function (d) {
          req(typeof c.vector[d] === 'number', et + ': falta el valor de la dimensión "' + d + '".');
        });
      }
      req(c.cultura && typeof c.cultura === 'object', et + ': falta cultura.');
      if (c.cultura) {
        ejes.forEach(function (e) {
          req(typeof c.cultura[e] === 'number', et + ': falta el valor del eje "' + e + '".');
        });
      }
      req(typeof c.expectativa === 'number', et + ': falta expectativa salarial.');
      req(c.entrevista && typeof c.entrevista === 'object', et + ': falta entrevista.');
    });

    return { ok: errores.length === 0, errores: errores.slice(0, 12) };
  }

  /* ------------------------------- núcleo -------------------------------- */
  function vacio(data, ctx, motivo) {
    return {
      vacio: true,
      motivo: motivo,
      ctx: ctx,
      dolor: null,
      dims: dimsOf(data),
      ejes: ejesOf(data),
      filas: [],
      porId: {},
      puestos: [],
      rankingPuestos: [],
      veredictos: null,
      pesos: { impacto: 0.45, cultura: 0.25, potencial: 0.2, riesgo: 0.1 },
      margenIndice: 0,
      margenCultura: 0
    };
  }

  function diagnosticar(data, ctxEntrada) {
    var ctx = Object.assign({}, CTX_BASE, ctxEntrada || {});
    var dims = dimsOf(data);
    var ejes = ejesOf(data);
    var dolores = arr(data.dolores);
    var dolorObj = dolores.filter(function (d) { return d.id === ctx.dolor; })[0] || dolores[0] || { id: null, nombre: 'Sin dolor declarado', pesos: {} };
    var cfg = Object.assign({}, ctx, { dims: dims, ejes: ejes, dolorObj: dolorObj });

    if (!arr(data.puestos).length) return vacio(data, ctx, 'No hay puestos cargados.');
    if (!arr(data.candidatos).length) return vacio(data, ctx, 'No hay candidatos cargados.');

    var critPorPuesto = {};
    var critDetalle = {};
    data.puestos.forEach(function (p) {
      var c = criticidad(p, cfg);
      critPorPuesto[p.id] = c.score;
      critDetalle[p.id] = c;
    });

    var porPuesto = {};
    var filas = data.candidatos.map(function (cand) {
      var matriz = {};
      data.puestos.forEach(function (p) {
        var ev = evaluarPuesto(p, cand, cfg);
        matriz[p.id] = ev;
        porPuesto[p.id] = porPuesto[p.id] || [];
        porPuesto[p.id].push({ candidato: cand.id, fit: ev.fit });
      });

      var aplicado = data.puestos.filter(function (p) { return p.id === cand.puestoAplicado; })[0];
      var asignadoAuto = false;
      if (!aplicado) {
        var mejor = null;
        data.puestos.forEach(function (p) {
          if (!mejor || matriz[p.id].fit > mejor.fit) mejor = { puesto: p, fit: matriz[p.id].fit };
        });
        aplicado = mejor.puesto;
        asignadoAuto = true;
      }

      var ev = matriz[aplicado.id];
      var impacto = r1(ev.fit * (critPorPuesto[aplicado.id] || 0) / 100);
      var cult = matchCultura(data.empresa || {}, cand, ejes, data.culturaEjes);
      var ent = entrevista(cand, ev.fit, impacto);

      return {
        id: cand.id,
        nombre: cand.nombre,
        puesto: aplicado.id,
        puestoNombre: aplicado.nombre,
        asignadoAuto: asignadoAuto,
        fit: ev.fit,
        impacto: impacto,
        detalle: ev.detalle,
        pesos: ev.pesos,
        cultura: cult.score,
        culturaBrecha: cult.brecha,
        culturaEje: cult.porEje,
        potencial: ent.potencial,
        prioridad: ent.prioridad,
        bloqueos: ev.bloqueos,
        sobreperfil: ev.sobreperfil,
        salario: ev.salario,
        gaps: gaps(aplicado, cand, dims),
        fortalezas: fortalezas(aplicado, cand, dims),
        matriz: matriz
      };
    });

    var puestos = data.puestos.map(function (p) {
      var aptos = (porPuesto[p.id] || []).slice().sort(function (a, b) { return b.fit - a.fit; });
      return {
        id: p.id,
        nombre: p.nombre,
        criticidad: critPorPuesto[p.id],
        critComponentes: critDetalle[p.id],
        vacanteDias: num(p.vacanteDias, 0),
        mejorCandidato: aptos[0] || null,
        banda: p.banda || [0, 0]
      };
    });

    var rankingPuestos = puestos.slice().sort(function (a, b) { return b.criticidad - a.criticidad; });

    var u = clamp(num(ctx.urgencia, 55), 0, 100) / 100;
    var peso = {
      impacto: 0.45,
      cultura: 0.25 * (0.55 + 0.9 * (clamp(num(ctx.culturaPeso, 55), 0, 100) / 100)),
      potencial: 0.20,
      riesgo: 0.10
    };
    var sumaPesos = peso.impacto + peso.cultura + peso.potencial + peso.riesgo;

    filas.forEach(function (f) {
      var cand = data.candidatos.filter(function (c) { return c.id === f.id; })[0];
      var bloqueosDuros = f.bloqueos.filter(function (b) { return b.tipo === 'bloqueo'; }).length;
      f.riesgo = r1(clamp(
        0.55 * num(cand.entrevista && cand.entrevista.riesgo, 30) +
        0.30 * Math.min(24, bloqueosDuros * 12) * 2 +
        0.15 * Math.max(0, f.salario.exceso), 0, 100));
      var demora = u * (num(cand.disponibilidad && cand.disponibilidad.dias, 30) / 60) * 5;
      var bruto = (peso.impacto * f.impacto + peso.cultura * f.cultura + peso.potencial * f.potencial + peso.riesgo * (100 - f.riesgo)) / sumaPesos;
      f.indice = r1(clamp(bruto - demora, 0, 100));
      f.demora = r1(demora);
    });

    filas.sort(function (a, b) { return b.indice - a.indice; });
    filas.forEach(function (f, i) { f.posicion = i + 1; });

    function top(key) {
      return filas.slice().sort(function (a, b) { return b[key] - a[key]; })[0] || null;
    }

    var porCultura = filas.slice().sort(function (a, b) { return b.cultura - a.cultura; });

    var veredictos = {
      contratacion: filas[0] || null,
      cultura: porCultura[0] || null,
      entrevista: top('prioridad'),
      encaje: top('fit'),
      criticidad: rankingPuestos[0] || null,
      segundo: filas[1] || null
    };

    return {
      vacio: false,
      ctx: ctx,
      dolor: dolorObj,
      dims: dims,
      ejes: ejes,
      pesos: {
        impacto: peso.impacto / sumaPesos,
        cultura: peso.cultura / sumaPesos,
        potencial: peso.potencial / sumaPesos,
        riesgo: peso.riesgo / sumaPesos
      },
      filas: filas,
      porId: filas.reduce(function (acc, f) { acc[f.id] = f; return acc; }, {}),
      puestos: puestos,
      rankingPuestos: rankingPuestos,
      veredictos: veredictos,
      margenIndice: filas.length > 1 ? r1(filas[0].indice - filas[1].indice) : 0,
      margenCultura: porCultura.length > 1 ? r1(porCultura[0].cultura - porCultura[1].cultura) : 0
    };
  }

  var API = {
    diagnosticar: diagnosticar,
    validar: validar,
    CTX_BASE: CTX_BASE,
    _scoreDim: scoreDim
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.MOTOR = API;
})(typeof window !== 'undefined' ? window : globalThis);
