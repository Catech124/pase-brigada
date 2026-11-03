/* =========================================================================
   PASE · datos de la brigada
   Contenido ficticio con fines de demostración. Empresa, personas, cifras
   y referencias son inventadas; cualquier parecido es coincidencia.
   ========================================================================= */
window.BRIGADA = {
  meta: {
    version: '1.0',
    actualizado: '2026-11-03',
    aviso:
      'Empresa, candidatos y cifras son ficticios. El diagnóstico es un modelo de apoyo: ordena la conversación, no sustituye la entrevista ni la verificación de documentos.'
  },

  empresa: {
    nombre: 'Casa Mirador',
    ciudad: 'Bogotá',
    tipo: 'Cocina de autor y mercado',
    cubiertos: 110,
    brigada: 12,
    ticket: 118000,
    foodCost: 34.8,
    merma: 7.2,
    rotacion: 48,
    valores: [
      'Rigor en el oficio antes que prisa',
      'Hospitalidad sin ceremonia',
      'Producto local y de temporada',
      'Orden: cada cosa en su sitio y a su hora'
    ],
    cultura: { rigor: 88, ritmo: 72, hospitalidad: 80, estructura: 82, creatividad: 55, estabilidad: 75 }
  },

  dimensiones: [
    { id: 'tecnica', nombre: 'Técnica culinaria', corto: 'Técnica', desc: 'Técnicas, puntos, sazón y ejecución repetible a la carta.' },
    { id: 'ritmo', nombre: 'Ritmo y volumen', corto: 'Ritmo', desc: 'Sostener el pico de servicio sin perder ejecución.' },
    { id: 'orden', nombre: 'Orden e higiene', corto: 'Orden', desc: 'Mise en place, rotulación, FIFO y BPM.' },
    { id: 'costos', nombre: 'Control de costos', corto: 'Costos', desc: 'Merma, escandallo, inventario y compras.' },
    { id: 'mando', nombre: 'Mando de brigada', corto: 'Mando', desc: 'Coordinar partidas, corregir y formar sin romper el equipo.' },
    { id: 'admin', nombre: 'Administración', corto: 'Admin', desc: 'Programación, facturas, documentación e indicadores.' },
    { id: 'creatividad', nombre: 'Creatividad e I+D', corto: 'I+D', desc: 'Desarrollo de platos con criterio de producto y margen.' },
    { id: 'servicio', nombre: 'Servicio y trato', corto: 'Servicio', desc: 'Puente con sala, cliente y proveedores.' }
  ],

  culturaEjes: [
    { id: 'rigor', nombre: 'Rigor', desc: 'Estándar alto, detalle y precisión.' },
    { id: 'ritmo', nombre: 'Ritmo', desc: 'Comodidad con el volumen y la prisa.' },
    { id: 'hospitalidad', nombre: 'Hospitalidad', desc: 'Calidez en el trato, dentro y fuera de la cocina.' },
    { id: 'estructura', nombre: 'Estructura', desc: 'Apego al proceso, a los registros y a la norma.' },
    { id: 'creatividad', nombre: 'Creatividad', desc: 'Curiosidad, búsqueda y cambio de carta.' },
    { id: 'estabilidad', nombre: 'Estabilidad', desc: 'Permanencia, constancia y bajo impulso de irse.' }
  ],

  dolores: [
    {
      id: 'costos',
      nombre: 'Costos fuera de control',
      desc: 'Food cost y merma por encima del objetivo, inventarios que no cuadran.',
      pesos: { costos: 1.45, admin: 1.2, orden: 1.1 }
    },
    {
      id: 'consistencia',
      nombre: 'Platos distintos cada turno',
      desc: 'El mismo plato sale diferente según quién esté en línea.',
      pesos: { tecnica: 1.4, orden: 1.2, mando: 1.15 }
    },
    {
      id: 'velocidad',
      nombre: 'El pase se cae en el pico',
      desc: 'Tiempos largos, comandas cruzadas, sala esperando.',
      pesos: { ritmo: 1.45, mando: 1.2, orden: 1.05 }
    },
    {
      id: 'experiencia',
      nombre: 'El cliente no vuelve',
      desc: 'Quejas de sala, trato frío, postres y salida débiles.',
      pesos: { servicio: 1.4, tecnica: 1.15, creatividad: 1.05 }
    },
    {
      id: 'creatividad',
      nombre: 'La carta se quedó vieja',
      desc: 'Sin novedades, sin relato de producto, competencia adelante.',
      pesos: { creatividad: 1.5, tecnica: 1.2, costos: 1.05 }
    }
  ],

  noNegociables: [
    { id: 'manipulacion', nombre: 'Manipulación de alimentos vigente' },
    { id: 'findes', nombre: 'Disponibilidad fines de semana' },
    { id: 'altaCocina', nombre: 'Experiencia en alta cocina' },
    { id: 'costos', nombre: 'Manejo demostrado de costos' },
    { id: 'liderazgo', nombre: 'Ha liderado equipo' }
  ],

  puestos: [
    {
      id: 'steward',
      nombre: 'Steward',
      area: 'Servicio y apoyo',
      nivel: 'Operativo',
      reporta: 'Chef ejecutivo',
      supervisa: 'Sin personal a cargo',
      resumen:
        'Asegura que la cocina tenga siempre menaje limpio, superficie sanitaria y residuos gestionados, para que la brigada no pierda minutos buscando lo que necesita.',
      mision:
        'Mantener la operación limpia y abastecida durante los dos servicios, cumpliendo el plan de higiene y el protocolo de separación de áreas, y apoyar la mise en place simple cuando el pase lo exija.',
      funciones: [
        'Lavar y reponer menaje, cristalería y utensilios durante el servicio, con reposición por estación.',
        'Ejecutar el plan de limpieza diario y profundo (campanas, freidoras, cámaras, desagües) y firmar el checklist.',
        'Sacar residuos orgánicos y reciclables por las rutas definidas, sin cruzar zonas limpias.',
        'Apoyar el montaje y la mise en place simple (pelado, porcionado básico) bajo indicación del jefe de partida.',
        'Recibir y almacenar producto seco aplicando FIFO y reportar faltantes de aseo al almacén.',
        'Reportar en el mismo servicio cualquier avería, plaga o desvío de higiene al chef de turno.',
        'Cumplir el protocolo de lavado de manos, indumentaria y separación de áreas.'
      ],
      indicadores: [
        { nombre: 'Checklist de limpieza firmado', meta: '≥ 98%' },
        { nombre: 'Reposición de menaje en pico', meta: '< 5 min' },
        { nombre: 'Hallazgos críticos en auditoría', meta: '0' },
        { nombre: 'Consumo de químicos', meta: 'Dentro de presupuesto' }
      ],
      condiciones: {
        jornada: 'Rotativa, 48 horas semanales, dos días de descanso',
        contrato: 'Término fijo con renovación',
        banda: [1600000, 2100000],
        beneficios: ['Alimentación en turno', 'Dotación completa', 'Auxilio de transporte']
      },
      requisitos: {
        formacion: 'Bachiller',
        experiencia: '1 año en cocina institucional, hotel o restaurante de volumen',
        tecnicos: ['Lavado industrial de menaje', 'Manejo de químicos con ficha de seguridad', 'FIFO y rotulación'],
        certificaciones: ['Curso de manipulación de alimentos vigente', 'BPM deseable']
      },
      perfil: {
        niveles: { tecnica: 20, ritmo: 65, orden: 92, costos: 45, mando: 10, admin: 15, creatividad: 5, servicio: 60 },
        formacion: 'Bachillerato terminado. Curso de BPM o manipulación vigente.',
        experiencia: '1 a 2 años en stewarding de hotel o cocina de volumen.',
        competencias: [
          { nombre: 'Disciplina de checklist', nivel: 'Alto', nota: 'Cumple el plan sin que nadie lo vigile.' },
          { nombre: 'Resistencia física', nivel: 'Alto', nota: 'Ocho horas de pie, calor y carga.' },
          { nombre: 'Anticipación', nivel: 'Medio', nota: 'Avisa antes de que falte menaje o químico.' },
          { nombre: 'Discreción', nivel: 'Alto', nota: 'Trabaja sin interrumpir el pase.' }
        ],
        rasgos: ['Puntual', 'Metódico', 'Callado', 'Servicial sin protagonismo'],
        antiPerfil: [
          'Quien vive el aseo como castigo y lo demuestra en el turno.',
          'Quien necesita reconocimiento público para sostener el estándar.',
          'Quien "ayuda" a cocinar sin que se lo pidan y descuida su zona.'
        ]
      },
      banda: [1600000, 2100000],
      vacanteDias: 24,
      riesgoOperativo: 62,
      escasez: 35,
      notaOperativa: 'Si falla el cierre de cocina, la auditoría de higiene se cae y el servicio del día siguiente arranca sucio.',
      preguntaCultura: '¿Qué haces cuando el turno anterior deja la cocina a medias y te toca cerrar a ti?',
      relaciones: {
        internas: ['Jefes de partida: recibe prioridades de reposición', 'Almacén: reporta faltantes de aseo y producto seco', 'Chef de turno: reporta desvíos, averías y plagas'],
        externas: ['Proveedores de aseo e insumos: recepción y verificación', 'Servicio de recolección de residuos', 'Mantenimiento del edificio']
      },
      autoridad: 'No autoriza compras. Puede detener la recepción de un producto sin rotulación o con empaque roto y reportarlo de inmediato al chef de turno.',
      riesgosPuesto: ['Exposición a químicos y a calor constante', 'Carga física y movimientos repetitivos', 'Turno noche con supervisión intermitente'],
      pruebaTecnica: [
        'Limpieza profunda de una freidora en 20 minutos, con ficha de seguridad y EPP puesto.',
        'Armado de una estación de menaje para 120 cubiertos en 15 minutos.',
        'Lectura de un checklist real y detección de tres desvíos en una foto de cocina.'
      ],
      incorporacion: [
        'Semana 1: mapa de la cocina, rutas de residuos y protocolo de químicos.',
        'Semana 2: cierre de cocina acompañado por el steward saliente.',
        'Semana 3: cierre autónomo con checklist firmado y revisión diaria.',
        'Mes 2: auditoría interna simulada y ajuste del mapa de menaje.',
        'Mes 3: propuesta de mejora de reposición con medición de tiempos.'
      ],
      anclas: {
        tecnica: 'Reconoce menaje, utensilios y productos de limpieza. No cocina.',
        ritmo: 'Sostiene el pico lavando y reponiendo sin acumular menaje en la zona.',
        orden: 'Cumple checklist, rotulación y separación de áreas sin que se lo recuerden.',
        costos: 'Dosifica químicos y cuida el menaje para no reponer de más.',
        mando: 'No dirige personas: recibe prioridades y las ejecuta.',
        admin: 'Firma el checklist y reporta faltantes por escrito.',
        creatividad: 'No requiere iniciativa culinaria ni desarrollo de producto.',
        servicio: 'Se relaciona con sala y brigada con respeto, sin interrumpir el pase.'
      }
    },

    {
      id: 'cocinero-b',
      nombre: 'Cocinero B',
      area: 'Producción',
      nivel: 'Operativo',
      reporta: 'Cocinero A de partida',
      supervisa: 'Sin personal a cargo',
      resumen:
        'Ejecuta la producción de su partida con receta y gramaje exactos, para que el plato salga igual en el primer turno y en el último.',
      mision:
        'Producir la mise en place y los platos de su partida según escandallo, controlando punto, temperatura y merma, y dejando la estación lista para el turno siguiente.',
      funciones: [
        'Preparar la mise en place de su partida según la ficha técnica y el gramaje definido.',
        'Ejecutar platos durante el servicio respondiendo por punto, temperatura y presentación.',
        'Registrar mermas y productos dados de baja en el formato de partida.',
        'Mantener cámara y refrigerados rotulados, fechados y en orden FIFO.',
        'Apoyar al cocinero A en el pase y cubrir su estación en el cambio de turno.',
        'Reportar desviaciones de producto, equipo o receta al jefe de partida.',
        'Dejar su zona limpia, con utensilios contados y mise en place del turno siguiente.'
      ],
      indicadores: [
        { nombre: 'Devoluciones por ejecución', meta: '0 por semana' },
        { nombre: 'Cumplimiento de gramaje', meta: '≥ 97%' },
        { nombre: 'Merma de partida', meta: '≤ 3%' },
        { nombre: 'Temperatura de servicio', meta: '100% en rango' }
      ],
      condiciones: {
        jornada: 'Rotativa, 48 horas semanales, un fin de semana al mes libre',
        contrato: 'Término fijo con renovación',
        banda: [2200000, 2800000],
        beneficios: ['Alimentación en turno', 'Dotación', 'Capacitación trimestral']
      },
      requisitos: {
        formacion: 'Técnico en cocina o formación equivalente',
        experiencia: '2 años en cocina a la carta',
        tecnicos: ['Mise en place', 'Puntos de cocción', 'Control de temperatura', 'FIFO'],
        certificaciones: ['Manipulación de alimentos vigente']
      },
      perfil: {
        niveles: { tecnica: 62, ritmo: 72, orden: 70, costos: 45, mando: 20, admin: 20, creatividad: 30, servicio: 25 },
        formacion: 'Técnico en cocina (SENA o escuela gastronómica).',
        experiencia: '2 a 3 años en línea de restaurante a la carta.',
        competencias: [
          { nombre: 'Repetibilidad', nivel: 'Alto', nota: 'La misma receta, el mismo resultado.' },
          { nombre: 'Ritmo', nivel: 'Alto', nota: 'Sostiene el pico sin desordenar la estación.' },
          { nombre: 'Cuidado del producto', nivel: 'Medio', nota: 'No desperdicia ni esconde merma.' },
          { nombre: 'Recepcion de instrucciones', nivel: 'Alto', nota: 'Pregunta antes de improvisar.' }
        ],
        rasgos: ['Constante', 'Rápido', 'Franco', 'Aprendiz'],
        antiPerfil: [
          'Quien ajusta a ojo y dice que "así lo hace el chef".',
          'Quien deja la partida sucia para el turno siguiente.',
          'Quien compite con el de al lado en vez de sacar el pase.'
        ]
      },
      banda: [2200000, 2800000],
      vacanteDias: 12,
      riesgoOperativo: 55,
      escasez: 45,
      notaOperativa: 'La partida queda descubierta en el turno noche, donde se concentra el 60% de las ventas.',
      preguntaCultura: 'Cuéntame la última vez que bajaste el estándar porque había prisa. ¿Qué pasó después?',
      relaciones: {
        internas: ['Cocinero A de partida: recibe la mise en place y rinde cuentas', 'Steward: solicita menaje y limpieza de estación', 'Almacén: retira producto y reporta faltantes'],
        externas: ['Proveedores: recepción de producto fresco en ausencia del jefe de partida']
      },
      autoridad: 'Puede rechazar producto que no cumpla temperatura o rotulación. No modifica recetas, gramajes ni precios sin aprobación del cocinero A.',
      riesgosPuesto: ['Quemaduras, cortes y exposición a calor', 'Ritmo alto con poca margen de error en el pico', 'Dependencia de instrucciones claras del jefe de partida'],
      pruebaTecnica: [
        'Ejecutar tres platos de la carta en 25 minutos con ficha técnica al lado.',
        'Porcionar cinco proteínas a gramaje ciego, con tolerancia de más o menos 3 gramos.',
        'Rotular y ordenar una cámara de 40 referencias aplicando FIFO.'
      ],
      incorporacion: [
        'Semana 1: recorrido de proveedores, fichas técnicas y estación asignada.',
        'Semana 2: mise en place acompañada y primeros platos en servicio con sombra.',
        'Semana 3: servicio completo en su estación con revisión de merma diaria.',
        'Mes 2: rotación por una segunda estación para ampliar polivalencia.',
        'Mes 3: evaluación de gramaje, temperatura y orden con retroalimentación escrita.'
      ],
      anclas: {
        tecnica: 'Ejecuta la carta con ficha: puntos, temperaturas y sazón repetibles.',
        ritmo: 'Aguanta el pico con la estación ordenada y sin saltarse pasos.',
        orden: 'Mise en place completa, cámara rotulada y FIFO al día.',
        costos: 'Registra la merma de su partida; no decide compras ni precios.',
        mando: 'Se hace cargo de su estación, no de personas.',
        admin: 'Llena los formatos de merma y temperatura sin que se los pidan.',
        creatividad: 'Propone ajustes menores de ejecución; no desarrolla platos.',
        servicio: 'Entiende los tiempos de sala; no trata directamente con el cliente.'
      }
    },

    {
      id: 'cocinero-a',
      nombre: 'Cocinero A',
      area: 'Producción',
      nivel: 'Jefe de partida',
      reporta: 'Sous chef',
      supervisa: '2 a 3 personas',
      resumen:
        'Es dueño de una partida completa: responde por su calidad, su costo y su gente, y sostiene el pase cuando el chef no está en línea.',
      mision:
        'Liderar la partida de fuegos y salsas: ejecutar y hacer ejecutar la carta con estándar, controlar el food cost de la partida y formar a quien entra, para que la cocina no dependa de una sola persona.',
      funciones: [
        'Coordinar la partida durante el servicio y corregir el pase en tiempo real.',
        'Desarrollar y documentar dos platos de temporada por trimestre con su escandallo.',
        'Controlar inventario, merma y consumo de su partida semanalmente.',
        'Formar y evaluar a cocineros B y stewards asignados a su estación.',
        'Cubrir al sous chef en ausencia y cerrar la cocina cuando corresponda.',
        'Garantizar el cumplimiento de BPM y trazabilidad en su partida.',
        'Proponer mejoras de proceso al chef ejecutivo con evidencia de costo y tiempo.'
      ],
      indicadores: [
        { nombre: 'Food cost de partida', meta: '≤ 33%' },
        { nombre: 'Platos nuevos con margen', meta: '2 por trimestre, ≥ 65%' },
        { nombre: 'Rotación de su equipo', meta: '< 20% anual' },
        { nombre: 'Incidentes de seguridad alimentaria', meta: '0' }
      ],
      condiciones: {
        jornada: 'Rotativa, 48 horas semanales, cierre tres noches por semana',
        contrato: 'Término indefinido',
        banda: [3400000, 4200000],
        beneficios: ['Alimentación', 'Bonificación por food cost', 'Plan de formación']
      },
      requisitos: {
        formacion: 'Profesional o técnico en gastronomía',
        experiencia: '4 años en cocina a la carta, 1 año como jefe de partida',
        tecnicos: ['Salsas madre', 'Fuegos y pescados', 'Escandallo', 'Formación de brigada'],
        certificaciones: ['Manipulación vigente', 'HACCP deseable']
      },
      perfil: {
        niveles: { tecnica: 85, ritmo: 82, orden: 76, costos: 62, mando: 45, admin: 35, creatividad: 58, servicio: 30 },
        formacion: 'Profesional en gastronomía o técnico con trayectoria equivalente.',
        experiencia: '4 a 6 años, con al menos uno liderando una partida.',
        competencias: [
          { nombre: 'Oficio', nivel: 'Alto', nota: 'Resuelve sin receta cuando el producto obliga.' },
          { nombre: 'Mando en línea', nivel: 'Medio', nota: 'Corrige rápido, sin humillar.' },
          { nombre: 'Conciencia de costo', nivel: 'Medio', nota: 'Sabe cuánto cuesta lo que hace.' },
          { nombre: 'Formación', nivel: 'Medio', nota: 'Deja capacidad instalada, no dependencia.' }
        ],
        rasgos: ['Exigente', 'Sereno en el pico', 'Curioso', 'Docente'],
        antiPerfil: [
          'Quien cocina muy bien pero no enseña: su partida se cae cuando falta.',
          'Quien no quiere ver números y llama "burocracia" al escandallo.',
          'Quien gana el respeto por gritos y no por estándar.'
        ]
      },
      banda: [3400000, 4200000],
      vacanteDias: 46,
      riesgoOperativo: 78,
      escasez: 70,
      notaOperativa: 'Sin jefe de partida, el sous chef absorbe 14 horas extra por semana y la carta pierde dos platos.',
      preguntaCultura: '¿Qué haces cuando alguien de tu partida repite un error que ya corregiste dos veces?',
      relaciones: {
        internas: ['Sous chef: reporta y cubre en ausencia', 'Chef ejecutivo: propone mejoras y desarrollo de carta', 'Cocineros B y stewards: los forma y evalúa', 'Sala: coordina tiempos de pase y devoluciones'],
        externas: ['Proveedores: valida calidad de producto en recepción', 'Escuelas de cocina: recibe aprendices en práctica']
      },
      autoridad: 'Define la ejecución de su partida y el orden de la mise en place. Puede detener la salida de un plato que no cumpla estándar y proponer sanciones al chef ejecutivo.',
      riesgosPuesto: ['Cuello de botella: si falta, la partida no tiene reemplazo', 'Estrés del pase y conflicto con sala en demoras', 'Doble rol de cocinero y formador sin tiempo protegido'],
      pruebaTecnica: [
        'Diseñar y ejecutar un plato de temporada en 60 minutos, con escandallo y costo por porción.',
        'Resolver un pase simulado de ocho comandas con un imprevisto: falta un insumo clave.',
        'Role play: corregir a un cocinero que repite el mismo error delante de la brigada.'
      ],
      incorporacion: [
        'Semana 1: carta completa, proveedores y estándares de la casa.',
        'Semana 2: toma de su partida con el chef en línea y revisión de inventario.',
        'Semana 3: primer plato de temporada propuesto y escandallado.',
        'Mes 2: evaluación de su equipo y plan de formación para dos personas.',
        'Mes 3: food cost de partida estabilizado y primera mejora de proceso documentada.'
      ],
      anclas: {
        tecnica: 'Resuelve fuera de receta y es referencia técnica de su partida.',
        ritmo: 'Sostiene el pase y corrige en tiempo real sin perder ejecución.',
        orden: 'Tiene estándar propio y lo exige; detecta desvíos antes del cierre.',
        costos: 'Escandolla sus platos y controla la merma de su partida cada semana.',
        mando: 'Dirige de dos a tres personas, corrige y forma sin humillar.',
        admin: 'Registra y reporta; no administra presupuesto ni nómina.',
        creatividad: 'Desarrolla dos platos por trimestre con criterio de producto y margen.',
        servicio: 'Coordina con sala los tiempos del pase y explica demoras.'
      }
    },

    {
      id: 'asistente-admin',
      nombre: 'Asistente de Chef Ejecutivo (administrativo)',
      area: 'Administración de cocina',
      nivel: 'Mando medio',
      reporta: 'Chef ejecutivo',
      supervisa: 'Compras, almacén y programación (indirecto)',
      resumen:
        'Convierte la cocina en un negocio legible: costos, compras, inventarios, programación y documentación al día, para que el chef decida con datos.',
      mision:
        'Administrar la información y los recursos de la cocina: escandallos actualizados, inventario cuadrado, compras conciliadas, turnos programados y documentación sanitaria vigente, con reporte semanal al chef ejecutivo.',
      funciones: [
        'Actualizar escandallos y precios de carta cada vez que cambie una factura de proveedor.',
        'Ejecutar inventario semanal y conteo cíclico por familias de producto.',
        'Conciliar facturas y resolver diferencias con proveedores en menos de 15 días.',
        'Programar turnos, controlar horas extra y consolidar la nómina de cocina.',
        'Emitir el reporte semanal de food cost real vs teórico y merma por partida.',
        'Mantener la documentación HACCP, trazabilidad y fichas técnicas al día.',
        'Coordinar compras, logística de eventos y apoyo en selección y onboarding.'
      ],
      indicadores: [
        { nombre: 'Food cost real vs teórico', meta: '≤ 1 punto de diferencia' },
        { nombre: 'Merma total', meta: '≤ 4,5%' },
        { nombre: 'Inventario cuadrado', meta: '≥ 98%' },
        { nombre: 'Reporte semanal', meta: 'Lunes 08:00, sin excepción' }
      ],
      condiciones: {
        jornada: 'Lunes a viernes, 45 horas, disponibilidad en eventos',
        contrato: 'Término indefinido',
        banda: [4400000, 5400000],
        beneficios: ['Alimentación', 'Equipo de trabajo', 'Formación en costos']
      },
      requisitos: {
        formacion: 'Administración, gastronomía o afines',
        experiencia: '3 años en administración de A&B o costos de cocina',
        tecnicos: ['Escandallos', 'Inventario cíclico', 'Excel avanzado', 'Compras y conciliación'],
        certificaciones: ['Manipulación vigente', 'HACCP deseable']
      },
      perfil: {
        niveles: { tecnica: 55, ritmo: 60, orden: 85, costos: 92, mando: 70, admin: 95, creatividad: 35, servicio: 55 },
        formacion: 'Administración de empresas turísticas, gastronomía o contabilidad.',
        experiencia: '3 a 5 años en costos, compras o administración de restaurante.',
        competencias: [
          { nombre: 'Rigor numérico', nivel: 'Alto', nota: 'Un inventario cuadrado no es suerte.' },
          { nombre: 'Traducción al chef', nivel: 'Alto', nota: 'Convierte planilla en decisión de cocina.' },
          { nombre: 'Negociación con proveedores', nivel: 'Medio', nota: 'Precio, plazo y calidad a la vez.' },
          { nombre: 'Presencia en línea', nivel: 'Medio', nota: 'No administra desde la oficina.' }
        ],
        rasgos: ['Ordenado', 'Persistente', 'Concreto', 'Discreto'],
        antiPerfil: [
          'Quien solo sabe de Excel y no pisa la cocina en un mes.',
          'Quien produce reportes que nadie usa y defiende el formato.',
          'Quien ajusta el inventario para que cuadre.'
        ]
      },
      banda: [4400000, 5400000],
      vacanteDias: 63,
      riesgoOperativo: 88,
      escasez: 82,
      notaOperativa: 'Hoy el food cost se calcula a mano y con dos semanas de retraso: se compra y se cobra a ciegas.',
      preguntaCultura: 'Un cliente tiene una queja que no es de tu área. ¿Qué haces tú?',
      relaciones: {
        internas: ['Chef ejecutivo: reporte semanal y decisiones de carta', 'Jefes de partida: inventario y consumo por estación', 'Contabilidad: facturas, causación y pagos', 'Recursos humanos: programación, nómina y onboarding'],
        externas: ['Proveedores: negociación, pedidos y conciliación', 'Auditoría sanitaria: documentación y trazabilidad', 'Organizadores de eventos: logística y costos']
      },
      autoridad: 'Valida facturas y órdenes de compra hasta el monto acordado. Puede bloquear un pago en disputa y congelar un pedido que incumpla precio o especificación. No cambia precios de carta sin aprobación del chef.',
      riesgosPuesto: ['Tensión con la brigada: controlar sin ser percibido como obstáculo', 'Dependencia de sistemas y datos que no siempre están completos', 'Trabajo solitario en una operación que se mueve en equipo'],
      pruebaTecnica: [
        'Cerrar un inventario de 30 referencias con diferencias inyectadas y explicar cada descuadre.',
        'Calcular el food cost de tres platos a partir de facturas reales en 40 minutos.',
        'Armar el reporte semanal en 45 minutos con los datos entregados y proponer una decisión.'
      ],
      incorporacion: [
        'Semana 1: sistemas, proveedores, calendario de cierres y mapa de la operación.',
        'Semana 2: inventario acompañado y conciliación de la última facturación.',
        'Semana 3: primer reporte semanal propio con revisión del chef.',
        'Mes 2: cierre mensual completo y plan de reducción de merma.',
        'Mes 3: tablero de indicadores instalado y rutina de conteo cíclico funcionando.'
      ],
      anclas: {
        tecnica: 'Lee una cocina y entiende sus procesos, pero no cubre línea en servicio.',
        ritmo: 'Cierra reportes en fecha aunque el servicio se desborde.',
        orden: 'Datos trazables, versiones controladas y respaldos al día.',
        costos: 'Domina food cost real vs teórico, inventario y compras.',
        mando: 'Coordina sin línea de mando formal sobre la brigada.',
        admin: 'Escandallos, nómina, HACCP documental y tablero de indicadores.',
        creatividad: 'Mejora procesos y reportes; no desarrolla platos.',
        servicio: 'Negocia con proveedores y traduce números a decisiones de cocina.'
      }
    },

    {
      id: 'pastelero',
      nombre: 'Pastelero',
      area: 'Producción',
      nivel: 'Especialista',
      reporta: 'Chef ejecutivo',
      supervisa: '1 ayudante',
      resumen:
        'Sostiene la carta de postres y la pastelería de autor con consistencia, costo controlado y una identidad que el cliente reconozca.',
      mision:
        'Producir la pastelería de carta y de eventos con receta estandarizada, desarrollar un postre por temporada y controlar merma e inventario de repostería, para que el postre sea margen y no un cierre obligatorio.',
      funciones: [
        'Producir diariamente los postres de carta y los pedidos de eventos.',
        'Desarrollar y documentar un postre nuevo por temporada con su escandallo.',
        'Controlar merma de repostería y rotación de secos y refrigerados.',
        'Estandarizar recetas con gramaje, proceso y punto de terminación.',
        'Decorar y montar los pases especiales y las mesas de evento.',
        'Formar al ayudante de pastelería en higiene, pesaje y producción.',
        'Reportar consumo y necesidades de compra al asistente administrativo.'
      ],
      indicadores: [
        { nombre: 'Devoluciones de postre', meta: '0' },
        { nombre: 'Merma de repostería', meta: '≤ 5%' },
        { nombre: 'Margen de postres', meta: '≥ 70%' },
        { nombre: 'Producción lista', meta: '11:30 todos los días' }
      ],
      condiciones: {
        jornada: 'Martes a domingo, 46 horas, entrada 06:30',
        contrato: 'Término fijo con renovación',
        banda: [3200000, 4000000],
        beneficios: ['Alimentación', 'Dotación', 'Insumos para pruebas']
      },
      requisitos: {
        formacion: 'Técnico en panadería y pastelería',
        experiencia: '3 años en pastelería de restaurante u hotel',
        tecnicos: ['Entremets', 'Chocolatería', 'Helados', 'Estandarización de recetas'],
        certificaciones: ['Manipulación vigente']
      },
      perfil: {
        niveles: { tecnica: 88, ritmo: 55, orden: 90, costos: 65, mando: 30, admin: 45, creatividad: 90, servicio: 35 },
        formacion: 'Técnico en panadería y pastelería. Formación complementaria en chocolate o heladería.',
        experiencia: '3 a 5 años en pastelería de restaurante con carta propia.',
        competencias: [
          { nombre: 'Precisión de pesaje', nivel: 'Alto', nota: 'La repostería no perdona el ojo.' },
          { nombre: 'Identidad', nivel: 'Alto', nota: 'Un postre que se reconoce sin leer la carta.' },
          { nombre: 'Costo de receta', nivel: 'Medio', nota: 'Creatividad con margen, no a cualquier precio.' },
          { nombre: 'Volumen', nivel: 'Medio', nota: 'Eventos de 80 postres sin cambiar el estándar.' }
        ],
        rasgos: ['Perfeccionista', 'Metódico', 'Reservado', 'Constante'],
        antiPerfil: [
          'Quien no pesa y confía en la memoria.',
          'Quien cambia la receta cada semana y llama a eso evolución.',
          'Quien se aburre con la producción repetitiva de todos los días.'
        ]
      },
      banda: [3200000, 4000000],
      vacanteDias: 30,
      riesgoOperativo: 70,
      escasez: 65,
      notaOperativa: 'Nadie más en la brigada sabe hacer los postres: si falta, la carta de postres se reduce a helado de compra.',
      preguntaCultura: '¿Qué tendría que pasar en esta cocina para que decidieras irte?',
      relaciones: {
        internas: ['Chef ejecutivo: aprueba carta y desarrollo', 'Asistente administrativo: consumo, compras y costos', 'Ayudante de pastelería: lo forma y supervisa', 'Sala: montaje y tiempos de postre'],
        externas: ['Proveedores de lácteos, chocolate y fruta de temporada', 'Clientes de eventos: pedidos especiales y restricciones']
      },
      autoridad: 'Define la carta de postres con aprobación del chef ejecutivo. Rechaza materia prima fuera de especificación y detiene la salida de un postre que no cumpla estándar.',
      riesgosPuesto: ['Madrugada y producción solitaria', 'Presión de eventos concentrada en pocas fechas', 'Merma alta por pruebas y desarrollo'],
      pruebaTecnica: [
        'Producir 40 porciones de un postre de carta en tres horas, midiendo merma real.',
        'Estandarizar una receta con gramaje, proceso y punto de terminación.',
        'Adaptar un postre a una restricción alimentaria sin perder margen ni identidad.'
      ],
      incorporacion: [
        'Semana 1: carta actual, proveedores, bodega y equipo de frío.',
        'Semana 2: producción acompañada y costeo de las seis recetas vigentes.',
        'Semana 3: producción autónoma con control de merma diario.',
        'Mes 2: primer postre nuevo en carta con escandallo probado.',
        'Mes 3: inventario de repostería y rutina de estandarización instalados.'
      ],
      anclas: {
        tecnica: 'Repostería fina: entremets, chocolate, helados y puntos exactos.',
        ritmo: 'Saca volumen de carta y eventos sin perder precisión ni presentación.',
        orden: 'Pesaje, rotulación y FIFO estrictos en una zona que no perdona.',
        costos: 'Costea cada receta y controla la merma de las pruebas.',
        mando: 'Dirige a un ayudante con instrucción clara y verificación.',
        admin: 'Estandariza recetas y reporta consumo y necesidades de compra.',
        creatividad: 'Identidad propia: un postre nuevo por temporada, con relato de producto.',
        servicio: 'Monta pases especiales y responde por restricciones alimentarias.'
      }
    }
  ],

  candidatos: [
    {
      id: 'rosa',
      nombre: 'Rosa Elvira Cárdenas',
      edad: 46,
      ciudad: 'Bogotá, Kennedy',
      puestoAplicado: 'steward',
      titular: 'Auxiliar de servicio · 9 años en cocinas de hotel',
      contacto: { tel: '310 000 0001', mail: 'rosa.cardenas@correo.example', linkedin: '' },
      resumen:
        'Auxiliar de servicio con nueve años en cocinas de hotel y restaurante de alto volumen. Responsable del cierre de cocina, lavado de menaje y plan de limpieza profunda. En seis auditorías de higiene no he tenido un solo hallazgo crítico.',
      experiencia: [
        {
          cargo: 'Steward, turno noche',
          empresa: 'Hotel Tequendama',
          periodo: '2021 - actual',
          contexto: 'Tres restaurantes, 400 cubiertos diarios, brigada de 38 personas.',
          logros: [
            'Reduje el consumo de químicos un 18% cambiando la dosificación por litro y no por "chorro".',
            'Seis auditorías de higiene sin hallazgos críticos, con checklist firmado por turno.',
            'Reorganicé el cuarto de menaje con un mapa visual: la reposición en pico bajó de 11 a 4 minutos.'
          ]
        },
        {
          cargo: 'Auxiliar de cocina y aseo',
          empresa: 'Restaurante Salvo Patria',
          periodo: '2018 - 2021',
          contexto: 'Restaurante de autor, 70 cubiertos, dos servicios.',
          logros: [
            'Apoyo de mise en place simple (pelado y porcionado) en el pase de almuerzo.',
            'Cierre completo de cocina cuatro noches por semana, sin supervisión directa.'
          ]
        },
        {
          cargo: 'Auxiliar de producción',
          empresa: 'Cocina central de catering',
          periodo: '2016 - 2018',
          contexto: 'Producción de 600 a 900 porciones diarias.',
          logros: ['Lavado industrial de menaje y apoyo en línea de empaque.']
        }
      ],
      formacion: [
        { titulo: 'Bachiller académico', institucion: 'Colegio Distrital Kennedy', anio: 1996 },
        { titulo: 'Curso de Buenas Prácticas de Manufactura (BPM)', institucion: 'SENA', anio: 2023 }
      ],
      certificaciones: [
        { nombre: 'Manipulación de alimentos', estado: 'Vigente hasta 03/2028' },
        { nombre: 'BPM', estado: '2023' }
      ],
      habilidades: {
        tecnicas: ['Lavado industrial de menaje', 'Limpieza profunda de campanas y freidoras', 'Manejo de químicos con ficha de seguridad', 'FIFO y rotulación'],
        gestion: ['Cierre de cocina', 'Control de inventario de aseo', 'Reporte de averías'],
        herramientas: ['Checklist físico', 'WhatsApp para reportes']
      },
      idiomas: ['Español nativo'],
      referencias: [
        { nombre: 'Marta Peña', cargo: 'Gobernanta, Hotel Tequendama', nota: 'Verificable' },
        { nombre: 'Julián Rojas', cargo: 'Chef, Salvo Patria', nota: 'Verificable' }
      ],
      expectativa: 1750000,
      disponibilidad: { texto: 'Inmediata', dias: 0 },
      vector: { tecnica: 30, ritmo: 68, orden: 95, costos: 55, mando: 15, admin: 20, creatividad: 10, servicio: 85 },
      cultura: { rigor: 92, ritmo: 60, hospitalidad: 82, estructura: 88, creatividad: 20, estabilidad: 95 },
      entrevista: { evidencia: 78, trayectoria: 70, disponibilidad: 100, referencias: 95, riesgo: 15 },
      banderas: { manipulacion: 'vigente', findes: true, altaCocina: false, costos: false, liderazgo: false },
      banderasNota: { costos: 'No ha manejado presupuesto ni escandallos.' },
      riesgos: [
        { tipo: 'brecha', texto: 'Sin experiencia en alta cocina: hay que enseñarle el estándar de la casa.' },
        { tipo: 'techo', texto: 'Trayectoria plana: nueve años en el mismo nivel. Poco margen de promoción interna.' }
      ],
      notas: [
        'Verificar certificado de manipulación y carta laboral de la última empresa.',
        'Preguntar por la rotación del cuarto de menaje: es la única con números propios.'
      ],
      logrosClave: ['Químicos -18%', '0 hallazgos en 6 auditorías', 'Reposición 11 min → 4 min'],
      verificacion: 'Pedir el checklist firmado del último mes y el mapa del cuarto de menaje que dice haber hecho.'
    },

    {
      id: 'jhon',
      nombre: 'Jhon Fredy Mosquera',
      edad: 29,
      ciudad: 'Soacha, Cundinamarca',
      puestoAplicado: 'cocinero-b',
      titular: 'Cocinero de línea · parrilla y producción',
      contacto: { tel: '310 000 0002', mail: 'jhon.mosquera@correo.example', linkedin: '' },
      resumen:
        'Cocinero de línea con seis años en parrilla y producción para eventos. Rápido, resistente y con buen punto de carne. Busco una cocina donde pueda crecer a jefe de partida y aprender salsas.',
      experiencia: [
        {
          cargo: 'Cocinero B, parrilla',
          empresa: 'Casa Vieja',
          periodo: '2022 - actual',
          contexto: 'Cocina a la carta, 180 cubiertos, brigada de 16.',
          logros: [
            'Bajé el tiempo de pase de la parrilla de 14 a 9 minutos en el pico del sábado.',
            'Reduje la merma de carnes de 6,1% a 4,3% con porcionado previo y registro diario.',
            'Entrené a dos auxiliares nuevos en el manejo de la parrilla.'
          ]
        },
        {
          cargo: 'Cocinero de producción',
          empresa: 'Bogotá Eventos Catering',
          periodo: '2019 - 2022',
          contexto: 'Eventos de 200 a 600 personas, cocina central.',
          logros: [
            'Producción en lote de proteínas y guarniciones para 24 eventos por mes.',
            'Cero quejas de temperatura en 14 meses.'
          ]
        },
        {
          cargo: 'Auxiliar de panadería',
          empresa: 'Panadería El Trigal',
          periodo: '2018 - 2019',
          contexto: 'Panadería de barrio, producción de madrugada.',
          logros: ['Armado y horneado de panes de vitrina.']
        }
      ],
      formacion: [
        { titulo: 'Técnico en Cocina', institucion: 'SENA', anio: 2019 },
        { titulo: 'Curso de parrilla y cortes', institucion: 'Escuela de carnes', anio: 2021 }
      ],
      certificaciones: [{ nombre: 'Manipulación de alimentos', estado: 'Vence 02/2027' }],
      habilidades: {
        tecnicas: ['Parrilla y puntos de carne', 'Horno', 'Producción en lote', 'Control de temperatura'],
        gestion: ['Mise en place de partida', 'Registro de merma'],
        herramientas: ['Comandas impresas', 'Termómetro de sonda']
      },
      idiomas: ['Español nativo'],
      referencias: [
        { nombre: 'Óscar Medina', cargo: 'Chef, Casa Vieja', nota: 'Verificable' },
        { nombre: 'Diana Cruz', cargo: 'Coordinadora, Bogotá Eventos', nota: 'Verificable' }
      ],
      expectativa: 2400000,
      disponibilidad: { texto: '15 días', dias: 15 },
      vector: { tecnica: 66, ritmo: 88, orden: 52, costos: 40, mando: 28, admin: 25, creatividad: 45, servicio: 30 },
      cultura: { rigor: 55, ritmo: 90, hospitalidad: 60, estructura: 45, creatividad: 50, estabilidad: 40 },
      entrevista: { evidencia: 88, trayectoria: 72, disponibilidad: 80, referencias: 85, riesgo: 38 },
      banderas: { manipulacion: 'vence', findes: true, altaCocina: false, costos: false, liderazgo: false },
      banderasNota: { manipulacion: 'Certificado vence en 02/2027: renovar antes de contratar.' },
      riesgos: [
        { tipo: 'orden', texto: 'Registro y rotulación por debajo del estándar: su merma baja porque él controla, no porque el sistema controle.' },
        { tipo: 'permanencia', texto: 'Tres empleos en seis años, uno de once meses. Preguntar por el motivo real de salida.' }
      ],
      notas: [
        'Poner a prueba el punto de carne y el registro de merma en la prueba técnica.',
        'Preguntar cómo organiza la cámara al cerrar, no cómo la organizaría.'
      ],
      logrosClave: ['Pase 14 → 9 min', 'Merma de carnes 6,1% → 4,3%', '24 eventos/mes sin quejas'],
      verificacion: 'Prueba de punto de carne a ciegas y revisar el registro de merma de la última semana, no el discurso.'
    },

    {
      id: 'camila',
      nombre: 'Camila Restrepo',
      edad: 33,
      ciudad: 'Medellín, en traslado a Bogotá',
      puestoAplicado: 'cocinero-a',
      titular: 'Jefa de partida · cocina de autor',
      contacto: { tel: '310 000 0003', mail: 'camila.restrepo@correo.example', linkedin: 'linkedin.com/in/camila-restrepo-demo' },
      resumen:
        'Jefa de partida con ocho años en cocinas de autor y una etapa de investigación en Lima. Dueña de salsas y pescados en una brigada de catorce. Me interesa una cocina con identidad de producto y un equipo al que pueda enseñar.',
      experiencia: [
        {
          cargo: 'Jefa de partida, salsas y pescados',
          empresa: 'El Chato',
          periodo: '2021 - actual',
          contexto: 'Cocina de autor, 90 cubiertos, menú degustación de nueve pasos, brigada de 14.',
          logros: [
            'Food cost de mi partida en 31,4%, frente al 34% del restaurante.',
            'Siete platos desarrollados por mí siguen en carta después de dos temporadas.',
            'Formé a cuatro auxiliares; dos fueron promovidos a cocinero B.'
          ]
        },
        {
          cargo: 'Cocinera A',
          empresa: 'Raus',
          periodo: '2019 - 2021',
          contexto: 'Restaurante de mercado, 60 cubiertos, carta cambiante.',
          logros: [
            'Responsable de la partida de verduras y fermentaciones.',
            'Implementé el registro de merma por partida que hoy usa toda la cocina.'
          ]
        },
        {
          cargo: 'Cocinera B',
          empresa: 'Sal',
          periodo: '2017 - 2019',
          contexto: 'Cocina de producto, 45 cubiertos.',
          logros: ['Mise en place completa y apoyo en el pase de fuegos.']
        },
        {
          cargo: 'Pasantía de investigación y desarrollo',
          empresa: 'Cocina de investigación, Lima',
          periodo: '2018 (4 meses)',
          contexto: 'Proyecto de productos nativos y técnicas de conservación.',
          logros: ['Documenté 22 fichas de producto y tres técnicas de fermentación.']
        }
      ],
      formacion: [
        { titulo: 'Profesional en Gastronomía', institucion: 'Colegio Mayor de Antioquia', anio: 2017 },
        { titulo: 'Curso de cocina de mercado', institucion: 'Basque Culinary Center', anio: 2022 }
      ],
      certificaciones: [
        { nombre: 'Manipulación de alimentos', estado: 'Vigente hasta 09/2027' }
      ],
      habilidades: {
        tecnicas: ['Salsas madre', 'Pescados y mariscos', 'Fermentaciones', 'Fuegos', 'Pasta fresca'],
        gestion: ['Escandallo de partida', 'Formación de brigada', 'Desarrollo de platos'],
        herramientas: ['Excel intermedio', 'Fichas técnicas propias']
      },
      idiomas: ['Español nativo', 'Inglés B2'],
      referencias: [
        { nombre: 'Santiago Vera', cargo: 'Chef ejecutivo, El Chato', nota: 'Verificable' },
        { nombre: 'Paula Duque', cargo: 'Chef propietaria, Raus', nota: 'Verificable' }
      ],
      expectativa: 4600000,
      disponibilidad: { texto: '30 días (preaviso)', dias: 30 },
      vector: { tecnica: 92, ritmo: 78, orden: 80, costos: 58, mando: 40, admin: 30, creatividad: 88, servicio: 40 },
      cultura: { rigor: 78, ritmo: 70, hospitalidad: 65, estructura: 55, creatividad: 92, estabilidad: 50 },
      entrevista: { evidencia: 95, trayectoria: 92, disponibilidad: 60, referencias: 92, riesgo: 45 },
      banderas: { manipulacion: 'vigente', findes: false, altaCocina: true, costos: true, liderazgo: true },
      banderasNota: { findes: 'No disponible domingos por maestría en curso.' },
      riesgos: [
        { tipo: 'salario', texto: 'Pide 4,6M, por encima de la banda del cargo (3,4M a 4,2M).' },
        { tipo: 'proyección', texto: 'Apunta a sous chef en 18 meses: sin ruta clara, se irá a otro proyecto.' },
        { tipo: 'disponibilidad', texto: 'No trabaja domingos, el día de mayor venta de la casa.' }
      ],
      notas: [
        'Validar el food cost de partida con la última nómina y el último inventario.',
        'Hablar de la ruta de crecimiento antes de hablar de salario.'
      ],
      logrosClave: ['Food cost 31,4% vs 34%', '7 platos en carta 2 temporadas', '2 de 4 auxiliares promovidos'],
      verificacion: 'Pedir el escandallo de dos de sus siete platos y el último inventario de su partida.'
    },

    {
      id: 'andres',
      nombre: 'Andrés Felipe Ospina',
      edad: 38,
      ciudad: 'Bogotá, Chapinero',
      puestoAplicado: 'asistente-admin',
      titular: 'Administración de A&B · 11 años en restaurantes',
      contacto: { tel: '310 000 0004', mail: 'andres.ospina@correo.example', linkedin: 'linkedin.com/in/afospina-demo' },
      resumen:
        'Administrador de alimentos y bebidas con once años en operaciones de 80 a 400 cubiertos. He bajado el food cost de 38% a 31% en dos restaurantes y montado inventario cíclico donde antes había conteo trimestral. Sé leer una cocina desde el inventario y desde la línea.',
      experiencia: [
        {
          cargo: 'Asistente de Chef Ejecutivo (administrativo)',
          empresa: 'Grupo Rasa, tres restaurantes',
          periodo: '2020 - actual',
          contexto: '210 empleados, 480 cubiertos diarios, tres marcas.',
          logros: [
            'Food cost consolidado de 34,8% a 31,2% en 18 meses.',
            'Merma de 7,9% a 4,1% con conteo cíclico semanal y control por familia.',
            'Disputas de facturas con proveedores reducidas 62%; horas extra de cocina, 14%.'
          ]
        },
        {
          cargo: 'Administrador de A&B',
          empresa: 'Restaurante Índigo',
          periodo: '2015 - 2020',
          contexto: 'Restaurante de hotel, 120 cubiertos, banquetería.',
          logros: [
            'Implementé escandallos para el 100% de la carta y formación al equipo de cocina.',
            'Margen bruto de bebidas de 58% a 64%.'
          ]
        },
        {
          cargo: 'Analista de costos y compras',
          empresa: 'Hotel Bogotá Plaza',
          periodo: '2013 - 2015',
          contexto: 'Hotel de 300 habitaciones, tres puntos de venta.',
          logros: ['Conciliación mensual de compras y reporte de consumo por centro de costo.']
        }
      ],
      formacion: [
        { titulo: 'Administración de Empresas Turísticas y Hoteleras', institucion: 'Universidad Externado', anio: 2012 },
        { titulo: 'Curso de costos de alimentos y bebidas', institucion: 'Educación continua', anio: 2021 }
      ],
      certificaciones: [
        { nombre: 'Manipulación de alimentos', estado: 'Vigente hasta 05/2027' },
        { nombre: 'Power BI intermedio', estado: '2023' },
        { nombre: 'HACCP', estado: 'Curso 2022' }
      ],
      habilidades: {
        tecnicas: ['Escandallos', 'Inventario cíclico', 'Conciliación de facturas', 'Compras y negociación', 'Programación de turnos'],
        gestion: ['Food cost real vs teórico', 'Presupuesto', 'Nómina de cocina', 'Documentación HACCP'],
        herramientas: ['Excel avanzado', 'Power BI', 'Sistema de inventarios', 'Google Sheets']
      },
      idiomas: ['Español nativo', 'Inglés B1'],
      referencias: [
        { nombre: 'Mauricio Londoño', cargo: 'Chef corporativo, Grupo Rasa', nota: 'Verificable' },
        { nombre: 'Clara Benavides', cargo: 'Gerente de operaciones, Restaurante Índigo', nota: 'Verificable' }
      ],
      expectativa: 5200000,
      disponibilidad: { texto: '45 días (preaviso)', dias: 45 },
      vector: { tecnica: 60, ritmo: 58, orden: 88, costos: 96, mando: 68, admin: 97, creatividad: 30, servicio: 60 },
      cultura: { rigor: 85, ritmo: 55, hospitalidad: 55, estructura: 96, creatividad: 35, estabilidad: 72 },
      entrevista: { evidencia: 96, trayectoria: 90, disponibilidad: 45, referencias: 90, riesgo: 30 },
      banderas: { manipulacion: 'vigente', findes: true, altaCocina: false, costos: true, liderazgo: true },
      banderasNota: {},
      riesgos: [
        { tipo: 'oficio', texto: 'No cocina en línea desde 2019: puede perder autoridad frente a la brigada.' },
        { tipo: 'encaje', texto: 'Viene de grupo grande con equipo de apoyo; aquí estará solo.' }
      ],
      notas: [
        'Pedir el último reporte de food cost que haya hecho y preguntarle qué decisión tomó con él.',
        'Verificar cómo maneja la relación con el chef cuando los números contradicen su intuición.'
      ],
      logrosClave: ['Food cost 34,8% → 31,2%', 'Merma 7,9% → 4,1%', 'Disputas de facturas -62%'],
      verificacion: 'Pedir el último reporte de food cost real vs teórico y preguntar qué decisión tomó con él.'
    },

    {
      id: 'lucia',
      nombre: 'Lucía Fernanda Beltrán',
      edad: 31,
      ciudad: 'Bogotá, Usaquén',
      puestoAplicado: 'pastelero',
      titular: 'Pastelera de autor · 7 años en restaurante',
      contacto: { tel: '310 000 0005', mail: 'lucia.beltran@correo.example', linkedin: 'linkedin.com/in/lucia-beltran-demo' },
      resumen:
        'Pastelera con siete años en repostería de restaurante y una marca propia de postres por encargo. Trabajo con producto de temporada y recetas estandarizadas. Busco un proyecto estable para desarrollar la carta de postres completa.',
      experiencia: [
        {
          cargo: 'Pastelera',
          empresa: 'Restaurante Domingo',
          periodo: '2021 - actual',
          contexto: '70 cubiertos, carta de seis postres y eventos privados.',
          logros: [
            'Margen de postres de 68% a 74%; merma de 8% a 4,6%.',
            'Tres postres se mantuvieron en carta dos años seguidos.',
            'Monté la producción de 40 eventos al año sin ampliar el equipo.'
          ]
        },
        {
          cargo: 'Fundadora y pastelera',
          empresa: 'Beltrán Postres (marca propia)',
          periodo: '2019 - 2021',
          contexto: 'Pedidos por encargo, 30 pedidos mensuales, venta directa.',
          logros: [
            'Desarrollé catálogo de 18 productos con costeo unitario.',
            'Cerré la operación en pandemia con inventario liquidado.'
          ]
        },
        {
          cargo: 'Auxiliar de pastelería',
          empresa: 'Hotel Casa Medina',
          periodo: '2017 - 2019',
          contexto: 'Pastelería de hotel, buffet y eventos.',
          logros: ['Producción diaria de buffet y montaje de mesas dulces.']
        }
      ],
      formacion: [
        { titulo: 'Técnica en Panadería y Pastelería', institucion: 'SENA', anio: 2017 },
        { titulo: 'Curso de chocolate y entremets', institucion: 'Escuela de repostería', anio: 2022 }
      ],
      certificaciones: [
        { nombre: 'Manipulación de alimentos', estado: 'Vigente hasta 11/2027' },
        { nombre: 'Chocolate y entremets', estado: '2022' }
      ],
      habilidades: {
        tecnicas: ['Entremets', 'Chocolatería', 'Helados y sorbetes', 'Fermentaciones dulces', 'Decoración'],
        gestion: ['Estandarización de recetas', 'Costeo de receta', 'Inventario de repostería'],
        herramientas: ['Excel básico', 'Báscula de precisión']
      },
      idiomas: ['Español nativo', 'Inglés A2'],
      referencias: [
        { nombre: 'Daniel Arango', cargo: 'Chef ejecutivo, Domingo', nota: 'Verificable' },
        { nombre: 'Ana María Gil', cargo: 'Cliente de eventos, 40 pedidos al año', nota: 'Verificable' }
      ],
      expectativa: 3900000,
      disponibilidad: { texto: '15 días', dias: 15 },
      vector: { tecnica: 94, ritmo: 42, orden: 92, costos: 58, mando: 30, admin: 45, creatividad: 96, servicio: 40 },
      cultura: { rigor: 90, ritmo: 45, hospitalidad: 60, estructura: 70, creatividad: 95, estabilidad: 65 },
      entrevista: { evidencia: 90, trayectoria: 80, disponibilidad: 80, referencias: 78, riesgo: 42 },
      banderas: { manipulacion: 'vigente', findes: false, altaCocina: true, costos: true, liderazgo: false },
      banderasNota: { findes: 'No disponible domingos: conserva pedidos propios.' },
      riesgos: [
        { tipo: 'ritmo', texto: 'Producción lenta en volumen: 42 en ritmo frente a 55 que pide el puesto.' },
        { tipo: 'marca', texto: 'Mantiene su marca de pedidos: riesgo de conflicto de interés y de fuga.' },
        { tipo: 'equipo', texto: 'Nunca ha liderado a más de un ayudante.' }
      ],
      notas: [
        'Prueba técnica de 40 postres en tres horas, no de un postre de autor.',
        'Aclarar por escrito el uso de su marca personal durante la relación laboral.'
      ],
      logrosClave: ['Margen 68% → 74%', 'Merma 8% → 4,6%', '40 eventos/año sin ampliar equipo'],
      verificacion: 'Prueba de 40 postres en tres horas, no un postre de autor. Medir tiempo real y merma.'
    }
  ],

  preguntas: {
    tecnica: [
      'Cuéntame un plato que te haya salido mal en servicio y qué cambiaste en la mise en place siguiente.',
      '¿Cómo verificas el punto de un plato cuando no puedes probarlo por alergia o por volumen?'
    ],
    ritmo: [
      'En el pico, ¿qué sacrificas primero y qué no sacrificas nunca?',
      'Describe el último servicio en el que te quedaste corto de manos y qué hiciste.'
    ],
    orden: [
      'Descríbeme tu cámara: cómo está rotulada y qué haces cuando encuentras producto sin fecha.',
      '¿Qué revisas antes de cerrar tu estación y qué revisa el turno siguiente de ti?'
    ],
    costos: [
      '¿Cómo calculas el food cost de un plato y qué haces si sube tres puntos en un mes?',
      'Cuéntame una merma que hayas reducido y cómo la mediste.'
    ],
    mando: [
      'Un cocinero nuevo comete el mismo error tres veces. ¿Qué haces, paso por paso?',
      '¿Cómo corriges a alguien delante de la brigada y cómo lo corriges después?'
    ],
    admin: [
      '¿Qué reporte miras el lunes y qué decisión concreta tomas con él?',
      'Cuéntame un inventario que no te cuadró: qué pasó y cómo lo cerraste.'
    ],
    creatividad: [
      '¿Cómo decides que un plato está listo para entrar a carta?',
      'Cuéntame un plato que retiraste y por qué.'
    ],
    servicio: [
      'Un cliente devuelve un plato. ¿Qué haces y qué le dices?',
      '¿Cómo se entera sala de que un plato va a salir tarde?'
    ]
  },

  preguntasCultura: {
    rigor: 'Cuéntame la última vez que bajaste el estándar porque había prisa. ¿Qué pasó después?',
    ritmo: '¿Qué sientes cuando el servicio se desborda y el tiempo no alcanza? ¿Qué haces con eso?',
    hospitalidad: 'Un cliente tiene una queja que no es de tu área. ¿Qué haces?',
    estructura: '¿Qué haces con un formato o un proceso que te parece inútil?',
    creatividad: '¿Cuándo fue la última vez que propusiste un cambio y cómo lo defendiste?',
    estabilidad: '¿Qué tendría que pasar en esta cocina para que decidieras irte?'
  }
};
