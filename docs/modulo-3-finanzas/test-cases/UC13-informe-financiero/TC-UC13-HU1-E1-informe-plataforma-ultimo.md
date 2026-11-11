### Test Case Specification: Informe financiero · HU1 · E1 Informe de la plataforma del último período cerrado
**Created** : 2026-11-10  **Spec/Plan Link** : [013-consultar-informe-financiero/spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC13-HU1-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero, al abrir "Informe" (`/finadmin/informe`), ve por defecto el **último período cerrado** de la periodicidad seleccionada con los agregados de toda la plataforma (cobros, reembolsos, dispersiones y comisiones confirmados), el neto generado, la cantidad de registros por tipo y la comparación con el período inmediatamente anterior.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC13 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md) |
| Implementation Plan UC13 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/plan.md) |
| Contrato REST — consultar informe | REST contract | [UC13-consultar-informe-financiero.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC13-consultar-informe-financiero.md) |
| Test case backend equivalente | Test Case | [TC-UC13-HU1-E1-informe-plataforma-ultimo.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC13-HU1-E1-informe-plataforma-ultimo.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`) con una latencia simulada de ~200 ms. Los valores de este TC (Mensual: cobros 18.42 M, reembolsos 2.16 M, dispersiones 11.78 M, comisiones 1.42 M, neto 0.62 M) son **ilustrativos**; ajustar a los del entorno.
* **Inconsistencia de los mocks**: el neto del mock (0.62 M) no cumple la fórmula del spec `cobros − reembolsos − dispersiones` (18.42 − 2.16 − 11.78 = 4.48 M). El paso 12 fallará con mocks; **no es un defecto del front**, pero debe cumplirse con backend real.
* Los mocks devuelven los mismos valores para cualquier período de una periodicidad; solo cambia la etiqueta del período.
* Los mocks solo ofrecen períodos cerrados; el período en curso (informe abierto) no se puede probar con ellos.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; la plataforma tiene registros confirmados de varios propietarios.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Informe del último período cerrado (alcance plataforma)
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | |
| 2 | Abrir el informe | Pulsar "Informe" en el menú | N/A | La URL es `/finadmin/informe`; se muestra "Informe financiero". | [ ] | |
| 3 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego el informe. | [ ] | |
| 4 | Verificar los controles por defecto | Leer "Periodicidad" y "Período" | N/A | "Mensual" seleccionado y período "Septiembre 2026" (el más reciente de la lista). | [ ] | RF-003: último período cerrado. |
| 5 | Verificar los cobros | Leer "Cobros confirmados" | N/A | `$ 18.42 M` y "+12.4% vs. período anterior". | [ ] | |
| 6 | Verificar los reembolsos | Leer "Reembolsos confirmados" | N/A | `$ 2.16 M` y "−4.8% vs. período anterior". | [ ] | |
| 7 | Verificar las dispersiones | Leer "Dispersiones confirmadas" | N/A | `$ 11.78 M` y "+9.1% vs. período anterior". | [ ] | |
| 8 | Verificar las comisiones | Leer "Comisiones confirmadas" | N/A | `$ 1.42 M` con la nota "Métrica informativa". | [ ] | La comisión es informativa e independiente. |
| 9 | Verificar el neto generado | Leer el panel grande | N/A | "Neto generado", "Cobros − reembolsos − dispersiones" y "+ $ 0.62 M · +16.1% frente al período anterior". | [ ] | |
| 10 | Verificar los registros por tipo | Leer "Registros por tipo" | N/A | Cobro 42, Reembolso 8, Dispersión 37, Comisión 42. | [ ] | |
| 11 | Verificar la nota al pie | Leer el pie del informe | N/A | "Período cerrado · corte al 30 sep 2026 · garantías pendientes excluidas". | [ ] | RF-014. |
| 12 | Verificar la fórmula del neto | Calcular `cobros − reembolsos − dispersiones` con los valores mostrados | 18.42 − 2.16 − 11.78 | El neto mostrado es igual al resultado (4.48 M con estos datos). | [ ] | **Con mocks falla** (0.62 M); con backend real debe pasar. |
| 13 | Verificar que la comisión no altera el neto | Comparar el neto con y sin sumar/restar comisiones | N/A | El neto no incluye las comisiones. | [ ] | RF-009. Verificable con backend real. |

##### Section 2: Otras periodicidades, errores y casos extremos
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar a Quincenal | Pulsar "Quincenal" en "Periodicidad" | `Quincenal` | Período por defecto "1ª quincena sep 2026"; cobros `$ 9.10 M`, reembolsos `$ 0.94 M`, dispersiones `$ 5.70 M`, comisiones `$ 0.71 M`, neto `$ 0.30 M`; pie "corte al 15 sep 2026". | [ ] | |
| 2 | Cambiar a Trimestral | Pulsar "Trimestral" | `Trimestral` | Período por defecto "3T 2026"; cobros `$ 52.80 M`, reembolsos `$ 6.40 M`, dispersiones `$ 33.90 M`, comisiones `$ 4.10 M`, neto `$ 1.90 M`. | [ ] | |
| 3 | Volver a Mensual | Pulsar "Mensual" | `Mensual` | Vuelve el período más reciente "Septiembre 2026". | [ ] | Cambiar la periodicidad reinicia el período. |
| 4 | Verificar que no hay rangos libres | Buscar campos de fecha desde/hasta | N/A | No existen; solo se puede elegir entre los períodos de la lista. | [ ] | RF-004. |
| 5 | Verificar que no se muestran datos de registros individuales | Revisar la pantalla | N/A | Solo hay agregados; no aparece el detalle paginado (UC12). | [ ] | RF-011. |
| 6 | Período sin registros (solo backend real) | Elegir un período sin operaciones confirmadas | N/A | Todas las métricas en `$ 0.00 M` y todos los conteos en 0, sin error. | [ ] | Variación no calculable si el anterior es 0: verificar cómo se muestra. |
| 7 | Período en curso (solo backend real) | Consultar el período actual | N/A | Se identifica como abierto/parcial con corte a la fecha de consulta. | [ ] | Los mocks no lo ofrecen. |
| 8 | Error de carga (solo backend real) | Apagar el backend o simular `500` y abrir el informe | N/A | Aparece un mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: `FinanceReportPage` no maneja el estado de error y puede fallar al leer `r.cobros`. |
| 9 | Periodicidad o período inválido (solo backend real) | Simular `400 INVALID_PERIOD` | N/A | Se informa un error controlado y no se muestran cifras. | [ ] | La interfaz solo permite valores de la lista. |
| 10 | Recargar la página | Pulsar F5 | N/A | Vuelve al estado por defecto (Mensual, último período) sin volver al login. | [ ] | |
| 11 | Vista móvil | Reducir la ventana a < 768 px | N/A | Los KPI y paneles se apilan y todo es legible sin scroll horizontal. | [ ] | |
| 12 | Acceso por otro rol | Entrar como Propietario y abrir `/finadmin/informe` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Quincenas del día 1 al 15 y del 16 al fin de mes; meses calendario; trimestres calendario.
* **EC-002** : Por defecto se muestra siempre un período **cerrado**; el período en curso solo se ve si se elige y se marca como abierto.
* **EC-003** : Los depósitos de garantía pendientes no entran en las métricas.
* **EC-004** : Si el valor del período anterior es 0, la variación porcentual debe mostrarse como "no calculable" (no `Infinity` ni `NaN`).
* **EC-005** : Los montos se muestran en millones de COP con dos decimales (`$ 18.42 M`).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
