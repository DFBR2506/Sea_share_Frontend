### Test Case Specification: Registros financieros · HU1 · E2 Consulta propia con filtros
**Created** : 2026-11-10  **Spec/Plan Link** : [012-consultar-registros-financieros/spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC12-HU1-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Propietario, en `/owner/finanzas/historial`, puede filtrar sus registros por tipo de transacción (cobro, reembolso, dispersión o comisión), que el resultado contiene solo registros propios que coinciden con el filtro, que la paginación y el resumen se recalculan con los datos del backend y que ningún filtro amplía el alcance a registros de otro propietario.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC12 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md) |
| Implementation Plan UC12 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/plan.md) |
| Contrato REST — consultar registros | REST contract | [UC12-consultar-registros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC12-consultar-registros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC12-HU1-E2-filtros-propios.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC12-HU1-E2-filtros-propios.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**; los conteos por tipo se toman de la BD, no de valores fijos. Los registros se preparan con el dataset del TC (no forman parte del seed).
* **Brecha frente al spec**: la API admite filtrar por tipo (`transaction_type`), embarcación (`boat_id`), reserva (`reservation_id`) y rango de fechas (`date_from`/`date_to`); la pantalla solo ofrece el filtro por **tipo**. La ausencia de los demás se registra como observación (H-07).
* En el alcance propietario el `owner_id` es fijo y de solo lectura.

##### Dependencies & Assumptions
* **TC-UC12-HU1-E1 debe haber pasado** (la consulta propia sin filtros funciona).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`) y la sesión del Propietario usa el `owner_id` del dataset.

##### Preconditions & Default Setup
* **Initial State** : registros del propietario `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` (23, los cuatro tipos, al menos dos embarcaciones) y registros de otro propietario.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Filtrado por tipo de transacción
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base por tipo | `psql`: `SELECT record_type, count(*) FROM v_financial_records WHERE owner_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' GROUP BY record_type;` | N/A | Conteos por tipo del propietario (suman 23); anotarlos para contrastar. | [ ] | |
| 2 | Abrir el historial | Entrar como Propietario y abrir `/owner/finanzas/historial` | `http://localhost:5173/owner/finanzas/historial` | Tabla con 10 filas y resumen "1–10 de 23 registros · Página 1 de 3". | [ ] | |
| 3 | Verificar las opciones del filtro | Leer "Filtrar por tipo" | N/A | Opciones: Todos, Cobro, Reembolso, Dispersión, Comisión; "Todos" seleccionado. | [ ] | |
| 4 | Filtrar por Cobro | Pulsar "Cobro" | `Cobro` | La petición lleva `transaction_type=CHARGE`; todas las filas son "Cobro"; el total del resumen es igual al conteo de `CHARGE` del paso 1. | [ ] | RF-002. |
| 5 | Verificar el alcance con el filtro | Leer la columna "Propietario" | N/A | Todas las filas son de `a1b2c3d4-…`. | [ ] | El filtro no amplía el alcance. |
| 6 | Filtrar por Reembolso | Pulsar "Reembolso" | `Reembolso` | Petición con `transaction_type=REFUND`; solo filas "Reembolso"; total igual al conteo de `REFUND`. | [ ] | |
| 7 | Filtrar por Dispersión | Pulsar "Dispersión" | `Dispersión` | Petición con `transaction_type=SETTLEMENT`; solo filas "Dispersión"; total igual al conteo de `SETTLEMENT`. | [ ] | |
| 8 | Filtrar por Comisión | Pulsar "Comisión" | `Comisión` | Petición con `transaction_type=COMMISSION`; solo filas "Comisión"; total igual al conteo de `COMMISSION`. | [ ] | RF-002: se filtra por tipo, no por monto. |
| 9 | Contrastar el contenido con la BD | Para un tipo, comparar las filas con `SELECT * FROM v_financial_records WHERE owner_id = 'a1b2…' AND record_type = '<tipo>' ORDER BY created_at DESC, record_id DESC;` | N/A | Mismos registros y mismo orden; monto, fecha y referencia externa coinciden. | [ ] | |
| 10 | Quitar el filtro | Pulsar "Todos" | `Todos` | Vuelve a 23 registros en 3 páginas. | [ ] | |
| 11 | Verificar la suma de los tipos | Sumar los totales de los cuatro tipos | N/A | La suma es 23, igual al total sin filtro. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Filtrar estando en otra página | Ir a la página 3 sin filtro y pulsar "Comisión" | N/A | Vuelve a la página 1 con los resultados del filtro; no queda en una página inexistente. | [ ] | |
| 2 | Filtro combinado con tamaño de página | Filtrar por un tipo con más de 5 registros y cambiar el tamaño a 5 | tamaño `5` | La petición lleva `transaction_type` y `size=5`; resumen y páginas coherentes con el total filtrado. | [ ] | |
| 3 | Cambiar de filtro con tamaño personalizado | Con tamaño 5, cambiar de un tipo a otro | N/A | Se mantiene el tamaño 5 y se muestran los resultados del nuevo tipo. | [ ] | |
| 4 | Filtro sin resultados | Aplicar un filtro sin registros (usar un propietario sin comisiones, si el dataset lo permite) | N/A | "No hay registros para este filtro." sin error; el backend responde `200` con página vacía. | [ ] | Página vacía, no es un error. |
| 5 | Selección visual del filtro | Observar el selector tras cambiar el filtro | N/A | El indicador deslizante marca la opción activa. | [ ] | |
| 6 | Navegación por teclado | Mover el foco por las opciones con Tab/flechas y activar con Enter o Espacio | N/A | Se puede cambiar el filtro solo con teclado. | [ ] | Accesibilidad. |
| 7 | Filtros que el API admite y la pantalla no ofrece | Buscar filtros por embarcación, reserva y rango de fechas | N/A | No existen en la pantalla; registrar como brecha frente a RF-002 y el contrato. | [ ] | No es un fallo del TC. |
| 8 | Alcance con `owner_id` manipulado | Intentar editar el campo `owner_id` | `owner-ajeno` | El campo es de solo lectura y no se puede cambiar. | [ ] | Sin validación de identidad real (seguridad fuera de alcance). |
| 9 | Error de carga al filtrar | Detener PostgreSQL, pulsar un filtro; restaurar | N/A | Aparece "No se pudieron cargar los registros." | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : Aplicar un filtro siempre reinicia la paginación a la página 1.
* **EC-002** : El filtro por tipo se aplica **después** del alcance: ningún filtro muestra registros de otro propietario.
* **EC-003** : La suma de los resultados de cada tipo coincide con el total sin filtro.
* **EC-004** : Comisión se filtra por tipo de registro, no por comparación numérica del monto.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
