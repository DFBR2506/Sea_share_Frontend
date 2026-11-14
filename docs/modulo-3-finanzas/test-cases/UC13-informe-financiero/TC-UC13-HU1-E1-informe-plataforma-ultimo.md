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
Este caso de prueba verifica que el Administrador Financiero, al abrir "Informe" (`/finadmin/informe`), ve por defecto el **último período cerrado** de la periodicidad seleccionada con los agregados de toda la plataforma que devuelve el backend (cobros, reembolsos, dispersiones y comisiones confirmados), el neto generado, la cantidad de registros por tipo y la comparación con el período inmediatamente anterior.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**. Los registros del dataset (período 2026-10) **no forman parte del seed**: se preparan con el dataset de este TC.
* Los montos y cantidades son **ilustrativos y coherentes entre sí**; ajustar al dataset del entorno.
* La fecha de referencia es 2026-11-02; mientras la ejecución ocurra en noviembre de 2026 el último mes cerrado sigue siendo `2026-10` (cuatrimestral: `2026-Q3`; quincena: `2026-10-H2`). Si se ejecuta después, recalcular el período esperado.
* La pantalla muestra los montos en **millones de COP con dos decimales** (`$ 1.15 M`); el valor exacto se contrasta contra el JSON del backend en DevTools.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Existen registros financieros **confirmados** de varios propietarios y períodos (generados por UC05, UC09 y UC10 o cargados como dataset).

##### Preconditions & Default Setup
* **Initial State** : dataset mensual 2026-10 con 10 cobros, 2 reembolsos, 8 dispersiones y 8 comisiones. Totales: cobros `1150000.00`, reembolsos `100000.00`, dispersiones `900000.00`, comisiones `135000.00`, neto `150000.00`. Período 2026-09 (comparación): neto `125000.00`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Informe del último período cerrado (alcance plataforma)
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Verificar el dataset del período | `psql`: `SELECT record_type, COUNT(*), SUM(amount) FROM v_financial_records WHERE created_at >= '2026-10-01T00:00:00-05:00' AND created_at < '2026-11-01T00:00:00-05:00' GROUP BY record_type;` | `2026-10`, America/Bogota | 10 cobros, 2 reembolsos, 8 dispersiones y 8 comisiones con los totales de la precondición. | [ ] | |
| 2 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | |
| 3 | Abrir el informe | Pulsar "Informe" en el menú | N/A | La URL es `/finadmin/informe`; se muestra "Informe financiero". | [ ] | |
| 4 | Verificar la petición | DevTools → Network | N/A | `GET /api/v1/financial-report?scope=PLATFORM&periodicity=MONTHLY` (con o sin `period`) responde `200`; anotar el JSON. | [ ] | |
| 5 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego el informe. | [ ] | |
| 6 | Verificar los controles por defecto | Leer "Periodicidad" y "Período" | N/A | "Mensual" seleccionado y el último período cerrado (octubre de 2026); coincide con `period = "2026-10"` y `is_closed = true` del JSON. | [ ] | RF-003. |
| 7 | Verificar los cobros | Leer "Cobros confirmados" | N/A | `$ 1.15 M` (`total_collections = "1150000.00"`). | [ ] | |
| 8 | Verificar los reembolsos | Leer "Reembolsos confirmados" | N/A | `$ 0.10 M` (`total_refunds = "100000.00"`). | [ ] | |
| 9 | Verificar las dispersiones | Leer "Dispersiones confirmadas" | N/A | `$ 0.90 M` (`total_settlements = "900000.00"`). | [ ] | |
| 10 | Verificar las comisiones | Leer "Comisiones confirmadas" | N/A | Aprox. `$ 0.14 M` (`total_commissions = "135000.00"`), con la nota "Métrica informativa". | [ ] | La comisión es informativa e independiente. El redondeo a millones pierde precisión (H-12). |
| 11 | Verificar el neto generado | Leer el panel grande | N/A | "Neto generado", "Cobros − reembolsos − dispersiones" y valor `$ 0.15 M` (`net_amount = "150000.00"`). | [ ] | RF-008. |
| 12 | Verificar la comparación con el período anterior | Leer la variación del panel grande | período anterior `2026-09`, neto `125000.00` | Variación absoluta de `25000.00` y porcentual de `20.00 %` frente a septiembre de 2026 (`comparison` del JSON). | [ ] | RF-010. |
| 13 | Verificar los registros por tipo | Leer "Registros por tipo" | N/A | Cobro 10, Reembolso 2, Dispersión 8, Comisión 8 (`counts`). | [ ] | |
| 14 | Verificar la nota al pie | Leer el pie del informe | N/A | Indica período cerrado y que las garantías pendientes están excluidas. | [ ] | RF-014. |
| 15 | Verificar la fórmula del neto | Calcular `cobros − reembolsos − dispersiones` con los valores del JSON | 1150000 − 100000 − 900000 | Igual al neto mostrado (`150000.00`); la comisión no se suma ni se resta. | [ ] | RF-009. |
| 16 | Verificar que no hay detalle individual | Revisar la pantalla y el JSON | N/A | Solo agregados; no aparece el detalle paginado de UC12. | [ ] | RF-011. |

