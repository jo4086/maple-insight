import type {
  DataValidationProgress,
  DataValidationRunResult,
  DataValidationWarningAcknowledgementRequest
} from '../../shared/types/data-validation'

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

export function OperationsView({
  currentVersion,
  isValidating,
  activeValidationVersion,
  validationProgress,
  validationResult,
  onValidate,
  onCancelValidation,
  onUpdateWarning
}: {
  currentVersion: string
  isValidating: boolean
  activeValidationVersion: string | null
  validationProgress: DataValidationProgress | null
  validationResult: DataValidationRunResult | null
  onValidate: () => void
  onCancelValidation: () => void
  onUpdateWarning: (
    request: Omit<DataValidationWarningAcknowledgementRequest, 'version'>
  ) => Promise<void>
}): React.JSX.Element {
  const isCurrentValidation = isValidating && activeValidationVersion === currentVersion
  const validation =
    validationResult?.status === 'success' && validationResult.validation.version === currentVersion
      ? validationResult.validation
      : null

  const formatValue = (value: unknown): string => JSON.stringify(value) ?? String(value)

  return (
    <>
      <section className="mb-4 rounded-[9px] border border-app-border bg-app-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="page-eyebrow">VALIDATION · {currentVersion || '버전 미선택'}</span>
            <h2 className="section-title mt-2">변환 데이터 검증</h2>
            <p className="section-description">
              원본과 변환 JSON을 보존하고 별도 작업본에서 공통·도메인 규칙을 검사합니다.
            </p>
          </div>
          {isCurrentValidation ? (
            <button className="action-secondary" onClick={onCancelValidation}>
              검증 취소
            </button>
          ) : (
            <button
              className="action-primary"
              disabled={!currentVersion || isValidating}
              onClick={onValidate}
            >
              현재 버전 검증
            </button>
          )}
        </div>

        {isCurrentValidation && validationProgress && (
          <div className="mt-4 rounded-md border border-app-info-border bg-app-info-bg p-4">
            <div className="flex items-center justify-between gap-4 text-small text-app-info">
              <strong>
                {validationProgress.stage === 'preparing'
                  ? '작업본 준비'
                  : validationProgress.stage === 'writing'
                    ? '결과 저장'
                    : '데이터 검증'}
              </strong>
              <span>{validationProgress.percent.toFixed(1)}%</span>
            </div>
            {validationProgress.currentFile && (
              <code className="mt-2 block truncate text-caption text-app-muted">
                {validationProgress.currentFile}
              </code>
            )}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-border">
              <div
                className="h-full rounded-full bg-app-info transition-[width]"
                style={{ width: `${validationProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {validation && (
          <div className="mt-4">
            <div
              className={`rounded-md border p-4 ${validation.publishable ? 'border-app-accent-border bg-app-accent-bg' : 'border-app-warning-border bg-app-warning-bg'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong className="text-body">
                  {validation.publishable ? '검증 완료 · 다음 단계 가능' : '검토가 필요한 작업본'}
                </strong>
                <span className="text-small text-app-muted">
                  파일 {validation.summary.files} · 레코드{' '}
                  {validation.summary.records.toLocaleString('ko-KR')} · 오류{' '}
                  {validation.summary.errors} · 경고 {validation.summary.warnings}
                </span>
              </div>
              <code className="mt-2 block truncate text-caption text-app-muted">
                {validation.workspacePath}
              </code>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {validation.files.map((file) => (
                <div
                  className="rounded-md border border-app-border bg-app-input p-3"
                  key={file.file}
                >
                  <code className="block truncate text-small text-app-text">{file.file}</code>
                  <span className="mt-1 block text-caption text-app-muted">
                    {file.domain} · {file.records.toLocaleString('ko-KR')}개 · 오류 {file.errors} ·
                    경고 {file.warnings}
                  </span>
                </div>
              ))}
            </div>

            {validation.issues.length > 0 && (
              <details className="mt-3 rounded-md border border-app-border bg-app-input p-3">
                <summary className="cursor-pointer text-body font-semibold">
                  오류 및 경고 {validation.issues.length}개
                </summary>
                <ul className="mt-3 max-h-72 space-y-2 overflow-auto text-small text-app-muted">
                  {validation.issues.map((issue) => (
                    <li className="border-b border-app-border pb-2 last:border-0" key={issue.id}>
                      <strong
                        className={
                          issue.severity === 'error' ? 'text-app-danger' : 'text-app-warning'
                        }
                      >
                        [{issue.code}]
                      </strong>{' '}
                      {issue.message} · {issue.location.file}
                      {issue.location.record !== undefined
                        ? ` · 레코드 ${issue.location.record}`
                        : ''}
                      {issue.location.field ? ` · ${issue.location.field}` : ''}
                      {issue.value && (
                        <div className="mt-1 space-y-1 font-mono text-caption">
                          {'before' in issue.value && (
                            <div>이전: {formatValue(issue.value.before)}</div>
                          )}
                          {'after' in issue.value && (
                            <div>이후: {formatValue(issue.value.after)}</div>
                          )}
                        </div>
                      )}
                      {issue.severity === 'warning' && (
                        <form
                          className="mt-2 flex flex-wrap items-end gap-2"
                          onSubmit={(event) => {
                            event.preventDefault()
                            const form = new FormData(event.currentTarget)
                            void onUpdateWarning({
                              issueId: issue.id,
                              acknowledged: !issue.acknowledgement?.acknowledged,
                              ...(issue.acknowledgement?.acknowledged
                                ? {}
                                : {
                                    exceptionReason:
                                      (form.get('exceptionReason') as string).trim() || undefined
                                  })
                            })
                          }}
                        >
                          {!issue.acknowledgement?.acknowledged && (
                            <label className="flex min-w-56 flex-1 flex-col gap-1 text-caption">
                              예외 사유 (선택)
                              <input
                                className="rounded border border-app-border bg-app-surface px-2 py-1 text-small text-app-text"
                                defaultValue={issue.acknowledgement?.exceptionReason ?? ''}
                                maxLength={1000}
                                name="exceptionReason"
                              />
                            </label>
                          )}
                          <button
                            className="action-secondary"
                            disabled={isValidating}
                            type="submit"
                          >
                            {issue.acknowledgement?.acknowledged ? '확인 해제' : '경고 확인'}
                          </button>
                          {issue.acknowledgement?.acknowledged && (
                            <span className="text-caption text-app-accent">
                              확인됨
                              {issue.acknowledgement.exceptionReason
                                ? ` · ${issue.acknowledgement.exceptionReason}`
                                : ''}
                            </span>
                          )}
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {validationResult && validationResult.status !== 'success' && !isValidating && (
          <div className="mt-4 rounded-md border border-app-danger-border bg-app-danger-bg p-4 text-body text-app-danger">
            {validationResult.message}
          </div>
        )}
      </section>
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
