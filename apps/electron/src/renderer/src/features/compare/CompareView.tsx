import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { VersionSelect } from '../../components/ui/VersionSelect'
import type { VersionContextValue } from '../version/model'

export function CompareView({
  versions,
  currentVersion,
  compareVersion,
  changeCurrentVersion,
  changeCompareVersion
}: VersionContextValue): React.JSX.Element {
  return (
    <>
      <PageHeader
        eyebrow="VERSION DIFF"
        title="버전 비교"
        description="선택한 두 버전의 추가, 수정, 삭제 데이터를 비교합니다."
      />
      <section className="flex items-center justify-center gap-3 rounded-[10px] border border-app-border bg-app-surface p-7 [&_label]:min-w-[240px]">
        <VersionSelect
          label="비교 기준"
          value={compareVersion}
          versions={versions}
          excludedVersion={currentVersion}
          onChange={changeCompareVersion}
        />
        <div className="grid min-w-[76px] justify-items-center gap-1 text-app-accent">
          <span className="font-mono text-micro tracking-[0.13em] text-app-muted">DIFF</span>
          <strong className="text-[19px]">→</strong>
        </div>
        <VersionSelect
          label="현재 작업 버전"
          value={currentVersion}
          versions={versions}
          onChange={changeCurrentVersion}
        />
      </section>
      <EmptyState
        symbol="DIFF"
        title={`${compareVersion} → ${currentVersion}`}
        description="데이터 로더를 연결하면 도메인별 추가, 수정, 삭제 결과가 이곳에 표시됩니다."
      />
    </>
  )
}
