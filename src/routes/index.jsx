import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import LoginPage from '@/pages/login/LoginPage'
import ComponentCatalog from '@/pages/dev/ComponentCatalog'
import Placeholder from '@/pages/Placeholder'
import BoatDetailPage from '@/features/reservations/pages/BoatDetailPage'
import ExplorePage from '@/features/reservations/pages/ExplorePage'
import MyReservationsPage from '@/features/reservations/pages/MyReservationsPage'
import PaymentPage from '@/features/reservations/pages/PaymentPage'
import ReservationDetailPage from '@/features/reservations/pages/ReservationDetailPage'
import RootRedirect from './RootRedirect'

const page = (title, figma) => <Placeholder title={title} figma={figma} />

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/dev/components', element: <ComponentCatalog /> },
  {
    element: <AppShell role="RENTER" />,
    children: [
      { path: '/explorar', element: <ExplorePage /> },
      { path: '/explorar/:boatId', element: <BoatDetailPage /> },
      { path: '/explorar/:boatId/pago', element: <PaymentPage /> },
      { path: '/mis-reservas', element: <MyReservationsPage /> },
      { path: '/mis-reservas/:reservationId', element: <ReservationDetailPage /> },
    ],
  },
  {
    element: <AppShell role="OWNER" />,
    children: [
      { path: '/owner/embarcaciones', element: page('Mis embarcaciones', '28:32') },
      { path: '/owner/reservas', element: page('Reservas recibidas', '28:2212') },
      { path: '/owner/finanzas', element: <Navigate to="/owner/finanzas/balance" replace /> },
      { path: '/owner/finanzas/balance', element: page('Balance general', '28:3296') },
      { path: '/owner/finanzas/historial', element: page('Historial de pagos', '28:3296') },
      { path: '/owner/finanzas/cuentas', element: page('Cuentas de retiro', '28:3383') },
    ],
  },
  {
    element: <AppShell role="ADMIN" />,
    children: [
      { path: '/admin', element: page('Panel general · Embarcaciones', '26:191') },
      { path: '/admin/disputas', element: page('Resolución de disputas', '26:1121') },
    ],
  },
  {
    element: <AppShell role="FINADMIN" />,
    children: [
      { path: '/finadmin/parametros', element: page('Parámetros financieros', '29:2') },
      { path: '/finadmin/registros', element: page('Registros financieros', '29:44') },
      { path: '/finadmin/informe', element: page('Informe financiero', '29:131') },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
