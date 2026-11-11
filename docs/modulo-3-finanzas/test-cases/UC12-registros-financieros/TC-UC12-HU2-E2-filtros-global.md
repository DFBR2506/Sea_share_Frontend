### Test Case Specification: Registros financieros · HU2 · E2 Consulta global filtrada
**Created** : 2026-11-10  **Spec/Plan Link** : [012-consultar-registros-financieros/spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC12-HU2-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero, en `/finadmin/registros`, puede filtrar los registros de toda la plataforma por tipo de transacción y por propietario, que los filtros se combinan (el resultado cumple **todos** a la vez), que la paginación y el resumen se recalculan con los datos del backend y que una combinación sin coincidencias muestra una página vacía sin error.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC12 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/spec.md) |
| Implementation Plan UC12 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/012-consultar-registros-financieros/plan.md) |
| Contrato REST — consultar registros | REST contract | [UC12-consultar-registros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC12-consultar-registros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC12-HU2-E2-filtros-global.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC12-HU2-E2-filtros-global.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**; los conteos esperados se toman de la BD. Los registros se preparan con el dataset del TC (no forman parte del seed).
* **Brechas frente al spec**: la API admite filtrar por embarcación (`boat_id`), reserva (`reservation_id`) y rango de fechas (`date_from`/`date_to`); la pantalla solo ofrece **tipo** y **propietario** (H-07).
* **Origen de las opciones del selector de propietario**: el contrato de M3 no define un endpoint que liste propietarios. Verificar de dónde salen las opciones; si la lista es fija o no incluye a `a1b2c3d4-…`, registrar un defecto (H-11).

##### Dependencies & Assumptions
* **TC-UC12-HU2-E1 debe haber pasado** (alcance global y paginación por defecto correctos).
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).

##### Preconditions & Default Setup
* **Initial State** : registros globales de 3 propietarios (`a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` y otros dos), 4 embarcaciones, varias reservas y los cuatro tipos.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Filtrado por tipo y por propietario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base | `psql`: `SELECT record_type, count(*) FROM v_financial_records GROUP BY record_type;` y `SELECT owner_id, count(*) FROM v_financial_records GROUP BY owner_id;` | N/A | Totales por tipo y por propietario; anotarlos para contrastar. | [ ] | Ajustar al entorno. |
| 2 | Abrir los registros | Entrar como Admin Financiero y abrir `/finadmin/registros` | `http://localhost:5173/finadmin/registros` | Tabla con 10 filas y resumen "1–10 de 34 registros · Página 1 de 4". | [ ] | |
| 3 | Filtrar por Cobro | Pulsar "Cobro" en "Filtrar por tipo" | `Cobro` | La petición lleva `scope=PLATFORM&transaction_type=CHARGE`; solo filas "Cobro"; el total del resumen es igual al conteo global de `CHARGE`. | [ ] | RF-002. |
| 4 | Filtrar por Reembolso | Pulsar "Reembolso" | `Reembolso` | `transaction_type=REFUND`; solo filas "Reembolso"; total igual al conteo global. | [ ] | |
| 5 | Filtrar por Dispersión | Pulsar "Dispersión" | `Dispersión` | `transaction_type=SETTLEMENT`; solo filas "Dispersión"; total igual al conteo global. | [ ] | |
| 6 | Filtrar por Comisión | Pulsar "Comisión" | `Comisión` | `transaction_type=COMMISSION`; solo filas "Comisión"; total igual al conteo global. | [ ] | RF-002: solo registros de comisión. |
| 7 | Quitar el filtro de tipo | Pulsar "Todos" | `Todos` | Vuelve a 34 registros en 4 páginas. | [ ] | |
| 8 | Filtrar por propietario | Abrir "Propietario (opcional)" y elegir `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` | `owner_id` del dataset | La petición lleva `owner_id=a1b2c3d4-…`; todas las filas son de ese propietario; total igual a su conteo en BD (23). | [ ] | |
| 9 | Filtrar por otro propietario | Elegir otro propietario del dataset | otro `owner_id` | Solo filas de ese propietario; total igual a su conteo en BD. | [ ] | |
| 10 | Combinar propietario y tipo | Con `a1b2c3d4-…`, pulsar "Cobro" | `owner_id` + `Cobro` | La petición lleva ambos filtros; solo "Cobro" de ese propietario; total igual al conteo de `CHARGE` de ese propietario en BD. | [ ] | Se cumplen **todos** los filtros. |
| 11 | Contrastar el contenido con la BD | Comparar las filas filtradas con la consulta SQL equivalente (`ORDER BY created_at DESC, record_id DESC`) | N/A | Mismos registros y mismo orden. | [ ] | |
| 12 | Volver al alcance global | Elegir "Todos" en "Propietario (opcional)" | `Todos` | Vuelve a incluir todos los propietarios (con el filtro de tipo vigente si lo hay); la petición ya no lleva `owner_id`. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Combinación sin resultados | Elegir un propietario y un tipo sin registros en el dataset | `owner_id` + tipo sin datos | "No hay registros para este filtro." sin mensaje de error; el backend responde `200` con página vacía. | [ ] | Página vacía, no es un error. |
| 2 | Resumen con 0 resultados | Leer el pie de la tabla en el paso anterior | N/A | El resumen no muestra rangos incoherentes (p. ej. "1–0"); indica 0 registros. | [ ] | Verificar el texto exacto y reportar si es confuso (H-08). |
| 3 | Filtrar estando en otra página | Ir a la página 3 sin filtros y filtrar por "Comisión" | N/A | Vuelve a la página 1 con los resultados del filtro. | [ ] | |
| 4 | Cambiar de propietario estando en otra página | Ir a la página 2 y elegir un propietario | N/A | Vuelve a la página 1 con los registros de ese propietario. | [ ] | |
| 5 | Filtros con tamaño de página | Filtrar por un tipo con más de 5 registros y cambiar el tamaño a 5 | tamaño `5` | La petición lleva `size=5`; resumen y páginas coherentes con el total filtrado. | [ ] | |
| 6 | Suma de los tipos | Sumar los totales de los cuatro tipos | N/A | Suma 34, igual al total sin filtros. | [ ] | |
| 7 | Cambiar el tipo con un propietario activo | Con un propietario elegido, alternar entre tipos | N/A | El propietario se mantiene seleccionado; solo cambia el tipo. | [ ] | |
| 8 | Filtros que el API admite y la pantalla no ofrece | Buscar filtros por embarcación, reserva y rango de fechas | N/A | No existen en la pantalla; registrar como brecha frente a RF-002 y el contrato. | [ ] | No es un fallo del TC. |
| 9 | Opciones del selector de propietario | Abrir "Propietario (opcional)" | N/A | Incluye a los propietarios con registros en el dataset (al menos los 3 de la BD). | [ ] | H-11. |
| 10 | Error de carga al filtrar | Detener PostgreSQL, aplicar un filtro; restaurar | N/A | Aparece "No se pudieron cargar los registros." | [ ] | |
| 11 | Navegación por teclado | Operar los filtros con Tab/flechas/Enter | N/A | Se pueden cambiar el tipo y el propietario solo con teclado. | [ ] | Accesibilidad. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Cada cambio de filtro reinicia la paginación a la página 1.
* **EC-002** : Los filtros se combinan con lógica AND: nunca se muestran registros que incumplan alguno.
* **EC-003** : Sin coincidencias se devuelve una página vacía con metadatos, no un error.
* **EC-004** : Comisión se filtra por tipo de registro, no por comparación numérica del monto.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
