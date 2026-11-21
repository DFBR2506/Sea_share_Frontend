import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

const KEY = ['m1', 'notifications']
export const REFRESH_MS = 60000

/** Avisos del usuario con sesión: se refrescan al entrar y cada minuto. */
export const useNotifications = (enabled = true) => useQuery({
  queryKey: KEY,
  queryFn: api.listNotifications,
  enabled,
  refetchInterval: REFRESH_MS,
  retry: false,
})

function useNotificationMutation(fn, optimistic) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    // La lista se actualiza al instante y se vuelve a pedir al servidor por si algo falló.
    onMutate: (variables) => qc.setQueryData(KEY, (data) => (data ? optimistic(data, variables) : data)),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export const useMarkRead = () => useNotificationMutation(api.markRead, (data, id) => ({
  items: data.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
  unread: Math.max(0, data.unread - (data.items.find((i) => i.id === id)?.read ? 0 : 1)),
}))

export const useMarkAllRead = () => useNotificationMutation(api.markAllRead, (data) => ({
  items: data.items.map((item) => ({ ...item, read: true })),
  unread: 0,
}))
