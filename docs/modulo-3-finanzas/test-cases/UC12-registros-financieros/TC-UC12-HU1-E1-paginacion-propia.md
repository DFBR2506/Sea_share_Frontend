### Test Case Specification: Registros financieros · HU1 · E1 Consulta propia con paginación por defecto
**Created** : 2026-11-10  **Spec/Plan Link** : [012-consultar-registros-financieros/spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC12-HU1-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Propietario, desde "Historial de Pagos" (`/owner/finanzas/historial`), ve únicamente los registros financieros de **su** alcance, paginados de a diez por defecto, con los datos de cada registro (tipo, reserva, propietario, embarcación, monto, fecha de creación y referencia externa) y los metadatos de paginación correctos.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC12 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md) |
| Implementation Plan UC12 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/plan.md) |
| Contrato REST — consultar registros | REST contract | [UC12-consultar-registros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC12-consultar-registros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC12-HU1-E1-paginacion-propia.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC12-HU1-E1-paginacion-propia.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): 24 registros en total, de los cuales **21** pertenecen a `owner-0284` (el propietario de la sesión) y 3 a `owner-0310`. Con backend real los totales dependen del seed.
* Los datos de los mocks son **ilustrativos**; ajustar los totales esperados al entorno.
* El filtro por embarcación definido en el spec (RF-002) **no existe en la pantalla**; se cubre en TC-UC12-HU1-E2.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Propietario (`owner-0284`) con 21 registros propios y 3 de otro propietario en el sistema.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Consulta propia, primera página sin indicar tamaño
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Propietario | Abrir `/login` y pulsar "Entrar como Propietario" | `http://localhost:5173/login` | Redirige a `/owner/embarcaciones`. | [ ] | |
| 2 | Abrir el historial | Pulsar "Finanzas" en el menú y luego la pestaña "Historial de Pagos" | N/A | La URL es `/owner/finanzas/historial`; se muestra "Registros financieros". | [ ] | |
| 3 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego la tabla. | [ ] | |
| 4 | Verificar el alcance del propietario | Leer el campo `owner_id` | N/A | Muestra `owner-0284` y es de solo lectura; no hay selector de propietario. | [ ] | |
| 5 | Verificar el tamaño de página por defecto | Leer el selector "Tamaño de página" | N/A | Muestra "10 · por defecto". | [ ] | RF: 10 registros por defecto. |
| 6 | Verificar las columnas | Leer el encabezado de la tabla | N/A | Tipo, Reserva, Propietario, Embarcación, Monto, Creado, Referencia externa. | [ ] | |
| 7 | Verificar la cantidad de filas | Contar las filas de la tabla | N/A | Exactamente 10 filas. | [ ] | |
| 8 | Verificar que todos los registros son propios | Leer la columna "Propietario" | N/A | Las 10 filas muestran `owner-0284`; ninguna de `owner-0310`. | [ ] | |
| 9 | Verificar el contenido de una fila | Leer la primera fila | N/A | Tipo "Cobro", reserva `RSV-1048`, embarcación "Oceanis 38", monto `$ 420,000`, fecha "26 sep · 22:00", referencia `pay_8392`. | [ ] | Valores del mock. |
| 10 | Verificar el resumen de paginación | Leer el pie de la tabla | N/A | "1–10 de 21 registros · Página 1 de 3". | [ ] | Total, tamaño y total de páginas. |
| 11 | Verificar los controles de paginación | Observar los botones | N/A | Se ven las páginas 1, 2 y 3; "anterior" deshabilitado; "siguiente" habilitado. | [ ] | |
| 12 | Ir a la página 2 | Pulsar la página 2 | N/A | 10 filas distintas a las de la página 1; resumen "11–20 de 21 registros · Página 2 de 3". | [ ] | |
| 13 | Ir a la última página | Pulsar la página 3 | N/A | 1 fila; resumen "21–21 de 21 registros · Página 3 de 3"; "siguiente" deshabilitado. | [ ] | Última página parcial. |
| 14 | Verificar que no se repiten registros | Comparar las referencias externas de las 3 páginas | N/A | Las 21 referencias son distintas; ninguna se repite entre páginas. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar el tamaño de página | Seleccionar "5" en "Tamaño de página" | `5` | 5 filas, resumen "1–5 de 21 registros · Página 1 de 5"; vuelve a la página 1. | [ ] | |
| 2 | Tamaño de página mayor | Seleccionar "20" | `20` | 20 filas, resumen "1–20 de 21 registros · Página 1 de 2". | [ ] | |
| 3 | Cambiar el tamaño estando en otra página | Ir a la página 3 con tamaño 10 y cambiar a 20 | N/A | Vuelve a la página 1 y no queda en una página inexistente. | [ ] | |
| 4 | Navegar con "anterior" y "siguiente" | Usar ‹ y › | N/A | Cambia una página por vez; en los extremos el botón correspondiente está deshabilitado. | [ ] | |
| 5 | Persistencia al cambiar de pestaña | Ir a "Balance General" y volver a "Historial de Pagos" | N/A | La pantalla carga de nuevo sin errores (primera página, tamaño por defecto). | [ ] | |
| 6 | Sin acceso a registros ajenos | Revisar todas las páginas | N/A | En ninguna página aparece `owner-0310` ni sus referencias. | [ ] | CE: el alcance no se amplía. |
| 7 | Error de carga (solo backend real) | Apagar el backend o simular `500` y abrir la pantalla | N/A | Aparece "No se pudieron cargar los registros." y no se muestra la tabla. | [ ] | |
| 8 | Vista móvil | Reducir la ventana a < 768 px | N/A | La tabla se muestra como tarjetas legibles y la paginación sigue accesible. | [ ] | |
| 9 | Propietario sin registros (solo backend real) | Entrar con un propietario sin operaciones | N/A | Se muestra "No hay registros para este filtro." sin error. | [ ] | No es un error. |
| 10 | Solo lectura | Revisar la pantalla | N/A | No hay botones para crear, editar ni eliminar registros. | [ ] | RF-010: la consulta no modifica registros. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Con 21 registros y tamaño 10 hay 3 páginas; la última tiene 1 registro.
* **EC-002** : El propietario no puede ver registros de otro, aunque existan en el sistema.
* **EC-003** : Solo aparecen registros confirmados; las operaciones en curso o fallidas no se listan. Verificable solo con backend real.
* **EC-004** : Los montos se muestran con símbolo `$` y separador de miles; las fechas como "día mes · hora:minuto".

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
