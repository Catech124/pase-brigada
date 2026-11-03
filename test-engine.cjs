/* Prueba de escritorio del motor: no necesita navegador. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'assets/data.js'), 'utf8'), sandbox);
const DATA = sandbox.window.BRIGADA;
const MOTOR = require('./assets/engine.js');

function show(ctx) {
  const d = MOTOR.diagnosticar(DATA, ctx);
  console.log('\n=== DOLOR:', d.dolor.nombre, '| presupuesto:', d.ctx.presupuesto, '| urgencia:', d.ctx.urgencia, '| culturaPeso:', d.ctx.culturaPeso, '===');
  console.log("pesos ->", Object.fromEntries(Object.entries(d.pesos).map(([k,v])=>[k,v.toFixed(2)])));
  console.log('\nRANKING');
  d.filas.forEach(f => {
    console.log(
      ` ${f.posicion}. ${f.nombre.padEnd(24)} idx ${f.indice.toFixed(1).padStart(5)} | fit ${f.fit.toFixed(1).padStart(5)} | cult ${f.cultura.toFixed(1).padStart(5)} | prio ${f.prioridad.toFixed(1).padStart(5)} | imp ${f.impacto.toFixed(1).padStart(5)} | rie ${f.riesgo.toFixed(1).padStart(5)} | pot ${f.potencial.toFixed(1)} | sal ${f.salario.exceso > 0 ? '+' + f.salario.exceso + '%' : 'ok'} | bloqueos ${f.bloqueos.length}`
    );
  });
  console.log('\nVEREDICTOS');
  console.log(' contratación:', d.veredictos.contratacion.nombre, d.veredictos.contratacion.indice);
  console.log(' cultura     :', d.veredictos.cultura.nombre, d.veredictos.cultura.cultura);
  console.log(' entrevista  :', d.veredictos.entrevista.nombre, d.veredictos.entrevista.prioridad);
  console.log('\nCRITICIDAD DE PUESTOS');
  d.rankingPuestos.forEach(p => console.log(` ${p.nombre.padEnd(46)} ${p.criticidad.toFixed(1).padStart(5)}  (alin ${p.critComponentes.alineacion}, riesgo ${p.critComponentes.riesgo}, escasez ${p.critComponentes.escasez})`));
  console.log('\nMATRIZ fit candidato x puesto');
  const head = ['candidato'.padEnd(18)].concat(d.rankingPuestos.map(p => p.id.slice(0, 10).padStart(11)));
  console.log(head.join(''));
  d.filas.forEach(f => {
    const row = [f.nombre.split(' ')[0].padEnd(18)];
    d.rankingPuestos.forEach(p => row.push(f.matriz[p.id].fit.toFixed(1).padStart(11)));
    console.log(row.join(''));
  });
  console.log('\nGAPS del #1:');
  d.veredictos.contratacion.gaps.slice(0, 4).forEach(g => console.log(`  ${g.dim}: tiene ${g.have} / pide ${g.req} (${g.dif})`));
}

show({});
show({ dolor: 'consistencia' });
show({ dolor: 'velocidad' });
show({ dolor: 'creatividad', presupuesto: 'amplio' });
show({ dolor: 'costos', noNegociables: ['manipulacion', 'findes', 'costos', 'liderazgo'], presupuesto: 'ajustado', urgencia: 90 });

/* validación y genericidad */
const v = MOTOR.validar(DATA);
console.log('\nVALIDACIÓN:', v.ok ? 'OK' : v.errores);
const roto = JSON.parse(JSON.stringify(DATA));
delete roto.candidatos[0].vector.tecnica;
roto.puestos[0].banda = 'nada';
console.log('VALIDACIÓN ROTA:', MOTOR.validar(roto).errores);
const sinPuesto = JSON.parse(JSON.stringify(DATA));
delete sinPuesto.candidatos[0].puestoAplicado;
const d2 = MOTOR.diagnosticar(sinPuesto, {});
console.log('SIN PUESTO ASIGNADO:', d2.porId.rosa.puesto, 'auto=', d2.porId.rosa.asignadoAuto);
const dimsExtra = JSON.parse(JSON.stringify(DATA));
dimsExtra.dimensiones.push({ id: 'digital', nombre: 'Digital', corto: 'Digital', desc: 'x' });
dimsExtra.dimensiones.forEach(() => {});
dimsExtra.puestos.forEach(p => { p.perfil.niveles.digital = 50; });
dimsExtra.candidatos.forEach(c => { c.vector.digital = 70; });
console.log('CON DIMENSIÓN EXTRA:', MOTOR.diagnosticar(dimsExtra, {}).filas.length, 'filas OK');
