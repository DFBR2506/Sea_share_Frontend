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
Este caso de prueba verifica que el Administrador Financiero, en `/finadmin/registros`, puede filtrar los registros de toda la plataforma por tipo de transacción y por propietario, que los filtros se combinan (el resultado cumple **todos** a la vez), que la paginación y el resumen se recalculan y que una combinación sin coincidencias muestra una página vacía sin error.

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
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`). Totales de la plataforma (24): **9** cobros, **5** reembolsos, **5** dispersiones y **5** comisiones. `owner-0284` tiene 21 registros; `owner-0310` tiene 3 (1 cobro, 1 reembolso, 1 comisión y ninguna dispersión). Los totales son ilustrativos.
* **Brecha frente al spec**: el spec (RF-002) permite filtrar también por embarcación; la pantalla solo ofrece filtros por **tipo** y **propietario**. Registrar la ausencia como observación.
* El selector de propietario solo lista dos propietarios fijos del mock (`owner-0284` y `owner-0310`).

##### Dependencies & Assumptions
* **TC-UC12-HU2-E1 debe haber pasado** (la consulta global sin filtros funciona).
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; 24 registros de 2 propietarios.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Filtrado por tipo y por propietario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir los registros | Entrar como Admin Financiero y abrir `/finadmin/registros` | `http://localhost:5173/finadmin/registros` | Tabla con 10 filas y resumen "1–10 de 24 registros · Página 1 de 3". | [ ] | |
| 2 | Filtrar por Cobro | Pulsar "Cobro" en "Filtrar por tipo" | `Cobro` | Solo filas "Cobro"; resumen "1–9 de 9 registros · Página 1 de 1". | [ ] | |
| 3 | Filtrar por Reembolso | Pulsar "Reembolso" | `Reembolso` | Solo filas "Reembolso"; resumen "1–5 de 5 registros · Página 1 de 1". | [ ] | |
| 4 | Filtrar por Dispersión | Pulsar "Dispersión" | `Dispersión` | Solo filas "Dispersión"; resumen "1–5 de 5 registros · Página 1 de 1". | [ ] | |
| 5 | Filtrar por Comisión | Pulsar "Comisión" | `Comisión` | Solo filas "Comisión"; resumen "1–5 de 5 registros · Página 1 de 1". | [ ] | RF-002: solo registros de comisión. |
| 6 | Quitar el filtro de tipo | Pulsar "Todos" | `Todos` | Vuelve a 24 registros en 3 páginas. | [ ] | |
| 7 | Filtrar por propietario | Abrir "Propietario (opcional)" y elegir `owner-0310` | `owner-0310` | 3 filas, todas con `owner-0310`; resumen "1–3 de 3 registros · Página 1 de 1". | [ ] | |
| 8 | Filtrar por el otro propietario | Elegir `owner-0284` | `owner-0284` | 21 registros en 3 páginas; todas las filas con `owner-0284`. | [ ] | |
| 9 | Combinar propietario y tipo | Con `owner-0284`, pulsar "Cobro" | `owner-0284` + `Cobro` | 8 filas, todas "Cobro" de `owner-0284`; resumen "1–8 de 8 registros · Página 1 de 1". | [ ] | Se cumplen **todos** los filtros. |
| 10 | Combinar con el otro propietario | Con `owner-0310`, pulsar "Comisión" | `owner-0310` + `Comisión` | 1 fila "Comisión" de `owner-0310`; resumen "1–1 de 1 registros · Página 1 de 1". | [ ] | |
| 11 | Volver al alcance global | Elegir "Todos" en "Propietario (opcional)" | `Todos` | Vuelve a incluir ambos propietarios (con el filtro de tipo vigente si lo hay). | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Combinación sin resultados | Con `owner-0310`, pulsar "Dispersión" | `owner-0310` + `Dispersión` | Se muestra "No hay registros para este filtro." sin mensaje de error; resumen con 0 registros. | [ ] | Página vacía, no es un error. |
| 2 | Resumen con 0 resultados | Leer el pie de la tabla en el paso anterior | N/A | El resumen no muestra rangos incoherentes (p. ej. "1–0"); debe indicar 0 registros. | [ ] | Verificar el texto exacto y reportar si es confuso. |
| 3 | Filtrar estando en otra página | Ir a la página 3 sin filtros y filtrar por "Comisión" | N/A | Vuelve a la página 1 con los 5 resultados. | [ ] | |
| 4 | Cambiar de propietario estando en otra página | Ir a la página 2 y elegir `owner-0310` | N/A | Vuelve a la página 1 con 3 registros. | [ ] | |
| 5 | Filtros con tamaño de página | Filtrar por "Cobro" y cambiar el tamaño a 5 | `Cobro` + `5` | 5 filas, resumen "1–5 de 9 registros · Página 1 de 2"; la página 2 muestra 4. | [ ] | |
| 6 | Suma de los tipos | Sumar los resultados de los cuatro tipos | 9 + 5 + 5 + 5 | Suma 24, igual al total sin filtros. | [ ] | |
| 7 | Cambiar el filtro de tipo con un propietario activo | Con `owner-0310`, alternar entre tipos | N/A | El propietario se mantiene seleccionado; solo cambia el tipo. | [ ] | |
| 8 | Filtro por embarcación (brecha del spec) | Buscar un filtro por embarcación en la pantalla | N/A | No existe; registrar como brecha frente a RF-002. | [ ] | No es un fallo del TC. |
| 9 | Error de carga al filtrar (solo backend real) | Simular `500` y aplicar un filtro | N/A | Aparece "No se pudieron cargar los registros." | [ ] | |
| 10 | Navegación por teclado | Operar los filtros con Tab/flechas/Enter | N/A | Se pueden cambiar el tipo y el propietario solo con teclado. | [ ] | Accesibilidad. |

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
