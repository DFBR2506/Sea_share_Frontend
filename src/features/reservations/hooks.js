import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { getBoat, getReservation, listBoats, listReservations } from './api'
import { sessionIdentity } from '@/lib/sessionIdentity'

const identityKey = () => { const { userId, role } = sessionIdentity(); return [role, userId] }

export const useBoats = () => useQuery({ queryKey: ['m2', 'boats'], queryFn: listBoats })
export const useBoat = (id) => useQuery({ queryKey: ['m2', 'boat', id], queryFn: ({ signal }) => getBoat(id, { signal }), enabled: Boolean(id !== undefined && id !== null && id !== '') })
export const useReservations = () => useQuery({ queryKey: ['m2', 'reservations', ...identityKey()], queryFn: listReservations, refetchInterval: 30000 })
export const useReservation = (id) => useQuery({ queryKey: ['m2', 'reservation', id, ...identityKey()], queryFn: () => getReservation(id) })

export const useOwnerReservations = () => useQuery({ queryKey: ['m2', 'owner-reservations', ...identityKey()], queryFn: api.listOwnerReservations })
export const useOwnerReservation = (id) => useQuery({ queryKey: ['m2', 'owner-reservation', id, ...identityKey()], queryFn: () => api.getOwnerReservation(id) })
export const useDisputes = () => useQuery({ queryKey: ['m2', 'disputes', ...identityKey()], queryFn: api.listDisputes, refetchInterval: 15000, retry: false })
export const useDispute = (id) => useQuery({ queryKey: ['m2', 'dispute', id, ...identityKey()], queryFn: ({ signal }) => api.getDispute(id, { signal }), enabled: Boolean(id), retry: false, refetchInterval: 15000 })

function useM2Mutation(fn) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['m2'] }) })
}
export const useStartNavigation = () => useM2Mutation(api.startNavigation)
export const useEndNavigation = () => useM2Mutation(api.endNavigation)
export const useMarkNoShow = () => useM2Mutation(api.markNoShow)
export const useCancelByHost = () => useM2Mutation(({ id, ...data }) => api.cancelByHost(id, data))
export const useSubmitClaim = () => useM2Mutation(({ id, ...claim }) => api.submitClaim(id, claim))
export const useResolveDispute = () => useM2Mutation(({ id, ...data }) => api.resolveDispute(id, data))
