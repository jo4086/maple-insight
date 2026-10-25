import { Navigate, useRoutes, type RouteObject } from 'react-router'

import { WorkspaceLayout } from '../layouts/WorkspaceLayout'
import {
  DashboardPage,
  OperationsPage,
  UploadPage,
  VersionedDataPage,
  VersionListPage
} from '../pages/WorkspacePages'

const routes: RouteObject[] = [
  {
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'version-list', element: <VersionListPage /> },
      { path: 'compare', element: null },
      { path: 'compare-results', element: <Navigate replace to="/compare" /> },
      { path: 'equipment', element: <VersionedDataPage kind="equipment" /> },
      { path: 'class', element: <VersionedDataPage kind="class" /> },
      { path: 'operations', element: <OperationsPage /> },
      { path: '*', element: <DashboardPage /> }
    ]
  }
]

export function AppRoutes(): React.JSX.Element | null {
  return useRoutes(routes)
}
