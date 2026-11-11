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
Este caso de prueba verifica que el Administrador Financiero puede ajustar el porcentaje de incremento por fin de semana desde `/finadmin/parametros`, que el campo valida el rango 0 a 100 y que, al guardar, el backend persiste una **nueva versión vigente** conservando los otros tres parámetros.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**; la persistencia se verifica en la BD y las peticiones en DevTools → Network.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**.
* `financial_parameters` es *append-only*: ejecutar sobre una BD recién recreada con el seed para que la versión esperada sea `v8`.
* El efecto del incremento sobre la tarifa de una embarcación (UC02) no es visible en esta pantalla; solo se verifica la configuración.

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

##### Section 1: Ajuste del incremento por fin de semana y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base en BD | `psql`: `SELECT version_number, weekend_increase_pct FROM financial_parameters ORDER BY version_number;` | N/A | `v7` vigente con `10.0000` y `count = 7`. | [ ] | |
| 2 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los cuatro campos cargados desde el backend. | [ ] | |
| 3 | Verificar el valor actual | Leer "Incremento fin de semana (%)" | N/A | Muestra `10`. | [ ] | |
| 4 | Editar el incremento | Borrar el campo y escribir el nuevo valor | `12` | El campo muestra `12`; sin mensaje de error ni de guardado; aún no hay `PUT`. | [ ] | |
| 5 | Guardar | Pulsar "Guardar cambios" | N/A | Se envía un `PUT /api/v1/financial-parameters`, responde `200` con `version_number = 8` y aparece "Versión #8 guardada". | [ ] | |
| 6 | Verificar el valor persistido en pantalla | Leer "Incremento fin de semana (%)" | N/A | Muestra `12`. | [ ] | |
| 7 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Comisión `15`, seguro `15000`, temporada alta `25`. | [ ] | |
| 8 | Verificar la persistencia en BD | Repetir el `SELECT` del paso 1 | N/A | `count = 8`; `v8` con `12.0000` y los otros tres valores iguales a `v7`; `v7` intacta. | [ ] | |
| 9 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" y "Ventanas de temporada alta" sin cambios y deshabilitados. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Incremento vacío | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un porcentaje entre 0 y 100"; no se envía `PUT`. | [ ] | |
| 2 | Incremento mayor a 100 | Escribir el valor y guardar | `100.01` | Mismo mensaje; no se guarda. | [ ] | |
| 3 | Incremento negativo | Escribir el valor y guardar | `-5` | Mismo mensaje; no se guarda. | [ ] | |
| 4 | Incremento no numérico | Escribir el valor y guardar | `abc` | Mismo mensaje; no se guarda. | [ ] | |
| 5 | Límite inferior (sin incremento) | Escribir el valor y guardar | `0` | El backend responde `200`; aparece "Versión #N guardada". | [ ] | Frontera válida: 0 % significa sin recargo. |
| 6 | Límite superior | Escribir el valor y guardar | `100` | El backend responde `200`; aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 7 | Incremento con decimales | Escribir el valor y guardar | `7.5` | El backend responde `200`; el campo muestra `7.5` tras guardar y la BD guarda `7.5000`. | [ ] | |
| 8 | Error solo en este campo | Dejar este campo inválido y los otros tres válidos, y guardar | fin de semana `-5` | Solo este campo muestra el error; no se envía `PUT`. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : El rango válido es 0 a 100 inclusive; `-0.01` y `100.01` son inválidos (RF-013).
* **EC-002** : El incremento aplica a fines de semana y puentes festivos; el cálculo lo hace UC02, no esta pantalla.
* **EC-003** : Cambiar este valor no modifica la tarifa de reservas ya calculadas (spec UC11, casos extremos).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
