### Test Case Specification: Registros financieros · HU2 · E1 Consulta global con paginación por defecto
**Created** : 2026-11-10  **Spec/Plan Link** : [012-consultar-registros-financieros/spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC12-HU2-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero, desde "Registros" (`/finadmin/registros`), ve los registros financieros de **toda la plataforma** (de todos los propietarios), paginados de a diez por defecto, con los datos de cada registro y los metadatos de paginación correctos.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC12 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md) |
| Implementation Plan UC12 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/plan.md) |
| Contrato REST — consultar registros | REST contract | [UC12-consultar-registros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC12-consultar-registros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC12-HU2-E1-paginacion-global.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC12-HU2-E1-paginacion-global.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): 24 registros en total (21 de `owner-0284` y 3 de `owner-0310`). Con backend real los totales dependen del seed.
* Los datos de los mocks son **ilustrativos**; ajustar los totales esperados al entorno.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC; se recomienda haber ejecutado TC-UC12-HU1-E1 para conocer la tabla.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; 24 registros en el sistema de 2 propietarios.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Consulta global, primera página sin indicar tamaño
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | |
| 2 | Abrir los registros | Pulsar "Registros" en el menú | N/A | La URL es `/finadmin/registros`; se muestra "Registros financieros". | [ ] | |
| 3 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego la tabla. | [ ] | |
| 4 | Verificar el alcance global | Leer el selector "Propietario (opcional)" | N/A | Muestra "Todos" y es editable (a diferencia del alcance del propietario). | [ ] | |
| 5 | Verificar el tamaño de página por defecto | Leer el selector "Tamaño de página" | N/A | Muestra "10 · por defecto". | [ ] | |
| 6 | Verificar las columnas | Leer el encabezado de la tabla | N/A | Tipo, Reserva, Propietario, Embarcación, Monto, Creado, Referencia externa. | [ ] | |
| 7 | Verificar la cantidad de filas | Contar las filas | N/A | Exactamente 10 filas. | [ ] | |
| 8 | Verificar el resumen de paginación | Leer el pie de la tabla | N/A | "1–10 de 24 registros · Página 1 de 3". | [ ] | |
| 9 | Ir a la página 2 | Pulsar la página 2 | N/A | 10 filas distintas; resumen "11–20 de 24 registros · Página 2 de 3". | [ ] | |
| 10 | Ir a la última página | Pulsar la página 3 | N/A | 4 filas; resumen "21–24 de 24 registros · Página 3 de 3"; "siguiente" deshabilitado. | [ ] | Última página parcial. |
| 11 | Verificar que aparecen todos los propietarios | Revisar la columna "Propietario" en las 3 páginas | N/A | Aparecen `owner-0284` y `owner-0310` (3 registros de este último en total). | [ ] | Alcance global. |
| 12 | Verificar que no se repiten registros | Comparar las referencias externas de las 3 páginas | N/A | Las 24 referencias son distintas. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar el tamaño de página | Seleccionar "5" | `5` | 5 filas, resumen "1–5 de 24 registros · Página 1 de 5"; vuelve a la página 1. | [ ] | |
| 2 | Tamaño de página mayor | Seleccionar "20" | `20` | 20 filas, resumen "1–20 de 24 registros · Página 1 de 2". | [ ] | |
| 3 | Cambiar el tamaño estando en otra página | Ir a la página 3 con tamaño 10 y cambiar a 20 | N/A | Vuelve a la página 1 sin quedar en una página inexistente. | [ ] | |
| 4 | Navegar con "anterior" y "siguiente" | Usar ‹ y › | N/A | Cambia una página por vez; en los extremos el botón está deshabilitado. | [ ] | |
| 5 | Diferencia con el alcance del propietario | Comparar con TC-UC12-HU1-E1 | N/A | El admin ve 24 registros; el propietario solo 21. | [ ] | |
| 6 | Error de carga (solo backend real) | Apagar el backend o simular `500` | N/A | Aparece "No se pudieron cargar los registros." y no se muestra la tabla. | [ ] | |
| 7 | Plataforma sin registros (solo backend real) | Consultar con la BD sin registros | N/A | "No hay registros para este filtro." sin error. | [ ] | No es un error. |
| 8 | Vista móvil | Reducir la ventana a < 768 px | N/A | La tabla se muestra como tarjetas legibles y la paginación sigue accesible. | [ ] | |
| 9 | Solo lectura | Revisar la pantalla | N/A | No hay botones para crear, editar, eliminar ni exportar registros. | [ ] | RF-010 y RF-013: la exportación pertenece al informe (UC13). |
| 10 | Acceso por otro rol | Entrar como Propietario y abrir `/finadmin/registros` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Con 24 registros y tamaño 10 hay 3 páginas; la última tiene 4 registros.
* **EC-002** : El alcance global incluye a todos los propietarios sin necesidad de indicar uno.
* **EC-003** : Solo aparecen registros confirmados; las operaciones en curso o fallidas no se listan. Verificable solo con backend real.
* **EC-004** : Una página fuera de rango (p. ej. la 999) no se puede pedir desde la interfaz; ese caso se verifica en los TC del backend.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
