import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { getBoat, getReservation, listBoats, listReservations } from './api'

export const useBoats = () => useQuery({ queryKey: ['m2', 'boats'], queryFn: listBoats })
export const useBoat = (id) => useQuery({ queryKey: ['m2', 'boat', id], queryFn: () => getBoat(id) })
export const useReservations = () => useQuery({ queryKey: ['m2', 'reservations'], queryFn: listReservations })
export const useReservation = (id) => useQuery({ queryKey: ['m2', 'reservation', id], queryFn: () => getReservation(id) })

export const useOwnerReservations = () => useQuery({ queryKey: ['m2', 'owner-reservations'], queryFn: api.listOwnerReservations })
export const useOwnerReservation = (id) => useQuery({ queryKey: ['m2', 'owner-reservation', id], queryFn: () => api.getOwnerReservation(id) })
export const useDisputes = () => useQuery({ queryKey: ['m2', 'disputes'], queryFn: api.listDisputes })

function useM2Mutation(fn) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['m2'] }) })
}
export const useStartNavigation = () => useM2Mutation(api.startNavigation)
export const useEndNavigation = () => useM2Mutation(api.endNavigation)
export const useMarkNoShow = () => useM2Mutation(api.markNoShow)
export const useCancelByHost = () => useM2Mutation(({ id, ...data }) => api.cancelByHost(id, data))
export const useSubmitClaim = () => useM2Mutation(({ id, text }) => api.submitClaim(id, text))
export const useResolveDispute = () => useM2Mutation(({ id, ...data }) => api.resolveDispute(id, data))
