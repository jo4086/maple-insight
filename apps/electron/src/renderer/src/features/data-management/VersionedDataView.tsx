import { EmptyState } from '../../components/ui/EmptyState'
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

  return (
    <>
      <div className="mb-3 flex justify-end">
        <VersionSelect
          compact
          label="표시 버전"
          value={currentVersion}
          versions={versions}
          onChange={onCurrentVersionChange}
        />
      </div>
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
