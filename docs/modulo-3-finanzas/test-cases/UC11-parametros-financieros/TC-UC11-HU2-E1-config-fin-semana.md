### Test Case Specification: Parámetros financieros · HU2 · E1 Configuración del incremento por fin de semana
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU2-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero puede ajustar el porcentaje de incremento por fin de semana desde `/finadmin/parametros`, que el campo valida el rango 0 a 100 y que, al guardar, la pantalla confirma una **nueva versión vigente** conservando los otros tres parámetros.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU2-E1-config-fin-semana.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU2-E1-config-fin-semana.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): los valores se reinician al recargar. Con backend real (`VITE_API_M3_URL`) se repiten los pasos.
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**.
* El efecto del incremento sobre la tarifa de una embarcación (UC02) no es visible en esta pantalla; solo se verifica la configuración.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks (recargar antes de empezar).

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Ajuste del incremento por fin de semana y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestra "Parámetros financieros globales" con los cuatro campos cargados. | [ ] | |
| 2 | Verificar el valor actual | Leer el campo "Incremento fin de semana (%)" | N/A | Muestra `8`. | [ ] | |
| 3 | Editar el incremento | Borrar el campo y escribir el nuevo valor | `10` | El campo muestra `10`; sin mensaje de error ni de guardado. | [ ] | |
| 4 | Guardar | Pulsar "Guardar cambios" | N/A | Aparece "Versión #13 guardada". | [ ] | |
| 5 | Verificar el valor persistido | Leer el campo "Incremento fin de semana (%)" | N/A | Muestra `10`. | [ ] | |
| 6 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Comisión `12`, seguro `18000`, temporada alta `15`. | [ ] | |
| 7 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" visibles, deshabilitados y sin cambios. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Incremento vacío | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un porcentaje entre 0 y 100"; no se guarda. | [ ] | |
| 2 | Incremento mayor a 100 | Escribir el valor y guardar | `100.01` | Mismo mensaje; no se guarda. | [ ] | |
| 3 | Incremento negativo | Escribir el valor y guardar | `-5` | Mismo mensaje; no se guarda. | [ ] | |
| 4 | Incremento no numérico | Escribir el valor y guardar | `abc` | Mismo mensaje; no se guarda. | [ ] | |
| 5 | Límite inferior (sin incremento) | Escribir el valor y guardar | `0` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida: 0 % significa sin recargo. |
| 6 | Límite superior | Escribir el valor y guardar | `100` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 7 | Incremento con decimales | Escribir el valor y guardar | `7.5` | Se acepta y el campo muestra `7.5` tras guardar. | [ ] | |
| 8 | Error solo en este campo | Dejar este campo inválido y los otros tres válidos, y guardar | fin de semana `-5` | Solo este campo muestra el error; los demás no. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : El rango válido es 0 a 100 inclusive; `-0.01` y `100.01` son inválidos.
* **EC-002** : El incremento aplica a fines de semana y puentes festivos; el cálculo lo hace UC02, no esta pantalla.
* **EC-003** : Cambiar este valor no modifica la tarifa de reservas ya calculadas (spec UC11, casos extremos). Verificable solo con backend real.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
