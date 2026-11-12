### Test Case Specification: Informe financiero · HU2 · E2 Informe propio de un período anterior
**Created** : 2026-11-10  **Spec/Plan Link** : [013-consultar-informe-financiero/spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC13-HU2-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Propietario puede seleccionar un **período anterior** de la periodicidad elegida en `/owner/finanzas/balance`, que el informe se recarga solo con los agregados de **sus** reservas en ese período (sin mezclar otros períodos ni propietarios) y su comparación con el período inmediatamente anterior equivalente, y que solo se pueden elegir períodos predefinidos.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC13 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md) |
| Implementation Plan UC13 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/plan.md) |
| Contrato REST — consultar informe | REST contract | [UC13-consultar-informe-financiero.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC13-consultar-informe-financiero.md) |
| Test case backend equivalente | Test Case | [TC-UC13-HU2-E2-informe-propio-anterior.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC13-HU2-E2-informe-propio-anterior.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**. El dataset (propietarios A y B en 2026-07 a 2026-10) **no forma parte del seed**: se prepara con el dataset de este TC.
* Los montos son **ilustrativos**; ajustar al dataset. La pantalla muestra montos en millones de COP; el valor exacto se contrasta contra el JSON.
* La sesión del Propietario debe usar el `owner_id` del Propietario A.

##### Dependencies & Assumptions
* **TC-UC13-HU2-E1 debe haber pasado** (el informe propio del último período cerrado funciona).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).

##### Preconditions & Default Setup
* **Initial State** : Propietario A (`11111111-1111-4111-8111-111111111111`) en 2026-08: 2 cobros `200000.00`, 1 reembolso `50000.00`, 2 dispersiones `180000.00`, 2 comisiones `27000.00`; en 2026-07 sus dispersiones suman `150000.00`. Propietario B en 2026-08: 3 cobros `450000.00`, 2 dispersiones `400000.00`, 3 comisiones `78000.00` (sin reembolsos).
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Selección de un período anterior (alcance propietario)
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Verificar los registros de A y B en el período | `psql`: `SELECT owner_id, record_type, COUNT(*), SUM(amount) FROM v_financial_records WHERE created_at >= '2026-08-01T00:00:00-05:00' AND created_at < '2026-09-01T00:00:00-05:00' GROUP BY owner_id, record_type;` | `2026-08` | A y B tienen los totales de la precondición; B sirve de contraste. | [ ] | |
| 2 | Abrir el balance | Entrar como Propietario y abrir `/owner/finanzas/balance` | `http://localhost:5173/owner/finanzas/balance` | Mensual y el último período cerrado (octubre de 2026). | [ ] | Anotar la línea base. |
| 3 | Abrir la lista de períodos | Pulsar el desplegable "Período" | N/A | Se listan períodos cerrados (el más reciente primero), incluido agosto de 2026; no hay campos de fecha libres. | [ ] | RF-004. |
| 4 | Seleccionar un período anterior | Elegir agosto de 2026 | `Agosto 2026` | La petición lleva `scope=OWNER&owner_id=11111111-…&periodicity=MONTHLY&period=2026-08`; el informe se recarga sin errores. | [ ] | |
| 5 | Verificar período y alcance | Comparar con el JSON en DevTools | N/A | `period = "2026-08"`, `is_closed = true`, `scope = "OWNER"`. | [ ] | |
| 6 | Verificar que solo se agregan registros de A en agosto | Leer los KPI | N/A | Cobros `$ 0.20 M`, reembolsos `$ 0.05 M`, dispersiones `$ 0.18 M`, comisiones aprox. `$ 0.03 M`; sin montos de B ni de otros períodos. | [ ] | RF-006. |
| 7 | Verificar las ganancias | Leer el panel grande | N/A | "Ganancias del propietario" = `$ 0.18 M` (`net_amount = "180000.00"`); no se resta el reembolso. | [ ] | RF-008. |
| 8 | Verificar los registros por tipo | Leer "Registros por tipo" | N/A | Cobro 2, Reembolso 1, Dispersión 2, Comisión 2. | [ ] | |
| 9 | Verificar la comparación propia | Leer la variación | A, anterior `2026-07`, dispersiones `150000.00` | Variación absoluta `30000.00` y porcentual `20.00 %` frente a julio de 2026. | [ ] | RF-010. |
| 10 | Verificar que el período elegido prevalece | Volver al último período y comparar | N/A | Con el último período se ve octubre; con agosto se ve exactamente agosto, sin mezclar septiembre u octubre. | [ ] | |
| 11 | Verificar el pie | Leer el pie del informe | N/A | Indica período cerrado, alcance propietario y garantías pendientes excluidas. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Período anterior en Trimestral | Pulsar "Trimestral" y elegir el 2.º trimestre de 2026 | `2026-Q2` | La petición lleva `periodicity=QUARTERLY&period=2026-Q2`; la comparación es con `2026-Q1`; solo datos de A. | [ ] | |
| 2 | Período anterior en Quincenal | Pulsar "Quincenal" y elegir la 1ª quincena de septiembre de 2026 | `2026-09-H1` | `periodicity=SEMI_MONTHLY&period=2026-09-H1`; la comparación es con `2026-08-H2`; solo datos de A. | [ ] | |
| 3 | Cambiar de periodicidad con período anterior elegido | Con agosto elegido, pulsar "Trimestral" | N/A | El período vuelve al más reciente de la nueva periodicidad. | [ ] | |
| 4 | Cambios rápidos de período | Alternar rápido entre tres períodos | N/A | La pantalla termina mostrando el último período elegido, sin mezcla de datos. | [ ] | |
| 5 | Período sin operaciones del propietario | Elegir un período sin registros propios | N/A | `200` con todo en 0 y sin error; variación no calculable si el anterior también es 0. | [ ] | |
| 6 | Período inválido | Interceptar y enviar `period=2026-13` | `2026-13` | `400 INVALID_PERIOD`; error controlado y sin cifras. | [ ] | |
| 7 | Error de carga al cambiar de período | Detener PostgreSQL y elegir otro período; restaurar | N/A | `500 INTERNAL_ERROR`; mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: no se maneja el estado de error. |
| 8 | Alcance tras cambiar de período | Cambiar varias veces de período y revisar las peticiones | N/A | Todas llevan `scope=OWNER` y el `owner_id` de A. | [ ] | |
| 9 | Navegación por teclado | Operar el desplegable y las pestañas con teclado | N/A | Se puede cambiar periodicidad y período solo con teclado. | [ ] | |
| 10 | Solo lectura | Verificar `v_financial_records` antes y después | N/A | Mismo conteo y mismos montos. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La comparación es contra el período inmediatamente anterior equivalente al elegido.
* **EC-002** : Cada periodicidad ofrece su propia lista de períodos.
* **EC-003** : El alcance propietario se mantiene al cambiar de período o periodicidad.
* **EC-004** : No hay rangos libres de fechas.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
