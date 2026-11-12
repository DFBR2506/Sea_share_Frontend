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
Este caso de prueba verifica que el Administrador Financiero, desde `/finadmin/informe`, puede exportar con "Exportar CSV" el informe de la periodicidad y período seleccionados, que el archivo `.csv` descargado cumple el contrato del backend (16 columnas, alcance de plataforma, periodicidad, período y fecha y hora de generación), que sus datos **coinciden con los que se ven en pantalla** y que exportar no modifica ningún registro.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**; el archivo esperado es el que genera `GET /api/v1/financial-report/export`. Los datos del dataset (2026-10) **no forman parte del seed**.
* Los montos son **ilustrativos**; ajustar al dataset.
* **Posibles defectos conocidos** (leyendo el código del front): hoy `downloadCsv` arma el archivo en el navegador con 5 filas (`Concepto,Valor (millones COP)`) y lo nombra `informe-mensual.csv`, en lugar de descargar el CSV del backend. Los pasos marcados **H-05/H-06** fallarán si eso no cambia.
* El export exige un período **explícito** (sin `period` devuelve `400`); la pantalla debe enviarlo siempre.

##### Dependencies & Assumptions
* **TC-UC13-HU1-E1 debe haber pasado** (el informe de la plataforma se muestra con el dataset 2026-10).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`); el navegador permite descargas y se conoce la carpeta de descargas.

##### Preconditions & Default Setup
* **Initial State** : dataset mensual 2026-10 con cobros `1150000.00`, reembolsos `100000.00`, dispersiones `900000.00`, comisiones `135000.00`, neto `150000.00`; período anterior `2026-09` con neto `125000.00`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, editor de texto para abrir el `.csv`. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Exportación del informe de la plataforma
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el informe | Entrar como Admin Financiero y pulsar "Informe" | `http://localhost:5173/finadmin/informe` | Se ve el informe Mensual de octubre de 2026 (`2026-10`). | [ ] | Anotar los valores en pantalla y el JSON. |
| 2 | Verificar el botón | Observar "Exportar CSV" | N/A | El botón con el ícono de descarga está visible y habilitado. | [ ] | |
| 3 | Exportar | Pulsar "Exportar CSV" con DevTools → Network abierto | N/A | Se emite `GET /api/v1/financial-report/export?scope=PLATFORM&periodicity=MONTHLY&period=2026-10` y responde `200` con `Content-Type: text/csv`; el navegador descarga un archivo `.csv`. | [ ] | **H-05**: hoy el archivo se genera en el cliente y no hay petición al endpoint. |
| 4 | Verificar el nombre del archivo | Ver el nombre descargado | N/A | `informe_financiero_2026-10.csv` (`Content-Disposition` del backend). | [ ] | **H-06**: hoy es `informe-mensual.csv`. |
| 5 | Abrir el archivo | Abrir el `.csv` en un editor de texto | N/A | Texto plano delimitado por comas, legible, sin caracteres corruptos (UTF-8): una fila de encabezado y una de datos. | [ ] | |
| 6 | Verificar el encabezado | Leer la primera fila | N/A | 16 columnas en este orden: `Fecha de Generacion`, `Alcance`, `Periodicidad`, `Periodo`, `Neto Generado`, `Total Cobros`, `Total Reembolsos`, `Total Dispersiones`, `Total Comisiones`, `Count Charge`, `Count Refund`, `Count Settlement`, `Count Commission`, `Periodo Anterior`, `Variacion Absoluta`, `Variacion Porcentual`. | [ ] | **H-05**: hoy solo hay `Concepto,Valor (millones COP)`. |
| 7 | Verificar alcance, período y fecha de generación | Leer las columnas 1 a 4 | N/A | `Alcance = PLATFORM`, `Periodicidad = MONTHLY`, `Periodo = 2026-10`; `Fecha de Generacion` en ISO-8601 UTC y correspondiente al instante de la descarga. | [ ] | RF-013, HU3 esc. 1. |
| 8 | Verificar las métricas contra la pantalla | Comparar el archivo con lo mostrado | N/A | `Neto Generado = 150000.00`, `Total Cobros = 1150000.00`, `Total Reembolsos = 100000.00`, `Total Dispersiones = 900000.00`, `Total Comisiones = 135000.00`; equivalentes a `$ 0.15 M`, `$ 1.15 M`, `$ 0.10 M`, `$ 0.90 M` de la pantalla. | [ ] | RNF-004: consulta y exportación coinciden. |
| 9 | Verificar los conteos y la comparación | Leer las columnas 10 a 16 | N/A | Conteos `10/2/8/8`; `Periodo Anterior = 2026-09`, `Variacion Absoluta = 25000.00`, `Variacion Porcentual = 20.00`. | [ ] | RF-010. |
| 10 | Verificar que no se modificaron registros | `psql`: `SELECT record_type, COUNT(*), SUM(amount) FROM v_financial_records GROUP BY record_type;` antes y después | N/A | Mismo conteo y mismos montos. | [ ] | RF-013. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Exportar otra periodicidad | Pulsar "Trimestral" y exportar | `Trimestral` | La petición lleva `periodicity=QUARTERLY&period=2026-Q3`; el archivo es `informe_financiero_2026-Q3.csv` con `Periodo Anterior = 2026-Q2`. | [ ] | |
| 2 | Exportar un período anterior | Elegir agosto de 2026 y exportar | `Agosto 2026` | `period=2026-08`; el archivo corresponde a agosto y no mezcla otros períodos. | [ ] | |
| 3 | Exportar dos veces el mismo informe | Pulsar "Exportar CSV" dos veces | N/A | Ambos archivos tienen las mismas métricas; solo difiere `Fecha de Generacion`. | [ ] | |
| 4 | Exportar mientras carga | Cambiar de periodicidad y observar el botón durante la carga | N/A | El botón no permite exportar datos a medias; el archivo siempre corresponde a lo seleccionado. | [ ] | |
| 5 | Abrir el CSV en una hoja de cálculo | Abrir en Excel/LibreOffice | N/A | Columnas bien separadas y números legibles como números. | [ ] | Revisar el separador decimal según la configuración regional. |
| 6 | Exportar un período sin registros | Elegir un período sin operaciones y exportar | N/A | `200`; una fila de datos en ceros; `Variacion Porcentual` vacía si el período anterior es cero. | [ ] | |
| 7 | Error al exportar | Detener PostgreSQL y exportar; restaurar | N/A | `500 INTERNAL_ERROR`; se informa un error controlado y no se descarga un archivo vacío o corrupto. | [ ] | |
| 8 | Período inválido | Interceptar y enviar `period=2026-10-H1` con `MONTHLY` | `2026-10-H1` | `400 INVALID_PERIOD`; se informa un error controlado y no se descarga nada. | [ ] | |
| 9 | Descargas bloqueadas | Bloquear las descargas del navegador y exportar | N/A | La aplicación no se rompe; el navegador avisa del bloqueo. | [ ] | |
| 10 | Vista móvil | Reducir la ventana a < 768 px y exportar | N/A | El botón es accesible y la descarga funciona. | [ ] | |
| 11 | Solo lectura | Verificar `v_financial_records` tras varias exportaciones | N/A | No se creó, modificó ni eliminó ningún registro. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La exportación y la consulta usan el mismo alcance, período y cálculo; no deben diferir en ninguna cifra.
* **EC-002** : El archivo no contiene detalle de registros individuales, solo agregados.
* **EC-003** : El alcance de plataforma no usa el rótulo ni el valor de "Ganancias del propietario".
* **EC-004** : Si el período anterior es 0, `Variacion Porcentual` queda vacía y no `Infinity` ni `NaN`.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
