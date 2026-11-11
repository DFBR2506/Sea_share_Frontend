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
Este caso de prueba verifica que el Administrador Financiero puede ajustar la tarifa del seguro náutico por pasajero (COP) desde `/finadmin/parametros`, que el campo solo acepta montos mayores a 0 y que, al guardar, la pantalla confirma una **nueva versión vigente** conservando los otros tres parámetros.

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
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): los valores se reinician al recargar. Con backend real (`VITE_API_M3_URL`) se repiten los pasos.
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**.
* No hay autenticación real: el rol solo controla la navegación.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC; se recomienda haber ejecutado antes TC-UC11-HU1-E1 para conocer la pantalla.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks (recargar antes de empezar).

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Ajuste del seguro y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestra "Parámetros financieros globales" con los cuatro campos cargados. | [ ] | |
| 2 | Verificar el valor actual del seguro | Leer el campo "Seguro náutico por pasajero (COP)" | N/A | Muestra `18000`. | [ ] | |
| 3 | Editar el seguro | Borrar el campo y escribir el nuevo valor | `20000` | El campo muestra `20000`; sin mensaje de error ni de guardado. | [ ] | |
| 4 | Guardar | Pulsar "Guardar cambios" | N/A | Aparece "Versión #13 guardada". | [ ] | |
| 5 | Verificar el valor persistido | Leer el campo "Seguro náutico por pasajero (COP)" | N/A | Muestra `20000`. | [ ] | |
| 6 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Comisión `12`, fin de semana `8`, temporada alta `15`. | [ ] | |
| 7 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" visibles, deshabilitados y sin cambios. | [ ] | El depósito no depende del seguro. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Seguro vacío | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un monto mayor a 0"; no se guarda. | [ ] | |
| 2 | Seguro en cero | Escribir el valor y guardar | `0` | Mismo mensaje; no se guarda. | [ ] | Frontera inválida. |
| 3 | Seguro negativo | Escribir el valor y guardar | `-1000` | Mismo mensaje; no se guarda. | [ ] | |
| 4 | Seguro no numérico | Escribir el valor y guardar | `abc` | Mismo mensaje; no se guarda. | [ ] | |
| 5 | Seguro mínimo válido | Escribir el valor y guardar | `1` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 6 | Seguro con decimales | Escribir el valor y guardar | `15000.50` | Se acepta y el campo muestra `15000.5`/`15000.50` tras guardar. | [ ] | Confirmar con el backend el redondeo a 2 decimales. |
| 7 | Seguro muy grande | Escribir el valor y guardar | `999999999` | Se acepta o se rechaza con mensaje claro; la pantalla no se rompe ni desborda el campo. | [ ] | Documentar el comportamiento observado. |
| 8 | Error en seguro y comisión a la vez | Dejar ambos campos inválidos y guardar | seguro `0`, comisión `101` | Se muestran los dos mensajes de error a la vez; no se guarda nada. | [ ] | |
| 9 | Corregir tras el error | Con el error visible, escribir un valor válido | `20000` | El mensaje de error desaparece y el guardado procede. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : El seguro debe ser estrictamente mayor a 0; `0` y negativos son inválidos.
* **EC-002** : El seguro es por pasajero: el nuevo valor aplica solo a cálculos posteriores de reservas, no a las ya calculadas (spec UC11, casos extremos). Verificable solo con backend real.
* **EC-003** : El valor se muestra y se envía en COP sin separadores de miles en el campo de edición.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
