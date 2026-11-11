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
Este caso de prueba verifica que el Propietario puede seleccionar un **período anterior** de la periodicidad elegida en `/owner/finanzas/balance`, que el informe se recarga solo con los agregados de **sus** reservas en ese período y su comparación con el período inmediatamente anterior equivalente, y que solo se pueden elegir períodos predefinidos.

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
* **Con los mocks actuales, al cambiar de período los valores no cambian** y el informe no se restringe al propietario (`getReport` ignora período y alcance). Las comparaciones de cifras entre períodos y el aislamiento de datos propios solo son verificables con **backend real**.
* Períodos disponibles en los mocks: Quincenal (`1ª quincena sep 2026`, `2ª quincena ago 2026`), Mensual (`Septiembre 2026`, `Agosto 2026`, `Julio 2026`), Trimestral (`3T 2026`, `2T 2026`). Son ilustrativos.

##### Dependencies & Assumptions
* **TC-UC13-HU2-E1 debe haber pasado** (el informe propio del último período cerrado funciona).
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Propietario (`owner-0284`) con operaciones en varios períodos; en el sistema hay datos de otros propietarios.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Selección de un período anterior (alcance propietario)
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el balance | Entrar como Propietario y abrir `/owner/finanzas/balance` | `http://localhost:5173/owner/finanzas/balance` | Mensual, período "Septiembre 2026" y datos del último período cerrado. | [ ] | Anotar la línea base. |
| 2 | Abrir la lista de períodos | Pulsar el desplegable "Período" | N/A | Se listan "Septiembre 2026", "Agosto 2026" y "Julio 2026"; no hay campos de fecha libres. | [ ] | RF-004. |
| 3 | Seleccionar un período anterior | Elegir "Agosto 2026" | `Agosto 2026` | El desplegable muestra "Agosto 2026" y el informe se recarga sin errores. | [ ] | |
| 4 | Verificar la recarga | Observar KPI, ganancia y conteos | N/A | Se actualizan con los datos del propietario para agosto. | [ ] | **Con mocks los valores son iguales a la línea base.** |
| 5 | Verificar la ganancia | Leer "Ganancias del propietario" | N/A | Muestra la ganancia de sus dispersiones de agosto y la comparación con julio. | [ ] | Solo backend real. |
| 6 | Verificar el pie | Leer el pie del informe | N/A | "Período cerrado · alcance propietario · garantías pendientes excluidas". | [ ] | |
| 7 | Verificar el aislamiento | Revisar que los datos son solo del propietario | N/A | Las cifras no incluyen operaciones de otros propietarios. | [ ] | Solo backend real. |
| 8 | Volver al último período | Elegir "Septiembre 2026" | `Septiembre 2026` | Vuelve a los datos de la línea base. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Período anterior en Quincenal | Pulsar "Quincenal" y elegir "2ª quincena ago 2026" | `Quincenal` | Se carga sin errores; el desplegable muestra la quincena. | [ ] | |
| 2 | Período anterior en Trimestral | Pulsar "Trimestral" y elegir "2T 2026" | `Trimestral` | Se carga sin errores; el desplegable muestra el trimestre. | [ ] | |
| 3 | Cambiar de periodicidad con período anterior elegido | Con "Agosto 2026", pulsar "Trimestral" | N/A | El período vuelve al más reciente ("3T 2026"). | [ ] | |
| 4 | Cambios rápidos de período | Alternar rápido entre tres períodos | N/A | La pantalla termina mostrando el último período elegido, sin mezcla de datos. | [ ] | |
| 5 | Período sin operaciones del propietario (solo backend real) | Elegir un período sin registros propios | N/A | Todo en 0 y sin error; variación no calculable. | [ ] | |
| 6 | Período inválido (solo backend real) | Simular `400 INVALID_PERIOD` | N/A | Error controlado y sin cifras. | [ ] | |
| 7 | Error de carga al cambiar de período (solo backend real) | Simular `500` y elegir otro período | N/A | Mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: no se maneja el estado de error. |
| 8 | Navegación por teclado | Operar el desplegable y las pestañas con teclado | N/A | Se puede cambiar periodicidad y período solo con teclado. | [ ] | |
| 9 | Solo lectura | Revisar la pantalla | N/A | Elegir un período no modifica registros financieros. | [ ] | |

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
