import { createBrowserRouter } from 'react-router-dom'
import ComponentCatalog from '@/pages/dev/ComponentCatalog'

export const router = createBrowserRouter([
  { path: '/dev/components', element: <ComponentCatalog /> },
])
