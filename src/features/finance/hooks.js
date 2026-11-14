import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isUUID } from '@/lib/uuid'
import * as api from './api'

export const useRecords = (args) => useQuery({ queryKey: ['m3', 'records', args], queryFn: () => api.listRecords(args), placeholderData: keepPreviousData })
export const useReport = (args) => useQuery({ queryKey: ['m3', 'report', args], queryFn: () => api.getReport(args), placeholderData: keepPreviousData })
export const useParams3 = () => useQuery({ queryKey: ['m3', 'params'], queryFn: api.getParams })
export const useExportReport = () => useMutation({ mutationFn: api.exportReport })

// UC01 · lote para la exploración: una consulta sirve a todas las tarjetas y se refresca al
// guardar parámetros (la invalidación de ['m3'] la alcanza).
export const useEstimateBatch = (boatIds) => useQuery({
  queryKey: ['m3', 'estimates-batch', boatIds],
  queryFn: () => api.estimateBatch(boatIds),
  enabled: boatIds.length > 0,
  placeholderData: keepPreviousData,
})

// UC02 · estimación individual: la clave cambia con la selección, así la respuesta de una
// selección anterior se ignora y la petición en curso se aborta con la señal del query.
export const useEstimate = (args) => useQuery({
  queryKey: ['m3', 'estimate', args.boatId, args.startDate, args.endDate, args.passengers],
  queryFn: ({ signal }) => api.estimateIndividual(args, signal),
  enabled: !!args.boatId && !!args.startDate && !!args.endDate && args.passengers >= 1,
})

// UC04 · desglose registrado de la reserva. El POST deja los montos listos para el cobro:
// staleTime infinito para no recalcular al re-montar el panel o al recuperar el foco.
export const useReservationValue = (reservationId) => useQuery({
  queryKey: ['m3', 'reservation-value', reservationId],
  queryFn: () => api.getReservationValue(reservationId),
  enabled: isUUID(reservationId),
  staleTime: Infinity,
})

// UC06 · confirmación de pago de la reserva; se actualiza con el botón de la pantalla.
export const usePaymentConfirmation = (reservationId) => useQuery({
  queryKey: ['m3', 'payment-confirmation', reservationId],
  queryFn: ({ signal }) => api.getPaymentConfirmation(reservationId, signal),
  enabled: isUUID(reservationId),
})

function useM3Mutation(fn) {
  const qc = useQueryClient()
  // Al guardar parámetros se invalida todo M3: estimaciones, informes y desgloses dependen de ellos.
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['m3'] }) })
}
export const useSaveParams = () => useM3Mutation(api.saveParams)
