### Test Case Specification: Parámetros financieros · HU3 · E1 Carga de la configuración vigente
**Created** : 2026-11-10  **Spec/Plan Link** : [011-configurar-parametros-financieros-globales/spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md)  **Status** : Draft

#### Test Overview *(mandatory)*

**Test Case ID** : TC-UC11-HU3-E1
**Product Name & Version** : SeaShare Frontend — Módulo 3 (Finanzas) 0.1.0
**Author** : QA
**Current Owner** : QA
**Priority** : P1 - Critical

--------------------------------------------------------------------------------

#### Objectives & Context *(mandatory)*

##### Test Objectives
Este caso de prueba verifica que, al abrir `/finadmin/parametros`, la pantalla muestra el estado de carga y luego los cuatro parámetros configurables de la **versión vigente devuelta por el backend** como campos editables, junto con el depósito de garantía (10 % de la tarifa base diaria) y las ventanas de temporada alta como datos de **solo lectura**.

##### Document References
| Reference Name | Type of Reference | Document Location / Link |
| ------ | ------ | ------ |
| Feature Spec UC11 | Specification Document | [spec.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/spec.md) |
| Implementation Plan UC11 | Plan Document | [plan.md](../../../../../SeaShare_Modulo_3/docs/features/011-configurar-parametros-financieros-globales/plan.md) |
| Contrato REST — obtener parámetros | REST contract | [UC11-obtener-parametros-financieros.md](../../../../../SeaShare_Modulo_3/docs/technical-plan/contracts/rest/UC11-obtener-parametros-financieros.md) |
| Test case backend equivalente | Test Case | [TC-UC11-HU3-E1-carga-vigente.md](../../../../../SeaShare_Modulo_3/docs/features/qa/test-cases/TC-UC11-HU3-E1-carga-vigente.md) |

--------------------------------------------------------------------------------

#### Prerequisites & Environment

##### Test Case Limitations
* Se ejecuta contra el **backend M3 del entorno de pruebas**; los valores mostrados se contrastan con la respuesta del `GET` en DevTools y con la BD.
* Los valores del seed (v7: comisión 15 %, seguro 15000, fin de semana 10 %, temporada alta 25 %) son **ilustrativos**.
* El depósito y las ventanas de temporada alta son derivados: la pantalla debe mostrar `guarantee_deposit_rule` y `high_season_windows` que entrega la API, no textos fijos.

##### Dependencies & Assumptions
* El frontend está conectado al backend de pruebas (`VITE_API_M3_URL`).
* Seed del perfil `qa` aplicado (`v1..v7`, vigente `v7`).
* Ninguna dependencia de otros TC.

##### Preconditions & Default Setup
* **Initial State** : `financial_parameters` con `v7` vigente.
* **Environment** : backend en `http://localhost:8080`, frontend en `http://localhost:5173`, Chrome/Firefox actual, ventana ≥ 1024 px. BD: `docker exec -it seashare-postgres psql -U seashare -d seashare`.
* **Test Accounts** : en `/login`, botón "Entrar como Admin Financiero".

--------------------------------------------------------------------------------

#### Test Execution Flow *(mandatory)*

