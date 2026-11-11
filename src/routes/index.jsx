import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import LoginPage from '@/pages/login/LoginPage'
import ComponentCatalog from '@/pages/dev/ComponentCatalog'
import BoatDetailPage from '@/features/reservations/pages/BoatDetailPage'
import ExplorePage from '@/features/reservations/pages/ExplorePage'
import MyReservationsPage from '@/features/reservations/pages/MyReservationsPage'
import PaymentPage from '@/features/reservations/pages/PaymentPage'
import PaymentMethodPage from '@/features/reservations/pages/PaymentMethodPage'
import ReservationDetailPage from '@/features/reservations/pages/ReservationDetailPage'
import AdminFleetPage from '@/features/boats/pages/AdminFleetPage'
import AdminOwnerPage from '@/features/boats/pages/AdminOwnerPage'
import OwnerVesselsPage from '@/features/boats/pages/OwnerVesselsPage'
import VesselDetailPage from '@/features/boats/pages/VesselDetailPage'
import VesselEditPage from '@/features/boats/pages/VesselEditPage'
import VesselRegisterPage from '@/features/boats/pages/VesselRegisterPage'
import AdminDisputesPage from '@/features/reservations/pages/AdminDisputesPage'
import OwnerReservationDetailPage from '@/features/reservations/pages/OwnerReservationDetailPage'
import OwnerReservationsPage from '@/features/reservations/pages/OwnerReservationsPage'
import FinanceParamsPage from '@/features/finance/pages/FinanceParamsPage'
import FinanceRecordsPage from '@/features/finance/pages/FinanceRecordsPage'
import FinanceReportPage from '@/features/finance/pages/FinanceReportPage'
import RootRedirect from './RootRedirect'

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
      { path: '/explorar/:boatId/pago/metodo', element: <PaymentMethodPage /> },
      { path: '/mis-reservas', element: <MyReservationsPage /> },
      { path: '/mis-reservas/:reservationId', element: <ReservationDetailPage /> },
    ],
  },
  {
    element: <AppShell role="OWNER" />,
    children: [
      { path: '/owner/embarcaciones', element: <OwnerVesselsPage /> },
      { path: '/owner/embarcaciones/nueva', element: <VesselRegisterPage /> },
      { path: '/owner/embarcaciones/:vesselId', element: <VesselDetailPage mode="owner" /> },
      { path: '/owner/embarcaciones/:vesselId/editar', element: <VesselEditPage /> },
      { path: '/owner/reservas', element: <OwnerReservationsPage /> },
      { path: '/owner/reservas/:reservationId', element: <OwnerReservationDetailPage /> },
      { path: '/owner/finanzas', element: <Navigate to="/owner/finanzas/balance" replace /> },
      { path: '/owner/finanzas/balance', element: <FinanceReportPage scope="owner" /> },
      { path: '/owner/finanzas/historial', element: <FinanceRecordsPage scope="owner" /> },
    ],
  },
  {
    element: <AppShell role="ADMIN" />,
    children: [
      { path: '/admin', element: <AdminFleetPage /> },
      { path: '/admin/embarcaciones/:vesselId', element: <VesselDetailPage mode="admin" /> },
      { path: '/admin/propietarios/:ownerId', element: <AdminOwnerPage /> },
      { path: '/admin/disputas', element: <AdminDisputesPage /> },
    ],
  },
  {
    element: <AppShell role="FINADMIN" />,
    children: [
      { path: '/finadmin/parametros', element: <FinanceParamsPage /> },
      { path: '/finadmin/registros', element: <FinanceRecordsPage scope="admin" /> },
      { path: '/finadmin/informe', element: <FinanceReportPage scope="admin" /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
