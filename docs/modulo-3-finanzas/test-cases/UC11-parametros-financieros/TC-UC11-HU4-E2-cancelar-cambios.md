### Test Case Specification: Parámetros financieros · HU4 · E2 Cancelación de cambios no guardados
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU4-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que, tras modificar uno o más campos en `/finadmin/parametros` sin guardar, el botón "Cancelar" descarta los cambios, restaura los valores de la versión vigente del backend, limpia los errores de validación y **no envía ninguna petición de escritura ni crea una versión nueva**.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU4-E2-cancelar-cambios.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU4-E2-cancelar-cambios.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**. "Cancelar" es una acción **solo del cliente**: no existe endpoint de cancelación; la ausencia de peticiones de escritura se verifica en DevTools → Network y en la BD.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**.
* `financial_parameters` es *append-only*: ejecutar sobre una BD recién recreada con el seed (`v7`, `count = 7`).

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Seed del perfil `qa` aplicado (`v1..v7`, vigente `v7`).
* TC-UC11-HU4-E1 debe haber pasado (el guardado crea versiones nuevas); este TC se ejecuta sobre una BD recreada.
* DevTools abierto en la pestaña Network.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` con `v7` vigente y `count = 7`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Cancelación de cambios no guardados
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base en BD | `psql`: `SELECT version_number, commission_pct, insurance_fee_per_passenger, weekend_increase_pct, high_season_increase_pct FROM financial_parameters ORDER BY version_number;` | N/A | `v7` vigente y `count = 7`. | [ ] | |
| 2 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los cuatro campos con los valores de `v7` (`15`, `15000`, `10`, `25`). | [ ] | |
| 3 | Editar los cuatro campos sin guardar | Cambiar los cuatro valores | comisión `20`, seguro `18000`, fin de semana `15`, temporada alta `35` | Los campos muestran los valores nuevos; no aparece "Versión #N guardada". | [ ] | |
| 4 | Verificar que no hubo peticiones | Revisar DevTools → Network | N/A | No se emitió ningún `PUT`, `POST`, `PATCH` ni `DELETE` al editar. | [ ] | |
| 5 | Cancelar | Pulsar "Cancelar" | N/A | Los cuatro campos vuelven a `15`, `15000`, `10` y `25`. | [ ] | |
| 6 | Verificar que no hubo peticiones de escritura | Revisar DevTools → Network | N/A | Tras cancelar tampoco hay peticiones de escritura. | [ ] | La ausencia de petición es el resultado esperado. |
| 7 | Verificar que no se creó versión | Observar la zona de botones y repetir el `SELECT` del paso 1 | N/A | No aparece "Versión #8 guardada"; en BD `count = 7` y no existe `v8`. | [ ] | |
| 8 | Verificar el estado al reabrir | Ir a "Registros" y volver a "Parámetros" | N/A | Se muestran los valores de `v7`. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cancelar con errores de validación visibles | Escribir un valor inválido, pulsar "Guardar cambios" (aparece el error) y luego "Cancelar" | seguro `-1` | El error desaparece, el campo vuelve a `15000` y no se creó ninguna versión. | [ ] | Valida que `touched` se reinicia. |
| 2 | Cancelar sin haber editado | Pulsar "Cancelar" con el formulario intacto | N/A | Sin errores ni cambios; los valores siguen igual y no hay peticiones de escritura. | [ ] | |
| 3 | Cancelar dos veces seguidas | Editar, pulsar "Cancelar" dos veces | comisión `20` | Comportamiento idempotente: mismos valores vigentes, sin peticiones de escritura. | [ ] | |
| 4 | Cancelar y volver a editar | Cancelar y editar un campo | comisión `18` | La edición funciona con normalidad y, al guardar, crea la versión `v8`. | [ ] | Cancelar no deja el formulario en estado raro. |
| 5 | Cancelar justo después de guardar | Guardar una versión (aparece "Versión #8 guardada") y pulsar "Cancelar" | comisión `18` | Los campos siguen con los valores de `v8` (no vuelven a `v7`) y el mensaje "Versión #8 guardada" desaparece. | [ ] | Cancelar no revierte versiones ya creadas. |
| 6 | Recargar (F5) con cambios sin guardar | Editar y pulsar F5 | comisión `20` | Se descartan los cambios locales y se muestran los valores persistidos. | [ ] | |
| 7 | Navegar fuera con cambios sin guardar | Editar y pulsar "Registros" en el menú | comisión `20` | Se navega sin guardar; al volver se ven los valores vigentes y la BD no cambió. | [ ] | Hoy no hay aviso de "cambios sin guardar"; documentar si se espera. |
| 8 | Otro administrador guarda mientras se edita | Sesión A edita sin guardar; sesión B guarda una versión nueva; A pulsa "Cancelar" | valores válidos de B | A descarta solo sus cambios; no revierte ni sobrescribe lo que guardó B. | [ ] | Tras cancelar, A puede ver aún los valores que cargó al inicio hasta recargar: documentar. |
| 9 | Intento de cancelar por API | `DELETE /api/v1/financial-parameters` con un cliente HTTP | N/A | `405 METHOD_NOT_ALLOWED`; ninguna versión se elimina. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : "Cancelar" no genera ninguna petición ni versión; el estado del servidor es idéntico antes y después.
* **EC-002** : "Cancelar" restaura los valores de la versión vigente cargada en pantalla.
* **EC-003** : La cancelación no puede deshacer una versión ya creada; no hay *rollback* de versiones.
* **EC-004** : Cancelar no altera la referencia de versión de reservas ya calculadas.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
