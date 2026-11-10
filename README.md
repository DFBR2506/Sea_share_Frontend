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

Si el puerto está ocupado: `npm run dev -- --port 5199`.

### Variables de entorno

Copia `.env.example` a `.env` para apuntar a los backends (hoy no se usan porque las pantallas leen mocks):

```
VITE_API_M1_URL=http://localhost:8081   # Embarcaciones
VITE_API_M2_URL=http://localhost:8082   # Reservas
VITE_API_M3_URL=http://localhost:8083   # Finanzas
```

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
