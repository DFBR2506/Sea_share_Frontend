# Matriz de QA — Frontend Módulo 3 (Finanzas)

Plan de trazabilidad de QA del frontend de M3. Cada fila enlaza un Test Case (TC) con **un escenario de aceptación** del spec del backend, su Historia de Usuario (HU), la pantalla donde se ejecuta y los requisitos que verifica. Está basada en la [matriz del backend](../../../SeaShare_Modulo_3/docs/features/qa/matriz-qa.md) y en los TC de [`test-cases/`](test-cases/).

## Alcance

El frontend implementa **3 de los 13 casos de uso** de M3. Los demás (UC01–UC10) no tienen pantalla propia y se verifican en el backend.

| UC | Funcionalidad | Pantalla / ruta | Rol |
|---|---|---|---|
| UC11 | Parámetros financieros globales | `/finadmin/parametros` | Admin Financiero |
| UC12 | Registros financieros | `/owner/finanzas/historial` (propios) · `/finadmin/registros` (globales) | Propietario · Admin Financiero |
| UC13 | Informe financiero y exportación CSV | `/owner/finanzas/balance` (propio) · `/finadmin/informe` (plataforma) | Propietario · Admin Financiero |

## Convenciones

- **Un TC por escenario**: `TC-UCxx-HUy-En-<slug>.md` dentro de la carpeta de su UC. `En` es el número de escenario dentro de su HU.
- **Estados del TC**: `Draft` (redactado) → `In Process` (ejecutando) → `Approved` (PASS) o `Failed` (con defecto abierto).
- **Numeración local**: los `RF-xxx`, `RNF-xxx` y `CE-xxx` son **locales a cada spec**; cada fila ya incluye el prefijo de su UC. La columna de requisitos se tomó de la matriz del backend, pero el front solo cubre la parte visible en pantalla.
- **Plantilla**: la misma del backend ([`test-template.md`](../../../SeaShare_Modulo_3/docs/templates/test-template.md)), con pasos de interfaz (ruta, acción, dato, resultado esperado).
- **Severidad de defectos**: Critical / Major / Small, igual que en cada TC.

### Modos de ejecución

| Modo | Fuente de datos | Qué permite verificar |
|---|---|---|
| **A · Mocks** (hoy) | Datos en memoria (`src/features/finance/api/mocks.js`), se pierden al recargar | Interfaz, validaciones de formulario, paginación, filtros, navegación y mensajes. |
| **B · Backend real** (cuando se conecte `VITE_API_M3_URL`) | API de M3 | Todo lo anterior más persistencia, versionado, aislamiento por propietario, errores del servidor y períodos reales. |

Los pasos que solo funcionan en el modo B están marcados como "solo backend real" dentro de cada TC. Un TC con la columna **Modo** en `A` se puede ejecutar completo hoy; con `A + B` queda ejecutable en parte y se completa con el backend.

### Datos de prueba

| Dato | Valor |
|---|---|
| Aplicación | `npm run dev` → `http://localhost:5173` (recargar antes de cada TC para reiniciar los mocks) |
| Admin Financiero | `/login` → "Entrar como Admin Financiero" |
| Propietario | `/login` → "Entrar como Propietario" (`owner-0284`) |
| Parámetros iniciales | Versión 12: comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 % |
| Registros | 24 en total: 21 de `owner-0284` y 3 de `owner-0310` (cobros 9, reembolsos 5, dispersiones 5, comisiones 5) |
| Informe Mensual | Cobros 18.42 M, reembolsos 2.16 M, dispersiones 11.78 M, comisiones 1.42 M |

## Matriz de trazabilidad

### UC11 · Parámetros financieros — [`UC11-parametros-financieros/`](test-cases/UC11-parametros-financieros/)

