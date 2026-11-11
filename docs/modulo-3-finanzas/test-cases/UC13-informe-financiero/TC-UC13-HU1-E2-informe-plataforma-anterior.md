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
Este caso de prueba verifica que el Administrador Financiero puede seleccionar un **período anterior** de la periodicidad elegida en `/finadmin/informe`, que el informe se recarga con los agregados de toda la plataforma para ese período y su comparación con el período inmediatamente anterior equivalente, y que solo se pueden elegir períodos predefinidos (no rangos libres).

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
* **Con los mocks actuales, al cambiar de período los valores no cambian**: `getReport` devuelve los mismos datos de la periodicidad para cualquier período; solo cambia lo seleccionado en el desplegable. Los pasos que comparan cifras entre períodos solo son verificables con **backend real**.
* Períodos disponibles en los mocks: Quincenal (`1ª quincena sep 2026`, `2ª quincena ago 2026`), Mensual (`Septiembre 2026`, `Agosto 2026`, `Julio 2026`), Trimestral (`3T 2026`, `2T 2026`). Son ilustrativos.
* La pantalla no muestra el nombre del período dentro del informe, solo en el desplegable "Período".

##### Dependencies & Assumptions
* **TC-UC13-HU1-E1 debe haber pasado** (el informe del último período cerrado funciona).
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; hay registros confirmados en varios períodos.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Selección de un período anterior
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el informe | Entrar como Admin Financiero y pulsar "Informe" | `http://localhost:5173/finadmin/informe` | Mensual, período "Septiembre 2026" y los datos del último período cerrado. | [ ] | Anotar los valores como línea base. |
| 2 | Abrir la lista de períodos | Pulsar el desplegable "Período" | N/A | Se listan "Septiembre 2026", "Agosto 2026" y "Julio 2026"; no hay campos de fecha libres. | [ ] | RF-004. |
| 3 | Seleccionar un período anterior | Elegir "Agosto 2026" | `Agosto 2026` | El desplegable muestra "Agosto 2026" y el informe se recarga sin errores. | [ ] | |
| 4 | Verificar la recarga | Observar la pantalla tras elegir | N/A | Se actualizan los KPI, el neto, los conteos y la nota al pie con los datos del período elegido. | [ ] | **Con mocks los valores son iguales a la línea base.** |
| 5 | Verificar la comparación | Leer las variaciones de los KPI | N/A | Las variaciones comparan "Agosto 2026" con el período inmediatamente anterior (Julio 2026), no con septiembre. | [ ] | Solo verificable con backend real. |
| 6 | Verificar la nota al pie | Leer el pie del informe | N/A | Indica que es un período cerrado. | [ ] | |
| 7 | Seleccionar el período más antiguo | Elegir "Julio 2026" | `Julio 2026` | Se carga el informe de julio; si no existe un período anterior para comparar, se indica sin error. | [ ] | Variación no calculable si no hay base. |
| 8 | Volver al último período | Elegir "Septiembre 2026" | `Septiembre 2026` | Vuelve a los datos de la línea base. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Período anterior en Quincenal | Elegir "Quincenal" y luego "2ª quincena ago 2026" | `Quincenal` | Se carga el informe sin errores; el desplegable muestra la quincena elegida. | [ ] | |
| 2 | Período anterior en Trimestral | Elegir "Trimestral" y luego "2T 2026" | `Trimestral` | Se carga el informe sin errores; el desplegable muestra el trimestre elegido. | [ ] | |
| 3 | Cambiar de periodicidad con un período anterior elegido | Con "Agosto 2026" en Mensual, pulsar "Trimestral" | N/A | El período vuelve al más reciente de la nueva periodicidad ("3T 2026"); no queda un período de otra periodicidad. | [ ] | |
| 4 | Cambiar de período repetidamente | Alternar rápido entre tres períodos | N/A | La pantalla termina mostrando el último período elegido, sin datos de uno anterior mezclados. | [ ] | Carrera entre peticiones. |
| 5 | Período sin registros (solo backend real) | Elegir un período sin operaciones confirmadas | N/A | Métricas y conteos en 0, sin error; la variación se muestra como no calculable. | [ ] | |
| 6 | Período inválido (solo backend real) | Simular `400 INVALID_PERIOD` | N/A | Se informa un error controlado y no se muestran cifras. | [ ] | La interfaz no permite escribir períodos libres. |
| 7 | Error de carga al cambiar de período (solo backend real) | Simular `500` y elegir otro período | N/A | Mensaje de error controlado; la pantalla no queda en blanco. | [ ] | **Posible defecto**: la pantalla no maneja el estado de error. |
| 8 | Navegación por teclado | Operar el desplegable y las pestañas con teclado | N/A | Se puede elegir periodicidad y período solo con teclado. | [ ] | Accesibilidad. |
| 9 | Solo lectura | Revisar la pantalla | N/A | Elegir un período no modifica registros financieros. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La comparación siempre es contra el período inmediatamente anterior **equivalente** al elegido, no contra el último cerrado.
* **EC-002** : Cada periodicidad ofrece su propia lista de períodos; no se mezclan.
* **EC-003** : El informe de un período cerrado no cambia entre consultas (es estable en el tiempo).
* **EC-004** : No hay rangos libres de fechas.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
