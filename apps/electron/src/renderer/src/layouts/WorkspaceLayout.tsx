import { Outlet, useLocation, useNavigate } from 'react-router'

import { useWorkspace } from '../app/WorkspaceContext'
import { AppShell } from '../components/layout/AppShell'
import { ComparePage } from '../pages/WorkspacePages'
import { viewFromPath, viewPaths } from '../routes/paths'

export function WorkspaceLayout(): React.JSX.Element {
  const { version, notifications, screenshot, appearance, navigationGuard, error, setError } =
    useWorkspace()
  const navigate = useNavigate()
  const view = viewFromPath(useLocation().pathname)
  const navigateWithGuard = (path: string): void => {
    if (!navigationGuard || window.confirm(navigationGuard)) navigate(path)
  }

  return (
    <AppShell
      layout={
        view === 'compare'
          ? 'workspace'
          : view === 'class' || view === 'class-editor'
            ? 'document'
            : 'default'
      }
      view={view}
      currentVersion={version.currentVersion}
      versions={version.versions}
      onNavigate={(nextView) => navigateWithGuard(viewPaths[nextView])}
      onCurrentVersionChange={(nextVersion) => {
        if (!navigationGuard || window.confirm(navigationGuard))
          version.changeCurrentVersion(nextVersion)
      }}
      onCaptureScreenshot={screenshot.capture}
      isCapturingScreenshot={screenshot.isCapturing}
      notifications={notifications.items}
      unreadNotificationCount={notifications.unreadCount}
      isNotificationsOpen={notifications.isOpen}
      onToggleNotifications={notifications.toggle}
      onCloseNotifications={notifications.close}
      onDismissNotification={notifications.dismiss}
      onClearNotifications={notifications.clear}
      theme={appearance.theme}
      onToggleTheme={appearance.toggleTheme}
    >
      {error && (
        <div
          className="mb-5 flex justify-between rounded-lg border border-app-danger-border bg-app-danger-bg px-3.5 py-3 text-small text-app-danger"
          role="alert"
        >
          {error}
          <button className="border-0 bg-transparent text-inherit" onClick={() => setError('')}>
            ×
          </button>
        </div>
      )}
      <Outlet />
      <ComparePage view={view} />
    </AppShell>
  )
}
