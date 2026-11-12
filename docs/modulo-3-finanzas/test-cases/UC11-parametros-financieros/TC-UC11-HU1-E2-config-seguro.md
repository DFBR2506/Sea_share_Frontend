### Test Case Specification: Parámetros financieros · HU1 · E2 Configuración de la tarifa de seguro por pasajero
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU1-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero puede ajustar la tarifa del seguro náutico por pasajero (COP) desde `/finadmin/parametros`, que el campo valida que el monto sea válido (mayor o igual a cero según el spec) y que, al guardar, el backend persiste una **nueva versión vigente** conservando los otros tres parámetros.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU1-E2-config-seguro.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU1-E2-config-seguro.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**; la persistencia se verifica en la BD y las peticiones en DevTools → Network.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**.
* `financial_parameters` es *append-only*: ejecutar sobre una BD recién recreada con el seed para que la versión esperada sea `v8`.
* **Brecha conocida**: el spec (RF-013) acepta un seguro **mayor o igual a 0**, pero la pantalla exige mayor a 0. El paso 5 de la Section 2 documenta esa diferencia.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Seed del perfil `qa` aplicado (`v1..v7`, vigente `v7`).
* Ninguna dependencia de otros TC.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` con `v7` vigente y `count = 7`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Ajuste del seguro y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base en BD | `psql`: `SELECT version_number, insurance_fee_per_passenger FROM financial_parameters ORDER BY version_number;` | N/A | `v7` vigente con seguro `15000.0000` y `count = 7`. | [ ] | |
| 2 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestra "Parámetros financieros globales" con los cuatro campos cargados desde el backend. | [ ] | |
| 3 | Verificar el valor actual | Leer "Seguro náutico por pasajero (COP)" | N/A | Muestra `15000`. | [ ] | |
| 4 | Editar el seguro | Borrar el campo y escribir el nuevo valor | `18000` | El campo muestra `18000`; sin mensaje de error ni de guardado; aún no hay `PUT`. | [ ] | |
| 5 | Guardar | Pulsar "Guardar cambios" | N/A | Se envía un `PUT /api/v1/financial-parameters`, responde `200` con `version_number = 8` y aparece "Versión #8 guardada". | [ ] | |
| 6 | Verificar el valor persistido en pantalla | Leer "Seguro náutico por pasajero (COP)" | N/A | Muestra `18000`. | [ ] | |
| 7 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Comisión `15`, fin de semana `10`, temporada alta `25`. | [ ] | |
| 8 | Verificar la persistencia en BD | Repetir el `SELECT` del paso 1 | N/A | `count = 8`; `v8` con seguro `18000.0000` y los otros tres valores iguales a `v7`; `v7` intacta. | [ ] | |
| 9 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" sin cambios y deshabilitados. | [ ] | El depósito no depende del seguro. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Seguro vacío | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un monto mayor a 0"; no se envía `PUT`. | [ ] | |
| 2 | Seguro negativo | Escribir el valor y guardar | `-1000` | Mensaje de error; no se guarda; `count` en BD no cambia. | [ ] | RF-013: negativos inválidos. |
| 3 | Seguro no numérico | Escribir el valor y guardar | `abc` | Mensaje de error; no se guarda. | [ ] | |
| 4 | Seguro mínimo positivo | Escribir el valor y guardar | `1` | El backend responde `200`; aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 5 | Seguro en cero | Escribir el valor y guardar | `0` | Según el spec (RF-013) se **acepta**: `200` y "Versión #N guardada". | [ ] | **Brecha**: la pantalla muestra "Ingresa un monto mayor a 0" y bloquea el guardado. Registrar y confirmar con producto. |
| 6 | Seguro con decimales | Escribir el valor y guardar | `15000.50` | El backend responde `200`; la BD guarda el valor con 4 decimales (`15000.5000`). | [ ] | |
| 7 | Seguro muy grande | Escribir el valor y guardar | `999999999` | El backend lo acepta o lo rechaza con `400 VALIDATION_ERROR`; la pantalla no se rompe ni desborda el campo. | [ ] | Documentar el comportamiento observado. |
| 8 | Seguro y comisión inválidos a la vez | Dejar ambos campos inválidos y guardar | seguro `-1`, comisión `101` | Se muestran los dos mensajes de error a la vez; no se envía `PUT`. | [ ] | |
| 9 | Corregir tras el error | Con el error visible, escribir un valor válido | `18000` | El mensaje desaparece y el guardado procede (`200`). | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : El seguro debe ser un valor monetario válido y no negativo (RF-013).
* **EC-002** : El seguro es por pasajero: el nuevo valor aplica solo a cálculos posteriores, no a reservas ya calculadas (spec UC11, casos extremos).
* **EC-003** : El valor se muestra y se envía en COP sin separadores de miles en el campo de edición.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
