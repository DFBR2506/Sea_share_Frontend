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
Este caso de prueba verifica que, cuando el guardado falla (validación rechazada, error de persistencia o error de red), la pantalla `/finadmin/parametros` **no actualiza ningún parámetro**, informa un error controlado, **no** muestra "Versión #N guardada", conserva la configuración anterior íntegra en el backend y mantiene lo que el usuario escribió para poder reintentar.

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
* Se ejecuta contra el **backend M3 del entorno de pruebas**. La falla de persistencia se provoca de forma controlada (`docker compose stop postgres`); en un entorno compartido, coordinar la ventana de indisponibilidad.
* **Comportamiento actual del front no definido**: `FinanceParamsPage` no maneja errores del guardado (`save.mutate` sin `onError`); si el servidor falla probablemente no se muestre nada. Registrar lo observado y abrir defecto si no cumple lo esperado.
* El texto exacto del mensaje de error no está definido en el spec; los resultados esperados describen el comportamiento.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Seed del perfil `qa` aplicado (`v1..v7`, vigente `v7`); ejecutar sobre una BD recreada, no sobre la de TC-UC11-HU4-E1.
* TC-UC11-HU4-E1 debe haber pasado (guardado exitoso verificado).
* Acceso a `docker compose` para detener y restaurar `postgres`.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` con `v7` vigente y `count = 7`.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Fallo del servidor durante el guardado
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Fijar la línea base | `psql`: `SELECT * FROM financial_parameters ORDER BY version_number;` | N/A | `v7` vigente y `count = 7`; anotar los valores. | [ ] | |
| 2 | Abrir la pantalla de parámetros | Entrar como Admin Financiero y abrir `/finadmin/parametros` | `http://localhost:5173/finadmin/parametros` | Se muestran los valores de `v7`. | [ ] | |
| 3 | Preparar valores válidos | Editar los cuatro campos con valores que pasan la validación | comisión `18.5`, seguro `16500`, fin de semana `12`, temporada alta `30` | Sin mensajes de error en pantalla: el fallo debe ser de persistencia, no de validación. | [ ] | |
| 4 | Provocar la falla de persistencia | `docker compose stop postgres` y pulsar "Guardar cambios" | N/A | El `PUT` responde `500` con `code = PARAMETERS_SAVE_FAILED` y `retryable = true`. | [ ] | Observar en DevTools → Network. |
| 5 | Verificar el error en pantalla | Observar la pantalla | N/A | Se informa un error controlado sin detalles internos (sin SQL, trazas ni nombres de tabla); **no** aparece "Versión #N guardada". | [ ] | **Posible defecto**: hoy no se muestra ningún mensaje. |
| 6 | Verificar que se conservan los valores escritos | Leer los cuatro campos | N/A | Conservan lo que escribió el usuario (no se pierde la edición). | [ ] | |
| 7 | Verificar que el botón se rehabilita | Observar "Guardar cambios" | N/A | Vuelve a estar habilitado para reintentar; no queda en "guardando" indefinido. | [ ] | |
| 8 | Restaurar la base y verificar la configuración anterior | `docker compose start postgres`; recargar la pantalla | N/A | Se muestran los valores de `v7`; ningún valor del intento fallido quedó aplicado. | [ ] | |
| 9 | Verificar que no hubo cambios parciales | `psql`: `SELECT * FROM financial_parameters ORDER BY version_number;` | N/A | `count = 7`; no existe fila nueva ni versión parcial; `v7` intacta. | [ ] | |
| 10 | Reintentar tras la recuperación | Editar de nuevo con los mismos valores y pulsar "Guardar cambios" | mismos valores del paso 3 | El `PUT` responde `200` con `version_number = 8`; aparece "Versión #8 guardada"; `count = 8`. | [ ] | Sin versiones duplicadas. |

##### Section 2: Otros fallos y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Validación bloqueada en el cliente | Escribir un seguro inválido y pulsar "Guardar cambios" | seguro `-1` | Aparece "Ingresa un monto mayor a 0"; no se envía `PUT`; `count` no cambia. | [ ] | |
| 2 | Rechazo de validación del servidor | Con valores que pasan la validación del cliente, forzar un `400 VALIDATION_ERROR` (p. ej. interceptando la petición en DevTools con una comisión `150`) | comisión `150` | Se informa un error controlado en el campo afectado o en un aviso general; no aparece "Versión #N guardada"; la BD no cambia. | [ ] | El `400` trae `errors[].field`. |
| 3 | Error de red | DevTools → Network → Offline y pulsar "Guardar cambios" | N/A | Se informa un error de conexión; no queda en "guardando" indefinido. | [ ] | |
| 4 | Falla en la primera configuración | Tabla vacía (backend sin perfil `qa`) + PostgreSQL detenido + guardar valores válidos | N/A | Error controlado; tras restaurar, la tabla sigue vacía y la pantalla vuelve al estado "pendiente". | [ ] | Ver TC-UC11-HU3-E2. |
| 5 | Fallo parcial simulado | Provocar el fallo con los cuatro campos cambiados | cuatro valores nuevos | Ninguno de los cuatro queda persistido; no hay mezcla de valores nuevos y antiguos. | [ ] | Atomicidad. |
| 6 | Error al guardar y luego "Cancelar" | Provocar el error y pulsar "Cancelar" | N/A | Se descartan los valores escritos, se muestran los vigentes y el mensaje de error desaparece. | [ ] | |
| 7 | Timeout con escritura ya confirmada | Guardar y cortar la conexión después del commit; reintentar | mismos valores | Al reintentar no se duplica la versión: si el commit ocurrió, se devuelve la vigente; si no, se crea una sola. | [ ] | Contrato §6. Verificar `count`. |

##### Edge Cases & Boundary Conditions
* **EC-001** : Un guardado fallido no crea ninguna versión ni modifica ningún parámetro (atomicidad).
* **EC-002** : "Versión #N guardada" nunca debe aparecer si el guardado falló.
* **EC-003** : Un `5xx` nunca expone trazas, SQL ni nombres internos en pantalla.
* **EC-004** : El usuario puede reintentar sin recargar la página.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
