import { PageHeader } from '../../components/ui/PageHeader'

const operations = [
  {
    title: '장비 데이터',
    description: '장비 및 잠재옵션 데이터의 추가, 수정, 삭제',
    state: '설계 중'
  },
  { title: '직업 데이터', description: '직업 코드, 계열, 전직 차수 데이터 관리', state: '설계 중' },
  { title: 'DB 업데이트', description: '검증된 데이터만 transaction으로 반영', state: '연결 대기' },
  { title: '타입 생성', description: '데이터 변경에 따른 TypeScript 타입 생성', state: '연결 대기' }
]

export function OperationsView({ currentVersion }: { currentVersion: string }): React.JSX.Element {
  return (
    <>
      <PageHeader
        eyebrow={`OPERATIONS · ${currentVersion}`}
        title="DB · 타입 작업"
        description="검증 결과를 확인한 뒤 현재 버전의 DB seed와 타입 생성을 실행합니다."
      />
      <div className="grid grid-cols-4 gap-[13px] max-[1200px]:grid-cols-2">
        {operations.map((operation, index) => (
          <article
            className="min-h-[175px] rounded-[9px] border border-app-border bg-app-surface p-5"
            key={operation.title}
          >
            <span className="font-mono text-small text-app-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="section-title mt-5">{operation.title}</h2>
            <p className="min-h-12 text-body leading-relaxed text-app-muted">
              {operation.description}
            </p>
            <small className="mt-3 inline-block rounded bg-app-surface-2 px-2 py-1 text-caption text-app-muted">
              {operation.state}
            </small>
          </article>
        ))}
      </div>
    </>
  )
}
