import { PageHeader } from '../../components/ui/PageHeader'
import { StatusDot } from '../../components/ui/StatusDot'
import { VersionSelect } from '../../components/ui/VersionSelect'
import type { View } from '../navigation/model'
import type { VersionContextValue } from '../version/model'

const workflow = ['파일 수집', '형식 검증', '버전 비교', '변경 검토', 'DB 반영', '타입 생성']

const metricClass =
  'min-h-[121px] rounded-[9px] border border-app-border bg-linear-145 from-app-surface-2 to-app-surface p-[18px]'

export function Dashboard({
  onNavigate,
  versions,
  currentVersion,
  compareVersion,
  versionStatus,
  changeCurrentVersion,
  changeCompareVersion
}: VersionContextValue & { onNavigate: (view: View) => void }): React.JSX.Element {
  return (
    <>
      <PageHeader
        eyebrow="DATA OPERATIONS"
        title="게임 데이터 작업 공간"
        description="원본 수집부터 변경 검수와 DB 반영까지 하나의 흐름으로 관리합니다."
        action={
          <button className="action-primary" onClick={() => onNavigate('upload')}>
            새 데이터 가져오기
          </button>
        }
      />

      <section className="mb-3.5 flex items-center justify-between gap-8 rounded-[10px] border border-app-accent-border bg-linear-to-r from-app-accent-bg to-app-surface p-5 max-[1200px]:flex-col max-[1200px]:items-start">
        <div>
          <span className="page-eyebrow">VERSION CONTEXT</span>
          <h2 className="my-1.5 text-[16px] font-bold">작업할 데이터 버전</h2>
          <p className="m-0 text-small text-app-muted">
            현재 버전은 모든 데이터 탭에 적용되고, 비교 버전은 diff 기준으로 사용됩니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <VersionSelect
            label="비교 버전"
            value={compareVersion}
            versions={versions}
            excludedVersion={currentVersion}
            onChange={changeCompareVersion}
          />
          <span className="text-[16px] text-app-accent">→</span>
          <VersionSelect
            label="현재 버전"
            value={currentVersion}
            versions={versions}
            onChange={changeCurrentVersion}
          />
        </div>
      </section>

      <div className="grid grid-cols-4 gap-[13px] max-[1200px]:grid-cols-2">
        <Metric label="현재 데이터 버전" value={currentVersion} detail="모든 데이터 탭 기준" />
        <Metric label="비교 데이터 버전" value={compareVersion} detail="diff 기준" />
        <Metric
          label="DB 연결 상태"
          value={
            versionStatus === 'loading'
              ? '확인 중'
              : versionStatus === 'error'
                ? '연결 오류'
                : '정상'
          }
          detail={
            versionStatus === 'error' ? 'DB 설정과 실행 상태 확인 필요' : '버전 목록 조회 기준'
          }
          accent={versionStatus === 'ready'}
          danger={versionStatus === 'error'}
        />
        <article className={`${metricClass} border-app-accent-border from-app-accent-bg`}>
          <span className="block text-small text-app-muted">작업 모드</span>
          <strong className="my-3.5 block text-[25px] font-bold tracking-[-0.04em] text-app-accent">
            LOCAL
          </strong>
          <small className="block text-small text-app-muted">직접 배포 차단</small>
        </article>
      </div>

      <div className="mt-10 mb-4">
        <h2 className="section-title">안전한 데이터 처리 흐름</h2>
        <p className="section-description">모든 변경은 검증과 비교를 통과한 뒤 적용됩니다.</p>
      </div>
      <div className="grid grid-cols-6 rounded-[9px] border border-app-border bg-app-surface px-2.5 py-5">
        {workflow.map((label, index) => (
          <div className="relative flex flex-col items-center gap-2" key={label}>
            <span className="grid h-[29px] w-[29px] place-items-center rounded-full border border-app-accent-border bg-app-accent-bg font-mono text-caption text-app-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
            <strong className="text-small font-semibold text-app-text">{label}</strong>
            {index < workflow.length - 1 && (
              <i className="absolute top-1.5 -right-1 text-[13px] text-app-subtle not-italic">→</i>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <section className="rounded-[9px] border border-app-border bg-app-surface p-5">
          <PanelTitle title="빠른 작업" description="자주 사용하는 데이터 관리 기능" />
          <div className="grid gap-1.5">
            <QuickAction
              badge="CSV"
              title="CSV · JSON 가져오기"
              detail={`${currentVersion} 작업 공간에 등록`}
              onClick={() => onNavigate('upload')}
            />
            <QuickAction
              badge="DIFF"
              title="버전 차이 비교"
              detail={`${compareVersion} → ${currentVersion}`}
              onClick={() => onNavigate('compare')}
            />
            <QuickAction
              badge="ITEM"
              title="장비 데이터 편집"
              detail={`${currentVersion} 작업본 관리`}
              onClick={() => onNavigate('equipment')}
            />
          </div>
        </section>
        <section className="rounded-[9px] border border-app-border bg-app-surface p-5">
          <PanelTitle title="관리 기능 준비 상태" description="초기 애플리케이션 구축 현황" />
          <div className="grid gap-1.5">
            <StatusRow label="Electron 보안 경계" state="done" detail="완료" />
            <StatusRow label="버전 컨텍스트" state="done" detail="완료" />
            <StatusRow label="CSV → JSON 변환" state="progress" detail="다음 단계" />
            <StatusRow label="DB dry-run 및 승인" state="waiting" detail="대기" />
          </div>
        </section>
      </div>
    </>
  )
}

function Metric({
  label,
  value,
  detail,
  accent = false,
  danger = false
}: {
  label: string
  value: string
  detail: string
  accent?: boolean
  danger?: boolean
}): React.JSX.Element {
  return (
    <article className={metricClass}>
      <span className="block text-small text-app-muted">{label}</span>
      <strong
        className={`my-3.5 block text-[25px] font-bold tracking-[-0.04em] ${danger ? 'text-app-danger' : accent ? 'text-app-accent' : ''}`}
      >
        {value}
      </strong>
      <small className="block text-small text-app-muted">{detail}</small>
    </article>
  )
}

function PanelTitle({
  title,
  description
}: {
  title: string
  description: string
}): React.JSX.Element {
  return (
    <div className="mb-4">
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
    </div>
  )
}

function QuickAction({
  badge,
  title,
  detail,
  onClick
}: {
  badge: string
  title: string
  detail: string
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      className="grid grid-cols-[43px_1fr_auto] items-center gap-3 rounded-lg border-0 bg-app-surface-2 p-3 text-left text-app-text hover:bg-app-surface-hover"
      onClick={onClick}
    >
      <b className="grid h-[31px] w-[35px] place-items-center rounded-md bg-app-accent-bg font-mono text-micro text-app-accent">
        {badge}
      </b>
      <span>
        <strong className="block text-small font-semibold">{title}</strong>
        <small className="mt-1 block text-caption text-app-muted">{detail}</small>
      </span>
      <em className="text-[12px] text-app-subtle not-italic">→</em>
    </button>
  )
}

function StatusRow({
  label,
  state,
  detail
}: {
  label: string
  state: 'done' | 'progress' | 'waiting'
  detail: string
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[12px_1fr_auto] items-center rounded-lg bg-app-surface-2 px-2.5 py-3">
      <StatusDot state={state} />
      <strong className="text-small font-semibold">{label}</strong>
      <small className="text-caption text-app-muted">{detail}</small>
    </div>
  )
}
