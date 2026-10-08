import { PageHeader } from '../../components/ui/PageHeader'
import { formatBytes } from '../../shared/lib/format-bytes'
import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionResult,
  DataDirectoryInfo
} from '../../shared/types/data-file'

import { ReleaseDateSelect } from './ReleaseDateSelect'

export function UploadView({
  directory,
  isConverting,
  conversionProgress,
  conversionResult,
  targetVersion,
  releasedOn,
  onOpen,
  onConvert,
  onCancelConversion,
  onReleasedOnChange
}: {
  directory: DataDirectoryInfo | null
  isConverting: boolean
  conversionProgress: DataDirectoryConversionProgress | null
  conversionResult: DataDirectoryConversionResult | null
  targetVersion: string
  releasedOn: string
  onOpen: () => void
  onConvert: () => void
  onCancelConversion: () => void
  onReleasedOnChange: (value: string) => void
}): React.JSX.Element {
  return (
    <>
      <PageHeader
        eyebrow={`IMPORT · ${targetVersion}`}
        title="새 데이터 가져오기"
        description={`선택한 폴더의 CSV 파일을 ${targetVersion} 버전 작업본으로 변환합니다.`}
      />
      <section
        className={`flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-dashed p-11 text-center ${directory ? 'border-app-accent-border' : 'border-app-border-strong'} bg-[radial-gradient(circle_at_50%_45%,var(--color-app-accent-bg),var(--color-app-surface)_58%)]`}
      >
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-[14px] border border-app-accent-border bg-app-accent-bg text-[26px] text-app-accent">
          ⇧
        </div>
        {directory ? (
          <>
            <span className="mb-2 rounded bg-app-accent-bg px-2 py-1 text-caption font-bold text-app-accent">
              CSV {directory.fileCount}개
            </span>
            <h2 className="mb-1 text-[17px] font-bold">{directory.name}</h2>
            <p className="section-description">
              {formatBytes(directory.size)} ·{' '}
              {new Date(directory.modifiedAt).toLocaleString('ko-KR')}
            </p>
            <code className="my-3 max-w-[650px] overflow-hidden text-ellipsis whitespace-nowrap text-small text-app-muted">
              {directory.path}
            </code>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-[17px] font-bold">버전 데이터 폴더 선택</h2>
            <p className="section-description">
              선택한 폴더와 하위 폴더에서 CSV 파일을 찾아 하나의 세션으로 가져옵니다.
            </p>
          </>
        )}
        <div className="mt-5 flex gap-2.5">
          <button className="action-primary" disabled={isConverting} onClick={onOpen}>
            {directory ? '다른 폴더 선택' : '폴더 선택'}
          </button>
          {directory && !isConverting && (
            <button
              className="min-h-[38px] rounded-lg border border-app-info-border bg-app-info-bg px-4 text-body font-bold text-app-info hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!targetVersion}
              onClick={onConvert}
            >
              CSV {directory.fileCount}개 변환
            </button>
          )}
          {isConverting && (
            <button
              className="min-h-[38px] rounded-lg border border-app-danger-border bg-app-danger-bg px-4 text-body font-bold text-app-danger hover:brightness-105"
              onClick={onCancelConversion}
            >
              변환 취소
            </button>
          )}
        </div>
      </section>

      {directory && (
        <section className="mt-4 rounded-[9px] border border-app-border bg-app-surface p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="page-eyebrow">DISCOVERED CSV</span>
              <h2 className="section-title mt-2">가져올 파일 {directory.fileCount}개</h2>
            </div>
            <span className="text-small text-app-muted">총 {formatBytes(directory.size)}</span>
          </div>
          <div className="mt-3 max-h-56 overflow-auto rounded-md border border-app-border bg-app-input">
            {directory.files.map((file) => (
              <div
                className="flex items-center justify-between gap-5 border-b border-app-border px-3 py-2.5 last:border-b-0"
                key={file.relativePath}
              >
                <code className="truncate text-small text-app-text">{file.relativePath}</code>
                <span className="shrink-0 text-caption text-app-muted">
                  {formatBytes(file.size)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid items-start gap-3 border-t border-app-border pt-4 sm:grid-cols-2">
            <label className="grid self-start gap-1.5">
              <span className="field-label">서버 환경</span>
              <span className="flex h-10 items-center rounded-lg border border-app-border-strong bg-app-input px-3 text-body text-app-text">
                {directory.environment === 'test' ? '테스트 서버' : '실제 서버'}
              </span>
            </label>
            <div className="grid self-start gap-1.5">
              <span className="field-label">게임사 업데이트 날짜 (선택)</span>
              <ReleaseDateSelect
                disabled={isConverting}
                value={releasedOn}
                onChange={onReleasedOnChange}
              />
            </div>
          </div>
        </section>
      )}

      {isConverting && conversionProgress && (
        <section className="mt-4 rounded-[9px] border border-app-info-border bg-app-info-bg p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="page-eyebrow">
              CONVERTING · {conversionProgress.processedFiles}/{conversionProgress.totalFiles}
            </span>
            <strong className="text-body text-app-info">
              {conversionProgress.percent.toFixed(1)}%
            </strong>
          </div>
          <code className="mt-2 block truncate text-small text-app-info">
            {conversionProgress.currentFile}
          </code>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-border">
            <div
              className="h-full rounded-full bg-app-info transition-[width]"
              style={{ width: `${conversionProgress.percent}%` }}
            />
          </div>
          <p className="section-description mt-2">
            {formatBytes(conversionProgress.processedBytes)} /{' '}
            {formatBytes(conversionProgress.totalBytes)} · {conversionProgress.processedRecords}개
            레코드
          </p>
        </section>
      )}

      {conversionResult?.status === 'success' && (
        <section className="mt-4 rounded-[9px] border border-app-accent-border bg-app-accent-bg p-5">
          <span className="page-eyebrow">CONVERSION COMPLETE</span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="section-title text-app-accent">
                CSV {conversionResult.summary.convertedFiles}개 ·{' '}
                {conversionResult.summary.convertedRecords.toLocaleString('ko-KR')}개 레코드 완료
              </h2>
              <p className="section-description">
                입력 {formatBytes(conversionResult.summary.totalBytes)} · 제외{' '}
                {conversionResult.summary.rejectedRecords.toLocaleString('ko-KR')} · 오류{' '}
                {
                  conversionResult.summary.issues.filter(({ severity }) => severity === 'error')
                    .length
                }
              </p>
            </div>
            <small className="text-caption text-app-muted">
              대상 버전 {conversionResult.summary.targetVersion}
            </small>
          </div>
          <code className="mt-3 block overflow-hidden text-ellipsis whitespace-nowrap text-small text-app-muted">
            {conversionResult.summary.managedData?.versionDirectory ??
              conversionResult.summary.outputPath}
          </code>
          {conversionResult.summary.versionRegistration && (
            <p className="section-description mt-2">
              DB 상태 {conversionResult.summary.versionRegistration.status} ·{' '}
              {conversionResult.summary.versionRegistration.environment === 'test'
                ? '테스트 서버'
                : '실제 서버'}{' '}
              · 업데이트 {conversionResult.summary.versionRegistration.releasedOn ?? '미입력'}
            </p>
          )}
          <details className="mt-4 text-body text-app-muted">
            <summary className="cursor-pointer font-semibold text-app-text">파일별 결과</summary>
            <div className="mt-3 max-h-72 overflow-auto rounded-md border border-app-accent-border bg-app-input">
              {conversionResult.summary.files.map((file) => (
                <div
                  className="border-b border-app-border px-3 py-2.5 last:border-b-0"
                  key={file.relativePath}
                >
                  <div className="flex justify-between gap-5">
                    <code className="truncate text-small text-app-text">{file.relativePath}</code>
                    <span className="shrink-0 text-caption">
                      {file.convertedRecords.toLocaleString('ko-KR')}개
                    </span>
                  </div>
                  <code className="mt-1 block truncate text-caption text-app-muted">
                    SHA-256 {file.sha256}
                  </code>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {conversionResult && conversionResult.status !== 'success' && (
        <section className="mt-4 rounded-[9px] border border-app-danger-border bg-app-danger-bg p-5">
          <span className="page-eyebrow text-app-danger">
            {conversionResult.status === 'cancelled' ? 'CONVERSION CANCELLED' : 'CONVERSION FAILED'}
          </span>
          <ul className="mt-3 space-y-2 text-body text-app-danger">
            {conversionResult.issues.map((issue, index) => (
              <li key={`${issue.code}-${issue.file ?? ''}-${issue.row ?? 0}-${index}`}>
                [{issue.code}] {issue.message}
                {issue.file ? ` (${issue.file})` : ''}
                {issue.row !== undefined ? ` (행 ${issue.row})` : ''}
                {issue.column !== undefined ? ` (열 ${issue.column})` : ''}
                {issue.field ? ` (필드 ${issue.field})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4 flex items-center gap-3 rounded-md border-l-[3px] border-app-warning-border bg-app-warning-bg px-4 py-3.5">
        <span className="grid h-5 w-5 place-items-center rounded-full border border-app-warning-border font-serif text-body text-app-warning">
          i
        </span>
        <p className="m-0 text-small text-app-muted">
          <strong className="font-semibold text-app-warning">대상 버전: {targetVersion}</strong>{' '}
          폴더명의 버전을 우선 사용합니다. 원본 CSV는 변경하지 않으며 파일별 NDJSON 작업본을
          생성합니다.
        </p>
      </div>
    </>
  )
}
