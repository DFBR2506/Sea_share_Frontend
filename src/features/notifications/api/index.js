import { request } from '@/lib/http'

// Avisos de M1: eliminación de embarcación, mantenimiento del administrador, solicitudes de
// revisión del propietario y vuelta a disponible.
const NOTIFICATIONS = '/api/v1/notifications'

const mapNotification = (item) => ({
  id: item.notification_id,
  type: item.type,
  message: item.message ?? '',
  read: Boolean(item.read),
  createdAt: item.created_at ?? '',
  vesselId: item.vessel_id ?? null,
})

export const listNotifications = () => request('m1', NOTIFICATIONS).then((data) => ({
  items: (data.notifications ?? []).map(mapNotification),
  unread: data.unread_count ?? 0,
}))

export const markRead = (id) => request('m1', `${NOTIFICATIONS}/${encodeURIComponent(id)}/read`, { method: 'PATCH' })
export const markAllRead = () => request('m1', `${NOTIFICATIONS}/read-all`, { method: 'PATCH' })
