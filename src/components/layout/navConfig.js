import boat from '@/assets/icons/boat.svg'
import calendar from '@/assets/icons/calendar.svg'
import compass from '@/assets/icons/compass.svg'
import dashboard from '@/assets/icons/dashboard.svg'
import dispute from '@/assets/icons/dispute.svg'
import records from '@/assets/icons/records.svg'
import report from '@/assets/icons/report.svg'
import settings from '@/assets/icons/settings.svg'
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
    items: [
      { to: '/finadmin/parametros', label: 'Parámetros', icon: settings },
      { to: '/finadmin/registros', label: 'Registros', icon: records },
      { to: '/finadmin/informe', label: 'Informe', icon: report },
    ],
  },
}

export const OWNER_FINANCE_SUBNAV = [
  { to: '/owner/finanzas/balance', label: 'Balance General' },
  { to: '/owner/finanzas/historial', label: 'Historial de Pagos', shortLabel: 'Historial' },
]
