### Test Case Specification: Informe financiero · HU3 · E1 Exportación del informe de la plataforma (.csv)
**Created** : 2026-11-10  **Spec/Plan Link** : [013-consultar-informe-financiero/spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC13-HU3-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P2 - High

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero, desde `/finadmin/informe`, puede exportar con "Exportar CSV" el informe de la periodicidad y período seleccionados, que el archivo `.csv` descargado contiene los **mismos datos agregados** que se ven en pantalla, el alcance de plataforma, la periodicidad, el período y la fecha y hora de generación, y que exportar no modifica ningún registro.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC13 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/spec.md) |
| Implementation Plan UC13 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/013-consultar-informe-financiero/plan.md) |
| Contrato REST — exportar informe | REST contract | [UC13-exportar-informe-financiero.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC13-exportar-informe-financiero.md) |
| Test case backend equivalente | Test Case | [TC-UC13-HU3-E1-export-plataforma.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC13-HU3-E1-export-plataforma.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* **El CSV se genera hoy en el navegador** a partir de los datos en pantalla (`downloadCsv` en `FinanceReportPage.jsx`), no con el endpoint del contrato. Con los mocks produce `informe-mensual.csv` con las filas: `Concepto,Valor (millones COP)`, cobros, reembolsos, dispersiones, comisiones y neto.
* **Brechas frente al spec y al contrato** (los pasos correspondientes **fallarán** con la implementación actual y deben reportarse como defectos o ajustes de alcance):
  * El archivo no incluye fecha y hora de generación, alcance, periodicidad ni período (RF-013, HU3 esc. 1).
  * No incluye conteos por tipo ni la comparación con el período anterior (contrato §4).
  * El nombre del archivo solo trae la periodicidad (`informe-mensual.csv`), no el período.
  * Los montos van en millones de COP; el contrato usa COP con 2 decimales.
* Los valores (Mensual: cobros 18.42, reembolsos 2.16, dispersiones 11.78, comisiones 1.42, neto 0.62) son **ilustrativos** y vienen de los mocks.

##### Dependencies & Assumptions
* **TC-UC13-HU1-E1 debe haber pasado** (el informe de la plataforma se muestra).
* La aplicación corre en `http://localhost:5173`; el navegador permite descargas y se conoce la carpeta de descargas.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero, informe Mensual "Septiembre 2026" cargado.
* **Environment** : desarrollo local, Chrome/Firefox actual, editor de texto para abrir el `.csv`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Exportación del informe de la plataforma
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el informe | Entrar como Admin Financiero y pulsar "Informe" | `http://localhost:5173/finadmin/informe` | Se ve el informe Mensual "Septiembre 2026". | [ ] | Anotar los valores en pantalla. |
| 2 | Verificar el botón | Observar "Exportar CSV" | N/A | El botón con el ícono de descarga está visible y habilitado. | [ ] | |
| 3 | Exportar | Pulsar "Exportar CSV" | N/A | El navegador descarga un archivo `.csv` sin errores. | [ ] | |
| 4 | Verificar el nombre del archivo | Ver el nombre descargado | N/A | Es identificable por periodicidad y período (p. ej. `informe_financiero_2026-09.csv`). | [ ] | **Brecha**: hoy es `informe-mensual.csv`. |
| 5 | Abrir el archivo | Abrir el `.csv` en un editor de texto | N/A | Texto plano separado por comas, legible, sin caracteres corruptos (tildes correctas). | [ ] | UTF-8. |
| 6 | Verificar las métricas agregadas | Comparar el archivo con la pantalla | N/A | Cobros 18.42, reembolsos 2.16, dispersiones 11.78, comisiones 1.42 y neto 0.62: iguales a los de pantalla. | [ ] | RNF-004: consulta y exportación coinciden. |
| 7 | Verificar la fila del neto | Buscar la fila del neto | N/A | Aparece "Neto generado" (no "Ganancias del propietario"). | [ ] | Alcance plataforma. |
| 8 | Verificar fecha y hora de generación | Buscar la fecha y hora de la exportación | N/A | El archivo incluye la fecha y hora de generación. | [ ] | **Brecha**: hoy no se incluye. |
| 9 | Verificar alcance, periodicidad y período | Buscar esos datos en el archivo | N/A | Incluye el alcance de plataforma, "Mensual" y "Septiembre 2026". | [ ] | **Brecha**: hoy no se incluyen. |
| 10 | Verificar los conteos por tipo | Buscar la cantidad de registros por tipo | N/A | Cobro 42, Reembolso 8, Dispersión 37, Comisión 42. | [ ] | **Brecha**: hoy no se incluyen. |
| 11 | Verificar que no se modificaron registros | Ir a "Registros" y revisar el total | N/A | El total de registros no cambió tras exportar. | [ ] | RF-013. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Exportar otra periodicidad | Pulsar "Trimestral" y exportar | `Trimestral` | El archivo trae los datos del trimestre (cobros 52.8, reembolsos 6.4, dispersiones 33.9, comisiones 4.1, neto 1.9) y su nombre refleja la periodicidad. | [ ] | |
| 2 | Exportar un período anterior | Elegir "Agosto 2026" y exportar | `Agosto 2026` | El archivo corresponde a agosto y su nombre/contenido lo identifica. | [ ] | Con mocks los valores son iguales a septiembre. |
| 3 | Exportar dos veces el mismo informe | Pulsar "Exportar CSV" dos veces | N/A | Ambos archivos tienen los mismos datos agregados; solo difiere la fecha y hora de generación. | [ ] | Sin duplicar ni alterar registros. |
| 4 | Exportar mientras carga | Cambiar de periodicidad y observar el botón durante la carga | N/A | El botón no permite exportar datos a medias. | [ ] | Hoy se deshabilita solo si no hay datos. |
| 5 | Abrir el CSV en una hoja de cálculo | Abrir el archivo en Excel/LibreOffice | N/A | Las columnas se separan correctamente y los números se leen como números. | [ ] | Revisar el separador decimal según la configuración regional. |
| 6 | Exportar con valores en cero (solo backend real) | Exportar un período sin registros | N/A | El archivo se genera con ceros, sin error. | [ ] | |
| 7 | Error al exportar (solo backend real) | Simular `500` al generar el archivo | N/A | Se informa un error controlado y no se descarga un archivo vacío o corrupto. | [ ] | |
| 8 | Descargas bloqueadas | Bloquear las descargas del navegador y exportar | N/A | La aplicación no se rompe; el navegador avisa del bloqueo. | [ ] | |
| 9 | Vista móvil | Reducir la ventana a < 768 px y exportar | N/A | El botón es accesible y la descarga funciona. | [ ] | |
| 10 | Solo lectura | Revisar los registros tras varias exportaciones | N/A | No se creó, modificó ni eliminó ningún registro. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La exportación y la consulta usan el mismo alcance, período y cálculo; no deben diferir en ninguna cifra.
* **EC-002** : El archivo no contiene detalle de registros individuales, solo agregados.
* **EC-003** : El alcance de plataforma no debe usar el rótulo ni el valor de "Ganancias del propietario".
* **EC-004** : Si el período anterior es 0, la variación porcentual del archivo queda vacía (contrato) y no `Infinity` ni `NaN`.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
