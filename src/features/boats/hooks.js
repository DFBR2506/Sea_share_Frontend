import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

const KEY = ['m1']

export const useOwnerVessels = () => useQuery({ queryKey: [...KEY, 'owner-vessels'], queryFn: api.listOwnerVessels })
export const useAllVessels = () => useQuery({ queryKey: [...KEY, 'all-vessels'], queryFn: api.listAllVessels })
export const useVessel = (id) => useQuery({ queryKey: [...KEY, 'vessel', id], queryFn: () => api.getVessel(id) })
export const useOwners = () => useQuery({ queryKey: [...KEY, 'owners'], queryFn: api.listOwners })
export const useOwner = (id) => useQuery({ queryKey: [...KEY, 'owner', id], queryFn: () => api.getOwner(id) })

function useVesselMutation(fn) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) })
}

export const useUpdateVessel = () => useVesselMutation(({ id, changes }) => api.updateVessel(id, changes))
export const useSetMaintenance = () => useVesselMutation(({ id, on, reason }) => api.setMaintenance(id, on, reason))
export const useDeleteVessel = () => useVesselMutation((id) => api.deleteVessel(id))
export const useCreateVessel = () => useVesselMutation((data) => api.createVessel(data))
