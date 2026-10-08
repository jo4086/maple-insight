import { useEffect, useRef, useState } from 'react'

import { AppShell } from '../components/layout/AppShell'
import { CompareView } from '../features/compare/CompareView'
import { Dashboard } from '../features/dashboard/Dashboard'
import { VersionedDataView } from '../features/data-management/VersionedDataView'
import type { View } from '../features/navigation/model'
import { OperationsView } from '../features/operations/OperationsView'
import { formatLocalDate } from '../features/upload/release-date'
import { UploadView } from '../features/upload/UploadView'
import { useVersionSelection } from '../features/version/model'
import { getErrorMessage } from '../shared/lib/error-message'
import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionResult,
  DataDirectoryInfo
} from '../shared/types/data-file'

function App(): React.JSX.Element {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  )
  const [view, setView] = useState<View>('overview')
  const [directory, setDirectory] = useState<DataDirectoryInfo | null>(null)
  const [releasedOn, setReleasedOn] = useState('')
  const [activeConversionId, setActiveConversionId] = useState<string | null>(null)
  const activeConversionIdRef = useRef<string | null>(null)
  const [conversionProgress, setConversionProgress] =
    useState<DataDirectoryConversionProgress | null>(null)
  const [conversionResult, setConversionResult] = useState<DataDirectoryConversionResult | null>(
    null
  )
  const [error, setError] = useState('')
  const [screenshotMessage, setScreenshotMessage] = useState('')
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false)
  const version = useVersionSelection(setError)
  const importTargetVersion =
    directory && /^\d+\.\d+\.\d+$/.test(directory.name) ? directory.name : version.currentVersion

  useEffect(
    () =>
      window.api.onDataDirectoryConversionProgress((progress) => {
        if (progress.sessionId === activeConversionIdRef.current) {
          setConversionProgress(progress)
        }
      }),
    []
  )

  useEffect(
    () =>
      window.api.onScreenshotCaptured((event) => {
        if (event.status === 'success') {
          setScreenshotMessage(`스크린샷 저장: ${event.result.path}`)
          return
        }

        setError(event.message)
      }),
    []
  )

  const openDataDirectory = async (): Promise<void> => {
    try {
      setError('')
      const selected = await window.api.openDataDirectory()
      if (selected) {
        setDirectory(selected)
        setConversionProgress(null)
        setConversionResult(null)
        setReleasedOn(formatLocalDate(new Date()))
      }
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  const convertDirectory = async (): Promise<void> => {
    if (!directory || !importTargetVersion || activeConversionIdRef.current) return

    const sessionId = crypto.randomUUID()
    activeConversionIdRef.current = sessionId
    setActiveConversionId(sessionId)
    setConversionProgress(null)
    setConversionResult(null)
    setError('')

    try {
      const result = await window.api.convertDataDirectory({
        sessionId,
        directoryPath: directory.path,
        targetVersion: importTargetVersion,
        releasedOn: releasedOn || null
      })

      if (activeConversionIdRef.current === sessionId) {
        setConversionResult(result)

        if (result.status === 'success') {
          await version.refreshVersions(result.summary.targetVersion)
        }
      }
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      if (activeConversionIdRef.current === sessionId) {
        activeConversionIdRef.current = null
        setActiveConversionId(null)
      }
    }
  }

  const cancelConversion = async (): Promise<void> => {
    if (!activeConversionId) return
    await window.api.cancelDataFileConversion(activeConversionId)
  }

  const captureScreenshot = async (): Promise<void> => {
    setIsCapturingScreenshot(true)
    setScreenshotMessage('')

    try {
      const result = await window.api.captureScreenshot()
      setScreenshotMessage(`스크린샷 저장: ${result.path}`)
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setIsCapturingScreenshot(false)
    }
  }

  const toggleTheme = (): void => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem('maple-insight-theme', nextTheme)
    setTheme(nextTheme)
  }

  return (
    <AppShell
      view={view}
      currentVersion={version.currentVersion}
      versions={version.versions}
      onNavigate={setView}
      onCurrentVersionChange={version.changeCurrentVersion}
      onCaptureScreenshot={captureScreenshot}
      isCapturingScreenshot={isCapturingScreenshot}
      theme={theme}
      onToggleTheme={toggleTheme}
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
      {screenshotMessage && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-app-accent-border bg-app-accent-bg px-3.5 py-3 text-small text-app-accent">
          <span className="truncate">{screenshotMessage}</span>
          <button
            className="border-0 bg-transparent text-inherit"
            onClick={() => setScreenshotMessage('')}
          >
            ×
          </button>
        </div>
      )}
      {view === 'overview' && <Dashboard {...version} onNavigate={setView} />}
      {view === 'upload' && (
        <UploadView
          directory={directory}
          isConverting={activeConversionId !== null}
          conversionProgress={conversionProgress}
          conversionResult={conversionResult}
          targetVersion={importTargetVersion}
          releasedOn={releasedOn}
          onReleasedOnChange={setReleasedOn}
          onOpen={openDataDirectory}
          onConvert={convertDirectory}
          onCancelConversion={cancelConversion}
        />
      )}
      {view === 'compare' && <CompareView {...version} />}
      {view === 'equipment' && (
        <VersionedDataView
          kind="equipment"
          versions={version.versions}
          currentVersion={version.currentVersion}
          onCurrentVersionChange={version.changeCurrentVersion}
        />
      )}
      {view === 'class' && (
        <VersionedDataView
          kind="class"
          versions={version.versions}
          currentVersion={version.currentVersion}
          onCurrentVersionChange={version.changeCurrentVersion}
        />
      )}
      {view === 'operations' && <OperationsView currentVersion={version.currentVersion} />}
    </AppShell>
  )
}

export default App
