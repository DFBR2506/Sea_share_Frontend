import { mapReservationStatus } from './statusMap'
import { formatRange, monthName } from '../../../lib/dates'

const dateParts = (value) => {
  const parts = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (!parts) return null
  const [, month, day] = parts[1].split('-')
  return { date: parts[1], time: parts[2], getMonth: () => Number(month) - 1, getDate: () => Number(day) }
}
const shortDate = (parts) => parts ? `${parts.getDate()} ${monthName(parts.getMonth()).slice(0, 3)}` : ''
const itineraryTime = (value) => {
  const parts = dateParts(value)
  return parts ? `${shortDate(parts)}, ${parts.time}` : ''
}
const reservationRange = (start, end) => {
  const a = dateParts(start)
  const b = dateParts(end)
  if (!a || !b) return shortDate(a ?? b)
  return a.date === b.date ? shortDate(a) : formatRange(a, b)
}

export function mapReservation(reservation) {
  const itinerary = reservation.itinerary
  const dates = reservation.dates
  const payment = reservation.payment_summary
  const indicators = reservation.time_indicators
  const actions = reservation.available_actions
  const departure = itinerary?.scheduled_departure ?? dates?.start_at ?? ''
  const arrival = itinerary?.scheduled_arrival ?? dates?.end_at ?? ''
  const nights = itinerary?.duration_nights ?? dates?.duration_nights ?? 0
  const days = itinerary?.duration_days ?? dates?.duration_days ?? 0
  const elapsed = indicators?.courtesy_elapsed_minutes
  const status = mapReservationStatus(reservation.status)

  return {
    id: reservation.reservation_id,
    boatId: reservation.vessel.vessel_id,
    boatName: reservation.vessel.name ?? '',
    status,
    dates: reservationRange(departure, arrival),
    duration: nights > 0 ? `${nights} noches` : `${days} días`,
    total: reservation.total_price?.amount ?? payment?.total_paid ?? payment?.calculated_total ?? payment?.estimated_total ?? 0,
    totalPaid: payment?.total_paid ?? null,
    calculatedTotal: payment?.calculated_total ?? null,
    estimatedTotal: payment?.estimated_total ?? null,
    sectionTitle: payment?.section_title ?? null,
    clarifyingNote: payment?.clarifying_note ?? null,
    pax: itinerary?.passengers ?? reservation.passengers ?? 0,
    guest: reservation.renter?.name ?? '',
    guestTrips: reservation.renter?.previous_trips ?? 0,
    embark: itineraryTime(departure),
    disembark: itineraryTime(arrival),
    realDeparture: itineraryTime(itinerary?.actual_departure_at),
    realArrival: itineraryTime(itinerary?.actual_arrival_at),
    breakdown: {
      base: payment?.rental_amount ?? null,
      commission: 0,
      insurance: payment?.insurance_amount ?? null,
      deposit: payment?.guarantee_deposit_amount ?? null,
    },
    note: reservation.contextual_label ?? payment?.clarifying_note ?? '',
    cancelNote: status === 'CANCELADA' ? reservation.contextual_banner?.message ?? reservation.contextual_label ?? '' : '',
    cancelReason: '',
    cancelJustification: '',
    phase: status === 'CONFIRMADA'
      ? actions?.can_mark_no_show ? 'CORTESIA_CUMPLIDA' : elapsed != null ? 'CORTESIA' : 'ANTES'
      : undefined,
    minutesToDeparture: indicators?.minutes_to_departure ?? 0,
    minutesLate: elapsed ?? 0,
    toleranceSeconds: elapsed == null ? 0 : Math.max(0, 30 - elapsed) * 60,
  }
}
