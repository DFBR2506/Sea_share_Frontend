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
Este caso de prueba verifica que el Administrador Financiero, desde "Registros" (`/finadmin/registros`), ve los registros financieros de **toda la plataforma** (de todos los propietarios), paginados de a diez por defecto, con los datos de cada registro y los metadatos de paginación que devuelve el backend.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**. Los registros son inmutables, provienen de UC05/UC09/UC10 y **no forman parte del seed**: se preparan con el dataset de este TC.
* Los totales (34 registros globales de 3 propietarios) son **ilustrativos**; ajustar al dataset del entorno.
* La API devuelve identificadores (`owner_id`, `boat_id`, `reservation_id`) y no nombres (RF-012).
* La "sesión del Administrador Financiero" equivale a `scope=PLATFORM`; no hay validación de identidad.

##### Dependencies & Assumptions
* **TC-UC12-HU1-E1 debe haber pasado** (paginación por defecto y orden verificados con alcance propietario).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Al menos 3 propietarios con registros confirmados en la plataforma.

##### Preconditions & Default Setup
* **Initial State** : `v_financial_records` con **34** registros globales de 3 propietarios, 4 embarcaciones y los cuatro tipos.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Consulta global, primera página sin indicar tamaño
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Confirmar el conjunto global | `psql`: `SELECT count(*), count(DISTINCT owner_id) FROM v_financial_records;` | N/A | `count = 34` y `count(DISTINCT owner_id) >= 3`. | [ ] | Ajustar al entorno. |
| 2 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | |
| 3 | Abrir los registros | Pulsar "Registros" en el menú | N/A | La URL es `/finadmin/registros`; se muestra "Registros financieros". | [ ] | |
| 4 | Verificar la petición | DevTools → Network | N/A | `GET /api/v1/financial-records?scope=PLATFORM&page=1` (sin `owner_id`; `size` ausente o `10`) responde `200`. | [ ] | `owner_id` no es obligatorio en alcance global. |
| 5 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego la tabla. | [ ] | |
| 6 | Verificar el alcance global | Leer "Propietario (opcional)" | N/A | Muestra "Todos" y es editable. | [ ] | |
| 7 | Verificar el tamaño de página por defecto | Leer "Tamaño de página" | N/A | Muestra "10 · por defecto". | [ ] | |
| 8 | Verificar las columnas | Leer el encabezado de la tabla | N/A | Tipo, Reserva, Propietario, Embarcación, Monto, Creado, Referencia externa. | [ ] | |
| 9 | Verificar la cantidad de filas | Contar las filas | N/A | Exactamente 10 filas. | [ ] | |
| 10 | Contrastar el contenido con la BD | Comparar las filas con `SELECT * FROM v_financial_records ORDER BY created_at DESC, record_id DESC LIMIT 10;` | N/A | Mismos registros y mismo orden (más recientes primero); datos de cada fila coinciden. | [ ] | RF-005, RF-006, RNF-003. |
| 11 | Verificar el resumen de paginación | Leer el pie de la tabla | N/A | "1–10 de 34 registros · Página 1 de 4". | [ ] | RF-007. |
| 12 | Ir a la página 2 | Pulsar la página 2 | N/A | 10 filas distintas; resumen "11–20 de 34 registros · Página 2 de 4". | [ ] | |
| 13 | Ir a la última página | Pulsar la página 4 | N/A | 4 filas; resumen "31–34 de 34 registros · Página 4 de 4"; "siguiente" deshabilitado. | [ ] | Última página parcial. |
| 14 | Verificar que aparecen todos los propietarios | Revisar la columna "Propietario" en las 4 páginas | N/A | Aparecen al menos 3 `owner_id` distintos. | [ ] | Alcance global. |
| 15 | Verificar que no se repiten ni omiten registros | Comparar los IDs de las 4 páginas con la BD | N/A | La unión cubre los 34 registros sin duplicados ni omisiones. | [ ] | RNF-003. |
| 16 | Verificar que la consulta es de solo lectura | Repetir el `count` del paso 1 | N/A | Sin cambios; no se generó ningún archivo. | [ ] | RF-010, RF-013. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cambiar el tamaño de página | Seleccionar "5" | `5` | 5 filas, resumen "1–5 de 34 registros · Página 1 de 7"; la petición lleva `size=5`. | [ ] | |
| 2 | Tamaño de página mayor | Seleccionar "20" | `20` | 20 filas, resumen "1–20 de 34 registros · Página 1 de 2". | [ ] | |
| 3 | Cambiar el tamaño estando en otra página | Ir a la página 4 con tamaño 10 y cambiar a 20 | N/A | Vuelve a la página 1 sin quedar en una página inexistente. | [ ] | |
| 4 | Navegar con "anterior" y "siguiente" | Usar ‹ y › | N/A | Cambia una página por vez; en los extremos el botón está deshabilitado. | [ ] | |
| 5 | Diferencia con el alcance del propietario | Comparar con TC-UC12-HU1-E1 | N/A | El admin ve 34 registros; el propietario solo los suyos (23). | [ ] | |
| 6 | Error de carga | Detener PostgreSQL y recargar; restaurar | N/A | El backend responde `500 INTERNAL_ERROR` y la pantalla muestra "No se pudieron cargar los registros." sin tabla. | [ ] | |
| 7 | Plataforma sin registros | Consultar con una BD sin registros | N/A | "No hay registros para este filtro." sin error; el backend responde `200` con página vacía. | [ ] | No es un error. |
| 8 | Vista móvil | Reducir la ventana a < 768 px | N/A | La tabla se muestra como tarjetas legibles y la paginación sigue accesible. | [ ] | |
| 9 | Solo lectura | Revisar la pantalla | N/A | No hay botones para crear, editar, eliminar ni exportar registros. | [ ] | RF-010 y RF-013: la exportación pertenece al informe (UC13). |
| 10 | Acceso por otro rol | Entrar como Propietario y abrir `/finadmin/registros` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Con 34 registros y tamaño 10 hay 4 páginas; la última tiene 4 registros.
* **EC-002** : El alcance global incluye a todos los propietarios sin necesidad de indicar uno.
* **EC-003** : Solo aparecen registros confirmados; las operaciones en curso o fallidas no se listan.
* **EC-004** : Una página fuera de rango (p. ej. `page=999`) no se puede pedir desde la interfaz; ese caso se verifica en el TC del backend (`404 PAGE_OUT_OF_RANGE`).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
