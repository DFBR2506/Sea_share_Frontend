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
Este caso de prueba verifica que el Propietario, desde "Historial de Pagos" (`/owner/finanzas/historial`), ve únicamente los registros financieros de **su** alcance, paginados de a diez por defecto, con los datos de cada registro (tipo, reserva, propietario, embarcación, monto, fecha de creación y referencia externa) y los metadatos de paginación que devuelve el backend.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**. Los registros financieros son inmutables y los generan UC05/UC09/UC10; **no forman parte del seed** automático: se preparan con el dataset de este TC.
* Los totales (23 registros del propietario, al menos 5 de otro) son **ilustrativos**; ajustar al dataset del entorno.
* La API devuelve identificadores (`reservation_id`, `owner_id`, `boat_id`) y no nombres; el backend no consulta a Flota (RF-012). La columna "Embarcación" mostrará lo que entregue la API.
* Los errores de paginación de la API (`page=0`, `page` fuera de rango, `size` fuera de rango) no se pueden provocar desde la interfaz; se cubren en el TC del backend.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`) y la sesión del Propietario usa el `owner_id` del dataset.
* **TC-UC05-HU2-E1, TC-UC09-HU3-E1 y TC-UC10-HU4-E1 del backend deben haber pasado** (existen registros de cobro, reembolso, dispersión y comisión) o el dataset equivalente está cargado.

##### Preconditions & Default Setup
* **Initial State** : `v_financial_records` con **23** registros del propietario `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` (cuatro tipos: `CHARGE`, `REFUND`, `SETTLEMENT`, `COMMISSION`) y al menos 5 de otro propietario.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Consulta propia, primera página sin indicar tamaño
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Confirmar el conjunto del propietario | `psql`: `SELECT count(*) FROM v_financial_records WHERE owner_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';` y `SELECT count(*) FROM v_financial_records WHERE owner_id <> 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';` | `owner_id` de prueba | `count = 23` para el propietario y al menos 5 de otros. | [ ] | Ajustar al entorno. |
| 2 | Entrar como Propietario | Abrir `/login` y pulsar "Entrar como Propietario" | `http://localhost:5173/login` | Redirige a `/owner/embarcaciones`. | [ ] | |
| 3 | Abrir el historial | Pulsar "Finanzas" en el menú y luego la pestaña "Historial de Pagos" | N/A | La URL es `/owner/finanzas/historial`; se muestra "Registros financieros". | [ ] | |
| 4 | Verificar la petición | DevTools → Network | N/A | `GET /api/v1/financial-records?scope=OWNER&owner_id=a1b2c3d4-…&page=1` (sin `size` o con `size=10`) responde `200`. | [ ] | |
| 5 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego la tabla. | [ ] | |
| 6 | Verificar el alcance del propietario | Leer el campo `owner_id` | N/A | Muestra `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` y es de solo lectura; no hay selector de propietario. | [ ] | |
| 7 | Verificar el tamaño de página por defecto | Leer "Tamaño de página" | N/A | Muestra "10 · por defecto". | [ ] | RF-008. |
| 8 | Verificar las columnas | Leer el encabezado de la tabla | N/A | Tipo, Reserva, Propietario, Embarcación, Monto, Creado, Referencia externa. | [ ] | |
| 9 | Verificar la cantidad de filas | Contar las filas | N/A | Exactamente 10 filas. | [ ] | |
| 10 | Verificar que todos los registros son propios | Leer la columna "Propietario" | N/A | Las 10 filas corresponden a `a1b2c3d4-…`; ninguna de otro propietario. | [ ] | RF-003. |
| 11 | Verificar el contenido de las filas | Comparar las 10 filas con `SELECT * FROM v_financial_records WHERE owner_id = 'a1b2…' ORDER BY created_at DESC, record_id DESC LIMIT 10;` | N/A | Mismos registros y mismo orden (más recientes primero); tipo en español (Cobro, Reembolso, Dispersión, Comisión), reserva, embarcación, monto, fecha y referencia externa (cuando existe) coinciden. | [ ] | RF-005, RF-006, RNF-003. |
| 12 | Verificar el resumen de paginación | Leer el pie de la tabla | N/A | "1–10 de 23 registros · Página 1 de 3". | [ ] | RF-007. |
| 13 | Verificar los controles | Observar los botones | N/A | Páginas 1, 2 y 3; "anterior" deshabilitado; "siguiente" habilitado. | [ ] | |
| 14 | Ir a la página 2 | Pulsar la página 2 | N/A | 10 filas distintas; resumen "11–20 de 23 registros · Página 2 de 3"; la petición lleva `page=2`. | [ ] | |
| 15 | Ir a la última página | Pulsar la página 3 | N/A | 3 filas; resumen "21–23 de 23 registros · Página 3 de 3"; "siguiente" deshabilitado. | [ ] | Última página parcial. |
| 16 | Verificar que no se repiten ni omiten registros | Comparar las referencias/IDs de las 3 páginas con la BD | N/A | La unión cubre los 23 registros sin duplicados ni omisiones. | [ ] | RNF-003. |
| 17 | Verificar que la consulta es de solo lectura | Repetir el `count` del paso 1 | N/A | Sin cambios; no se generó ningún archivo. | [ ] | RF-010, RF-013. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar el tamaño de página | Seleccionar "5" en "Tamaño de página" | `5` | 5 filas, resumen "1–5 de 23 registros · Página 1 de 5"; la petición lleva `size=5` y vuelve a la página 1. | [ ] | |
| 2 | Tamaño de página mayor | Seleccionar "20" | `20` | 20 filas, resumen "1–20 de 23 registros · Página 1 de 2". | [ ] | |
| 3 | Cambiar el tamaño estando en otra página | Ir a la página 3 con tamaño 10 y cambiar a 20 | N/A | Vuelve a la página 1 y no queda en una página inexistente. | [ ] | |
| 4 | Navegar con "anterior" y "siguiente" | Usar ‹ y › | N/A | Cambia una página por vez; en los extremos el botón correspondiente está deshabilitado. | [ ] | |
| 5 | Alternar pestañas de Finanzas | Ir a "Balance General" y volver a "Historial de Pagos" | N/A | Vuelve a cargar sin errores (primera página, tamaño por defecto). | [ ] | |
| 6 | Sin acceso a registros ajenos | Revisar todas las páginas | N/A | En ninguna página aparece un `owner_id` distinto de `a1b2c3d4-…`. | [ ] | El alcance nunca se amplía. |
| 7 | Propietario sin registros | Entrar con un propietario sin operaciones | N/A | Se muestra "No hay registros para este filtro." sin error; el backend responde `200` con una página vacía. | [ ] | Página vacía, no es un error. |
| 8 | Error de carga | Detener PostgreSQL (`docker compose stop postgres`) y recargar; restaurar | N/A | El backend responde `500 INTERNAL_ERROR` y la pantalla muestra "No se pudieron cargar los registros." sin tabla. | [ ] | |
| 9 | Error de red | DevTools → Network → Offline y cambiar de página | N/A | Aparece "No se pudieron cargar los registros." y al recuperar la conexión se puede reintentar. | [ ] | |
| 10 | Vista móvil | Reducir la ventana a < 768 px | N/A | La tabla se muestra como tarjetas legibles y la paginación sigue accesible. | [ ] | |
| 11 | Solo lectura | Revisar la pantalla | N/A | No hay botones para crear, editar, eliminar ni exportar registros. | [ ] | RF-010, RF-013. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Con 23 registros y tamaño 10 hay 3 páginas; la última tiene 3 registros.
* **EC-002** : El propietario no puede ver registros de otro, aunque existan en el sistema.
* **EC-003** : Solo aparecen registros confirmados; las operaciones en curso o fallidas no se listan.
* **EC-004** : El orden es siempre `created_at` descendente y, ante empate, `record_id` descendente.
* **EC-005** : Los montos se muestran con símbolo `$` y separador de miles; verificar que no pierden decimales relevantes frente al valor de la API.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
