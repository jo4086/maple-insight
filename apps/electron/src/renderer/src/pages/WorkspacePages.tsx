import { useNavigate } from 'react-router'

import { useWorkspace } from '../app/WorkspaceContext'
import { CompareView } from '../features/compare/CompareView'
import { Dashboard } from '../features/dashboard/Dashboard'
import { VersionedDataView } from '../features/data-management/VersionedDataView'
import type { View } from '../features/navigation/model'
import { OperationsView } from '../features/operations/OperationsView'
import { UploadView } from '../features/upload/UploadView'
import { VersionListView } from '../features/version/VersionListView'
import { viewPaths } from '../routes/paths'

export function DashboardPage(): React.JSX.Element {
  const { version } = useWorkspace()
  const navigate = useNavigate()
  return <Dashboard {...version} onNavigate={(view: View) => navigate(viewPaths[view])} />
}

export function UploadPage(): React.JSX.Element {
  const { dataImport } = useWorkspace()
  return (
    <UploadView
      directory={dataImport.directory}
      isConverting={dataImport.activeConversionId !== null}
      conversionProgress={dataImport.conversionProgress}
      conversionResult={dataImport.conversionResult}
      targetVersion={dataImport.targetVersion}
      releasedOn={dataImport.releasedOn}
      onReleasedOnChange={dataImport.setReleasedOn}
      onOpen={dataImport.open}
      onConvert={dataImport.convert}
      onCancelConversion={dataImport.cancel}
    />
  )
}

export function VersionListPage(): React.JSX.Element {
  const { version, versionActions } = useWorkspace()
  return (
    <VersionListView
      currentVersion={version.currentVersion}
      registeredVersions={version.registeredVersions}
      versionStatus={version.versionStatus}
      onUpdateReleasedOn={versionActions.updateReleasedOn}
      onCopyVersion={versionActions.copy}
      onDeleteVersion={versionActions.remove}
    />
  )
}

export function VersionedDataPage({ kind }: { kind: 'equipment' | 'class' }): React.JSX.Element {
  const { version } = useWorkspace()
  return (
    <VersionedDataView
      kind={kind}
      versions={version.versions}
      currentVersion={version.currentVersion}
      onCurrentVersionChange={version.changeCurrentVersion}
    />
  )
}

export function OperationsPage(): React.JSX.Element {
  const { version, validation } = useWorkspace()
  return (
    <OperationsView
      currentVersion={version.currentVersion}
      isValidating={validation.activeValidationId !== null}
      activeValidationVersion={validation.activeValidationVersion}
      validationProgress={validation.validationProgress}
      validationResult={validation.validationResult}
      onValidate={validation.validate}
      onCancelValidation={validation.cancel}
      onUpdateWarning={validation.updateWarning}
    />
  )
}

export function ComparePage({ view }: { view: View }): React.JSX.Element {
  const { version } = useWorkspace()
  return (
    <div className="h-full" hidden={view !== 'compare'}>
      <CompareView {...version} />
    </div>
  )
}
