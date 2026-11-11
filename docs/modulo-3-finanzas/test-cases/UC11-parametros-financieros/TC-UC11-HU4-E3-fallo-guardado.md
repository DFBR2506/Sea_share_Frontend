### Test Case Specification: Parámetros financieros · HU4 · E3 Fallo durante el guardado
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU4-E3
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que, cuando el guardado falla (validación rechazada por el servidor, error de persistencia o error de red), la pantalla `/finadmin/parametros` **no actualiza ningún parámetro**, informa un error controlado, **no** muestra "Versión #N guardada" y conserva la configuración anterior íntegra, sin perder lo que el usuario escribió para poder reintentar.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — guardar parámetros | REST contract | [UC11-guardar-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-guardar-parametros-financieros.md) |
| Catálogo de errores y convenciones | Conventions | [contracts/README.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/README.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU4-E3-fallo-guardado.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU4-E3-fallo-guardado.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* **Con los mocks actuales solo se ejecuta la parte de validación en cliente** (Section 1, pasos 1 a 5): `saveParams` nunca falla. Los fallos del servidor (Section 2) requieren backend real o simular la respuesta en DevTools (Network → bloquear petición / sobrescribir respuesta).
* **Comportamiento actual del front no definido**: `FinanceParamsPage` no tiene manejo de error en el guardado (no hay `onError` ni mensaje). Si el servidor falla, probablemente no se muestre nada. Registrar lo observado y abrir defecto si no cumple lo esperado.
* El texto exacto del mensaje de error no está definido en el spec; los resultados esperados describen el comportamiento.

##### Dependencies & Assumptions
* TC-UC11-HU4-E1 debe haber pasado (el guardado exitoso funciona).
* Para la Section 2: backend M3 accesible (`VITE_API_M3_URL`) y DevTools abierto en Network.

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; versión vigente #12 con comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15`.
* **Environment** : desarrollo local, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Valores inválidos rechazados sin cambiar la configuración
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los cuatro campos con los valores de la versión #12. | [ ] | |
| 2 | Escribir un valor inválido | Reemplazar el seguro por un valor inválido | seguro `-1` | El campo muestra `-1`. | [ ] | |
| 3 | Intentar guardar | Pulsar "Guardar cambios" | N/A | Aparece "Ingresa un monto mayor a 0" bajo el campo; no se muestra "Versión #N guardada". | [ ] | |
| 4 | Verificar que no se envió nada | Revisar DevTools → Network | N/A | No se emitió ninguna petición de guardado (la validación la bloquea en el cliente). | [ ] | |
| 5 | Verificar la configuración vigente | Pulsar "Cancelar" | N/A | Los campos vuelven a `12`, `18000`, `8` y `15`; sigue la versión #12. | [ ] | |

##### Section 2: Fallo del servidor durante el guardado (backend real o respuesta simulada)
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Rechazo de validación del servidor | Con valores que pasan la validación del cliente, simular una respuesta `400 VALIDATION_ERROR` y pulsar "Guardar cambios" | comisión `15` | Se informa un error controlado; **no** aparece "Versión #N guardada"; la versión vigente no cambia. | [ ] | |
| 2 | Error de persistencia | Simular una respuesta `500` y guardar | comisión `15` | Se informa un error controlado; no se actualiza ningún parámetro. | [ ] | |
| 3 | Error de red / backend apagado | Poner el navegador sin conexión (DevTools → Offline) y guardar | comisión `15` | Se informa un error controlado; no queda la pantalla en estado de "guardando" indefinido. | [ ] | |
| 4 | Verificar que el botón se rehabilita | Tras el error, observar "Guardar cambios" | N/A | El botón vuelve a estar habilitado para reintentar. | [ ] | |
| 5 | Verificar que se conservan los valores escritos | Tras el error, leer los cuatro campos | N/A | Los campos conservan lo que escribió el usuario (no se pierde la edición). | [ ] | |
| 6 | Verificar la configuración persistida | Recargar la pantalla con el backend ya disponible | N/A | Se muestran los valores originales de la versión #12; no hay versión parcial ni nueva. | [ ] | |
| 7 | Reintentar con éxito | Quitar la simulación de fallo y pulsar "Guardar cambios" | comisión `15` | Aparece "Versión #13 guardada" y no hay versiones duplicadas. | [ ] | |
| 8 | Fallo parcial simulado | Simular fallo tras validar los cuatro campos con cambios en todos | cuatro valores nuevos | Ninguno de los cuatro queda persistido; no hay mezcla de valores nuevos y antiguos. | [ ] | Atomicidad. |
| 9 | Error al guardar y luego "Cancelar" | Provocar el error y pulsar "Cancelar" | N/A | Se descartan los valores escritos y se muestran los vigentes; el mensaje de error desaparece. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : Un guardado fallido no crea ninguna versión ni modifica ningún parámetro (atomicidad).
* **EC-002** : El mensaje de éxito "Versión #N guardada" nunca debe aparecer si el guardado falló.
* **EC-003** : El error no debe exponer detalles internos (trazas, SQL, nombres de tablas).
* **EC-004** : El usuario puede reintentar sin recargar la página.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
