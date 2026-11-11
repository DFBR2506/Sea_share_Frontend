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
Este caso de prueba verifica que el Propietario, en `/owner/finanzas/historial`, puede filtrar sus registros por tipo de transacción (cobro, reembolso, dispersión o comisión), que el resultado contiene solo registros propios que coinciden con el filtro, que la paginación y el resumen se recalculan y que ningún filtro amplía el alcance a registros de otro propietario.

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
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`). Los registros de `owner-0284` son 21: **8** cobros, **4** reembolsos, **5** dispersiones y **4** comisiones. Los totales son ilustrativos; ajustar al entorno.
* **Brecha frente al spec**: el spec (RF-002) permite filtrar también por embarcación y propietario; la pantalla solo ofrece filtro por **tipo**. En el alcance propietario el `owner_id` es fijo y de solo lectura. Registrar la ausencia del filtro por embarcación como observación.

##### Dependencies & Assumptions
* **TC-UC12-HU1-E1 debe haber pasado** (la consulta propia sin filtros funciona).
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Propietario (`owner-0284`); en el sistema hay también 3 registros de `owner-0310` (1 cobro, 1 reembolso, 1 comisión).
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Propietario".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Filtrado por tipo de transacción
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir el historial | Entrar como Propietario y abrir `/owner/finanzas/historial` | `http://localhost:5173/owner/finanzas/historial` | Se muestra la tabla con 10 filas y el resumen "1–10 de 21 registros · Página 1 de 3". | [ ] | |
| 2 | Verificar las opciones del filtro | Leer "Filtrar por tipo" | N/A | Opciones: Todos, Cobro, Reembolso, Dispersión, Comisión; "Todos" seleccionado. | [ ] | |
| 3 | Filtrar por Cobro | Pulsar "Cobro" | `Cobro` | Todas las filas muestran tipo "Cobro"; resumen "1–8 de 8 registros · Página 1 de 1". | [ ] | |
| 4 | Verificar el alcance con el filtro | Leer la columna "Propietario" | N/A | Todas las filas muestran `owner-0284`. | [ ] | El filtro no amplía el alcance. |
| 5 | Filtrar por Reembolso | Pulsar "Reembolso" | `Reembolso` | Solo filas "Reembolso"; resumen "1–4 de 4 registros · Página 1 de 1". | [ ] | |
| 6 | Filtrar por Dispersión | Pulsar "Dispersión" | `Dispersión` | Solo filas "Dispersión"; resumen "1–5 de 5 registros · Página 1 de 1". | [ ] | |
| 7 | Filtrar por Comisión | Pulsar "Comisión" | `Comisión` | Solo filas "Comisión"; resumen "1–4 de 4 registros · Página 1 de 1". | [ ] | RF-002: solo registros de comisión. |
| 8 | Quitar el filtro | Pulsar "Todos" | `Todos` | Vuelve a 21 registros en 3 páginas. | [ ] | |
| 9 | Verificar el contenido de una fila filtrada | Filtrar por "Dispersión" y leer la primera fila | N/A | Tipo "Dispersión", reserva `RSV-1045`, embarcación "Lagoon 42", monto `$ 280,000`, referencia `set_8181`. | [ ] | Valores del mock. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Filtrar estando en otra página | Ir a la página 3 sin filtro y pulsar "Comisión" | N/A | Vuelve a la página 1 con los 4 resultados; no queda en una página inexistente. | [ ] | |
| 2 | Filtro combinado con tamaño de página | Filtrar por "Cobro" y cambiar el tamaño de página a 5 | `Cobro`, `5` | 5 filas, resumen "1–5 de 8 registros · Página 1 de 2"; la página 2 muestra 3 filas. | [ ] | |
| 3 | Cambiar de filtro con un tamaño personalizado | Con tamaño 5, cambiar de "Cobro" a "Reembolso" | N/A | Se mantiene el tamaño 5 y se muestran los 4 reembolsos. | [ ] | |
| 4 | Filtro sin resultados | Aplicar un filtro sin registros (solo backend real, p. ej. propietario sin comisiones) | N/A | "No hay registros para este filtro." sin error; el resumen muestra 0 registros. | [ ] | Página vacía, no es un error. |
| 5 | Selección visual del filtro | Observar el selector tras cambiar el filtro | N/A | El indicador deslizante marca la opción activa. | [ ] | |
| 6 | Navegación por teclado | Mover el foco por las opciones del filtro con Tab/flechas y activar con Enter o Espacio | N/A | Se puede cambiar el filtro solo con teclado. | [ ] | Accesibilidad. |
| 7 | Filtro por embarcación (brecha del spec) | Buscar un filtro por embarcación en la pantalla | N/A | No existe; registrar como brecha frente a RF-002. | [ ] | No es un fallo del TC. |
| 8 | Alcance con `owner_id` manipulado | Intentar editar el campo `owner_id` | `owner-0310` | El campo es de solo lectura y no se puede cambiar. | [ ] | Sin validación de identidad real (seguridad fuera de alcance). |
| 9 | Error de carga al filtrar (solo backend real) | Simular `500` y pulsar un filtro | N/A | Aparece "No se pudieron cargar los registros." | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : Aplicar un filtro siempre reinicia la paginación a la página 1.
* **EC-002** : El filtro por tipo se aplica **después** del alcance: ningún filtro muestra registros de otro propietario.
* **EC-003** : La suma de los resultados de cada tipo (8 + 4 + 5 + 4) coincide con el total sin filtro (21).
* **EC-004** : Comisión se filtra por tipo de registro, no por monto.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
