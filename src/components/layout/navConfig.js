import boat from '@/assets/icons/boat.svg'
import calendar from '@/assets/icons/calendar.svg'
import compass from '@/assets/icons/compass.svg'
import dashboard from '@/assets/icons/dashboard.svg'
import dispute from '@/assets/icons/dispute.svg'
import wallet from '@/assets/icons/wallet.svg'

// Rutas provisionales: se ajustarán al montar las pantallas de cada fase.
export const NAV_BY_ROLE = {
  ADMIN: {
    initial: 'A',
    items: [
      { to: '/admin', label: 'Panel General', icon: dashboard, end: true },
      { to: '/admin/disputas', label: 'Resolución de Disputas', icon: dispute },
    ],
  },
  OWNER: {
    initial: 'O',
    items: [
      { to: '/owner/embarcaciones', label: 'Mis Embarcaciones', icon: boat },
      { to: '/owner/reservas', label: 'Reservas Recibidas', icon: calendar },
      { to: '/owner/finanzas', label: 'Finanzas', icon: wallet },
    ],
  },
  RENTER: {
    initial: 'R',
    items: [
      { to: '/explorar', label: 'Explorar', icon: compass },
      { to: '/mis-reservas', label: 'Mis Reservas', icon: calendar },
    ],
  },
  FINADMIN: {
    initial: null,
    subtitle: 'Finanzas',
    plain: true,
    items: [
      { to: '/finadmin/parametros', label: 'Parámetros' },
      { to: '/finadmin/registros', label: 'Registros' },
      { to: '/finadmin/informe', label: 'Informe' },
    ],
  },
}

export const OWNER_FINANCE_SUBNAV = [
  { to: '/owner/finanzas/balance', label: 'Balance General' },
  { to: '/owner/finanzas/historial', label: 'Historial de Pagos', shortLabel: 'Historial' },
  { to: '/owner/finanzas/cuentas', label: 'Cuentas Retiro' },
]