| TC | HU | Escenario | Prior. | RF / CE cubierto (spec UC11) | Modo | Archivo | Estado |
|---|---|---|---|---|---|---|---|
| TC-UC11-HU1-E1 | HU1 | E1 Configuración del porcentaje de comisión | P1 | RF-001, RF-005, RF-006, RF-007 · CE-002 | A + B | [TC-UC11-HU1-E1-config-comision.md](test-cases/UC11-parametros-financieros/TC-UC11-HU1-E1-config-comision.md) | Draft |
| TC-UC11-HU1-E2 | HU1 | E2 Configuración de la tarifa de seguro por pasajero | P1 | RF-002, RF-005, RF-006, RF-007 · CE-002 | A + B | [TC-UC11-HU1-E2-config-seguro.md](test-cases/UC11-parametros-financieros/TC-UC11-HU1-E2-config-seguro.md) | Draft |
| TC-UC11-HU2-E1 | HU2 | E1 Configuración del incremento por fin de semana | P1 | RF-003, RF-005, RF-006, RF-007 · CE-002 | A + B | [TC-UC11-HU2-E1-config-fin-semana.md](test-cases/UC11-parametros-financieros/TC-UC11-HU2-E1-config-fin-semana.md) | Draft |
| TC-UC11-HU2-E2 | HU2 | E2 Configuración del incremento por temporada alta | P1 | RF-004, RF-005, RF-006, RF-007 · CE-002 | A + B | [TC-UC11-HU2-E2-config-temporada-alta.md](test-cases/UC11-parametros-financieros/TC-UC11-HU2-E2-config-temporada-alta.md) | Draft |
| TC-UC11-HU3-E1 | HU3 | E1 Carga de la configuración vigente | P1 | RF-006, RF-009, RF-012, RF-013 | A + B | [TC-UC11-HU3-E1-carga-vigente.md](test-cases/UC11-parametros-financieros/TC-UC11-HU3-E1-carga-vigente.md) | Draft |
| TC-UC11-HU3-E2 | HU3 | E2 Carga sin configuración previa (no inventa valores) | P1 | RF-005, RF-009, RF-013 | **B** | [TC-UC11-HU3-E2-carga-sin-config.md](test-cases/UC11-parametros-financieros/TC-UC11-HU3-E2-carga-sin-config.md) | Draft |
| TC-UC11-HU4-E1 | HU4 | E1 Guardado completo y exitoso (versión atómica) | P1 | RF-005, RF-006, RF-007, RF-008 · CE-001, CE-002, CE-004 | A + B | [TC-UC11-HU4-E1-guardado-exitoso.md](test-cases/UC11-parametros-financieros/TC-UC11-HU4-E1-guardado-exitoso.md) | Draft |
| TC-UC11-HU4-E2 | HU4 | E2 Cancelación de cambios no guardados | P1 | RF-005, RF-007, RF-010 · CE-004 | A | [TC-UC11-HU4-E2-cancelar-cambios.md](test-cases/UC11-parametros-financieros/TC-UC11-HU4-E2-cancelar-cambios.md) | Draft |
| TC-UC11-HU4-E3 | HU4 | E3 Fallo durante el guardado (sin cambios parciales) | P1 | RF-005, RF-007, RF-011 · CE-002 | A (validación) + B (fallos) | [TC-UC11-HU4-E3-fallo-guardado.md](test-cases/UC11-parametros-financieros/TC-UC11-HU4-E3-fallo-guardado.md) | Draft |

### UC12 · Registros financieros — [`UC12-registros-financieros/`](test-cases/UC12-registros-financieros/)

| TC | HU | Escenario | Prior. | RF / CE cubierto (spec UC12) | Modo | Archivo | Estado |
|---|---|---|---|---|---|---|---|
| TC-UC12-HU1-E1 | HU1 | E1 Consulta propia con paginación por defecto | P1 | RF-001, RF-003, RF-005, RF-007, RF-008 · CE-001 | A + B | [TC-UC12-HU1-E1-paginacion-propia.md](test-cases/UC12-registros-financieros/TC-UC12-HU1-E1-paginacion-propia.md) | Draft |
| TC-UC12-HU1-E2 | HU1 | E2 Consulta propia con filtros | P1 | RF-002, RF-003, RF-007 · CE-001 | A + B | [TC-UC12-HU1-E2-filtros-propios.md](test-cases/UC12-registros-financieros/TC-UC12-HU1-E2-filtros-propios.md) | Draft |
| TC-UC12-HU2-E1 | HU2 | E1 Consulta global con paginación por defecto | P1 | RF-003, RF-005, RF-007, RF-008 · CE-002 | A + B | [TC-UC12-HU2-E1-paginacion-global.md](test-cases/UC12-registros-financieros/TC-UC12-HU2-E1-paginacion-global.md) | Draft |
| TC-UC12-HU2-E2 | HU2 | E2 Consulta global filtrada | P1 | RF-002, RF-003, RF-007 · CE-002 | A + B | [TC-UC12-HU2-E2-filtros-global.md](test-cases/UC12-registros-financieros/TC-UC12-HU2-E2-filtros-global.md) | Draft |

### UC13 · Informe financiero — [`UC13-informe-financiero/`](test-cases/UC13-informe-financiero/)

