# Matriz de QA — Frontend Módulo 3 (Finanzas)

Plan de trazabilidad de QA del frontend de M3. Cada fila enlaza un Test Case (TC) con **un escenario de aceptación** del spec del backend, su Historia de Usuario (HU), la pantalla donde se ejecuta y los requisitos que verifica. Está basada en la [matriz del backend](../../../SeaShare_Modulo_3/docs/features/qa/matriz-qa.md) y en los TC de [`test-cases/`](test-cases/).

**Definición de "verificado"**: todos los TC de esta matriz pasan al 100 % (PASS) ejecutados desde el frontend contra el **backend M3 del entorno de pruebas**. Cualquier FAIL abre un defecto y bloquea el cierre.

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
- **Plantilla**: la misma del backend ([`test-template.md`](../../../SeaShare_Modulo_3/docs/templates/test-template.md)), con pasos de interfaz (ruta, acción, dato, resultado esperado) y verificación de datos en la BD y en DevTools → Network.
- **Severidad de defectos**: Critical / Major / Small, igual que en cada TC.
- **Ejecución**: todos los TC se ejecutan con el backend en entorno de pruebas; no se usan datos simulados del front.

## Entorno de pruebas

| Elemento | Valor |
|---|---|
| Backend M3 | `docker compose --profile app up --build -d` (health en `http://localhost:8080/actuator/health`); perfil `dev,qa` salvo en TC-UC11-HU3-E2 |
| Frontend | `npm run dev` → `http://localhost:5173`, con `VITE_API_M3_URL` apuntando al backend de pruebas |
| Base de datos | `docker exec -it seashare-postgres psql -U seashare -d seashare` |
| Admin Financiero | `/login` → "Entrar como Admin Financiero" |
| Propietario | `/login` → "Entrar como Propietario" (con el `owner_id` del dataset del TC) |

### Datos de prueba por UC

| UC | Dato | Origen | Valores |
|---|---|---|---|
| UC11 | `financial_parameters` | Seed del perfil `qa` (`R__qa_seed.sql`) | `v1..v7`, vigente `v7`: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 % |
| UC12 | `v_financial_records` | Dataset propio del TC (no es seed) | Propietario `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` con 23 registros; global con 34 de 3 propietarios y 4 embarcaciones |
| UC13 | `v_financial_records` por período | Dataset propio del TC (no es seed) | Plataforma 2026-10: cobros 1150000, reembolsos 100000, dispersiones 900000, comisiones 135000; propietarios A (`11111111-1111-4111-8111-111111111111`) y B (`22222222-2222-4222-8222-222222222222`); períodos 2026-07 a 2026-10 |

> `financial_parameters` es *append-only*: cada guardado agrega una versión. Para que los TC de UC11 vean `v7`/`count = 7`, recrear la BD entre ellos: `docker compose --profile app down -v` y volver a levantar (el `--profile app` es obligatorio en `down`). TC-UC11-HU3-E2 requiere además la BD **sin** el seed (`SPRING_PROFILES_ACTIVE=dev`).
>
> Los registros de UC12 y UC13 los generan UC05, UC09 y UC10; si no se ejecutaron los TC del backend que los crean, hay que cargar un dataset equivalente. La fecha de referencia de UC13 es 2026-11-02: el último mes cerrado sigue siendo `2026-10` durante noviembre de 2026; si se ejecuta después, recalcular los períodos esperados.

### Prerrequisitos para poder ejecutar

1. **El frontend debe estar conectado al backend de M3.** Hoy las pantallas de finanzas leen datos en memoria (`src/features/finance/api/`) y no llaman a la API; hay que reemplazar esa capa por `request('m3', ...)` antes de ejecutar los TC.
2. Backend de pruebas levantado y con el seed aplicado.
3. Datasets de UC12 y UC13 cargados.
4. La sesión del Propietario usa el `owner_id` del dataset del TC (el front no tiene autenticación real).

## Matriz de trazabilidad

### UC11 · Parámetros financieros — [`UC11-parametros-financieros/`](test-cases/UC11-parametros-financieros/)

