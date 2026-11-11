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
Este caso de prueba verifica que el Administrador Financiero puede ajustar el porcentaje de comisión de la plataforma desde "Parámetros financieros globales" (`/finadmin/parametros`), que el campo valida el rango permitido (0 a 100) y que, al guardar, el backend persiste una **nueva versión vigente** y la pantalla la confirma, conservando los otros tres parámetros y la versión anterior en el historial.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**; la persistencia se verifica en la BD y las peticiones en DevTools → Network.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**; ajustar a la versión vigente del entorno.
* `financial_parameters` es *append-only*: cada guardado agrega una versión. Para que la versión esperada coincida (`v8`), ejecutar sobre una BD recién recreada con el seed.
* No hay autenticación real: el rol se elige en el login y solo controla la navegación.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Seed del perfil `qa` aplicado (`v1..v7`, vigente `v7`); ver `matriz-qa.md` → *Datos de prueba*.
* Ninguna dependencia de otros TC.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` con `v7` vigente y `count = 7`.
* **Environment** : backend en `http://localhost:8080` (health `/actuator/health`), frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Ajuste de la comisión y guardado como nueva versión
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base en BD | `psql`: `SELECT version_number, commission_pct, insurance_fee_per_passenger, weekend_increase_pct, high_season_increase_pct FROM financial_parameters ORDER BY version_number;` | N/A | `v7` vigente con `15.0000` / `15000.0000` / `10.0000` / `25.0000` y `count = 7`. | [ ] | |
| 2 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`; el menú muestra Parámetros, Registros e Informe. | [ ] | |
| 3 | Verificar la carga | Observar la pantalla y DevTools → Network | N/A | Se muestra "Parámetros financieros globales" con la sección "Configuración editable"; el `GET /api/v1/financial-parameters` responde `200`. | [ ] | |
| 4 | Verificar el valor actual de la comisión | Leer "Comisión de plataforma (%)" | N/A | Muestra `15` (la API devuelve `15.0000`; anotar cómo se presenta). | [ ] | |
| 5 | Editar la comisión | Borrar el campo y escribir el nuevo valor | `20` | El campo muestra `20`; sin mensaje de error ni de guardado; aún no hay petición `PUT`. | [ ] | |
| 6 | Guardar | Pulsar "Guardar cambios" | N/A | Se envía un único `PUT /api/v1/financial-parameters` con los cuatro valores y responde `200` con `version_number = 8`; la pantalla muestra "Versión #8 guardada". | [ ] | |
| 7 | Verificar el valor persistido en pantalla | Leer "Comisión de plataforma (%)" | N/A | Muestra `20`. | [ ] | |
| 8 | Verificar que los demás parámetros no cambiaron | Leer los otros tres campos | N/A | Seguro `15000`, fin de semana `10`, temporada alta `25`. | [ ] | La nueva versión lleva la configuración completa. |
| 9 | Verificar la persistencia en BD | Repetir el `SELECT` del paso 1 | N/A | `count = 8`; `v8` con comisión `20.0000` y los otros tres valores iguales a `v7`; `v7` intacta. | [ ] | Historial *append-only*. |
| 10 | Verificar los datos de solo lectura | Leer "Datos calculados · solo lectura" | N/A | "Depósito de garantía" muestra la regla del backend (`10% de la tarifa base diaria`) y "Ventanas de temporada alta" las ventanas devueltas por la API; ambos deshabilitados. | [ ] | |
| 11 | Recargar la página | Pulsar F5 | N/A | La pantalla carga con la versión `v8` y comisión `20`. | [ ] | La versión persiste. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Comisión vacía | Borrar el campo y pulsar "Guardar cambios" | (vacío) | Mensaje "Ingresa un porcentaje entre 0 y 100"; no se envía `PUT`; `count` no cambia. | [ ] | |
| 2 | Comisión mayor a 100 | Escribir el valor y guardar | `100.01` | Mismo mensaje; no se guarda. | [ ] | |
| 3 | Comisión negativa | Escribir el valor y guardar | `-1` | Mismo mensaje; no se guarda. | [ ] | |
| 4 | Comisión no numérica | Escribir el valor y guardar | `abc` | Mismo mensaje; no se guarda. | [ ] | |
| 5 | Límite inferior | Escribir el valor y guardar | `0` | El backend responde `200`; aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 6 | Límite superior | Escribir el valor y guardar | `100` | El backend responde `200`; aparece "Versión #N guardada". | [ ] | Frontera válida. |
| 7 | Comisión con decimales | Escribir el valor y guardar | `12.5` | El backend responde `200`; el campo muestra `12.5` tras guardar y la BD guarda `12.5000`. | [ ] | |
| 8 | Guardado repetido sin cambios | Pulsar "Guardar cambios" dos veces sin editar | N/A | Sin errores; el backend es idempotente (devuelve la versión vigente sin crear una nueva). | [ ] | Contrato §6. Verificar `count` en BD. |
| 9 | Efecto en reservas ya calculadas | Consultar en BD `frozen_parameters_id` de una reserva calculada antes del guardado | N/A | Sigue apuntando a su versión original; el nuevo valor aplica solo a cálculos posteriores. | [ ] | Requiere una reserva con valor calculado (UC04). |

##### Edge Cases & Boundary Conditions
* **EC-001** : El rango válido de comisión es 0 a 100 inclusive; `-0.01` y `100.01` son inválidos (RF-013).
* **EC-002** : El error de validación del cliente aparece solo tras pulsar "Guardar cambios".
* **EC-003** : Guardar crea una versión nueva; nunca modifica ni elimina las anteriores.
* **EC-004** : En viewport < 768 px la pantalla sigue siendo usable (campos en una columna, botones accesibles).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
