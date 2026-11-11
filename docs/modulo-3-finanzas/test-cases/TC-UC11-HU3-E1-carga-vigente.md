### Test Case Specification: Parámetros financieros · HU3 · E1 Carga de la configuración vigente
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU3-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que, al abrir `/finadmin/parametros`, la pantalla muestra el estado de carga y luego los cuatro parámetros configurables de la versión vigente como campos editables, junto con el depósito de garantía (10 % de la tarifa base diaria) y las ventanas de temporada alta como datos de **solo lectura**.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — obtener parámetros | REST contract | [UC11-obtener-parametros-financieros.md](../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-obtener-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU3-E1-carga-vigente.md](../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU3-E1-carga-vigente.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`) con una latencia simulada de ~200 ms. Con backend real (`VITE_API_M3_URL`) se repiten los pasos.
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**.
* En los mocks el depósito de garantía es un texto fijo (`$ 120,000 COP · 10% tarifa base diaria`); con backend real debe venir calculado.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks (recargar antes de empezar).

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con los valores del seed.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Carga de la configuración vigente
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | Es la ruta de inicio del rol. |
| 2 | Verificar el estado de carga | Observar la pantalla justo al abrir | N/A | Se muestra brevemente "Cargando…" y luego el contenido, sin pantalla en blanco ni error. | [ ] | Con mocks dura ~200 ms. |
| 3 | Verificar el encabezado | Leer el encabezado | N/A | "Feature 011", título "Parámetros financieros globales" y la descripción sobre la versión vigente. | [ ] | |
| 4 | Verificar la comisión | Leer "Comisión de plataforma (%)" | N/A | Muestra `12`; el campo es editable. | [ ] | |
| 5 | Verificar el seguro | Leer "Seguro náutico por pasajero (COP)" | N/A | Muestra `18000`; el campo es editable. | [ ] | |
| 6 | Verificar el incremento de fin de semana | Leer "Incremento fin de semana (%)" | N/A | Muestra `8`; el campo es editable. | [ ] | |
| 7 | Verificar el incremento de temporada alta | Leer "Incremento temporada alta (%)" | N/A | Muestra `15`; el campo es editable. | [ ] | |
| 8 | Verificar el depósito de garantía | Leer "Depósito de garantía" en "Datos calculados · solo lectura" | N/A | Muestra el depósito como 10 % de la tarifa base diaria; el campo está deshabilitado. | [ ] | |
| 9 | Verificar las ventanas de temporada alta | Leer "Ventanas de temporada alta" | N/A | Muestra "Fin de año · mitad de año · Semana Santa · receso"; campo deshabilitado. | [ ] | |
| 10 | Verificar el estado inicial de la acción | Observar la zona de botones | N/A | Se ven "Cancelar" y "Guardar cambios" habilitados; **no** aparece ningún mensaje "Versión #N guardada". | [ ] | El mensaje solo aparece tras guardar. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Recargar la pantalla | Pulsar F5 en `/finadmin/parametros` | N/A | Vuelve a mostrar "Cargando…" y luego la configuración; el rol se conserva sin volver al login. | [ ] | |
| 2 | Navegar y volver | Ir a "Registros" y regresar a "Parámetros" | N/A | La pantalla carga de nuevo con los valores vigentes. | [ ] | |
| 3 | Cargar tras guardar una versión | Guardar una nueva versión y volver a entrar a la pantalla | comisión `15` | Muestra los valores de la versión recién guardada, no los del seed. | [ ] | |
| 4 | Solo lectura real | Intentar escribir en los dos campos de "Datos calculados" | texto libre | Ninguno acepta edición. | [ ] | |
| 5 | Acceso por otro rol | Entrar como Propietario y abrir `/finadmin/parametros` por URL | N/A | Redirige fuera de la pantalla (no se muestra la configuración). | [ ] | Es navegación, no seguridad real. |
| 6 | Vista móvil | Reducir la ventana a < 768 px | N/A | Los campos se apilan y todo el contenido sigue accesible sin scroll horizontal. | [ ] | |
| 7 | Error de carga (solo backend real) | Apagar el backend y abrir la pantalla | N/A | La pantalla informa el fallo de forma controlada. | [ ] | **Posible defecto**: hoy la página solo maneja el estado de carga y no tiene mensaje de error; documentar el resultado. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Los cuatro parámetros se cargan en una sola respuesta; no debe verse una combinación de valores nuevos y antiguos.
* **EC-002** : El depósito y las ventanas son derivados y nunca editables desde esta pantalla.
* **EC-003** : La pantalla no inventa valores: sin configuración vigente se cubre en TC-UC11-HU3-E2.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
