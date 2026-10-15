import { PageHeader } from '../../components/ui/PageHeader'

export type RegisteredVersion = {
  version: string
  releasedOn: string | null
  createdAt: string
  environment: 'test' | 'production'
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

export function VersionListView({
  registeredVersions,
  currentVersion,
  versionStatus
}: {
  registeredVersions: RegisteredVersion[]
  currentVersion: string
  versionStatus: 'loading' | 'ready' | 'error'
}): React.JSX.Element {
  if (versionStatus === 'loading') {
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

      {registeredVersions.length === 0 ? (
        <section className="rounded-[9px] border border-dashed border-app-border bg-app-surface p-8 text-center">
          <strong className="text-small text-app-text">등록된 버전이 없습니다.</strong>
          <p className="mt-2 text-small text-app-muted">
            데이터를 가져오면 여기에서 등록 상태를 확인할 수 있습니다.
          </p>
        </section>
      ) : (
        <section className="overflow-x-auto rounded-[9px] border border-app-border bg-app-surface">
          <table className="min-w-[720px] w-full border-collapse text-left text-small">
            <thead className="border-b border-app-border bg-app-surface-2 text-caption text-app-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">버전</th>
                <th className="px-5 py-3 font-semibold">릴리스 날짜</th>
                <th className="px-5 py-3 font-semibold">등록 시각</th>
                <th className="px-5 py-3 font-semibold">환경</th>
                <th className="px-5 py-3 font-semibold">상태</th>
              </tr>
            </thead>
            <tbody>
              {registeredVersions.map((registeredVersion) => {
                const current = registeredVersion.version === currentVersion

                return (
                  <tr
                    className={
                      current
                        ? 'bg-app-accent-bg text-app-text'
                        : 'border-t border-app-border text-app-text'
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
                    <td className="px-5 py-4 text-app-muted">
                      {formatReleasedOn(registeredVersion.releasedOn)}
                    </td>
                    <td className="px-5 py-4 text-app-muted">
                      {formatCreatedAt(registeredVersion.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      {registeredVersion.environment === 'test' ? '테스트' : '운영'}
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
