### Test Case Specification: Parámetros financieros · HU1 · E1 Configuración del porcentaje de comisión
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU1-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que el Administrador Financiero puede ajustar el porcentaje de comisión de la plataforma desde la pantalla "Parámetros financieros globales" (`/finadmin/parametros`), que el campo valida el rango permitido (0 a 100) y que, al guardar, la pantalla confirma una **nueva versión vigente** que conserva los demás tres parámetros sin cambios.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU1-E1-config-comision.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU1-E1-config-comision.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Hoy la pantalla lee **datos mock en memoria** (`src/features/finance/api/mocks.js`): la versión y los valores se reinician al recargar la página. Cuando se conecte el backend (`VITE_API_M3_URL`), los pasos se repiten contra datos reales.
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**; ajustar a los del entorno.
* No hay autenticación real: el rol se elige en el login y solo controla la navegación.

##### Dependencies & Assumptions
* Ninguna dependencia de otros TC.
* La aplicación está corriendo (`npm run dev`, `http://localhost:5173`) con el estado inicial de los mocks (recargar la página antes de empezar).

##### Preconditions & Default Setup
* **Initial State** : sesión iniciada como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero" (no requiere usuario ni contraseña).

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Ajuste de la comisión y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`; el menú muestra Parámetros, Registros e Informe. | [ ] | |
| 2 | Verificar la carga de la pantalla | Observar la pantalla | N/A | Se ve el título "Parámetros financieros globales" y la sección "Configuración editable" con los cuatro campos cargados con los valores vigentes. | [ ] | |
| 3 | Verificar el valor actual de la comisión | Leer el campo "Comisión de plataforma (%)" | N/A | Muestra `12`. | [ ] | |
| 4 | Editar la comisión | Borrar el campo y escribir el nuevo valor | `15` | El campo muestra `15`; no aparece mensaje de error; aún no se muestra ningún mensaje de guardado. | [ ] | |
| 5 | Guardar | Pulsar "Guardar cambios" | N/A | Aparece el mensaje de estado "Versión #13 guardada" junto a los botones. | [ ] | |
| 6 | Verificar el valor persistido | Leer el campo "Comisión de plataforma (%)" | N/A | Muestra `15`. | [ ] | |
| 7 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Seguro `18000`, fin de semana `8`, temporada alta `15`, iguales a la línea base. | [ ] | La nueva versión incluye la configuración completa. |
| 8 | Verificar los datos de solo lectura | Leer la sección "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" siguen visibles, deshabilitados y sin cambios. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Comisión vacía | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un porcentaje entre 0 y 100" bajo el campo; no se guarda ni cambia la versión. | [ ] | |
| 2 | Comisión mayor a 100 | Escribir el valor y pulsar "Guardar cambios" | `100.01` | Mismo mensaje de error; no se guarda. | [ ] | |
| 3 | Comisión negativa | Escribir el valor y pulsar "Guardar cambios" | `-1` | Mismo mensaje de error; no se guarda. | [ ] | |
| 4 | Comisión no numérica | Escribir el valor y pulsar "Guardar cambios" | `abc` | Mismo mensaje de error; no se guarda. | [ ] | |
| 5 | Límite inferior | Escribir el valor y pulsar "Guardar cambios" | `0` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 6 | Límite superior | Escribir el valor y pulsar "Guardar cambios" | `100` | Se acepta y aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 7 | Comisión con decimales | Escribir el valor y pulsar "Guardar cambios" | `12.5` | Se acepta y el campo muestra `12.5` tras guardar. | [ ] | |
| 8 | Guardado repetido sin cambios | Pulsar "Guardar cambios" dos veces seguidas sin editar | N/A | Sin errores; la pantalla sigue mostrando los valores vigentes. | [ ] | Idempotencia a verificar contra el backend real. |
| 9 | Recargar la página tras guardar | Pulsar F5 | N/A | Con mocks vuelve al estado inicial (#12). Con backend real, mantiene la versión guardada. | [ ] | Registrar cuál de los dos modos se ejecutó. |

##### Edge Cases & Boundary Conditions
* **EC-001** : El rango válido de comisión es 0 a 100 inclusive; `-0.01` y `100.01` son inválidos.
* **EC-002** : El error de validación solo aparece tras pulsar "Guardar cambios" (no mientras se escribe).
* **EC-003** : Editar la comisión no modifica las reservas ya calculadas; solo aplica a cálculos posteriores (spec UC11, casos extremos). Verificable solo con backend real.
* **EC-004** : En viewport < 768 px la pantalla debe seguir siendo usable (campos en una columna, botones accesibles).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
