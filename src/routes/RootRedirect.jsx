import { Navigate } from 'react-router-dom'
import { HOME_BY_ROLE } from '@/lib/roles'
import { useSession } from '@/lib/sessionContext'

export default function RootRedirect() {
  const { role } = useSession()
  return <Navigate to={role ? HOME_BY_ROLE[role] : '/login'} replace />
}
