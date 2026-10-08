import type { ReactNode } from 'react'

import { navigation, type View } from '../../features/navigation/model'
import { StatusDot } from '../ui/StatusDot'
import { VersionSelect } from '../ui/VersionSelect'

export function AppShell({
  view,
  currentVersion,
  versions,
  onNavigate,
  onCurrentVersionChange,
  onCaptureScreenshot,
  isCapturingScreenshot,
  theme,
  onToggleTheme,
  children
}: {
  view: View
  currentVersion: string
  versions: string[]
  onNavigate: (view: View) => void
  onCurrentVersionChange: (version: string) => void
  onCaptureScreenshot: () => void
  isCapturingScreenshot: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  children: ReactNode
}): React.JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[244px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-10 flex w-[244px] flex-col border-r border-app-border bg-app-sidebar px-[17px] py-7">
        <div className="flex items-center gap-3 px-2.5 pb-8">
          <div className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-app-accent text-[13px] font-extrabold text-app-accent-contrast">
            MI
          </div>
          <div>
            <strong className="block text-[13px] font-bold">Maple Insight</strong>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.16em] text-app-muted uppercase">
              Data Studio
            </span>
          </div>
        </div>

        <nav className="grid gap-1">
          {navigation.map((item) => {
            const active = view === item.id

            return (
              <button
                className={`flex w-full items-center gap-[13px] rounded-lg border-0 px-[13px] py-3 text-left text-[12px] font-semibold transition-colors ${active ? 'bg-app-accent-bg text-app-text' : 'bg-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text'}`}
                key={item.id}
                onClick={() => onNavigate(item.id)}
              >
                <span
                  className={`w-[22px] font-mono text-[9px] ${active ? 'text-app-accent' : 'text-app-subtle'}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 border-t border-app-border px-3 pt-4">
          <StatusDot state="done" />
          <div>
            <strong className="block text-[10px] font-semibold text-app-muted">
              Local workspace
            </strong>
            <small className="block text-[9px] text-app-subtle">main process connected</small>
          </div>
        </div>
      </aside>

      <main className="col-start-2 min-w-0">
        <div className="sticky top-0 z-5 flex h-[65px] items-center justify-between border-b border-app-border bg-app-header px-[34px] text-[11px] text-app-muted backdrop-blur-xl">
          <span>{navigation.find((item) => item.id === view)?.label}</span>
          <div className="flex items-center gap-[18px]">
            <button
              className="h-8 rounded-lg border border-app-border-strong bg-app-input px-3 text-[10px] font-semibold text-app-muted hover:border-app-accent hover:text-app-accent disabled:cursor-wait disabled:opacity-60"
              disabled={isCapturingScreenshot}
              title="스크롤 전체 화면을 screenshots/manual/electron에 저장 (Ctrl+Shift+S)"
              type="button"
              onClick={onCaptureScreenshot}
            >
              {isCapturingScreenshot ? '저장 중...' : '전체 스크린샷 Ctrl+Shift+S'}
            </button>
            <button
              className="h-8 rounded-lg border border-app-border-strong bg-app-input px-3 text-[10px] font-semibold text-app-muted hover:border-app-accent hover:text-app-accent"
              title={theme === 'dark' ? '라이트 모드로 변경' : '다크 모드로 변경'}
              type="button"
              onClick={onToggleTheme}
            >
              {theme === 'dark' ? '☀ 라이트' : '☾ 다크'}
            </button>
            <VersionSelect
              compact
              label="현재 버전"
              value={currentVersion}
              versions={versions}
              onChange={onCurrentVersionChange}
            />
            <div className="flex items-center gap-2">
              <small>환경</small>
              <strong className="rounded-md border border-app-accent-border bg-app-accent-bg px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-app-accent">
                LOCAL
              </strong>
              <i className="ml-2 grid h-[30px] w-[30px] place-items-center rounded-full border border-app-border-strong bg-app-surface-2 text-[10px] font-bold text-app-muted not-italic">
                AD
              </i>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1240px] px-[42px] pt-[42px] pb-[76px] max-[1200px]:px-7">
          {children}
        </div>
      </main>
    </div>
  )
}
