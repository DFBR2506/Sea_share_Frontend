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
Este caso de prueba verifica que el Propietario, desde `/owner/finanzas/balance`, puede exportar con "Exportar CSV" el informe de la periodicidad y período seleccionados, que el archivo cumple el contrato del backend con alcance de propietario, que sus datos **coinciden con los de la pantalla**, que contiene solo datos de **sus** reservas y que exportar no modifica ningún registro.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**; el archivo esperado es el que genera `GET /api/v1/financial-report/export`. Los datos del dataset (propietarios A y B en 2026-10) **no forman parte del seed**.
* Los montos son **ilustrativos**; ajustar al dataset.
* **Posibles defectos conocidos** (leyendo el código del front): hoy `downloadCsv` arma el archivo en el navegador con 5 filas y lo nombra `informe-mensual.csv`, en lugar de descargar el CSV del backend. Los pasos marcados **H-05/H-06** fallarán si eso no cambia.
* La sesión del Propietario debe usar el `owner_id` del Propietario A.

##### Dependencies & Assumptions
* **TC-UC13-HU2-E1 debe haber pasado** (el informe propio se muestra con el dataset 2026-10).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`); el navegador permite descargas.

##### Preconditions & Default Setup
* **Initial State** : Propietario A (`11111111-1111-4111-8111-111111111111`) en 2026-10: 2 cobros `300000.00`, 1 reembolso `20000.00`, 2 dispersiones `250000.00`, 2 comisiones `37500.00`; ganancia `250000.00`; período anterior `2026-09` con dispersiones `200000.00`. Propietario B en 2026-10 con dispersiones `400000.00`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, editor de texto para abrir el `.csv`. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Exportación del informe propio
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el balance | Entrar como Propietario y pulsar "Finanzas" | `http://localhost:5173/owner/finanzas/balance` | Se ve el informe Mensual de octubre de 2026. | [ ] | Anotar los valores en pantalla y el JSON. |
| 2 | Exportar | Pulsar "Exportar CSV" con DevTools → Network abierto | N/A | Se emite `GET /api/v1/financial-report/export?scope=OWNER&owner_id=11111111-…&periodicity=MONTHLY&period=2026-10` y responde `200` con `Content-Type: text/csv`; el navegador descarga un archivo `.csv`. | [ ] | **H-05**: hoy no hay petición al endpoint. |
| 3 | Verificar el nombre del archivo | Ver el nombre descargado | N/A | `informe_financiero_2026-10.csv`. | [ ] | **H-06**: hoy es `informe-mensual.csv`. |
| 4 | Abrir el archivo | Abrir el `.csv` en un editor de texto | N/A | Texto plano delimitado por comas, legible en UTF-8: una fila de encabezado y una de datos. | [ ] | |
| 5 | Verificar el encabezado | Leer la primera fila | N/A | Las mismas 16 columnas y en el mismo orden que el contrato de exportación. | [ ] | **H-05**. |
| 6 | Verificar alcance, período y fecha de generación | Leer las columnas 1 a 4 | N/A | `Alcance = OWNER`, `Periodicidad = MONTHLY`, `Periodo = 2026-10`; `Fecha de Generacion` en ISO-8601 UTC y correspondiente al instante de la descarga. | [ ] | HU3 esc. 2, RF-013. |
| 7 | Verificar las métricas contra la pantalla | Comparar el archivo con lo mostrado | N/A | `Neto Generado = 250000.00` (ganancia), `Total Cobros = 300000.00`, `Total Reembolsos = 20000.00`, `Total Dispersiones = 250000.00`, `Total Comisiones = 37500.00`; equivalentes a los de la pantalla (`$ 0.25 M`, `$ 0.30 M`, `$ 0.02 M`, `$ 0.25 M`). | [ ] | RNF-004. |
| 8 | Verificar los conteos y la comparación | Leer las columnas 10 a 16 | N/A | Conteos `2/1/2/2`; `Periodo Anterior = 2026-09`, `Variacion Absoluta = 50000.00`, `Variacion Porcentual = 25.00`. | [ ] | RF-010. |
| 9 | Verificar el aislamiento en el archivo | Comparar con el CSV de plataforma y con los totales de B | B: dispersiones `400000.00` | El archivo no contiene los `400000.00` de B ni ningún dato de otro propietario. | [ ] | RF-006. |
| 10 | Verificar que no se modificaron registros | `psql`: `SELECT record_type, COUNT(*), SUM(amount) FROM v_financial_records GROUP BY record_type;` antes y después | N/A | Mismo conteo y mismos montos. | [ ] | RF-013. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Exportar otra periodicidad | Pulsar "Trimestral" y exportar | `Trimestral` | `periodicity=QUARTERLY&period=2026-Q3`; el archivo es `informe_financiero_2026-Q3.csv`, solo con datos de A. | [ ] | |
| 2 | Exportar un período anterior | Elegir agosto de 2026 y exportar | `Agosto 2026` | `period=2026-08`; el archivo corresponde a agosto y solo a A (ganancia `180000.00` en el dataset de TC-UC13-HU2-E2). | [ ] | |
| 3 | Exportar dos veces el mismo informe | Pulsar "Exportar CSV" dos veces | N/A | Mismas métricas; solo difiere `Fecha de Generacion`. | [ ] | |
| 4 | Coherencia ganancia y dispersiones | Comparar `Neto Generado` con `Total Dispersiones` en el archivo | N/A | Ambos valores son iguales (ganancia = dispersiones de A). | [ ] | RF-008. |
| 5 | Propietario sin operaciones | Exportar un período sin registros propios | N/A | `200`; una fila en ceros; sin error. | [ ] | |
| 6 | Error al exportar | Detener PostgreSQL y exportar; restaurar | N/A | `500 INTERNAL_ERROR`; error controlado y sin archivo vacío o corrupto. | [ ] | |
| 7 | Abrir el CSV en una hoja de cálculo | Abrir en Excel/LibreOffice | N/A | Columnas bien separadas y números legibles como números. | [ ] | |
| 8 | Vista móvil | Reducir la ventana a < 768 px y exportar | N/A | El botón es accesible y la descarga funciona. | [ ] | |
| 9 | Alcance tras cambiar de pestaña | Ir a "Historial de Pagos", volver al balance y exportar | N/A | La petición sigue llevando `scope=OWNER` y el `owner_id` de A. | [ ] | |
| 10 | Solo lectura | Verificar `v_financial_records` tras varias exportaciones | N/A | No se creó, modificó ni eliminó ningún registro. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : La exportación y la consulta usan el mismo alcance, período y cálculo.
* **EC-002** : El archivo del propietario nunca debe contener datos de otros propietarios.
* **EC-003** : El archivo no contiene detalle de registros individuales, solo agregados.
* **EC-004** : Si el período anterior es 0, `Variacion Porcentual` queda vacía y no `Infinity` ni `NaN`.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
