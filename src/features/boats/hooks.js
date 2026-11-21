import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

const KEY = ['m1']

export const useOwnerVessels = () => useQuery({ queryKey: [...KEY, 'owner-vessels'], queryFn: api.listOwnerVessels })
export const useAllVessels = (filters) => useQuery({ queryKey: [...KEY, 'all-vessels', filters], queryFn: () => api.listAllVessels(filters) })
export const useVessel = (id, { admin = false } = {}) => useQuery({ queryKey: [...KEY, 'vessel', admin, id], queryFn: () => api.getVessel(id, { admin }), retry: false })
export const useFleetOwners = () => useQuery({ queryKey: [...KEY, 'owners'], queryFn: api.listFleetOwners })
export const useOwner = (id) => useQuery({ queryKey: [...KEY, 'owner', id], queryFn: () => api.getOwner(id), retry: false })
export const useBoatTypes = () => useQuery({ queryKey: [...KEY, 'boat-types'], queryFn: api.listBoatTypes, staleTime: Infinity })
export const useDraft = () => useQuery({ queryKey: [...KEY, 'draft'], queryFn: api.getDraft, staleTime: 0, gcTime: 0 })

function useVesselMutation(fn) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) })
}

export const useUpdateVessel = () => useVesselMutation(({ id, changes }) => api.updateVessel(id, changes))
export const useSetMaintenance = () => useVesselMutation(({ id, ...options }) => api.setMaintenance(id, options))
export const useRequestReview = () => useVesselMutation((id) => api.requestMaintenanceReview(id))
export const useDeleteVessel = () => useVesselMutation(({ id, ...options }) => api.deleteVessel(id, options))
export const useCreateDraft = () => useVesselMutation((data) => api.createDraft(data))
export const useDeleteDraft = () => useVesselMutation(() => api.deleteDraft())
export const useCompleteRegistration = () => useVesselMutation(({ id, data }) => api.completeRegistration(id, data))
