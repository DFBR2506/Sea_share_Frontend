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
Este caso de prueba verifica que, cuando todavía no existe una configuración financiera global, la pantalla `/finadmin/parametros` informa que la configuración está **pendiente**, **no inventa valores** para ningún parámetro y permite al Administrador Financiero crear la primera versión.

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
* **Este escenario no se puede reproducir con los mocks actuales**: `getParams` siempre devuelve la versión inicial (#12). Solo es ejecutable con backend real y una BD sin filas en `financial_parameters`, o simulando la respuesta vacía en las herramientas de desarrollo del navegador.
* **Comportamiento actual del front no definido**: `FinanceParamsPage` no tiene estado vacío ni de error; con una respuesta vacía probablemente falla al leer `params.version`. Registrar lo observado y abrir defecto si no cumple lo esperado.
* El mensaje exacto de "configuración pendiente" no está definido en el spec; los resultados esperados describen el comportamiento y no un texto literal.

##### Dependencies & Assumptions
* Backend M3 corriendo y accesible (`VITE_API_M3_URL`), con la BD sin ninguna versión de parámetros.
* Alternativa: interceptar la petición de parámetros (DevTools → Network → bloquear/sobrescribir respuesta) para devolver "no configurado".

##### Preconditions & Default Setup
* **Initial State** : sesión como Admin Financiero; tabla `financial_parameters` vacía.
* **Environment** : desarrollo local con backend real, Chrome/Firefox actual, ventana ≥ 1024 px.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Carga sin configuración previa
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | |
| 2 | Verificar que la pantalla no se rompe | Observar la pantalla tras la carga | N/A | La pantalla no queda en blanco ni congelada en "Cargando…" y no hay errores sin controlar en la consola del navegador. | [ ] | |
| 3 | Verificar el aviso de configuración pendiente | Leer el contenido de la pantalla | N/A | Se informa claramente que la configuración financiera está pendiente. | [ ] | |
| 4 | Verificar que no se inventan valores | Leer los cuatro campos configurables | N/A | Ningún campo muestra un valor por defecto inventado (ni `0`, ni los valores del seed); aparecen vacíos. | [ ] | |
| 5 | Verificar los datos calculados | Leer "Depósito de garantía" y "Ventanas de temporada alta" | N/A | No muestran valores derivados de una configuración inexistente (vacíos o con aviso de pendiente). | [ ] | |
| 6 | Verificar que no hay versión guardada | Buscar el mensaje "Versión #N guardada" | N/A | No aparece ningún número de versión vigente. | [ ] | |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Guardar con los campos vacíos | Pulsar "Guardar cambios" sin llenar nada | N/A | Se muestran los errores de validación de los cuatro campos; no se crea ninguna versión. | [ ] | |
| 2 | Crear la primera versión | Llenar los cuatro campos con valores válidos y guardar | comisión `12`, seguro `18000`, fin de semana `8`, temporada alta `15` | Aparece "Versión #1 guardada" y desaparece el aviso de configuración pendiente. | [ ] | Valores ilustrativos. |
| 3 | Recargar tras crear la primera versión | Pulsar F5 | N/A | La pantalla carga con los valores guardados y sin aviso de pendiente. | [ ] | |
| 4 | Cancelar sin configuración | Escribir valores y pulsar "Cancelar" | N/A | Los campos vuelven a quedar vacíos; no se crea ninguna versión. | [ ] | |
| 5 | Error del servidor distinto a "sin configuración" | Simular una respuesta `500` | N/A | Se informa un error controlado, distinto del aviso de configuración pendiente. | [ ] | No debe confundirse "pendiente" con "falló". |

##### Edge Cases & Boundary Conditions
* **EC-001** : "Sin configuración" y "error de carga" son estados distintos y deben comunicarse de forma diferente.
* **EC-002** : Mientras no exista configuración, UC02, UC04 y UC10 (consumidores) no pueden calcular; esa respuesta se verifica en los TC del backend, no aquí.
* **EC-003** : Tras crear la primera versión, la numeración parte de la versión inicial que defina el backend (se asume `1`).

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
