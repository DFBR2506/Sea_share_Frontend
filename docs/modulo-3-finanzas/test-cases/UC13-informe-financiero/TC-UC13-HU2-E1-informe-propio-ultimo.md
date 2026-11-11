### Test Case Specification: Informe financiero · HU2 · E1 Informe propio del último período cerrado
**Created** : 2026-11-10  **Spec/Plan Link** : [013-consultar-informe-financiero/spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC13-HU2-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Propietario, desde "Balance General" (`/owner/finanzas/balance`), ve por defecto el **último período cerrado** con los agregados de **sus** reservas, su ganancia (total de dispersiones confirmadas a su favor), la cantidad de registros por tipo y la comparación con el período inmediatamente anterior, sin acceder a datos de otros propietarios.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC13 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md) |
| Implementation Plan UC13 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/plan.md) |
| Contrato REST — consultar informe | REST contract | [UC13-consultar-informe-financiero.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC13-consultar-informe-financiero.md) |
| Test case backend equivalente | Test Case | [TC-UC13-HU2-E1-informe-propio-ultimo.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC13-HU2-E1-informe-propio-ultimo.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**. El dataset (propietarios A y B en 2026-09 y 2026-10) **no forma parte del seed**: se prepara con el dataset de este TC.
* Los montos son **ilustrativos**; ajustar al dataset. La pantalla muestra montos en millones de COP (`$ 0.30 M`); el valor exacto se contrasta contra el JSON.
* Último mes cerrado = `2026-10` mientras la ejecución ocurra en noviembre de 2026.
* La sesión del Propietario debe usar el `owner_id` del Propietario A; verificar cómo la pantalla obtiene ese identificador (sin autenticación real).

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`) y la sesión del Propietario usa el `owner_id` de A.
* **TC-UC13-HU1-E1 debe haber pasado** (agregado de plataforma y dataset mensual verificados).
* El dataset contiene al menos dos propietarios con registros en 2026-09 y 2026-10.

##### Preconditions & Default Setup
* **Initial State** : Propietario A (`11111111-1111-4111-8111-111111111111`) en 2026-10: 2 cobros `300000.00`, 1 reembolso `20000.00`, 2 dispersiones `250000.00`, 2 comisiones `37500.00`; en 2026-09 sus dispersiones suman `200000.00`. Propietario B (`22222222-2222-4222-8222-222222222222`) en 2026-10: 5 cobros `500000.00`, 1 reembolso `80000.00`, 4 dispersiones `400000.00`, 4 comisiones `60000.00`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Informe propio del último período cerrado
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Verificar los registros de A y B | `psql`: `SELECT owner_id, record_type, COUNT(*), SUM(amount) FROM v_financial_records WHERE created_at >= '2026-10-01T00:00:00-05:00' AND created_at < '2026-11-01T00:00:00-05:00' GROUP BY owner_id, record_type;` | A y B, `2026-10` | A y B tienen los totales de la precondición; B sirve de contraste para detectar fuga de datos. | [ ] | |
| 2 | Entrar como Propietario | Abrir `/login` y pulsar "Entrar como Propietario" | `http://localhost:5173/login` | Redirige a `/owner/embarcaciones`. | [ ] | |
| 3 | Abrir el balance | Pulsar "Finanzas" en el menú | N/A | Redirige a `/owner/finanzas/balance`; la pestaña "Balance General" está activa y también se ve "Historial de Pagos". | [ ] | |
| 4 | Verificar la petición | DevTools → Network | N/A | `GET /api/v1/financial-report?scope=OWNER&owner_id=11111111-…&periodicity=MONTHLY` responde `200`; anotar el JSON. | [ ] | |
| 5 | Verificar el encabezado | Leer el encabezado | N/A | "Feature 013", título "Informe financiero". | [ ] | |
| 6 | Verificar los controles por defecto | Leer "Periodicidad" y "Período" | N/A | "Mensual" y el último período cerrado (octubre de 2026); coincide con `period = "2026-10"`, `is_closed = true`, `scope = "OWNER"`. | [ ] | RF-003. |
| 7 | Verificar los KPI | Leer los cuatro indicadores | N/A | Cobros `$ 0.30 M`, reembolsos `$ 0.02 M`, dispersiones `$ 0.25 M` y comisiones aprox. `$ 0.04 M`; solo datos de A. | [ ] | RF-006. Redondeo a millones (H-12). |
| 8 | Verificar la ganancia del propietario | Leer el panel grande | N/A | "Ganancias del propietario", "Total de dispersiones confirmadas a favor" y valor `$ 0.25 M` (`net_amount = "250000.00"`). | [ ] | No debe decir "Neto generado". RF-008. |
| 9 | Verificar la coherencia de la ganancia | Comparar "Ganancias del propietario" con "Dispersiones confirmadas" | N/A | Ambos valores son iguales. | [ ] | No se aplica la fórmula de plataforma. |
| 10 | Verificar la comparación propia | Leer la variación | A, anterior `2026-09`, dispersiones `200000.00` | Variación absoluta `50000.00` y porcentual `25.00 %` frente a septiembre de 2026. | [ ] | RF-010. |
| 11 | Verificar los registros por tipo | Leer "Registros por tipo" | N/A | Cobro 2, Reembolso 1, Dispersión 2, Comisión 2. | [ ] | Sin conteos de B. |
| 12 | Verificar la nota al pie | Leer el pie | N/A | Indica período cerrado, alcance propietario y garantías pendientes excluidas. | [ ] | |
| 13 | Verificar el aislamiento de datos | Comparar con el informe de plataforma (TC-UC13-HU1-E1) | plataforma: cobros `1150000.00`, neto `150000.00` | Los valores de A no coinciden con los de la plataforma ni incluyen los `400000.00` de dispersiones de B. | [ ] | RF-006. |
| 14 | Verificar que no se consulta Flota | Revisar el journal de Flota o los logs del backend | N/A | No hay llamada al Sistema de Gestión de Flota; no hay `401`/`403`. | [ ] | RF-015. |

##### Section 2: Otras periodicidades, errores y casos extremos
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar a Quincenal | Pulsar "Quincenal" | `Quincenal` | `periodicity=SEMI_MONTHLY`; período por defecto `2026-10-H2`; cifras solo de A y coincidentes con el JSON. | [ ] | |
| 2 | Cambiar a Trimestral | Pulsar "Trimestral" | `Trimestral` | `periodicity=QUARTERLY`; período por defecto `2026-Q3`; cifras solo de A. | [ ] | |
| 3 | Volver a Mensual | Pulsar "Mensual" | `Mensual` | Vuelve el último mes cerrado. | [ ] | |
| 4 | Propietario sin operaciones | Entrar con un propietario sin registros en el período | N/A | `200`; todo en `$ 0.00 M` y conteos en 0, sin error. | [ ] | |
| 5 | Período en curso | Elegir el período actual si la lista lo ofrece | N/A | `is_closed = false`; la pantalla lo identifica como abierto/parcial. | [ ] | |
| 6 | Alternar pestañas de Finanzas | Ir a "Historial de Pagos" y volver al balance | N/A | El informe vuelve a cargar sin errores y conserva el alcance del propietario. | [ ] | |
| 7 | Error de carga | Detener PostgreSQL y abrir el balance; restaurar | N/A | `500 INTERNAL_ERROR`; mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: no se maneja el estado de error. |
| 8 | Vista móvil | Reducir la ventana a < 768 px | N/A | KPI y paneles apilados; la barra flotante de Finanzas sigue accesible. | [ ] | |
| 9 | Acceso por otro rol | Entrar como Arrendatario y abrir `/owner/finanzas/balance` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |
| 10 | Sin datos de propietarios ajenos | Revisar toda la pantalla | N/A | No aparecen identificadores ni montos de otros propietarios. | [ ] | RF-006. |
| 11 | Solo lectura | Verificar `v_financial_records` antes y después | N/A | Mismo conteo y mismos montos. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La ganancia del propietario es el total de sus dispersiones confirmadas (liquidación, compensaciones por cancelación y depósitos liquidados); no incluye costos operativos.
* **EC-002** : Por defecto se muestra un período **cerrado**.
* **EC-003** : Los depósitos de garantía pendientes no entran en las métricas.
* **EC-004** : Si el período anterior vale 0, la variación porcentual debe mostrarse como "no calculable".

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
