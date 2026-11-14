import { Navigate, useRoutes, type RouteObject } from 'react-router'

import { JobEditorIndex } from '../features/jobs/JobEditorIndex'
import { WorkspaceLayout } from '../layouts/WorkspaceLayout'
import {
  DashboardPage,
  JobDataPage,
  JobEditPage,
  OperationsPage,
  SkillListPage,
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
      { path: 'class', element: <JobDataPage /> },
      { path: 'class/editor', element: <JobEditorIndex /> },
      { path: 'class/edit/:jobId', element: <JobEditPage /> },
      { path: 'skill', element: <SkillListPage /> },
      { path: 'skill/editor', element: null },
      { path: 'skill/image', element: null },
      { path: 'operations', element: <OperationsPage /> },
      { path: '*', element: <DashboardPage /> }
    ]
  }
]

export function AppRoutes(): React.JSX.Element | null {
  return useRoutes(routes)
}
