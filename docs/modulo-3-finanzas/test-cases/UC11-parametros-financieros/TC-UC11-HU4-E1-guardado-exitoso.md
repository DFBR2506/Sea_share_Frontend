### Test Case Specification: Parámetros financieros · HU4 · E1 Guardado completo y exitoso
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU4-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que, tras editar a la vez los cuatro parámetros (comisión, seguro, incremento de fin de semana e incremento de temporada alta) con valores válidos, "Guardar cambios" los persiste **juntos** como una única versión nueva vigente, que la pantalla confirma el número de versión y que la versión anterior no se pierde.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU4-E1-guardado-exitoso.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU4-E1-guardado-exitoso.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): la versión y los valores se reinician al recargar. El historial inmutable de versiones solo se puede verificar con backend real (BD o API).
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**.
* La pantalla no muestra el historial de versiones anteriores.

##### Dependencies & Assumptions
* Se recomienda haber ejecutado antes TC-UC11-HU1-E1, HU1-E2, HU2-E1 y HU2-E2 (guardado de un parámetro a la vez).
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks (recargar antes de empezar).

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Edición completa y guardado atómico
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los cuatro campos con los valores de la versión #12. | [ ] | |
| 2 | Editar la comisión | Reemplazar el valor en "Comisión de plataforma (%)" | `15` | El campo muestra `15`. | [ ] | |
| 3 | Editar el seguro | Reemplazar el valor en "Seguro náutico por pasajero (COP)" | `20000` | El campo muestra `20000`. | [ ] | |
| 4 | Editar el incremento de fin de semana | Reemplazar el valor en "Incremento fin de semana (%)" | `10` | El campo muestra `10`. | [ ] | |
| 5 | Editar el incremento de temporada alta | Reemplazar el valor en "Incremento temporada alta (%)" | `20` | El campo muestra `20`. | [ ] | |
| 6 | Verificar el estado antes de guardar | Observar la zona de botones | N/A | No aparece el mensaje "Versión #N guardada"; los cambios aún no están guardados. | [ ] | |
| 7 | Guardar | Pulsar "Guardar cambios" | N/A | Aparece "Versión #13 guardada". | [ ] | |
| 8 | Verificar los cuatro valores guardados | Leer los cuatro campos | N/A | Comisión `15`, seguro `20000`, fin de semana `10`, temporada alta `20`: todos juntos, ninguno con valor anterior. | [ ] | Atomicidad: no debe verse una mezcla. |
| 9 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" siguen visibles y deshabilitados. | [ ] | |
| 10 | Verificar el mensaje al editar de nuevo | Modificar cualquier campo después de guardar | seguro `21000` | El mensaje "Versión #13 guardada" desaparece mientras hay cambios sin guardar. | [ ] | |
| 11 | Verificar la versión en el backend (solo backend real) | Consultar la API o BD de parámetros | N/A | Existe la versión nueva con los cuatro valores y la versión #12 se conserva intacta. | [ ] | RF de historial *append-only*. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Guardados consecutivos | Guardar una versión, cambiar un valor y guardar otra vez | seguro `21000` | Aparece "Versión #14 guardada"; la numeración avanza de a uno. | [ ] | |
| 2 | Guardar sin cambios | Pulsar "Guardar cambios" sin editar nada | N/A | Sin errores; la pantalla sigue mostrando los valores vigentes. | [ ] | Idempotencia a verificar contra el backend real. |
| 3 | Doble clic en "Guardar cambios" | Hacer doble clic rápido tras editar | cualquier valor válido | Se crea una sola versión; el botón se deshabilita mientras se guarda. | [ ] | Verificar que no se duplica la versión. |
| 4 | Un campo inválido entre cuatro válidos | Dejar uno inválido y guardar | seguro `0` | No se guarda **ninguno**; solo el campo inválido muestra error y la versión no cambia. | [ ] | Atomicidad ante validación. |
| 5 | Valores en los límites | Guardar los cuatro con límites válidos | comisión `0`, seguro `1`, fin de semana `100`, temporada alta `0` | Se acepta y aparece "Versión #N guardada". | [ ] | |
| 6 | Navegar y volver tras guardar | Ir a "Registros" y regresar a "Parámetros" | N/A | Se muestran los valores de la versión recién guardada. | [ ] | Con mocks, mientras no se recargue la página. |
| 7 | Recargar la página tras guardar | Pulsar F5 | N/A | Con mocks vuelve a la #12. Con backend real conserva la versión guardada. | [ ] | Registrar el modo ejecutado. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Los cuatro valores se guardan como una única versión; nunca se guarda un subconjunto.
* **EC-002** : Guardar crea una versión nueva; no modifica ni elimina las anteriores.
* **EC-003** : Las reservas ya calculadas conservan la referencia a la versión con la que se calcularon (spec UC11, casos extremos). Verificable solo con backend real.
* **EC-004** : El mensaje de éxito solo refleja la versión realmente persistida, no un valor optimista.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
