# SeaShare · Frontend

Frontend web de **SeaShare**, plataforma de alquiler náutico. Implementa el [prototipo de Figma](https://www.figma.com/design/QSLQFuT6aasLwA4trVGgJX/Prototipo-seashare) y consume datos de **3 módulos backend**:

| Módulo | Dominio | Roles que lo usan |
|---|---|---|
| **M1** | Embarcaciones | Propietario, Administrador |
| **M2** | Reservas (y disputas) | Arrendatario, Propietario, Administrador |
| **M3** | Finanzas | Propietario, Admin Financiero |

> **Estado actual:** todas las pantallas del prototipo están implementadas y funcionan con **datos mock en memoria**. Aún no hay conexión a los backends reales ni autenticación (ver [Pendiente](#pendiente)).

## Stack

- React 19 + Vite 8 (con React Compiler)
- JavaScript (sin TypeScript)
- React Router 7, TanStack Query 5
- CSS Modules + variables CSS (tokens del diseño). Sin librería de UI
- Fuente Inter (`@fontsource-variable/inter`)
- Lint con Oxlint

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Oxlint |
| `npm test` | Pruebas unitarias de checkout y pagos (Node, sin SDK real) |
| `npm run test:e2e` | Pruebas Chromium de escritorio y móvil con doble de SDK |

Si el puerto está ocupado: `npm run dev -- --port 5199`.

### Variables de entorno

Copia `.env.example` a `.env` para apuntar a los backends (hoy no se usan porque las pantallas leen mocks):

```
VITE_API_M1_URL=http://localhost:8081   # Embarcaciones
VITE_API_M2_URL=http://localhost:8082   # Reservas
VITE_API_M3_URL=http://localhost:8083   # Finanzas
VITE_MERCADOPAGO_PUBLIC_KEY=          # Public Key de pruebas de Colombia
```

### Payment Brick (tokenización sin cobro)

1. Configura `VITE_MERCADOPAGO_PUBLIC_KEY` en `.env.local` con la **Public Key de pruebas** de una aplicación de Colombia (MCO), y reinicia Vite. Nunca uses Access Token ni secreto de webhook en `VITE_*`.
2. Como arrendatario, selecciona embarcación, fechas y pasajeros; pulsa «Reservar», acepta la política y continúa al método de pago.
3. Completa primero nombre y teléfono del contacto de la reserva con datos de prueba; luego el Brick con [tarjetas oficiales de prueba de Colombia](https://www.mercadopago.com.co/developers/es/docs/checkout-bricks/integration-test/test-cards). El contacto puede ser distinto del titular de la tarjeta. El correo del pagador se solicita solo en el Brick. No uses una tarjeta real.
4. Pulsa «Obtener datos de pago de prueba». El callback debe mostrar `tokenPresent: true`, `emailPresent: true`, el método y `installments: 1`. La evidencia no muestra el token, correo ni documento.
5. Comprueba en Network que hay peticiones del SDK a MercadoPago para tokenizar, pero **ningún POST de creación de pagos o preferencias ni llamadas a M2/M3**. El backend puede permanecer apagado.
6. Vuelve al resumen y recarga: se conservan consentimiento y vencimiento, pero no el token. Al vencer se desmonta el Brick. «Volver a cargar formulario» limpia sus datos sin renovar el TTL.

Se usa el SDK oficial `https://sdk.mercadopago.com/js/v2`, sin wrapper React, preferencias ni billetera/PSE/efectivo. Solo tarjetas y una cuota. El importe sigue siendo el del mock; no se presenta como una cotización real en COP. Un importe inferior al mínimo habilitado por MercadoPago puede impedir mostrar cuotas: la prueba debe usar una selección compatible, sin alterar silenciosamente el total.

La captura queda únicamente en memoria del flujo local y se borra al salir, volver a cargar el formulario, editar el contacto o expirar. El contacto tampoco se persiste al volver o recargar. No se crean pagos: `tokenized` **no** significa `APPROVED`.

#### Contrato local de pago (fase 4)

`features/reservations/checkout/paymentContract.js` normaliza una lista explícita de campos:

- `checkoutId`, `reservationId: null` (todavía no hay reserva real).
- `contact: { name, phone }`, separado de la identidad del pagador/titular.
- `selectedPaymentMethod` y `formData`: `token`, `payment_method_id`, `transaction_amount`, `installments`, `payer.email`; cuando estén presentes, `issuer_id`, `payer.identification`, `payment_method_option_id` y `processing_mode`.
- `additionalData`: únicamente `lastFourDigits` y `cardholderName` si fueron devueltos. No se conserva BIN, PAN, CVV ni vencimiento.

`toM3PaymentFields` es una proyección local de `payment_token_ref`, `payment_method_type` (marca real) y `payment_metadata: { payer_email, last_four? }`. No publica mensajes ni crea un evento completo. M3 aún no transporta `issuer_id`/identificación y no tiene un endpoint HTTP de cobro acreditado para el frontend. No se transmite el nombre/teléfono a M3: sigue pendiente el contrato de Reservas.

La comprobación sanitizada incluye presencia de contacto y de los campos mínimos de M3, nunca sus valores sensibles. Editar el contacto desmonta el Brick y exige capturar de nuevo el token, sin renovar el TTL.

#### Apariencia del Brick

`checkout/brickAppearance.js` deriva colores, variantes de marca, radios, tamaños de texto y espaciados de `src/styles/tokens.css`. Convierte colores calculados (`color-mix`) a valores sRGB antes de entregarlos al SDK. Los campos de contacto usan `Input`/`Button` y las columnas/paneles existentes; no se añaden colores globales ni selectores del DOM interno del SDK.

La interfaz anfitriona conserva Inter. Los campos PCI aislados mantienen las limitaciones tipográficas del SDK: no se presupone que hereden la fuente del documento ni se inyectan reglas dentro de sus iframes. Revisar visualmente el Brick real en móvil y escritorio, incluidos errores y foco, sigue siendo necesario.

El formulario del Brick utiliza `--space-3` (12 px) de padding interior para separar ligeramente los campos de sus laterales, mediante la opción pública `formPadding` del SDK.

#### Flujo desacoplado (fase 5)

`checkout/paymentFlow.js` controla `loading_sdk`, `ready`, `tokenizing`, `tokenized`, `error` y `expired`. Una Public Key ausente muestra `configuration_error` sin cargar el SDK. `tokenizing` corresponde a validar/capturar el resultado de `onSubmit`; la tokenización de tarjeta previa al callback la gestiona el propio Brick.

El flujo entrega el contrato normalizado a `checkout/detachedPaymentAdapter.js`, que solo devuelve:

```js
{ mode: 'detached', outcome: 'tokenized', paymentCreated: false }
```

No hay llamadas HTTP, temporizadores de éxito ficticio ni estados financieros simulados. El resultado sanitizado muestra `mode`/`outcome`, nunca el contrato sensible. El doble callback comparte una sola promesa; tras capturar se oculta el formulario y otra prueba requiere volver a cargarlo. Un fallo permite reintentar mientras el plazo siga vigente; la recarga nunca renueva el TTL.

Se valida el vencimiento antes de normalizar, antes del adaptador y después de resolverlo. Si el plazo vence durante la operación, se descarta su resultado, se borra la captura y se cancela la señal. Salir, editar contacto o recargar también cancela e ignora respuestas tardías; no se escribe el contrato en storage ni en React Query.

**Conexión futura (fuera de esta entrega):** reemplazar el adaptador local por un transporte HTTP solo cuando exista el endpoint acordado con Reservas/intermediario. Conservar el contrato normalizado y la cancelación mediante `AbortSignal`; adaptar explícitamente la respuesta y los estados de confirmación financiera. El flujo actual rechaza respuestas `APPROVED` o `paymentCreated: true` para no confundirlas con tokenización. No basta con cambiar una URL: siguen pendientes el contrato de entrada, el UUID real de reserva y el soporte de emisor/identificación en M3. Un timeout futuro deberá tratarse como resultado desconocido, no como permiso para duplicar un cobro.

#### Verificación reproducible (fase 6)

```bash
npm ci
npx playwright install chromium
npm test
npm run test:e2e
npm run lint
npm run build
```

`playwright.config.js` inicia un Vite aislado en `127.0.0.1:5197` con una Public Key ficticia que sobrescribe `.env`/`.env.local`. Si el puerto está ocupado falla: no reutiliza una instancia con credenciales desconocidas. Las pruebas no leen ni imprimen credenciales privadas.

El navegador intercepta el script oficial con `tests/e2e/sdkStub.js`; el CSS de Google Fonts preexistente en `index.html` también se intercepta localmente. Cualquier intento de acceder al backend o a otro recurso externo hace fallar la prueba. No se llama a MercadoPago en E2E: **los tokens de esas pruebas son sintéticos**.

| Comprobación | Evidencia automática |
|---|---|
| Datos requeridos, mapeo a M3 y exclusión de PAN/CVV/BIN | `tests/paymentContract.test.js`, `tests/paymentBrick.test.js` |
| Selección válida, fechas y capacidad conocida | `tests/selection.test.js` |
| TTL absoluto, recarga y cambios de selección | `tests/checkoutState.test.js` y `tests/e2e/checkout.spec.js` |
| Carga única, cancelación y limpieza con StrictMode | `tests/mercadoPagoSdk.test.js`, `tests/paymentBrick.test.js` |
| Doble envío, fallo, reintento y resultado tardío | `tests/paymentFlow.test.js` |
| Navegación sin diálogo, acceso directo, atrás/adelante | `tests/e2e/checkout.spec.js` |
| Configuración ausente, descarga fallida y storage bloqueado | `tests/e2e/checkout.spec.js` |
| Sin llamadas backend ni datos sensibles en storage/consola | Fixture de red y aserciones de privacidad en E2E |
| Tokens visuales, padding de 12 px y ausencia de overflow | Caso visual E2E en escritorio y móvil |

**Resultado ejecutado en esta etapa:** 44 pruebas unitarias y 26 pruebas de navegador correctas (13 casos por proyecto). Lint sin errores, con la advertencia preexistente de Fast Refresh en `AnimatedStepper.jsx`; build correcto, con advertencia de tamaño del bundle. Se fortaleció la validación de selección para rechazar una capacidad de pasajeros ausente o inválida.

Las capturas locales `contacto.png` y `layout-doble-sdk.png` quedan en las carpetas del caso visual bajo `test-results/`, excluido de Git. Contienen únicamente datos sintéticos y se revisaron en escritorio y móvil. **La captura del doble verifica el contenedor y la configuración visual, no los campos PCI reales.** No se generan trazas, vídeos ni HAR por defecto; no adjuntar evidencia de sesiones reales sin sanearla.

##### Aceptación pendiente con SDK real (Colombia)

La visualización del Brick fue reportada por el usuario. La generación real de un token mediante `onSubmit` y la apariencia de los campos seguros **no se dan por verificadas por las pruebas anteriores**. Para cerrar ese requisito, ejecutar los pasos de tokenización de esta sección con datos oficiales de prueba y registrar únicamente:

- [ ] SDK real cargado con Public Key de pruebas MCO, sin doble de SDK.
- [ ] `tokenPresent: true`, `emailPresent: true`, `installments: 1` y `paymentMethodId` presente.
- [ ] Registrar los booleanos de presencia de emisor, identificación y últimos cuatro dígitos; no asumir que siempre se reciben. Si falta uno requerido por el contrato acordado, registrar el bloqueo.
- [ ] `contactNamePresent`, `contactPhonePresent` y `m3PaymentFieldsPresent` en `true`.
- [ ] `mode: detached`, `outcome: tokenized`, `paymentCreated: false`.
- [ ] Network: peticiones de tokenización permitidas; ningún POST de creación de pagos/preferencias ni llamadas a M2/M3. No exportar HAR con datos de tarjeta/documento.
- [ ] Captura y datos de contacto ausentes de storage/consola; limpieza al editar, salir y expirar.
- [ ] Revisar campos seguros en móvil/escritorio, márgenes, foco y errores. La herencia tipográfica del iframe sigue limitada por el SDK.

Guardar fecha, navegador y booleanos anteriores, sin token, correo, teléfono, documento ni credenciales. **No marcar la tokenización real como completada solo porque el formulario sea visible.**

##### Límites que siguen abiertos

- Precio, disponibilidad, identidad de reserva y vencimiento son simulaciones locales. Si el navegador bloquea storage, no se conserva el checkout tras recargar.
- M3 aún no tiene un endpoint HTTP de cobro para este flujo ni transmite emisor/identificación. Contacto y UUID real dependen del contrato de Reservas.
- PSE, efectivo, billetera, confirmación financiera, 3DS y requisitos fiscales/productivos no se validan en esta entrega.
- Las pruebas móviles usan emulación de Chromium, no un dispositivo físico ni Safari/WebKit.

## Cómo probarlo

1. Abre `/login` y elige un rol con los botones inferiores (no hace falta usuario ni contraseña).
2. Para cambiar de rol, pulsa **Perfil** en la barra superior (cierra la sesión).
3. `/dev/components` muestra el catálogo de componentes con todos sus estados.
4. Reduce la ventana por debajo de 768 px para ver el diseño móvil (menú hamburguesa, tablas en tarjetas).

Los datos mock viven en memoria: las acciones (cancelar, eliminar, retirar…) se reflejan en la UI pero **se pierden al recargar**. Solo el rol elegido se conserva (`localStorage`).

## Rutas por rol

| Rol | Ruta | Pantalla |
|---|---|---|
| Todos | `/login` | Inicio de sesión (selector de rol) |
| **Arrendatario** | `/explorar` | Explorar embarcaciones con filtros |
| | `/explorar/:boatId` | Detalle, calendario de rango, reserva |
| | `/explorar/:boatId/pago` | Pago con temporizador de 15 min |
| | `/explorar/:boatId/pago/metodo` | Payment Brick de prueba, sin cobro |
| | `/mis-reservas`, `/mis-reservas/:id` | Historial y detalle, cancelación |
| **Propietario** | `/owner/embarcaciones` | Lista de embarcaciones |
| | `/owner/embarcaciones/nueva` | Registro en 2 pasos |
| | `/owner/embarcaciones/:id`, `/:id/editar` | Detalle, edición, mantenimiento, eliminación |
| | `/owner/reservas`, `/owner/reservas/:id` | Reservas recibidas y flujo de embarque |
| | `/owner/finanzas/balance` | Informe financiero (feature 013) |
| | `/owner/finanzas/historial` | Registros financieros (feature 012) |
| **Administrador** | `/admin` | Control general de flota |
| | `/admin/embarcaciones/:id`, `/admin/propietarios/:id` | Detalle de embarcación y ficha del propietario |
| | `/admin/disputas` | Resolución de disputas |
| **Admin Financiero** | `/finadmin/parametros` | Parámetros financieros globales (feature 011) |
| | `/finadmin/registros` | Registros financieros con filtro por propietario |
| | `/finadmin/informe` | Informe financiero |

Cada grupo de rutas está envuelto por `AppShell`, que redirige a `/login` si no hay sesión o el rol no corresponde. Esto es solo navegación, **no es seguridad**.

## Estructura

```
src/
  main.jsx · App.jsx            # providers: QueryClient, Session, Router
  routes/                       # definición de rutas por rol
  styles/                       # tokens.css (variables del diseño) y base.css
  lib/                          # http.js, roles, sesión, fechas/moneda, useCountdown
  components/
    ui/                         # primitivos: Button, Modal, Field, Calendar, DataTable…
    cards/                      # BoatCard, ReservationItem, FinancialSummary, InfoTile…
    layout/                     # TopBar, SubTabs, AppShell, PageCard, navConfig
    filters/ · modals/          # FilterBar · modales de negocio y ConfirmDialog
  features/
    boats/                      # M1 · api/ (mocks), hooks.js, components/, pages/
    reservations/               # M2
    finance/                    # M3
  pages/                        # login y catálogo de componentes (/dev/components)
```

Convenciones:

- **Componentes presentacionales** (`components/`) no llaman a la API: reciben datos por props.
- **Cada feature** separa `api/` (acceso a datos), `hooks.js` (TanStack Query) y `pages/`.
- Las pantallas **nunca** importan los mocks directamente: pasan por `api/index.js` y los hooks.
- Estilos con CSS Modules; colores, tipografía y espaciados salen de `src/styles/tokens.css`.
- Alias `@/` apunta a `src/`.

## Diseño

Los tokens (colores, tipografía, radios) provienen de Figma y están en `src/styles/tokens.css`:

| Token | Valor |
|---|---|
| `--seashare-color-brand-primary` | `#0b2a4a` |
| `--seashare-color-brand-support` | `#00b3c6` |
| `--seashare-color-brand-soft` | `#e6f7fa` |
| `--seashare-color-brand-accent` | `#e5503c` (acciones destructivas) |
| Tipografía | Inter (Title 20/700, Body 14/400, Label 12/500) |

El diseño es **responsive desde el inicio**: la barra superior colapsa a menú hamburguesa bajo 768 px y las tablas pasan a tarjetas apiladas.

## Conectar los backends

Los mocks están aislados detrás de una capa de acceso por módulo. Para integrar un contrato real solo se cambia el cuerpo de las funciones de `api/index.js`, usando el cliente de `src/lib/http.js`:

```js
// features/boats/api/index.js
import { request } from '@/lib/http'

export const listOwnerVessels = () => request('m1', '/vessels?owner=me')
```

`request(modulo, ruta, { method, body })` antepone la URL base del módulo (`VITE_API_M1_URL`, `M2`, `M3`) y lanza `ApiError` si la respuesta no es 2xx. Los hooks y las pantallas no cambian.

Archivos a tocar:

- `src/features/boats/api/index.js` (M1)
- `src/features/reservations/api/index.js` (M2)
- `src/features/finance/api/index.js` (M3)

Los archivos `mocks.js` / `ownerMocks.js` pueden eliminarse cuando ya no se usen.

## Pendiente

- Integrar los contratos reales de M1, M2 y M3.
- Autenticación real y obtención del rol (hoy el rol es un selector en el login).
- Mapa interactivo para el puerto de atraque (hoy `MapPlaceholder`; ver frame «Prototipo · Mapa» de Figma).
- Modal de proceso borrador del registro de embarcaciones (frames 28:676 a 28:863).
- Valores calculados en el cliente que deben venir del backend: comisión, seguro y depósito del pago, política de cancelación, tolerancia de embarque.
- Subida real de fotografías (hoy solo se selecciona el archivo).
- Revisión visual fina contra Figma.
