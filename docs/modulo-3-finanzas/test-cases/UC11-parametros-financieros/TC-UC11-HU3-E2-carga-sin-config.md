### Test Case Specification: Parámetros financieros · HU3 · E2 Carga sin configuración previa
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU3-E2
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que, cuando el backend no tiene ninguna configuración financiera global (`404 PARAMETERS_NOT_CONFIGURED`), la pantalla `/finadmin/parametros` informa que la configuración está **pendiente**, **no inventa valores** para ningún parámetro y permite al Administrador Financiero crear la primera versión.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — obtener parámetros | REST contract | [UC11-obtener-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-obtener-parametros-financieros.md) |
| Catálogo de errores y convenciones | Conventions | [contracts/README.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/README.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU3-E2-carga-sin-config.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU3-E2-carga-sin-config.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Requiere una BD **sin** versiones de parámetros: levantar el backend **sin** el perfil `qa` (`SPRING_PROFILES_ACTIVE=dev`) para que no se aplique el seed. Al terminar, restaurar `dev,qa`.
* **Comportamiento actual del front no definido**: `FinanceParamsPage` no tiene estado vacío ni de error; con un `404` probablemente falla al leer `params.version`. Registrar lo observado y abrir defecto si no cumple lo esperado.
* El texto exacto de "configuración pendiente" no está definido en el spec; los resultados esperados describen el comportamiento y no un texto literal.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Capacidad de recrear la BD: `docker compose --profile app down -v`. `financial_parameters` es *append-only* y no admite `TRUNCATE`.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` vacía (`SELECT count(*) = 0`).
* **Environment** : backend en `http://localhost:8080` levantado sin el perfil `qa`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Carga sin configuración previa
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Confirmar que no hay configuración | `psql`: `SELECT count(*) FROM financial_parameters;` | N/A | `count = 0`. | [ ] | |
| 2 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | |
| 3 | Verificar la respuesta del backend | DevTools → Network | N/A | `GET /api/v1/financial-parameters` responde `404` con `code = PARAMETERS_NOT_CONFIGURED` y `retryable = true`. | [ ] | |
| 4 | Verificar que la pantalla no se rompe | Observar la pantalla | N/A | No queda en blanco ni congelada en "Cargando…"; sin errores sin controlar en la consola. | [ ] | |
| 5 | Verificar el aviso de configuración pendiente | Leer el contenido | N/A | Se informa claramente que la configuración financiera está pendiente. | [ ] | |
| 6 | Verificar que no se inventan valores | Leer los cuatro campos configurables | N/A | Ningún campo muestra un valor por defecto inventado (ni `0` ni los valores del seed); aparecen vacíos. | [ ] | |
| 7 | Verificar los datos calculados | Leer "Depósito de garantía" y "Ventanas de temporada alta" | N/A | No muestran valores derivados de una configuración inexistente (vacíos o con aviso de pendiente). | [ ] | |
| 8 | Verificar que no hay versión guardada | Buscar "Versión #N guardada" | N/A | No aparece ningún número de versión. | [ ] | |
| 9 | Verificar que la lectura no crea estado | `psql`: `SELECT count(*) FROM financial_parameters;` | N/A | Sigue en `0`. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Guardar con los campos vacíos | Pulsar "Guardar cambios" sin llenar nada | N/A | Se muestran los errores de validación de los cuatro campos; no se envía `PUT`; la tabla sigue vacía. | [ ] | |
| 2 | Crear la primera versión | Llenar los cuatro campos con valores válidos y guardar | comisión `15`, seguro `15000`, fin de semana `10`, temporada alta `25` | El backend responde `200` con `version_number = 1`; aparece "Versión #1 guardada" y desaparece el aviso de pendiente. | [ ] | Valores ilustrativos. |
| 3 | Verificar la primera versión en BD | `psql`: `SELECT * FROM financial_parameters;` | N/A | Una sola fila (`v1`) con los cuatro valores guardados. | [ ] | |
| 4 | Recargar tras crear la primera versión | Pulsar F5 | N/A | Carga con los valores guardados y sin aviso de pendiente. | [ ] | |
| 5 | Cancelar sin configuración | Escribir valores y pulsar "Cancelar" | N/A | Los campos vuelven a quedar vacíos; no se crea ninguna versión. | [ ] | Hacerlo con la tabla aún vacía (antes del paso 2). |
| 6 | Error del servidor distinto a "sin configuración" | Detener PostgreSQL y recargar la pantalla; restaurar | N/A | El backend responde `500 INTERNAL_ERROR` y la pantalla informa un error, distinto del aviso de pendiente. | [ ] | No debe confundirse "pendiente" con "falló". |
| 7 | Guardado inválido antes de configurar | Intentar guardar una comisión inválida con la tabla vacía | comisión `150` | Error de validación; la tabla sigue vacía y la pantalla sigue en estado pendiente. | [ ] | |
| 8 | Configuración creada por otra sesión | Con la pantalla en estado pendiente, otra sesión guarda una versión; recargar | N/A | Tras recargar, la pantalla muestra la versión guardada por la otra sesión. | [ ] | `retryable = true`. |

##### Edge Cases & Boundary Conditions
* **EC-001** : "Sin configuración" (`404 PARAMETERS_NOT_CONFIGURED`) y "error de carga" (`5xx`) son estados distintos y deben comunicarse de forma diferente.
* **EC-002** : No confundir con el `503 FINANCIAL_PARAMETERS_NOT_CONFIGURED` que consumen UC01/UC04; este TC solo cubre el `404` de UC11.
* **EC-003** : La primera versión guardada recibe el número `1`.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
