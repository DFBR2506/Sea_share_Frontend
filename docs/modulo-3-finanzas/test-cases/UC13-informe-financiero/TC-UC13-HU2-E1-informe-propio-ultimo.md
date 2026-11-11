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
* **Los mocks no restringen el informe al propietario**: `getReport` ignora el alcance y devuelve los mismos valores de la plataforma (Mensual: cobros 18.42 M, reembolsos 2.16 M, dispersiones 11.78 M, comisiones 1.42 M, ganancia 1.04 M). El aislamiento de datos propios (pasos marcados) solo se verifica con **backend real**.
* **Inconsistencia de los mocks**: la ganancia del mock (1.04 M) no coincide con el total de dispersiones (11.78 M), y según el spec (RF-008) la ganancia del propietario **es** el total de sus dispersiones confirmadas. Con backend real ambos valores deben coincidir.
* Los valores son **ilustrativos**; ajustar a los del entorno. Los mocks solo ofrecen períodos cerrados.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Propietario (`owner-0284`); en el sistema hay registros de otros propietarios.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Informe propio del último período cerrado
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Propietario | Abrir `/login` y pulsar "Entrar como Propietario" | `http://localhost:5173/login` | Redirige a `/owner/embarcaciones`. | [ ] | |
| 2 | Abrir el balance | Pulsar "Finanzas" en el menú | N/A | Redirige a `/owner/finanzas/balance`; la pestaña "Balance General" está activa y también se ve "Historial de Pagos". | [ ] | |
| 3 | Verificar el encabezado | Leer el encabezado | N/A | "Feature 013", título "Informe financiero". | [ ] | |
| 4 | Verificar los controles por defecto | Leer "Periodicidad" y "Período" | N/A | "Mensual" seleccionado y período "Septiembre 2026". | [ ] | RF-003. |
| 5 | Verificar los KPI | Leer los cuatro indicadores | N/A | Cobros `$ 18.42 M`, reembolsos `$ 2.16 M`, dispersiones `$ 11.78 M` y comisiones `$ 1.42 M`, con variaciones "vs. período anterior" (y "Métrica informativa" para comisiones). | [ ] | Con backend real, valores solo de sus reservas. |
| 6 | Verificar la ganancia del propietario | Leer el panel grande | N/A | "Ganancias del propietario", "Total de dispersiones confirmadas a favor" y "+ $ 1.04 M · +9.1% frente al período anterior". | [ ] | No debe decir "Neto generado". |
| 7 | Verificar los registros por tipo | Leer "Registros por tipo" | N/A | Cobro 42, Reembolso 8, Dispersión 37, Comisión 42. | [ ] | |
| 8 | Verificar la nota al pie | Leer el pie | N/A | "Período cerrado · alcance propietario · garantías pendientes excluidas". | [ ] | |
| 9 | Verificar la coherencia de la ganancia | Comparar "Ganancias del propietario" con "Dispersiones confirmadas" | N/A | Ambos valores son iguales. | [ ] | RF-008. **Con mocks falla** (1.04 vs 11.78); con backend real debe pasar. |
| 10 | Verificar el aislamiento de datos | Comparar con el informe de la plataforma (TC-UC13-HU1-E1) | N/A | Las cifras del propietario son menores o iguales a las de la plataforma y no incluyen datos de otros. | [ ] | Solo backend real. |

##### Section 2: Otras periodicidades, errores y casos extremos
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar a Quincenal | Pulsar "Quincenal" | `Quincenal` | Período "1ª quincena sep 2026"; ganancia `$ 0.52 M` con "+4.6%". | [ ] | |
| 2 | Cambiar a Trimestral | Pulsar "Trimestral" | `Trimestral` | Período "3T 2026"; ganancia `$ 3.10 M` con "+12.7%". | [ ] | |
| 3 | Volver a Mensual | Pulsar "Mensual" | `Mensual` | Vuelve "Septiembre 2026". | [ ] | |
| 4 | Propietario sin operaciones (solo backend real) | Entrar con un propietario sin registros en el período | N/A | Todo en `$ 0.00 M` y conteos en 0, sin error. | [ ] | |
| 5 | Período en curso (solo backend real) | Consultar el período actual | N/A | Se identifica como abierto/parcial. | [ ] | |
| 6 | Cambiar a "Historial de Pagos" y volver | Alternar entre las dos pestañas de Finanzas | N/A | El informe vuelve a cargar sin errores. | [ ] | |
| 7 | Error de carga (solo backend real) | Simular `500` y abrir el balance | N/A | Mensaje de error controlado, sin pantalla en blanco. | [ ] | **Posible defecto**: no se maneja el estado de error. |
| 8 | Vista móvil | Reducir la ventana a < 768 px | N/A | KPI y paneles apilados; la barra flotante de Finanzas sigue accesible. | [ ] | |
| 9 | Acceso por otro rol | Entrar como Arrendatario y abrir `/owner/finanzas/balance` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |
| 10 | Sin datos de propietarios ajenos | Revisar toda la pantalla | N/A | No aparecen identificadores ni montos de otros propietarios. | [ ] | RF-006. |

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