| TC | HU | Escenario | Prior. | RF / CE cubierto (spec UC13) | Modo | Archivo | Estado |
|---|---|---|---|---|---|---|---|
| TC-UC13-HU1-E1 | HU1 | E1 Informe de la plataforma del último período cerrado | P1 | RF-002, RF-003, RF-005, RF-007, RF-008, RF-009, RF-010, RF-014 | A + B | [TC-UC13-HU1-E1-informe-plataforma-ultimo.md](test-cases/UC13-informe-financiero/TC-UC13-HU1-E1-informe-plataforma-ultimo.md) | Draft |
| TC-UC13-HU1-E2 | HU1 | E2 Informe de la plataforma de un período anterior | P1 | RF-002, RF-003, RF-004, RF-005, RF-010 | **B** (cifras) | [TC-UC13-HU1-E2-informe-plataforma-anterior.md](test-cases/UC13-informe-financiero/TC-UC13-HU1-E2-informe-plataforma-anterior.md) | Draft |
| TC-UC13-HU2-E1 | HU2 | E1 Informe propio del último período cerrado | P1 | RF-003, RF-006, RF-008, RF-009, RF-010, RF-014 | A + B | [TC-UC13-HU2-E1-informe-propio-ultimo.md](test-cases/UC13-informe-financiero/TC-UC13-HU2-E1-informe-propio-ultimo.md) | Draft |
| TC-UC13-HU2-E2 | HU2 | E2 Informe propio de un período anterior | P1 | RF-004, RF-006, RF-010 | **B** (cifras) | [TC-UC13-HU2-E2-informe-propio-anterior.md](test-cases/UC13-informe-financiero/TC-UC13-HU2-E2-informe-propio-anterior.md) | Draft |
| TC-UC13-HU3-E1 | HU3 | E1 Exportación del informe de la plataforma (.csv) | P2 | RF-012, RF-013 · RNF-004 | A + B | [TC-UC13-HU3-E1-export-plataforma.md](test-cases/UC13-informe-financiero/TC-UC13-HU3-E1-export-plataforma.md) | Draft |
| TC-UC13-HU3-E2 | HU3 | E2 Exportación del informe propio (.csv) | P2 | RF-006, RF-012, RF-013 · RNF-004 | A + B | [TC-UC13-HU3-E2-export-propio.md](test-cases/UC13-informe-financiero/TC-UC13-HU3-E2-export-propio.md) | Draft |

## Resumen de cobertura

| UC | HU | TC | P1 | P2 |
|---|---|---|---|---|
| UC11 | 4 | 9 | 9 | 0 |
| UC12 | 2 | 4 | 4 | 0 |
| UC13 | 3 | 6 | 4 | 2 |
| **Total** | **9** | **19** | **17** | **2** |

Todos los escenarios de aceptación de UC11, UC12 y UC13 tienen un TC. Los requisitos del backend que no tienen pantalla (por ejemplo `RF-012` de UC12, "no consultar a Flota") no se verifican en el front.

## Hallazgos conocidos al redactar los TC

Son **candidatos a defecto** detectados al leer el código; se confirman o descartan al ejecutar los TC. No son resultados de ejecución.

### Del frontend

| # | Pantalla | Hallazgo | TC afectados | Sev. estimada |
|---|---|---|---|---|
| H-01 | Parámetros | Si falla la carga no hay mensaje de error y la pantalla puede quedar en "Cargando…". | TC-UC11-HU3-E1 | Major |
| H-02 | Parámetros | No existe el estado "configuración pendiente"; sin versión vigente la página probablemente falla. | TC-UC11-HU3-E2 | Major |
| H-03 | Parámetros | El guardado no maneja errores (`save.mutate` sin `onError`); si el servidor falla no se informa nada. | TC-UC11-HU4-E3 | Major |
| H-04 | Informe | La página no maneja el estado de error y puede fallar al leer `r.cobros`. | TC-UC13-HU1-E1, HU1-E2, HU2-E1, HU2-E2 | Major |
| H-05 | Informe | El CSV se genera en el cliente y omite fecha de generación, alcance, periodicidad, período, conteos y comparación (RF-013, contrato §4). | TC-UC13-HU3-E1, HU3-E2 | Major |
| H-06 | Informe | El nombre del CSV no incluye el período (`informe-mensual.csv`) y los montos van en millones de COP, no en COP. | TC-UC13-HU3-E1, HU3-E2 | Small |
| H-07 | Registros | Falta el filtro por embarcación definido en el spec (RF-002 de UC12). | TC-UC12-HU1-E2, HU2-E2 | Small (a confirmar con producto) |
| H-08 | Registros | Con 0 resultados el resumen de paginación puede mostrar "0–0 de 0 registros". | TC-UC12-HU2-E2 | Small |
| H-09 | Parámetros | Navegar con cambios sin guardar no avisa al usuario. | TC-UC11-HU4-E2 | Small (decisión de producto) |

### De los mocks (no son defectos del front)

| # | Hallazgo | Efecto |
|---|---|---|
| M-01 | El neto del mock no cumple `cobros − reembolsos − dispersiones` (0.62 M vs 4.48 M). | Falla el paso de fórmula de TC-UC13-HU1-E1 con datos mock. |
| M-02 | La ganancia del propietario no coincide con sus dispersiones (1.04 M vs 11.78 M). | Falla el paso de coherencia de TC-UC13-HU2-E1 y HU3-E2. |
| M-03 | `getReport` ignora período y alcance: todos los períodos y roles muestran los mismos valores. | Las cifras por período y el aislamiento por propietario solo se verifican con backend real. |
| M-04 | `getParams` siempre devuelve la versión inicial. | TC-UC11-HU3-E2 solo se puede ejecutar con backend real. |

## Pendiente de definir

- Quién ejecuta cada TC y en qué rama o entorno (en el backend: autoría en `develop`, ejecución en `release/0.1.0`).
- Dónde se registran los resultados de ejecución (Pass/Fail y comentarios en cada TC, o una columna de resultado aquí).
- Cuándo se repiten los TC con backend real (modo B) y quién conecta `VITE_API_M3_URL`.