| TC | HU | Escenario | Prior. | RF / CE cubierto (spec UC11) | Archivo | Estado | Resultado | Defecto |
|---|---|---|:---:|---|---|:---:|:---:|---|
| TC-UC11-HU1-E1 | HU1 | E1 Configuración del porcentaje de comisión | P1 | RF-001, RF-005, RF-006, RF-007, RF-013 · CE-002 | [TC-UC11-HU1-E1-config-comision.md](test-cases/UC11-parametros-financieros/TC-UC11-HU1-E1-config-comision.md) | Draft | — | — |
| TC-UC11-HU1-E2 | HU1 | E2 Configuración de la tarifa de seguro por pasajero | P1 | RF-002, RF-005, RF-006, RF-007, RF-013 · CE-002 | [TC-UC11-HU1-E2-config-seguro.md](test-cases/UC11-parametros-financieros/TC-UC11-HU1-E2-config-seguro.md) | Draft | — | — |
| TC-UC11-HU2-E1 | HU2 | E1 Configuración del incremento por fin de semana | P1 | RF-003, RF-005, RF-006, RF-007, RF-013 · CE-002 | [TC-UC11-HU2-E1-config-fin-semana.md](test-cases/UC11-parametros-financieros/TC-UC11-HU2-E1-config-fin-semana.md) | Draft | — | — |
| TC-UC11-HU2-E2 | HU2 | E2 Configuración del incremento por temporada alta | P1 | RF-004, RF-005, RF-006, RF-007, RF-012, RF-013 · CE-002 | [TC-UC11-HU2-E2-config-temporada-alta.md](test-cases/UC11-parametros-financieros/TC-UC11-HU2-E2-config-temporada-alta.md) | Draft | — | — |
| TC-UC11-HU3-E1 | HU3 | E1 Carga de la configuración vigente | P1 | RF-006, RF-009, RF-012, RF-013 | [TC-UC11-HU3-E1-carga-vigente.md](test-cases/UC11-parametros-financieros/TC-UC11-HU3-E1-carga-vigente.md) | Draft | — | — |
| TC-UC11-HU3-E2 | HU3 | E2 Carga sin configuración previa (no inventa valores) | P1 | RF-005, RF-009, RF-013 | [TC-UC11-HU3-E2-carga-sin-config.md](test-cases/UC11-parametros-financieros/TC-UC11-HU3-E2-carga-sin-config.md) | Draft | — | — |
| TC-UC11-HU4-E1 | HU4 | E1 Guardado completo y exitoso (versión atómica) | P1 | RF-005, RF-006, RF-007, RF-008, RF-013 · CE-001, CE-002, CE-004 | [TC-UC11-HU4-E1-guardado-exitoso.md](test-cases/UC11-parametros-financieros/TC-UC11-HU4-E1-guardado-exitoso.md) | Draft | — | — |
| TC-UC11-HU4-E2 | HU4 | E2 Cancelación de cambios no guardados | P1 | RF-005, RF-007, RF-010 · CE-004 | [TC-UC11-HU4-E2-cancelar-cambios.md](test-cases/UC11-parametros-financieros/TC-UC11-HU4-E2-cancelar-cambios.md) | Draft | — | — |
| TC-UC11-HU4-E3 | HU4 | E3 Fallo durante el guardado (sin cambios parciales) | P1 | RF-005, RF-007, RF-011, RF-013 · CE-002 | [TC-UC11-HU4-E3-fallo-guardado.md](test-cases/UC11-parametros-financieros/TC-UC11-HU4-E3-fallo-guardado.md) | Draft | — | — |

### UC12 · Registros financieros — [`UC12-registros-financieros/`](test-cases/UC12-registros-financieros/)

