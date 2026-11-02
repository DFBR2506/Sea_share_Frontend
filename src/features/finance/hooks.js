import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

export const useRecords = (args) => useQuery({ queryKey: ['m3', 'records', args], queryFn: () => api.listRecords(args), placeholderData: keepPreviousData })
export const useReport = (args) => useQuery({ queryKey: ['m3', 'report', args], queryFn: () => api.getReport(args), placeholderData: keepPreviousData })
export const useParams3 = () => useQuery({ queryKey: ['m3', 'params'], queryFn: api.getParams })
export const useAccounts = () => useQuery({ queryKey: ['m3', 'accounts'], queryFn: api.getAccounts })

function useM3Mutation(fn) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['m3'] }) })
}
export const useSaveParams = () => useM3Mutation(api.saveParams)
export const useWithdraw = () => useM3Mutation(api.withdraw)
