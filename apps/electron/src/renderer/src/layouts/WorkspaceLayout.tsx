import { Outlet, useLocation, useNavigate } from 'react-router'

import { useWorkspace } from '../app/WorkspaceContext'
import { AppShell } from '../components/layout/AppShell'
import { ComparePage } from '../pages/WorkspacePages'
import { viewFromPath, viewPaths } from '../routes/paths'

export function WorkspaceLayout(): React.JSX.Element {
  const { version, screenshot, appearance, error, setError } = useWorkspace()
  const navigate = useNavigate()
  const view = viewFromPath(useLocation().pathname)

  return (
    <AppShell
      layout={view === 'compare' ? 'workspace' : 'default'}
      view={view}
      currentVersion={version.currentVersion}
      versions={version.versions}
      onNavigate={(nextView) => navigate(viewPaths[nextView])}
      onCurrentVersionChange={version.changeCurrentVersion}
      onCaptureScreenshot={screenshot.capture}
      isCapturingScreenshot={screenshot.isCapturing}
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
      {screenshot.message && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-app-accent-border bg-app-accent-bg px-3.5 py-3 text-small text-app-accent">
          <span className="truncate">{screenshot.message}</span>
          <button
            className="border-0 bg-transparent text-inherit"
            onClick={() => screenshot.setMessage('')}
          >
            ×
          </button>
        </div>
      )}
      <Outlet />
      <ComparePage view={view} />
    </AppShell>
  )
}
