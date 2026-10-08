import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { VersionSelect } from '../../components/ui/VersionSelect'

export function VersionedDataView({
  kind,
  currentVersion,
  versions,
  onCurrentVersionChange
}: {
  kind: 'equipment' | 'class'
  currentVersion: string
  versions: string[]
  onCurrentVersionChange: (version: string) => void
}): React.JSX.Element {
  const isEquipment = kind === 'equipment'
  const title = isEquipment ? '장비 데이터' : '직업 데이터'
  const description = isEquipment
    ? '장비와 잠재옵션을 검색하고 선택한 버전의 작업본을 관리합니다.'
    : '직업 코드와 계열, 전직 차수를 선택한 버전을 기준으로 관리합니다.'

  return (
    <>
      <PageHeader
        eyebrow={`${isEquipment ? 'EQUIPMENT' : 'CLASS'} · ${currentVersion}`}
        title={title}
        description={description}
        action={
          <VersionSelect
            label="표시 버전"
            value={currentVersion}
            versions={versions}
            onChange={onCurrentVersionChange}
          />
        }
      />
      <section className="flex items-center justify-between gap-8 rounded-md border-l-[3px] border-app-accent bg-app-accent-bg px-5 py-4">
        <div>
          <span className="block text-caption text-app-muted">현재 데이터 컨텍스트</span>
          <strong className="mt-1 block font-mono text-[15px] font-bold text-app-accent">
            {currentVersion}
          </strong>
        </div>
        <p className="m-0 text-small text-app-muted">
          검색, 수정, 삭제 및 이후 DB 작업은 모두 이 버전을 대상으로 실행됩니다.
        </p>
      </section>
      <EmptyState
        symbol={isEquipment ? 'ITEM' : 'JOB'}
        title={`${currentVersion} ${title} 로더 연결 대기`}
        description="선택 버전이 바뀌면 이 화면의 조회 데이터와 편집 작업본도 함께 전환됩니다."
      />
    </>
  )
}
