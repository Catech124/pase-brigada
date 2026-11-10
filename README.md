# PASE · diagnóstico de contratación

Aplicación web para cruzar el perfil de tus puestos con tus candidatos y decidir
**qué vacante cubrir primero y con quién**. Funciona con cualquier número de
puestos, candidatos y dimensiones: todo sale de un archivo JSON.

**Demo:** https://catech124.github.io/pase-brigada/

## Qué hace

- **Resumen**: cuatro veredictos (fichaje recomendado, vacante más crítica, mejor
  match cultural, a quién entrevistar primero), ranking, criticidad de cada
  vacante y sensibilidad al dolor declarado.
- **Puestos**: descripción del cargo y perfil de competencias con niveles 0-100,
  anti-perfil, riesgos y prueba técnica.
- **Candidatos**: hoja de vida completa más la lectura del modelo: brechas,
  fortalezas, bloqueos, salario y plan de entrevista.
- **Matriz**: encaje de cada persona en cada puesto, con el detalle del cruce.
- **Datos**: importar y exportar el conjunto, con validación y mensajes de error.
- **Método**: las fórmulas con los pesos reales que se están usando.

El contexto de la empresa (dolor principal, presupuesto, urgencia, peso de la
cultura y requisitos eliminatorios) se cambia en vivo y todo se recalcula.

## Cómo usarla

1. Abre la demo o el `index.html` del proyecto.
2. Cambia el contexto en el panel **Contexto de la empresa**.
3. Revisa los cuatro veredictos y el ranking.
4. Para tus propios datos: **Datos → Exportar JSON**, edita el archivo y
   **Datos → Cargar JSON**.

Los datos se guardan en `localStorage` del navegador. No hay servidor ni base de
datos: nada se envía a internet.

## Currículas de ejemplo

Seis hojas de vida en PDF, una por persona y de una página, en `curriculos/`.
Están escritas como CV reales: tareas además de logros, cifras aproximadas,
referencias dispares y algún trabajo corto. No son casos de estudio.

| # | Currícula | Título |
| ---: | --- | --- |
| 01 | `CV-01-Rosa-Elvira-Cardenas.pdf` | Bachiller |
| 02 | `CV-02-Jhon-Fredy-Mosquera.pdf` | Técnico en Cocina |
| 03 | `CV-03-Camila-Restrepo.pdf` | Profesional en Gastronomía |
| 04 | `CV-04-Andres-Felipe-Ospina.pdf` | Administrador de Empresas Turísticas y Hoteleras |
| 05 | `CV-05-Lucia-Fernanda-Beltran.pdf` | Técnica en Panadería y Pastelería |
| 06 | `CV-06-Maria-de-la-Luz-Hernandez.pdf` | Secundaria (mayora, cocina tradicional) |

Las versiones editables están en `docs/curriculos/` y los datos de origen en
`assets/data.js`.

## Cargar tus puestos

El archivo mínimo está en [`datos/plantilla.json`](datos/plantilla.json) y el
ejemplo completo en [`datos/ejemplo.json`](datos/ejemplo.json).

Estructura:

| Bloque | Contenido |
| --- | --- |
| `empresa` | `nombre`, `ciudad`, `tipo`, `cultura` (un valor 0-100 por eje) |
| `dimensiones` | `id`, `nombre`, `corto`, `desc`. Pueden ser otras y ser más o menos de 8 |
| `culturaEjes` | `id`, `nombre`, `desc`, opcional `peso` |
| `dolores` | `id`, `nombre`, `desc` y `pesos` por dimensión |
| `noNegociables` | `id`, `nombre` (requisitos eliminatorios) |
| `puestos` | `id`, `nombre`, `banda` [mín, máx] y `perfil.niveles` con todas las dimensiones |
| `candidatos` | `id`, `nombre`, `vector` (todas las dimensiones), `cultura` (todos los ejes), `expectativa`, `entrevista` |
| `preguntas` | opcional: preguntas por dimensión |
| `preguntasCultura` | opcional: una pregunta por eje |

Reglas:

- Cada puesto debe traer **todas** las dimensiones en `perfil.niveles`.
- Cada candidato debe traer **todas** las dimensiones en `vector` y **todos** los
  ejes en `cultura`.
- Si un candidato no tiene `puestoAplicado`, se evalúa contra todos y se le asigna
  el de mayor encaje.
- Los `id` no se pueden repetir.

La aplicación valida el archivo antes de cargarlo y muestra los errores con el
campo exacto.

## Cómo se calcula

Para cada dimensión se compara lo que la persona tiene con el mínimo que pide el
puesto:

```
si tiene < pide:   100 × (tiene / pide)^1,35
si tiene ≥ pide:   100 + (tiene − pide) × 0,12   (máximo 104)
```

El encaje es el promedio ponderado por la exigencia de cada dimensión y por el
dolor declarado, menos los requisitos eliminatorios y el exceso salarial.

El índice de contratación mezcla impacto (encaje × criticidad de la vacante),
match cultural, potencial de entrevista y riesgo, con pesos que cambian según la
urgencia y el peso que le des a la cultura. La sección **Método** muestra los
pesos vigentes y las fórmulas completas.

## Estructura

```
├── index.html              aplicación
├── assets/
│   ├── data.js             conjunto de ejemplo (Casa Mirador)
│   ├── engine.js           motor de puntuación, sin DOM
│   ├── app.js              vistas e interacción
│   ├── styles.css          sistema visual
│   └── fonts/              Archivo + IBM Plex Mono, locales
├── datos/
│   ├── ejemplo.json        el conjunto de ejemplo exportado
│   └── plantilla.json      esqueleto mínimo para editar
├── curriculos/             las 5 hojas de vida en PDF (una página cada una)
├── docs/                   descripciones, perfiles y CV editables
│   ├── puestos/            descripciones de puesto
│   ├── perfiles/           perfiles de competencias
│   └── curriculos/         hojas de vida en Markdown
├── test-engine.cjs         pruebas del motor (node)
└── test-ui.cjs             pruebas de interfaz (Brave headless por CDP)
```

## Desarrollo

```bash
node test-engine.cjs        # ranking, validación, genericidad
node test-ui.cjs            # navega todas las vistas, captura en shots/ y reporta errores de consola
node build-docs.cjs         # regenera descripciones, perfiles y CV en Markdown
node build-cv-pdf.cjs       # regenera las 5 currículas en PDF
```

No hay dependencias de npm. La aplicación funciona abriendo `index.html` con
doble clic; el servidor solo hace falta para publicarla.

## Aviso

El conjunto de ejemplo (Casa Mirador, sus puestos y sus candidatos) es ficticio.
Si cargas datos reales, ten en cuenta que quedan guardados en el navegador de
quien use la aplicación.