| TC | HU | Escenario | Prior. | RF / CE cubierto (spec UC12) | Archivo | Estado | Resultado | Defecto |
|---|---|---|:---:|---|---|:---:|:---:|---|
| TC-UC12-HU1-E1 | HU1 | E1 Consulta propia con paginación por defecto | P1 | RF-001, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-010 · CE-001, CE-003, CE-005 | [TC-UC12-HU1-E1-paginacion-propia.md](test-cases/UC12-registros-financieros/TC-UC12-HU1-E1-paginacion-propia.md) | Draft | — | — |
| TC-UC12-HU1-E2 | HU1 | E2 Consulta propia con filtros | P1 | RF-002, RF-003, RF-004, RF-005, RF-007 · CE-001 | [TC-UC12-HU1-E2-filtros-propios.md](test-cases/UC12-registros-financieros/TC-UC12-HU1-E2-filtros-propios.md) | Draft | — | — |
| TC-UC12-HU2-E1 | HU2 | E1 Consulta global con paginación por defecto | P1 | RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-010 · CE-002, CE-003, CE-005 | [TC-UC12-HU2-E1-paginacion-global.md](test-cases/UC12-registros-financieros/TC-UC12-HU2-E1-paginacion-global.md) | Draft | — | — |
| TC-UC12-HU2-E2 | HU2 | E2 Consulta global filtrada | P1 | RF-002, RF-003, RF-004, RF-005, RF-007 · CE-002, CE-004 | [TC-UC12-HU2-E2-filtros-global.md](test-cases/UC12-registros-financieros/TC-UC12-HU2-E2-filtros-global.md) | Draft | — | — |

### UC13 · Informe financiero — [`UC13-informe-financiero/`](test-cases/UC13-informe-financiero/)

| TC | HU | Escenario | Prior. | RF / CE cubierto (spec UC13) | Archivo | Estado | Resultado | Defecto |
|---|---|---|:---:|---|---|:---:|:---:|---|
| TC-UC13-HU1-E1 | HU1 | E1 Informe de la plataforma del último período cerrado | P1 | RF-002, RF-003, RF-005, RF-007, RF-008, RF-009, RF-010, RF-011, RF-014 | [TC-UC13-HU1-E1-informe-plataforma-ultimo.md](test-cases/UC13-informe-financiero/TC-UC13-HU1-E1-informe-plataforma-ultimo.md) | Draft | — | — |
| TC-UC13-HU1-E2 | HU1 | E2 Informe de la plataforma de un período anterior | P1 | RF-002, RF-003, RF-004, RF-005, RF-008, RF-010 | [TC-UC13-HU1-E2-informe-plataforma-anterior.md](test-cases/UC13-informe-financiero/TC-UC13-HU1-E2-informe-plataforma-anterior.md) | Draft | — | — |
| TC-UC13-HU2-E1 | HU2 | E1 Informe propio del último período cerrado | P1 | RF-003, RF-006, RF-008, RF-009, RF-010, RF-014, RF-015 | [TC-UC13-HU2-E1-informe-propio-ultimo.md](test-cases/UC13-informe-financiero/TC-UC13-HU2-E1-informe-propio-ultimo.md) | Draft | — | — |
| TC-UC13-HU2-E2 | HU2 | E2 Informe propio de un período anterior | P1 | RF-004, RF-006, RF-008, RF-010 | [TC-UC13-HU2-E2-informe-propio-anterior.md](test-cases/UC13-informe-financiero/TC-UC13-HU2-E2-informe-propio-anterior.md) | Draft | — | — |
| TC-UC13-HU3-E1 | HU3 | E1 Exportación del informe de la plataforma (.csv) | P2 | RF-012, RF-013 · RNF-004 | [TC-UC13-HU3-E1-export-plataforma.md](test-cases/UC13-informe-financiero/TC-UC13-HU3-E1-export-plataforma.md) | Draft | — | — |
| TC-UC13-HU3-E2 | HU3 | E2 Exportación del informe propio (.csv) | P2 | RF-006, RF-012, RF-013 · RNF-004 | [TC-UC13-HU3-E2-export-propio.md](test-cases/UC13-informe-financiero/TC-UC13-HU3-E2-export-propio.md) | Draft | — | — |

## Resumen de cobertura

| UC | HU | TC | P1 | P2 |
|---|---|---|---|---|
| UC11 | 4 | 9 | 9 | 0 |
| UC12 | 2 | 4 | 4 | 0 |
| UC13 | 3 | 6 | 4 | 2 |
| **Total** | **9** | **19** | **17** | **2** |

