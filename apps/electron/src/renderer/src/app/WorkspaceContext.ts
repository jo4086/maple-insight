import { createContext, useContext } from 'react'

import type { useNotifications } from '../features/notifications/useNotifications'
import type { useValidation } from '../features/operations/useValidation'
import type { useScreenshot } from '../features/screenshot/useScreenshot'
import type { useDataImport } from '../features/upload/useDataImport'
import type { VersionContextValue } from '../features/version/model'
import type { createVersionActions } from '../features/version/version-actions'

import type { useTheme } from './useTheme'

export type WorkspaceContextValue = {
  version: VersionContextValue
  dataImport: ReturnType<typeof useDataImport>
  validation: ReturnType<typeof useValidation>
  versionActions: ReturnType<typeof createVersionActions>
  notifications: ReturnType<typeof useNotifications>
  screenshot: ReturnType<typeof useScreenshot>
  appearance: ReturnType<typeof useTheme>
  navigationGuard: string
  setNavigationGuard: (message: string) => void
  error: string
  setError: (message: string) => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace(): WorkspaceContextValue {
  const workspace = useContext(WorkspaceContext)
  if (!workspace) throw new Error('Workspace context is unavailable')
  return workspace
}
