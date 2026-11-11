### Test Case Specification: Parámetros financieros · HU2 · E2 Configuración del incremento por temporada alta
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU2-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero puede ajustar el porcentaje de incremento por temporada alta desde `/finadmin/parametros`, que el campo valida el rango 0 a 100, que las ventanas de temporada alta se muestran como dato de **solo lectura** (no se configuran aquí) y que, al guardar, la pantalla confirma una **nueva versión vigente** conservando los otros tres parámetros.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU2-E2-config-temporada-alta.md](../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU2-E2-config-temporada-alta.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): los valores se reinician al recargar. Con backend real (`VITE_API_M3_URL`) se repiten los pasos.
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**.
* Las ventanas de temporada alta (fin de año, mitad de año, Semana Santa, receso) las determina el calendario de UC02; esta pantalla solo las muestra.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks (recargar antes de empezar).

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Ajuste del incremento por temporada alta y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestra "Parámetros financieros globales" con los cuatro campos cargados. | [ ] | |
| 2 | Verificar el valor actual | Leer el campo "Incremento temporada alta (%)" | N/A | Muestra `15`. | [ ] | |
| 3 | Verificar las ventanas de temporada alta | Leer "Ventanas de temporada alta" en "Datos calculados · solo lectura" | N/A | Muestra "Fin de año · mitad de año · Semana Santa · receso"; el campo está deshabilitado y no se puede editar. | [ ] | La vigencia no se configura aquí. |
| 4 | Editar el incremento | Borrar el campo y escribir el nuevo valor | `20` | El campo muestra `20`; sin mensaje de error ni de guardado. | [ ] | |
| 5 | Guardar | Pulsar "Guardar cambios" | N/A | Aparece "Versión #13 guardada". | [ ] | |
| 6 | Verificar el valor persistido | Leer el campo "Incremento temporada alta (%)" | N/A | Muestra `20`. | [ ] | |
| 7 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Comisión `12`, seguro `18000`, fin de semana `8`. | [ ] | |
| 8 | Verificar que las ventanas no cambiaron | Leer "Ventanas de temporada alta" | N/A | Mismo texto que en el paso 3. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Incremento vacío | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un porcentaje entre 0 y 100"; no se guarda. | [ ] | |
| 2 | Incremento mayor a 100 | Escribir el valor y guardar | `100.01` | Mismo mensaje; no se guarda. | [ ] | |
| 3 | Incremento negativo | Escribir el valor y guardar | `-10` | Mismo mensaje; no se guarda. | [ ] | |
| 4 | Incremento no numérico | Escribir el valor y guardar | `abc` | Mismo mensaje; no se guarda. | [ ] | |
| 5 | Límite inferior (sin incremento) | Escribir el valor y guardar | `0` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 6 | Límite superior | Escribir el valor y guardar | `100` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 7 | Incremento con decimales | Escribir el valor y guardar | `12.5` | Se acepta y el campo muestra `12.5` tras guardar. | [ ] | |
| 8 | Intentar editar las ventanas | Hacer clic y escribir en "Ventanas de temporada alta" | texto libre | El campo no acepta edición. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : El rango válido es 0 a 100 inclusive; `-0.01` y `100.01` son inválidos.
* **EC-002** : El incremento de temporada alta es independiente del de fin de semana; pueden tener valores distintos y editarse a la vez.
* **EC-003** : Cambiar este valor no modifica la tarifa de reservas ya calculadas (spec UC11, casos extremos). Verificable solo con backend real.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
