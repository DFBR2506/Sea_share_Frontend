// Datos de ejemplo para el lado Propietario / Administrador del módulo 2.
// phase (solo CONFIRMADA): ANTES → CORTESIA (tolerancia en curso) → CORTESIA_CUMPLIDA
// Totales y desglose en COP derivados con la misma regla que el lado arrendatario (pricedReservation).
import { pricedReservation } from './mocks'

export const OWNER_RESERVATIONS = [
  { id: 'RS-4492', boatId: 'sunset-catamaran', guest: 'Laura Gomez', guestTrips: 12, pax: 3, dates: '25 – 27 sep', days: 3, status: 'CONFIRMADA', phase: 'ANTES', minutesToDeparture: 45, embark: '25 sep, 14:00', disembark: '27 sep, 12:00' },
  { id: 'RS-4310', boatId: 'kalua-day-sailer', guest: 'Mario Diaz', guestTrips: 4, pax: 2, dates: '28 – 30 ago', days: 3, status: 'EN_NAVEGACION', embark: '28 ago, 09:00', disembark: '30 ago, 18:00', realDeparture: '28 ago, 09:12' },
  { id: 'RS-4188', boatId: 'ocean-whisper', guest: 'Ana Torres', guestTrips: 1, pax: 5, dates: '12 – 14 jul', days: 3, status: 'PENDIENTE_PAGO', embark: '12 jul, 10:00', disembark: '14 jul, 16:00' },
  { id: 'RS-4120', boatId: 'lagoon-46', guest: 'Sofía Páez', guestTrips: 7, pax: 6, dates: '1 – 3 ago', days: 3, status: 'CONFIRMADA', phase: 'CORTESIA', toleranceSeconds: 765, embark: '1 ago, 14:00', disembark: '3 ago, 12:00' },
  { id: 'RS-4098', boatId: 'ocean-whisper', guest: 'Diego Ramos', guestTrips: 2, pax: 4, dates: '30 jul', days: 1, status: 'CONFIRMADA', phase: 'CORTESIA_CUMPLIDA', minutesLate: 35, embark: '30 jul, 14:00', disembark: '30 jul, 20:00' },
  { id: 'RS-4021', boatId: 'sunset-catamaran', guest: 'Carlos Ruiz', guestTrips: 3, pax: 4, dates: '10 – 12 sep', days: 3, status: 'CANCELADA', embark: '10 sep, 10:00', disembark: '12 sep, 12:00', cancelNote: 'Cancelación por anfitrión' },
  { id: 'RS-3977', boatId: 'sunset-catamaran', guest: 'Laura Gomez', guestTrips: 12, pax: 3, dates: '20 – 22 jun', days: 3, status: 'COMPLETADA', realDeparture: '20 jun, 14:38', realArrival: '22 jun, 12:15', embark: '20 jun, 14:00', disembark: '22 jun, 12:00',
    claim: { text: 'El timón llegó dañado y hubo 3h de retraso en la entrega del barco. Solicito la retención del depósito completo.', sentAt: '27 sep, 13:02', status: 'PENDIENTE' } },
].map(pricedReservation)

export const RESERVATION_STATUS_UI = {
  CONFIRMADA: { label: 'Confirmada', tone: 'confirmed' },
  EN_NAVEGACION: { label: 'En navegación', tone: 'ongoing' },
  PENDIENTE_PAGO: { label: 'Pendiente de pago', tone: 'pending' },
  CANCELADA: { label: 'Cancelada', tone: 'canceled' },
  COMPLETADA: { label: 'Completada', tone: 'completed' },
}

// Disputas precargadas (más las que cree el propietario al reportar un reclamo)
export const SEED_DISPUTES = [
  { id: 'D-2014', reservationId: 'RS-3977', code: 'RSV-2026-08341', boatName: 'Sunset Sailing Catamarán', guest: 'Laura Gómez', host: 'Cap. Marina', claim: 'El timón llegó dañado y hubo 3h de retraso en la entrega del barco.', closing: 'Sin novedades reportadas por el Arrendatario al momento de la entrega.', status: 'PENDIENTE', hoursLeft: 14 },
  { id: 'D-2011', reservationId: null, code: 'RSV-2026-08102', boatName: 'Ocean Whisper Motor Yacht', guest: 'Ana Torres', host: 'Cap. Rivera', claim: 'Daño en la cubierta de proa tras el viaje; se solicita retención parcial del depósito.', closing: 'El arrendatario indicó "todo en orden" en el check-out.', status: 'PENDIENTE', hoursLeft: 20 },
  { id: 'D-2009', reservationId: null, code: 'RSV-2026-07977', boatName: 'Kalua Day Sailer', guest: 'Mario Díaz', host: 'Cap. Kalua', claim: 'Faltaron dos chalecos salvavidas al devolver la embarcación.', closing: 'Sin novedades reportadas por el Arrendatario al momento de la entrega.', status: 'EN_REVISION', hoursLeft: 6 },
]
export const RESOLVED_BASE = 9
