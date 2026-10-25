import { useLayoutEffect, useRef, useState } from 'react'

import { PageHeader } from '../../components/ui/PageHeader'

export type RegisteredVersion = {
  version: string
  releasedOn: string | null
  createdAt: string
  environment: 'test' | 'production' | 'copy'
  status: 'ready' | 'importing'
}

function formatReleasedOn(value: string | null): string {
  if (!value) return '미등록'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(date)
}

function formatCreatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function statusLabel(status: RegisteredVersion['status']): string {
  return status === 'ready' ? '준비됨' : '가져오는 중'
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

type Action = { version: string; kind: 'date' | 'copy' | 'delete' }

const inputStyle =
  'h-9 min-w-32 rounded-lg border border-app-border-strong bg-app-input px-3 font-mono text-small text-app-text outline-none focus-visible:border-app-accent focus-visible:ring-2 focus-visible:ring-app-accent disabled:cursor-not-allowed disabled:opacity-60'
const buttonStyle =
  'min-h-9 rounded-lg border border-app-border-strong bg-app-surface-2 px-3 text-small font-semibold text-app-text hover:border-app-accent hover:bg-app-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-60'
const primaryButtonStyle =
  'min-h-9 rounded-lg border border-app-accent-border bg-app-accent-bg px-3 text-small font-semibold text-app-accent hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-60'
const compactButtonStyle =
  'h-9 shrink-0 rounded-lg border border-app-border-strong bg-app-surface-2 px-2 text-small font-semibold text-app-text hover:border-app-accent hover:bg-app-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-60'
const compactPrimaryButtonStyle =
  'h-9 shrink-0 rounded-lg border border-app-accent-border bg-app-accent-bg px-2 text-small font-semibold text-app-accent hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-60'
const iconButtonStyle =
  'inline-flex size-9 shrink-0 items-center justify-center rounded text-app-muted transition-colors hover:text-app-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-40'
const iconStyle = 'size-5 fill-none stroke-current stroke-2'

export function VersionListView({
  registeredVersions,
  currentVersion,
  versionStatus,
  busy = false,
  error = null,
  onUpdateReleasedOn,
  onCopyVersion,
  onDeleteVersion
}: {
  registeredVersions: RegisteredVersion[]
  currentVersion: string
  versionStatus: 'loading' | 'ready' | 'error'
  busy?: boolean
  error?: string | null
  onUpdateReleasedOn?: (version: string, releasedOn: string | null) => Promise<void> | void
  onCopyVersion?: (sourceVersion: string, targetVersion: string) => Promise<void> | void
  onDeleteVersion?: (version: string) => Promise<void> | void
}): React.JSX.Element {
  const [action, setAction] = useState<Action | null>(null)
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const dateEditTriggerRef = useRef<HTMLButtonElement | null>(null)
  const dateScrollRef = useRef<{ section: HTMLElement; scrollLeft: number } | null>(null)
  const dateFocusRestoreRef = useRef<{
    version: string
    trigger: HTMLButtonElement
    scroll: { section: HTMLElement; scrollLeft: number } | null
  } | null>(null)
  const dateInputFocusRef = useRef<((node: HTMLInputElement | null) => void) | null>(null)
  if (dateInputFocusRef.current === null) {
    dateInputFocusRef.current = (node) => {
      if (!node) return
      const scroll = dateScrollRef.current
      node.focus({ preventScroll: true })
      if (!scroll) return
      requestAnimationFrame(() => {
        if (dateScrollRef.current === scroll && node.isConnected) {
          scroll.section.scrollLeft = scroll.scrollLeft
        }
      })
    }
  }
  const disabled = busy || pending

  function open(version: RegisteredVersion, kind: Action['kind']): void {
    setAction({ version: version.version, kind })
    setValue(kind === 'date' ? (version.releasedOn?.slice(0, 10) ?? '') : '')
    setActionError(null)
  }

  function requestDateEditFocusRestore(version: string): void {
    const trigger = dateEditTriggerRef.current
    if (!trigger) return
    dateFocusRestoreRef.current = { version, trigger, scroll: dateScrollRef.current }
  }

  useLayoutEffect(() => {
    const restore = dateFocusRestoreRef.current
    if (action !== null || disabled || !restore) return
    requestAnimationFrame(() => {
      if (
        dateFocusRestoreRef.current !== restore ||
        dateEditTriggerRef.current !== restore.trigger ||
        !restore.trigger.isConnected ||
        restore.trigger.disabled ||
        restore.trigger.getAttribute('aria-label') !== `${restore.version} 릴리스 날짜 수정`
      ) {
        return
      }
      restore.trigger.focus({ preventScroll: true })
      if (restore.scroll) restore.scroll.section.scrollLeft = restore.scroll.scrollLeft
      dateFocusRestoreRef.current = null
      dateScrollRef.current = null
    })
  }, [action, disabled])

  function cancel(): void {
    if (action?.kind === 'date') requestDateEditFocusRestore(action.version)
    setAction(null)
    setActionError(null)
  }

  async function submit(version: string, kind: Action['kind']): Promise<void> {
    if (disabled) return
    if (kind === 'date' && value && !validDate(value)) {
      setActionError('유효한 날짜를 입력하세요.')
      return
    }
    if (kind === 'copy') {
      if (registeredVersions.find((item) => item.version === version)?.status !== 'ready') return
      if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) {
        setActionError('새 버전을 major.minor.patch 형식으로 입력하세요.')
        return
      }
      if (registeredVersions.some((item) => item.version === value)) {
        setActionError('이미 등록된 버전입니다.')
        return
      }
    }
    const callback =
      kind === 'date'
        ? () => onUpdateReleasedOn?.(version, value || null)
        : kind === 'copy'
          ? () => onCopyVersion?.(version, value)
          : () => onDeleteVersion?.(version)
    setPending(true)
    setActionError(null)
    try {
      await callback()
      if (kind === 'date') requestDateEditFocusRestore(version)
      setAction(null)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : '작업에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  if (versionStatus === 'loading' && registeredVersions.length === 0) {
    return (
      <p className="rounded-[9px] border border-app-border bg-app-surface p-5 text-small text-app-muted">
        버전 목록을 불러오는 중입니다.
      </p>
    )
  }

  if (versionStatus === 'error') {
    return (
      <p className="rounded-[9px] border border-app-danger-border bg-app-danger-bg p-5 text-small text-app-danger">
        버전 목록을 불러오지 못했습니다.
      </p>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="VERSION MANAGEMENT"
        title="등록 버전"
        description="DB에 등록된 버전을 환경과 가져오기 상태로 확인합니다. 관리 원본 JSON이 없어도 등록된 버전은 표시합니다."
      />
      {error && (
        <p role="alert" className="text-app-danger">
          {error}
        </p>
      )}
      {actionError && (
        <p role="alert" className="text-app-danger">
          {actionError}
        </p>
      )}
      {registeredVersions.length === 0 ? (
        <section className="rounded-[9px] border border-dashed border-app-border bg-app-surface p-8 text-center">
          <strong className="text-small text-app-text">등록된 버전이 없습니다.</strong>
          <p className="mt-2 text-small text-app-muted">
            데이터를 가져오면 여기에서 등록 상태를 확인할 수 있습니다.
          </p>
        </section>
      ) : (
        <section className="overflow-x-auto rounded-[9px] border border-app-border bg-app-surface">
          <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-small">
            <thead className="border-b border-app-border bg-app-surface-2 text-caption text-app-muted">
              <tr>
                <th className="w-44 px-5 py-3 font-semibold">버전</th>
                <th className="w-[400px] px-5 py-3 font-semibold">릴리스 날짜</th>
                <th className="w-52 px-5 py-3 font-semibold">등록 시각</th>
                <th className="w-24 px-5 py-3 font-semibold">환경</th>
                <th className="w-28 px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">작업</th>
              </tr>
            </thead>
            <tbody>
              {registeredVersions.map((registeredVersion) => {
                const current = registeredVersion.version === currentVersion
                const editing = action?.version === registeredVersion.version

                return (
                  <tr
                    className={
                      current
                        ? 'h-16 whitespace-nowrap bg-app-accent-bg text-app-text'
                        : 'h-16 whitespace-nowrap border-t border-app-border text-app-text'
                    }
                    key={`${registeredVersion.environment}-${registeredVersion.version}`}
                  >
                    <td className="px-5 py-4 font-mono font-semibold">
                      {registeredVersion.version}
                      {current && (
                        <span className="ml-2 rounded bg-app-accent px-1.5 py-0.5 font-sans text-caption text-app-accent-contrast">
                          현재
                        </span>
                      )}
                    </td>
                    <td className="w-[400px] px-5 py-0 text-app-muted">
                      <div className="relative flex h-9 min-w-0 items-center">
                        <span className="min-w-0 flex-1 truncate">
                          {formatReleasedOn(registeredVersion.releasedOn)}
                        </span>
                        <span className="flex w-9 shrink-0 justify-end">
                          <button
                            type="button"
                            className={iconButtonStyle}
                            aria-label={`${registeredVersion.version} 릴리스 날짜 수정`}
                            title={`${registeredVersion.version} 릴리스 날짜 수정`}
                            disabled={
                              disabled || !onUpdateReleasedOn || (editing && action.kind === 'date')
                            }
                            onClick={(event) => {
                              const section = event.currentTarget.closest<HTMLElement>('section')
                              dateEditTriggerRef.current = event.currentTarget
                              dateFocusRestoreRef.current = null
                              dateScrollRef.current = section
                                ? { section, scrollLeft: section.scrollLeft }
                                : null
                              open(registeredVersion, 'date')
                            }}
                          >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className={iconStyle}>
                              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="m16.5 3.5 4 4L12 16l-5 1 1-5Z" />
                            </svg>
                          </button>
                        </span>
                        {editing && action.kind === 'date' && (
                          <div
                            className={`absolute inset-0 z-10 flex items-center gap-1 ${
                              current ? 'bg-app-accent-bg' : 'bg-app-surface'
                            }`}
                          >
                            <input
                              aria-label={`${registeredVersion.version} 릴리스 날짜`}
                              ref={dateInputFocusRef.current}
                              type="date"
                              className={`${inputStyle} w-36 min-w-0 shrink-0 px-2`}
                              value={value}
                              disabled={disabled}
                              onChange={(event) => setValue(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  void submit(registeredVersion.version, 'date')
                                } else if (event.key === 'Escape') {
                                  event.preventDefault()
                                  cancel()
                                }
                              }}
                            />
                            <button
                              type="button"
                              className={compactButtonStyle}
                              aria-label={`${registeredVersion.version} 릴리스 날짜 비우기`}
                              disabled={disabled || !value}
                              onClick={() => setValue('')}
                            >
                              비우기
                            </button>
                            <button
                              type="button"
                              className={compactPrimaryButtonStyle}
                              aria-label={`${registeredVersion.version} 릴리스 날짜 저장`}
                              disabled={disabled}
                              onClick={() => void submit(registeredVersion.version, 'date')}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              className={compactButtonStyle}
                              aria-label={`${registeredVersion.version} 릴리스 날짜 취소`}
                              disabled={disabled}
                              onClick={cancel}
                            >
                              취소
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-app-muted">
                      {formatCreatedAt(registeredVersion.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      {registeredVersion.environment === 'test'
                        ? '테스트'
                        : registeredVersion.environment === 'copy'
                          ? '복사'
                          : '운영'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          registeredVersion.status === 'ready'
                            ? 'text-app-accent'
                            : 'text-app-warning'
                        }
                      >
                        {statusLabel(registeredVersion.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {editing && action.kind === 'copy' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            aria-label={`${registeredVersion.version} 새 버전`}
                            className={inputStyle}
                            value={value}
                            disabled={disabled}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder="major.minor.patch"
                          />
                          <button
                            type="button"
                            className={primaryButtonStyle}
                            aria-label={`${registeredVersion.version} 복제 실행`}
                            disabled={disabled}
                            onClick={() => void submit(registeredVersion.version, 'copy')}
                          >
                            복제 실행
                          </button>
                          <button
                            type="button"
                            className={buttonStyle}
                            aria-label={`${registeredVersion.version} 복제 취소`}
                            disabled={disabled}
                            onClick={cancel}
                          >
                            취소
                          </button>
                        </div>
                      ) : editing && action.kind === 'delete' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="w-full text-app-danger">
                            {registeredVersion.version} 버전 삭제 확인: 버전 소유 DB 데이터와 관리
                            파일에 영향이 있습니다. 상태만 deleted로 변경하며 데이터와 파일은
                            보존됩니다.
                          </p>
                          <button
                            type="button"
                            className={primaryButtonStyle}
                            aria-label={`${registeredVersion.version} 삭제 확인`}
                            disabled={disabled}
                            onClick={() => void submit(registeredVersion.version, 'delete')}
                          >
                            삭제 확인
                          </button>
                          <button
                            type="button"
                            className={buttonStyle}
                            aria-label={`${registeredVersion.version} 삭제 취소`}
                            disabled={disabled}
                            onClick={cancel}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`${registeredVersion.version} 복제`}
                            title={`${registeredVersion.version} 복제`}
                            className={iconButtonStyle}
                            disabled={
                              disabled || !onCopyVersion || registeredVersion.status !== 'ready'
                            }
                            onClick={() => open(registeredVersion, 'copy')}
                          >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className={iconStyle}>
                              <rect width="14" height="14" x="8" y="8" rx="2" />
                              <path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            aria-label={`${registeredVersion.version} 삭제`}
                            title={`${registeredVersion.version} 삭제`}
                            className={iconButtonStyle}
                            disabled={disabled || !onDeleteVersion}
                            onClick={() => open(registeredVersion, 'delete')}
                          >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className={iconStyle}>
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="m19 6-1 14H6L5 6" />
                              <path d="M10 11v5M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  )
}
