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
Este caso de prueba verifica que, tras editar a la vez los cuatro parámetros (comisión, seguro, incremento de fin de semana e incremento de temporada alta) con valores válidos, "Guardar cambios" los persiste **juntos** en el backend como una única versión nueva vigente, que la pantalla confirma el número de versión y que la versión anterior se conserva intacta.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**; la atomicidad y el historial se verifican en la BD.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**.
* `financial_parameters` es *append-only*: ejecutar sobre una BD recién recreada con el seed para que la numeración coincida (`v8`, `v9`, …).
* La pantalla no muestra el historial de versiones anteriores; se verifica por BD.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Seed del perfil `qa` aplicado (`v1..v7`, vigente `v7`).
* Se recomienda haber ejecutado antes TC-UC11-HU1-E1, HU1-E2, HU2-E1 y HU2-E2 (guardado de un parámetro a la vez); recrear la BD entre ellos.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` con `v7` vigente y `count = 7`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Edición completa y guardado atómico
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base en BD | `psql`: `SELECT version_number, commission_pct, insurance_fee_per_passenger, weekend_increase_pct, high_season_increase_pct FROM financial_parameters ORDER BY version_number;` | N/A | `v7` vigente con `15.0000` / `15000.0000` / `10.0000` / `25.0000` y `count = 7`. | [ ] | |
| 2 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los cuatro campos con los valores de `v7`. | [ ] | |
| 3 | Editar la comisión | Reemplazar el valor en "Comisión de plataforma (%)" | `18.5` | El campo muestra `18.5`. | [ ] | |
| 4 | Editar el seguro | Reemplazar el valor en "Seguro náutico por pasajero (COP)" | `16500` | El campo muestra `16500`. | [ ] | |
| 5 | Editar el incremento de fin de semana | Reemplazar el valor en "Incremento fin de semana (%)" | `12` | El campo muestra `12`. | [ ] | |
| 6 | Editar el incremento de temporada alta | Reemplazar el valor en "Incremento temporada alta (%)" | `30` | El campo muestra `30`. | [ ] | |
| 7 | Verificar el estado antes de guardar | Observar la zona de botones y Network | N/A | No aparece "Versión #N guardada"; aún no hay `PUT`. | [ ] | |
| 8 | Guardar | Pulsar "Guardar cambios" | N/A | Se envía **un único** `PUT /api/v1/financial-parameters` con los cuatro valores y responde `200` con `version_number = 8`; aparece "Versión #8 guardada". | [ ] | |
| 9 | Verificar los cuatro valores en pantalla | Leer los cuatro campos | N/A | Comisión `18.5`, seguro `16500`, fin de semana `12`, temporada alta `30`: todos juntos, ninguno con valor anterior. | [ ] | Atomicidad: no debe verse una mezcla. |
| 10 | Verificar la persistencia en BD | Repetir el `SELECT` del paso 1 | N/A | `count = 8`; `v8` con `18.5000` / `16500.0000` / `12.0000` / `30.0000` y `v7` intacta. | [ ] | Historial *append-only*. |
| 11 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" siguen visibles y deshabilitados. | [ ] | |
| 12 | Verificar el mensaje al editar de nuevo | Modificar cualquier campo después de guardar | seguro `17000` | El mensaje "Versión #8 guardada" desaparece mientras hay cambios sin guardar. | [ ] | |
| 13 | Recargar la página | Pulsar F5 | N/A | Se muestran los valores de `v8`. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Guardados consecutivos | Guardar una versión, cambiar un valor y guardar otra vez | seguro `17000` | Aparece "Versión #9 guardada"; la numeración avanza de a uno y `count = 9` en BD. | [ ] | |
| 2 | Guardar sin cambios | Pulsar "Guardar cambios" sin editar nada | N/A | Sin errores; el backend devuelve la versión vigente sin crear una nueva (`count` no cambia). | [ ] | Idempotencia (contrato §6). |
| 3 | Doble clic en "Guardar cambios" | Hacer doble clic rápido tras editar | cualquier valor válido | Se envía un solo `PUT` y se crea una sola versión; el botón se deshabilita mientras guarda. | [ ] | Verificar `count` en BD. |
| 4 | Un campo inválido entre cuatro válidos | Dejar uno inválido y guardar | seguro `-1` | No se envía `PUT`; solo el campo inválido muestra error y la versión no cambia. | [ ] | Atomicidad ante validación. |
| 5 | Valores en los límites | Guardar los cuatro con límites válidos | comisión `0`, seguro `1`, fin de semana `100`, temporada alta `0` | El backend responde `200`; aparece "Versión #N guardada". | [ ] | |
| 6 | Navegar y volver tras guardar | Ir a "Registros" y regresar a "Parámetros" | N/A | Se muestran los valores de la versión recién guardada. | [ ] | |
| 7 | Efecto en reservas ya calculadas | Consultar en BD `frozen_parameters_id` de una reserva calculada antes del guardado | N/A | Sigue apuntando a su versión original; la reserva no cambia. | [ ] | Requiere una reserva con valor calculado (UC04). |
| 8 | Guardado desde dos sesiones | Dos sesiones guardan a la vez valores distintos | valores válidos distintos | Se crean dos versiones consecutivas completas; ninguna queda con valores mezclados. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : Los cuatro valores se guardan como una única versión; nunca un subconjunto.
* **EC-002** : Guardar crea una versión nueva; no modifica ni elimina las anteriores.
* **EC-003** : Las reservas ya calculadas conservan la referencia a la versión con la que se calcularon.
* **EC-004** : El mensaje de éxito solo refleja la versión realmente persistida (`version_number` de la respuesta).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
