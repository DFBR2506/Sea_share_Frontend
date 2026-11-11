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
Este caso de prueba verifica que, tras modificar uno o más campos en `/finadmin/parametros` sin guardar, el botón "Cancelar" descarta los cambios, restaura los valores de la versión vigente, limpia los errores de validación y **no crea ninguna versión nueva** ni envía una petición de escritura.

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
* La pantalla usa **datos mock en memoria** (`src/features/finance/api/mocks.js`): los valores se reinician al recargar.
* "Cancelar" es una acción **solo del cliente**: no existe endpoint de cancelación. La ausencia de peticiones se verifica en DevTools → Network.
* Los valores del seed (versión 12, comisión 12 %, seguro 18000, fin de semana 8 %, temporada alta 15 %) son **ilustrativos**.

##### Dependencies & Assumptions
* TC-UC11-HU4-E1 debe haber pasado (el guardado crea versiones nuevas).
* La aplicación corre en `http://localhost:5173` con el estado inicial de los mocks (recargar antes de empezar).
* DevTools abierto en la pestaña Network para observar peticiones.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Cancelación de cambios no guardados
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los cuatro campos con los valores de la versión #12. | [ ] | Anotar la línea base. |
| 2 | Editar los cuatro campos sin guardar | Cambiar los cuatro valores | comisión `20`, seguro `25000`, fin de semana `15`, temporada alta `35` | Los campos muestran los valores nuevos; no aparece "Versión #N guardada". | [ ] | |
| 3 | Verificar que no hubo peticiones | Revisar DevTools → Network | N/A | No se emitió ninguna petición de escritura al editar. | [ ] | Con mocks no hay red: verificar que no hay errores en consola. |
| 4 | Cancelar | Pulsar "Cancelar" | N/A | Los cuatro campos vuelven a `12`, `18000`, `8` y `15`. | [ ] | |
| 5 | Verificar que no hubo peticiones de escritura | Revisar DevTools → Network | N/A | No hay `PUT`, `PATCH`, `POST` ni `DELETE` tras cancelar. | [ ] | La ausencia de petición es el resultado esperado. |
| 6 | Verificar que no se creó versión | Observar la zona de botones | N/A | No aparece "Versión #13 guardada" ni ningún mensaje de guardado. | [ ] | |
| 7 | Verificar el estado al reabrir | Ir a "Registros", volver a "Parámetros" | N/A | Se muestran los valores de la versión #12. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Cancelar con errores de validación visibles | Escribir un valor inválido, pulsar "Guardar cambios" (aparece el error) y luego "Cancelar" | seguro `0` | El error desaparece, el campo vuelve a `18000` y no se creó ninguna versión. | [ ] | Valida que `touched` se reinicia. |
| 2 | Cancelar sin haber editado | Pulsar "Cancelar" con el formulario intacto | N/A | Sin errores ni cambios; los valores siguen igual. | [ ] | |
| 3 | Cancelar dos veces seguidas | Editar, pulsar "Cancelar" dos veces | comisión `20` | Comportamiento idempotente: mismos valores vigentes, sin peticiones de escritura. | [ ] | |
| 4 | Cancelar y volver a editar | Cancelar y editar un campo | comisión `18` | La edición funciona con normalidad y, al guardar, crea la versión #13. | [ ] | Cancelar no deja el formulario en estado raro. |
| 5 | Cancelar justo después de guardar | Guardar una versión (aparece "Versión #13 guardada") y pulsar "Cancelar" | comisión `15` | Los campos siguen con los valores de la #13 (no vuelven a la #12) y el mensaje "Versión #13 guardada" desaparece. | [ ] | Cancelar no revierte versiones ya creadas. |
| 6 | Recargar (F5) con cambios sin guardar | Editar y pulsar F5 | comisión `20` | Se descartan los cambios locales y se muestran los valores persistidos. | [ ] | Con mocks vuelve a la #12. |
| 7 | Navegar fuera con cambios sin guardar | Editar y pulsar "Registros" en el menú | comisión `20` | Se navega sin guardar; al volver se ven los valores vigentes. | [ ] | Hoy no hay aviso de "cambios sin guardar"; documentar si se espera. |
| 8 | Otro administrador guarda mientras se edita (solo backend real) | Sesión A edita sin guardar; sesión B guarda la versión nueva; A pulsa "Cancelar" | valores de B válidos | A descarta solo sus cambios; no revierte ni sobrescribe lo que guardó B. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : "Cancelar" no genera ninguna petición ni versión; el estado del servidor es idéntico antes y después.
* **EC-002** : "Cancelar" restaura los valores de la versión vigente **en pantalla**, no los del seed inicial.
* **EC-003** : La cancelación no puede deshacer una versión ya creada; no hay rollback de versiones.
* **EC-004** : Cancelar no altera la referencia de versión de reservas ya calculadas.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
