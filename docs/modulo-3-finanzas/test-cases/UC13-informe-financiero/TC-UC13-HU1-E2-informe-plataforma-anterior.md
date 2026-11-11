### Test Case Specification: Informe financiero · HU1 · E2 Informe de la plataforma de un período anterior
**Created** : 2026-11-10  **Spec/Plan Link** : [013-consultar-informe-financiero/spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC13-HU1-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero puede seleccionar un **período anterior** de la periodicidad elegida en `/finadmin/informe`, que el informe se recarga con los agregados de toda la plataforma para **ese** período (sin mezclar otros) y su comparación con el período inmediatamente anterior equivalente, y que solo se pueden elegir períodos predefinidos (no rangos libres).

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC13 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md) |
| Implementation Plan UC13 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/plan.md) |
| Contrato REST — consultar informe | REST contract | [UC13-consultar-informe-financiero.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC13-consultar-informe-financiero.md) |
| Test case backend equivalente | Test Case | [TC-UC13-HU1-E2-informe-plataforma-anterior.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC13-HU1-E2-informe-plataforma-anterior.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**. El dataset (períodos 2026-07 a 2026-10) **no forma parte del seed**: se prepara con el dataset de este TC, con datos distintos en cada período para detectar mezclas.
* Los montos son **ilustrativos**; ajustar al dataset del entorno. La pantalla muestra montos en millones de COP (`$ 0.80 M`); el valor exacto se contrasta contra el JSON.
* El contrato no define un endpoint que liste períodos disponibles: verificar de dónde sale la lista del desplegable "Período" y que sus valores se traducen a períodos canónicos válidos (`2026-08`, `2026-Q2`, `2026-09-H1`).

##### Dependencies & Assumptions
* **TC-UC13-HU1-E1 debe haber pasado** (el informe del último período cerrado funciona).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).

##### Preconditions & Default Setup
* **Initial State** : 2026-08 con 6 cobros `800000.00`, 1 reembolso `50000.00`, 5 dispersiones `700000.00`, 5 comisiones `105000.00` (neto `50000.00`); 2026-07 (comparación) con neto `40000.00`; 2026-09 y 2026-10 con datos distintos.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Selección de un período anterior
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Verificar los datos del período elegido | `psql`: `SELECT record_type, COUNT(*), SUM(amount) FROM v_financial_records WHERE created_at >= '2026-08-01T00:00:00-05:00' AND created_at < '2026-09-01T00:00:00-05:00' GROUP BY record_type;` | `2026-08` | 6 cobros, 1 reembolso, 5 dispersiones y 5 comisiones con los totales de la precondición. | [ ] | |
| 2 | Abrir el informe | Entrar como Admin Financiero y pulsar "Informe" | `http://localhost:5173/finadmin/informe` | Mensual y el último período cerrado (octubre de 2026). | [ ] | Anotar los valores como línea base. |
| 3 | Abrir la lista de períodos | Pulsar el desplegable "Período" | N/A | Se listan períodos cerrados (el más reciente primero), incluido agosto de 2026; no hay campos de fecha libres. | [ ] | RF-004. |
| 4 | Seleccionar un período anterior | Elegir agosto de 2026 | `Agosto 2026` | La petición lleva `period=2026-08`; el desplegable muestra el período elegido y el informe se recarga sin errores. | [ ] | |
| 5 | Verificar el período devuelto | Comparar con el JSON en DevTools | N/A | `period = "2026-08"`, `is_closed = true`, `scope = "PLATFORM"`, `periodicity = "MONTHLY"`. | [ ] | |
| 6 | Verificar que no se mezclan períodos | Leer los KPI | N/A | Cobros `$ 0.80 M`, reembolsos `$ 0.05 M`, dispersiones `$ 0.70 M`, comisiones aprox. `$ 0.11 M`; ningún valor de 2026-09 ni 2026-10. | [ ] | RF-005. |
| 7 | Verificar el neto | Leer el panel grande | N/A | `$ 0.05 M` (`net_amount = "50000.00"`). | [ ] | RF-008. |
| 8 | Verificar los registros por tipo | Leer "Registros por tipo" | N/A | Cobro 6, Reembolso 1, Dispersión 5, Comisión 5. | [ ] | |
| 9 | Verificar la comparación | Leer la variación | período anterior `2026-07`, neto `40000.00` | Comparación con julio de 2026 (no con septiembre): variación absoluta `10000.00` y porcentual `25.00 %`. | [ ] | RF-010. |
| 10 | Verificar que el período elegido prevalece | Volver al último período y comparar | N/A | Con el último período se ve octubre (`2026-10`); con agosto se ve exactamente agosto. | [ ] | RF-003, RF-004. |
| 11 | Verificar que la consulta no modifica registros | Contar filas y sumar montos en `v_financial_records` antes y después | N/A | Mismo conteo y mismos montos. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Período anterior en Trimestral | Pulsar "Trimestral" y elegir el 2.º trimestre de 2026 | `2026-Q2` | La petición lleva `periodicity=QUARTERLY&period=2026-Q2`; la comparación es con `2026-Q1`. | [ ] | |
| 2 | Período anterior en Quincenal | Pulsar "Quincenal" y elegir la 1ª quincena de septiembre de 2026 | `2026-09-H1` | La petición lleva `periodicity=SEMI_MONTHLY&period=2026-09-H1`; la comparación es con `2026-08-H2`. | [ ] | |
| 3 | Cambiar de periodicidad con un período anterior elegido | Con agosto elegido en Mensual, pulsar "Trimestral" | N/A | El período vuelve al más reciente de la nueva periodicidad; no queda un período de otra periodicidad. | [ ] | |
| 4 | Cambiar de período repetidamente | Alternar rápido entre tres períodos | N/A | La pantalla termina mostrando el último período elegido, sin datos de uno anterior mezclados. | [ ] | Carrera entre peticiones. |
| 5 | Período sin registros | Elegir un período sin operaciones confirmadas | N/A | `200` con métricas y conteos en 0, sin error; variación como no calculable si el anterior también es 0. | [ ] | |
| 6 | Período inválido | Interceptar y enviar `period=2026-Q5` con `periodicity=QUARTERLY` | `2026-Q5` | `400 INVALID_PERIOD`; la pantalla informa un error controlado y no muestra cifras. | [ ] | La interfaz no permite escribir períodos libres. |
| 7 | Error de carga al cambiar de período | Detener PostgreSQL y elegir otro período; restaurar | N/A | `500 INTERNAL_ERROR`; mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: la pantalla no maneja el estado de error. |
| 8 | Navegación por teclado | Operar el desplegable y las pestañas con teclado | N/A | Se puede elegir periodicidad y período solo con teclado. | [ ] | Accesibilidad. |
| 9 | Estabilidad de un período cerrado | Consultar dos veces el mismo período anterior | N/A | Las cifras son idénticas en ambas consultas. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La comparación siempre es contra el período inmediatamente anterior **equivalente** al elegido, no contra el último cerrado.
* **EC-002** : Cada periodicidad ofrece su propia lista de períodos; no se mezclan.
* **EC-003** : El informe de un período cerrado no cambia entre consultas.
* **EC-004** : No hay rangos libres de fechas.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