Todos los escenarios de aceptación de UC11, UC12 y UC13 tienen un TC. Los requisitos del backend que no tienen pantalla (por ejemplo `RF-012` de UC12, "no consultar a Flota") se verifican en el backend, aunque algunos TC revisan en DevTools o en los logs que el front no los contradiga.

## Hallazgos conocidos al redactar los TC

Son **candidatos a defecto** detectados al leer el código del front frente a los contratos del backend; se confirman o descartan al ejecutar los TC. No son resultados de ejecución.

| # | Pantalla | Hallazgo | TC afectados | Sev. estimada |
|---|---|---|---|---|
| H-01 | Parámetros | Si falla la carga no hay mensaje de error y la pantalla puede quedar en "Cargando…". | TC-UC11-HU3-E1 | Major |
| H-02 | Parámetros | No existe el estado "configuración pendiente" (`404 PARAMETERS_NOT_CONFIGURED`); sin versión vigente la página probablemente falla. | TC-UC11-HU3-E2 | Major |
| H-03 | Parámetros | El guardado no maneja errores (`save.mutate` sin `onError`); si el servidor responde `4xx`/`5xx` no se informa nada. | TC-UC11-HU4-E3 | Major |
| H-04 | Informe | La página no maneja el estado de error y puede fallar al leer `r.cobros`. | TC-UC13-HU1-E1, HU1-E2, HU2-E1, HU2-E2 | Major |
| H-05 | Informe | El CSV se genera en el cliente con 5 filas (`Concepto,Valor (millones COP)`) en lugar de descargar el de `GET /financial-report/export`; omite fecha de generación, alcance, periodicidad, período, conteos y comparación (RF-013, contrato §4). | TC-UC13-HU3-E1, HU3-E2 | Major |
| H-06 | Informe | El nombre del CSV no incluye el período (`informe-mensual.csv`, el contrato indica `informe_financiero_2026-10.csv`). | TC-UC13-HU3-E1, HU3-E2 | Small |
| H-07 | Registros | Faltan los filtros por embarcación, reserva y rango de fechas que admite la API (RF-002 de UC12). | TC-UC12-HU1-E2, HU2-E2 | Small (a confirmar con producto) |
| H-08 | Registros | Con 0 resultados el resumen de paginación puede mostrar "0–0 de 0 registros". | TC-UC12-HU2-E2 | Small |
| H-09 | Parámetros | Navegar con cambios sin guardar no avisa al usuario. | TC-UC11-HU4-E2 | Small (decisión de producto) |
| H-10 | Parámetros | El seguro exige "mayor a 0", pero el spec (RF-013) acepta mayor o igual a 0. | TC-UC11-HU1-E2 | Small |
| H-11 | Registros | El selector de propietario del admin usa una lista fija; el contrato de M3 no tiene un endpoint de propietarios, así que podría no listar los propietarios reales. | TC-UC12-HU2-E2 | Major |
| H-12 | Informe | Los montos se muestran en millones con 2 decimales (`$ 0.14 M`), lo que pierde precisión frente a los COP exactos del backend. | TC-UC13-HU1-E1, HU2-E1 | Small |
| H-13 | Informe | La pantalla muestra variaciones por indicador (cobros, reembolsos, dispersiones), pero el backend solo entrega la comparación del neto/ganancia (`comparison`). | TC-UC13-HU1-E1 | Major |
| H-14 | Parámetros | El depósito de garantía y las ventanas de temporada alta son textos fijos en el front; deben mostrarse los de `guarantee_deposit_rule` y `high_season_windows`. | TC-UC11-HU3-E1, HU2-E2 | Major |

## Pendiente de definir

- Quién ejecuta cada TC y en qué rama o entorno (en el backend: autoría en `develop`, ejecución en `release/0.1.0`).
- Dónde se registran los resultados de ejecución (Pass/Fail y comentarios en cada TC, y la columna "Resultado" de esta matriz).
- Quién conecta el frontend al backend (`VITE_API_M3_URL` y reemplazo de la capa de datos de finanzas) y en qué rama.
- Cómo se cargan los datasets de UC12 y UC13 en el entorno de pruebas (script SQL o ejecución previa de los TC del backend).