##### Section 1: Carga de la configuración vigente
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Entrar como Admin Financiero | Abrir `/login` y pulsar "Entrar como Admin Financiero" | `http://localhost:5173/login` | Redirige a `/finadmin/parametros`. | [ ] | Es la ruta de inicio del rol. |
| 2 | Verificar la petición | Abrir DevTools → Network antes de cargar y recargar | N/A | Se emite un `GET /api/v1/financial-parameters` que responde `200` con `version_number = 7` y los cuatro valores. | [ ] | |
| 3 | Verificar el estado de carga | Observar la pantalla al abrir | N/A | Se muestra brevemente "Cargando…" y luego el contenido, sin pantalla en blanco ni error. | [ ] | |
| 4 | Verificar el encabezado | Leer el encabezado | N/A | "Feature 011", título "Parámetros financieros globales" y la descripción sobre la versión vigente. | [ ] | |
| 5 | Verificar la comisión | Leer "Comisión de plataforma (%)" | N/A | Muestra `15`; el campo es editable. | [ ] | |
| 6 | Verificar el seguro | Leer "Seguro náutico por pasajero (COP)" | N/A | Muestra `15000`; el campo es editable. | [ ] | |
| 7 | Verificar el incremento de fin de semana | Leer "Incremento fin de semana (%)" | N/A | Muestra `10`; el campo es editable. | [ ] | |
| 8 | Verificar el incremento de temporada alta | Leer "Incremento temporada alta (%)" | N/A | Muestra `25`; el campo es editable. | [ ] | |
| 9 | Verificar el depósito de garantía | Leer "Depósito de garantía" y comparar con `guarantee_deposit_rule` | N/A | Muestra `10% de la tarifa base diaria` (la regla del backend); campo deshabilitado. | [ ] | **Posible defecto**: el front muestra hoy un texto fijo con un monto de ejemplo. |
| 10 | Verificar las ventanas de temporada alta | Leer "Ventanas de temporada alta" y comparar con `high_season_windows` | N/A | Muestra las ventanas devueltas por la API; campo deshabilitado. | [ ] | **Posible defecto**: el front muestra hoy un texto fijo. |
| 11 | Verificar contra la BD | `psql`: `SELECT * FROM financial_parameters ORDER BY version_number DESC LIMIT 1;` | N/A | Los cuatro valores de la pantalla coinciden con la fila de mayor `version_number`. | [ ] | |
| 12 | Verificar el estado inicial de la acción | Observar la zona de botones | N/A | "Cancelar" y "Guardar cambios" habilitados; **no** aparece "Versión #N guardada". | [ ] | El mensaje solo aparece tras guardar. |

##### Section 2: Errores y casos extremos de este escenario
| Step # | Step Description | Path & Action | Test Data | Expected Results | Pass/Fail | Comments |
| :---: | ------ | ------ | ------ | ------ | :---: | ------ |
| 1 | Recargar la pantalla | Pulsar F5 en `/finadmin/parametros` | N/A | Vuelve a mostrar "Cargando…" y luego la configuración; el rol se conserva sin volver al login. | [ ] | |
| 2 | Navegar y volver | Ir a "Registros" y regresar a "Parámetros" | N/A | La pantalla carga de nuevo con los valores vigentes. | [ ] | |
| 3 | Cargar tras una versión nueva | Guardar una versión nueva (comisión `20`) y volver a entrar a la pantalla | comisión `20` | Muestra la versión recién guardada (`v8`), no la del seed. | [ ] | La BD queda con `v8`; recrear antes de otros TC. |
| 4 | Solo lectura real | Intentar escribir en los dos campos de "Datos calculados" | texto libre | Ninguno acepta edición. | [ ] | |
| 5 | Acceso por otro rol | Entrar como Propietario y abrir `/finadmin/parametros` por URL | N/A | Redirige fuera de la pantalla. | [ ] | Es navegación, no seguridad real. |
| 6 | Vista móvil | Reducir la ventana a < 768 px | N/A | Los campos se apilan y todo el contenido sigue accesible sin scroll horizontal. | [ ] | |
| 7 | Error de carga | Detener PostgreSQL (`docker compose stop postgres`) y abrir la pantalla; restaurar al terminar | N/A | El backend responde `500 INTERNAL_ERROR` y la pantalla informa el fallo de forma controlada, sin quedarse en "Cargando…". | [ ] | **Posible defecto**: hoy la página solo maneja el estado de carga y no tiene mensaje de error. |
| 8 | Lectura sin efectos | Recargar varias veces y contar filas en BD | N/A | `count` de `financial_parameters` no cambia: la carga es de solo lectura. | [ ] | |

##### Edge Cases & Boundary Conditions
* **EC-001** : Los cuatro parámetros llegan en una sola respuesta; no debe verse una mezcla de valores de versiones distintas.
* **EC-002** : El depósito y las ventanas son derivados y nunca editables desde esta pantalla.
* **EC-003** : La pantalla no inventa valores: la carga sin configuración se cubre en TC-UC11-HU3-E2.

--------------------------------------------------------------------------------

#### Defect Severity Reference

| Severity Level | Code | Definition & Impact |
| ------ | :---: | ------ |
| **Critical** | **C** | Crash, corrupción de datos o bloqueo completo del journey crítico sin workaround. |
| **Major** | **M** | Funcionalidad núcleo rota con workaround incómodo. |
| **Small / Minor** | **S** | Cosmético, typo, alineación menor, no bloqueante. |
