import { useState } from 'react'

import { useNotifications } from '../features/notifications/useNotifications'
import { useValidation } from '../features/operations/useValidation'
import { useScreenshot } from '../features/screenshot/useScreenshot'
import { useDataImport } from '../features/upload/useDataImport'
import { useVersionSelection } from '../features/version/model'
import { createVersionActions } from '../features/version/version-actions'
import { AppRoutes } from '../routes/AppRoutes'

import { useTheme } from './useTheme'
import { WorkspaceContext } from './WorkspaceContext'

export function AppWorkspace(): React.JSX.Element {
  const [error, setError] = useState('')
  const [navigationGuard, setNavigationGuard] = useState('')
  const version = useVersionSelection(setError)
  const dataImport = useDataImport(version.currentVersion, version.refreshVersions, setError)
  const validation = useValidation(version.currentVersion, setError)
  const versionActions = createVersionActions(version.refreshVersions)
  const notifications = useNotifications()
  const screenshot = useScreenshot(notifications.push, notifications.close)
  const appearance = useTheme()

  return (
    <WorkspaceContext.Provider
      value={{
        version,
        dataImport,
        validation,
        versionActions,
        notifications,
        screenshot,
        appearance,
        navigationGuard,
        setNavigationGuard,
        error,
        setError
      }}
    >
      <AppRoutes />
    </WorkspaceContext.Provider>
  )
}