##### Section 2: Otras periodicidades, errores y casos extremos
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar a Quincenal | Pulsar "Quincenal" | `Quincenal` | La petición lleva `periodicity=SEMI_MONTHLY`; período por defecto = 2ª quincena de octubre de 2026 (`2026-10-H2`), `is_closed = true`; las cifras coinciden con el JSON. | [ ] | |
| 2 | Cambiar a Trimestral | Pulsar "Trimestral" | `Trimestral` | `periodicity=QUARTERLY`; período por defecto = 3.er trimestre de 2026 (`2026-Q3`), cerrado; las cifras coinciden con el JSON. | [ ] | |
| 3 | Volver a Mensual | Pulsar "Mensual" | `Mensual` | Vuelve el último mes cerrado (octubre de 2026). | [ ] | Cambiar la periodicidad reinicia el período. |
| 4 | Verificar que no hay rangos libres | Buscar campos de fecha desde/hasta | N/A | No existen; solo se elige entre los períodos de la lista. | [ ] | RF-004. |
| 5 | Período sin registros | Elegir un período sin operaciones confirmadas (p. ej. enero de 2020 si la lista lo permite) | N/A | El backend responde `200` con todo en cero; la pantalla muestra `$ 0.00 M` y conteos en 0, sin error. | [ ] | Variación no calculable si el anterior es 0: verificar cómo se muestra. |
| 6 | Período en curso | Elegir el período actual (noviembre de 2026) si la lista lo ofrece | N/A | `is_closed = false`; la pantalla lo identifica como abierto/parcial con corte a la fecha de consulta. | [ ] | La lista de períodos debería marcar o excluir el período abierto. |
| 7 | Error de carga | Detener PostgreSQL y abrir el informe; restaurar | N/A | El backend responde `500 INTERNAL_ERROR`; la pantalla muestra un mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: `FinanceReportPage` no maneja el estado de error y puede fallar al leer `r.cobros`. |
| 8 | Período inválido | Interceptar la petición y enviar `period=2026-13` | `2026-13` | El backend responde `400 INVALID_PERIOD` y la pantalla informa un error controlado, sin cifras. | [ ] | La interfaz solo permite valores de la lista. |
| 9 | Variación con período anterior en cero | Elegir el primer período con datos (cuyo anterior no tiene registros) | N/A | `percentage_variation = null`; la pantalla muestra "no calculable" y no `NaN`, `Infinity` ni vacío confuso. | [ ] | RF-010. |
| 10 | Recargar la página | Pulsar F5 | N/A | Vuelve al estado por defecto (Mensual, último período) sin volver al login. | [ ] | |
| 11 | Vista móvil | Reducir la ventana a < 768 px | N/A | Los KPI y paneles se apilan y todo es legible sin scroll horizontal. | [ ] | |
| 12 | Acceso por otro rol | Entrar como Propietario y abrir `/finadmin/informe` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |
| 13 | Solo lectura | Verificar `v_financial_records` antes y después | N/A | Mismo conteo y mismos montos. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : Quincenas del día 1 al 15 y del 16 al fin de mes; meses calendario; trimestres calendario (America/Bogota).
* **EC-002** : Por defecto se muestra siempre un período **cerrado**; el período en curso solo se ve si se elige y se marca como abierto.
* **EC-003** : Los depósitos de garantía pendientes no entran en las métricas.
* **EC-004** : Si el período anterior vale 0, la variación porcentual debe mostrarse como "no calculable".
* **EC-005** : El backend entrega una sola comparación (del neto o ganancia); si la pantalla muestra variaciones por indicador (cobros, reembolsos, dispersiones), verificar de dónde salen (H-13).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
