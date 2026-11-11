### Test Case Specification: Informe financiero · HU3 · E2 Exportación del informe propio (.csv)
**Created** : 2026-11-10  **Spec/Plan Link** : [013-consultar-informe-financiero/spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC13-HU3-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P2 - High

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Propietario, desde `/owner/finanzas/balance`, puede exportar con "Exportar CSV" el informe de la periodicidad y período seleccionados, que el archivo contiene los **mismos datos agregados** que ve en pantalla restringidos a **sus** reservas (con su ganancia), la periodicidad, el período y la fecha y hora de generación, y que no incluye datos de otros propietarios.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC13 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md) |
| Implementation Plan UC13 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/plan.md) |
| Contrato REST — exportar informe | REST contract | [UC13-exportar-informe-financiero.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC13-exportar-informe-financiero.md) |
| Test case backend equivalente | Test Case | [TC-UC13-HU3-E2-export-propio.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC13-HU3-E2-export-propio.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* **El CSV se genera hoy en el navegador** a partir de los datos en pantalla (`downloadCsv` en `FinanceReportPage.jsx`), no con el endpoint del contrato. Con los mocks produce `informe-mensual.csv` con `Concepto,Valor (millones COP)`, cobros, reembolsos, dispersiones, comisiones y la fila "Ganancias del propietario".
* **Los mocks no restringen los datos al propietario**: las cifras son las mismas de la plataforma. El aislamiento solo se verifica con **backend real**.
* **Brechas frente al spec y al contrato** (los pasos marcados **fallarán** con la implementación actual y deben reportarse): el archivo no incluye fecha y hora de generación, alcance, periodicidad, período, conteos por tipo ni comparación con el período anterior; el nombre no incluye el período; los montos van en millones de COP.
* Los valores (Mensual: cobros 18.42, reembolsos 2.16, dispersiones 11.78, comisiones 1.42, ganancia 1.04) son **ilustrativos**.

##### Dependencies & Assumptions
* **TC-UC13-HU2-E1 debe haber pasado** (el informe propio se muestra).
* La aplicación corre en `http://localhost:5173`; el navegador permite descargas.

##### Preconditions & Default Setup
* **Initial State** : sesión como Propietario (`owner-0284`), informe Mensual "Septiembre 2026" cargado; hay datos de otros propietarios en el sistema.
* **Environment** : desarrollo local, Chrome/Firefox actual, editor de texto para abrir el `.csv`.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Exportación del informe propio
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el balance | Entrar como Propietario, pulsar "Finanzas" | `http://localhost:5173/owner/finanzas/balance` | Se ve el informe Mensual "Septiembre 2026". | [ ] | Anotar los valores en pantalla. |
| 2 | Exportar | Pulsar "Exportar CSV" | N/A | El navegador descarga un archivo `.csv` sin errores. | [ ] | |
| 3 | Verificar el nombre del archivo | Ver el nombre descargado | N/A | Es identificable por periodicidad y período. | [ ] | **Brecha**: hoy es `informe-mensual.csv`. |
| 4 | Abrir el archivo | Abrir el `.csv` en un editor de texto | N/A | Texto plano separado por comas, legible, tildes correctas. | [ ] | UTF-8. |
| 5 | Verificar las métricas agregadas | Comparar el archivo con la pantalla | N/A | Cobros 18.42, reembolsos 2.16, dispersiones 11.78, comisiones 1.42: iguales a los de pantalla. | [ ] | RNF-004. |
| 6 | Verificar la ganancia del propietario | Buscar la fila de ganancia | N/A | Aparece "Ganancias del propietario" con `1.04` y **no** "Neto generado". | [ ] | |
| 7 | Verificar fecha y hora de generación | Buscar la fecha y hora de la exportación | N/A | El archivo incluye la fecha y hora de generación. | [ ] | **Brecha**: hoy no se incluye. |
| 8 | Verificar alcance, periodicidad y período | Buscar esos datos | N/A | Incluye el alcance de propietario (`owner_id`), "Mensual" y "Septiembre 2026". | [ ] | **Brecha**: hoy no se incluyen. |
| 9 | Verificar el aislamiento de datos | Comparar con el informe de la plataforma | N/A | El archivo contiene solo datos de sus reservas; sin datos de otros propietarios. | [ ] | Solo backend real. |
| 10 | Verificar que no se modificaron registros | Ir a "Historial de Pagos" y revisar el total | N/A | El total de registros no cambió. | [ ] | RF-013. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Exportar otra periodicidad | Pulsar "Trimestral" y exportar | `Trimestral` | El archivo trae los datos del trimestre (cobros 52.8, reembolsos 6.4, dispersiones 33.9, comisiones 4.1, ganancia 3.1). | [ ] | |
| 2 | Exportar un período anterior | Elegir "Agosto 2026" y exportar | `Agosto 2026` | El archivo corresponde a agosto y lo identifica. | [ ] | Con mocks los valores son iguales a septiembre. |
| 3 | Exportar dos veces el mismo informe | Pulsar "Exportar CSV" dos veces | N/A | Mismos datos agregados; solo difiere la fecha y hora de generación. | [ ] | |
| 4 | Coherencia ganancia y dispersiones | Comparar "Ganancias del propietario" con "Dispersiones" en el archivo | N/A | Ambos valores son iguales. | [ ] | RF-008. **Con mocks falla** (1.04 vs 11.78). |
| 5 | Propietario sin operaciones (solo backend real) | Exportar un período sin registros propios | N/A | Archivo con ceros, sin error. | [ ] | |
| 6 | Error al exportar (solo backend real) | Simular `500` | N/A | Error controlado y sin archivo vacío o corrupto. | [ ] | |
| 7 | Abrir el CSV en una hoja de cálculo | Abrir en Excel/LibreOffice | N/A | Columnas bien separadas y números legibles como números. | [ ] | |
| 8 | Vista móvil | Reducir la ventana a < 768 px y exportar | N/A | El botón es accesible y la descarga funciona. | [ ] | |
| 9 | Alcance tras cambiar de pestaña | Ir a "Historial de Pagos", volver al balance y exportar | N/A | El archivo sigue siendo del propietario. | [ ] | |
| 10 | Solo lectura | Revisar los registros tras varias exportaciones | N/A | No se creó, modificó ni eliminó ningún registro. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La exportación y la consulta usan el mismo alcance, período y cálculo.
* **EC-002** : El archivo del propietario nunca debe contener datos de otros propietarios.
* **EC-003** : El archivo no contiene detalle de registros individuales, solo agregados.
* **EC-004** : Si el período anterior es 0, la variación porcentual queda vacía y no `Infinity` ni `NaN`.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
