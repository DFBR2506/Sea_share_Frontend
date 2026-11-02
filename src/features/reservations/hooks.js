import { useQuery } from '@tanstack/react-query'
import { getBoat, getReservation, listBoats, listReservations } from './api'

export const useBoats = () => useQuery({ queryKey: ['m2', 'boats'], queryFn: listBoats })
export const useBoat = (id) => useQuery({ queryKey: ['m2', 'boat', id], queryFn: () => getBoat(id) })
export const useReservations = () => useQuery({ queryKey: ['m2', 'reservations'], queryFn: listReservations })
export const useReservation = (id) => useQuery({ queryKey: ['m2', 'reservation', id], queryFn: () => getReservation(id) })
