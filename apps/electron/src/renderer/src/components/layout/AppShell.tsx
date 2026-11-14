import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Database,
  GitBranch,
  House,
  Layers3,
  Upload,
  X,
  Zap
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { navigation, type View } from '../../features/navigation/model'
import type {
  NotificationKind,
  WorkspaceNotification
} from '../../features/notifications/useNotifications'
import { StatusDot } from '../ui/StatusDot'
import { VersionSelect } from '../ui/VersionSelect'

function viewLabel(view: View): string | undefined {
  return (
    navigation.find((item) => 'id' in item && item.id === view)?.label ??
    navigation
      .flatMap((item) => ('children' in item ? item.children : []))
      .find((item) => item.id === view)?.label
  )
}

function notificationDotClass(kind: NotificationKind): string {
  if (kind === 'error') return 'bg-app-danger'
  if (kind === 'warning') return 'bg-app-warning'
  if (kind === 'info') return 'bg-app-muted'
  return 'bg-app-accent'
}

function NotificationCenter({
  notifications,
  unreadCount,
  open,
  onToggle,
  onClose,
  onDismiss,
  onClear
}: {
  notifications: WorkspaceNotification[]
  unreadCount: number
  open: boolean
  onToggle: () => void
  onClose: () => void
  onDismiss: (id: string) => void
  onClear: () => void
}): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) onClose()
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
      requestAnimationFrame(() => bellRef.current?.focus())
    }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls="global-notifications"
        aria-expanded={open}
        aria-label={`알림${unreadCount ? `, 읽지 않음 ${unreadCount}개` : ''}`}
        className="relative grid h-8 w-8 place-items-center rounded-lg border border-app-border-strong bg-app-input text-app-muted hover:border-app-accent hover:text-app-accent"
        ref={bellRef}
        title="알림"
        type="button"
        onClick={onToggle}
      >
        <Bell aria-hidden="true" size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 rounded-full bg-app-danger px-1 text-center text-[8px] leading-4 font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <section
          aria-label="전체 알림"
          className="absolute top-10 right-0 z-30 w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-xl border border-app-border-strong bg-app-surface shadow-2xl"
          id="global-notifications"
        >
          <header className="flex items-center justify-between border-b border-app-border px-4 py-3">
            <strong className="text-body text-app-text">알림</strong>
            {notifications.length > 0 && (
              <button
                className="border-0 bg-transparent text-small font-semibold text-app-muted hover:text-app-text"
                type="button"
                onClick={onClear}
              >
                모두 지우기
              </button>
            )}
          </header>
          {notifications.length === 0 ? (
            <p className="m-0 px-4 py-8 text-center text-small text-app-muted">
              새 알림이 없습니다.
            </p>
          ) : (
            <ul className="m-0 max-h-[360px] list-none overflow-y-auto p-0">
              {notifications.map((notification) => (
                <li
                  className="flex gap-3 border-b border-app-border px-4 py-3 last:border-b-0"
                  key={notification.id}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notificationDotClass(notification.kind)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-small text-app-text">{notification.title}</strong>
                    <p className="mt-1 mb-0 break-all text-[10px] leading-4 text-app-muted">
                      {notification.message}
                    </p>
                    <time className="mt-1 block text-[9px] text-app-subtle">
                      {new Date(notification.createdAt).toLocaleString('ko-KR')}
                    </time>
                  </div>
                  <button
                    aria-label={`${notification.title} 알림 지우기`}
                    className="grid h-6 w-6 shrink-0 place-items-center border-0 bg-transparent text-app-muted hover:text-app-text"
                    type="button"
                    onClick={() => onDismiss(notification.id)}
                  >
                    <X aria-hidden="true" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

export function AppShell({
  layout,
  view,
  currentVersion,
  versions,
  onNavigate,
  onCurrentVersionChange,
  onCaptureScreenshot,
  isCapturingScreenshot,
  notifications = [],
  unreadNotificationCount = 0,
  isNotificationsOpen = false,
  onToggleNotifications = () => {},
  onCloseNotifications = () => {},
  onDismissNotification = () => {},
  onClearNotifications = () => {},
  theme,
  onToggleTheme,
  children
}: {
  layout: 'default' | 'document' | 'workspace'
  view: View
  currentVersion: string
  versions: string[]
  onNavigate: (view: View) => void
  onCurrentVersionChange: (version: string) => void
  onCaptureScreenshot: () => void
  isCapturingScreenshot: boolean
  notifications?: WorkspaceNotification[]
  unreadNotificationCount?: number
  isNotificationsOpen?: boolean
  onToggleNotifications?: () => void
  onCloseNotifications?: () => void
  onDismissNotification?: (id: string) => void
  onClearNotifications?: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  children: ReactNode
}): React.JSX.Element {
  const [versionExpanded, setVersionExpanded] = useState(
    () => view === 'version-list' || view === 'compare'
  )
  const [jobExpanded, setJobExpanded] = useState(() => view === 'class' || view === 'class-editor')
  const [skillExpanded, setSkillExpanded] = useState(() => view.startsWith('skill-'))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const sidebarIcons = [House, Upload, GitBranch, Layers3, BriefcaseBusiness, Zap, Database]

  return (
    <div
      className={`grid min-h-screen max-[767px]:grid-cols-1 ${sidebarCollapsed ? 'grid-cols-[72px_1fr]' : 'grid-cols-[244px_1fr]'}`}
    >
      <aside
        className={`fixed inset-y-0 left-0 z-10 flex flex-col border-r border-app-border bg-app-sidebar py-7 max-[767px]:static max-[767px]:w-full max-[767px]:border-r-0 max-[767px]:border-b ${sidebarCollapsed ? 'w-[72px] px-3' : 'w-[244px] px-[17px]'}`}
      >
        <div
          className={`flex items-center pb-8 ${sidebarCollapsed ? 'flex-col gap-4' : 'gap-3 px-2.5'}`}
        >
          <div className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-app-accent text-[13px] font-extrabold text-app-accent-contrast">
            MI
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <strong className="block text-[13px] font-bold">Maple Insight</strong>
              <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.16em] text-app-muted uppercase">
                Data Studio
              </span>
            </div>
          )}
          <button
            aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            aria-pressed={sidebarCollapsed}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-app-border-strong bg-app-input text-app-muted hover:text-app-accent"
            type="button"
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        <nav aria-label="주 탐색" className="grid gap-1">
          {navigation.map((item, index) => {
            const Icon = sidebarIcons[index]
            if ('children' in item) {
              const active = item.children.some((child) => child.id === view)
              const isVersionGroup = item.children[0]?.id === 'version-list'
              const isSkillGroup = item.children[0]?.id === 'skill-list'
              const expanded = isVersionGroup
                ? versionExpanded
                : isSkillGroup
                  ? skillExpanded
                  : jobExpanded
              const childrenId = `${item.children[0]?.id}-navigation-children`

              return (
                <div key={item.label}>
                  {sidebarCollapsed ? (
                    <button
                      aria-current={active ? 'page' : undefined}
                      aria-label={item.label}
                      className={`grid h-11 w-full place-items-center rounded-lg border-0 ${active ? 'bg-app-accent-bg text-app-accent' : 'bg-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text'}`}
                      title={item.label}
                      type="button"
                      onClick={() => onNavigate(item.children[0].id)}
                    >
                      <Icon aria-hidden="true" size={19} />
                    </button>
                  ) : (
                    <button
                      aria-controls={childrenId}
                      aria-expanded={expanded}
                      className={`group flex w-full items-center gap-[13px] rounded-lg border-0 px-[13px] py-3 text-left text-[12px] font-semibold transition-colors ${active ? 'text-app-text' : 'bg-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text'}`}
                      type="button"
                      onClick={() =>
                        isVersionGroup
                          ? setVersionExpanded((current) => !current)
                          : isSkillGroup
                            ? setSkillExpanded((current) => !current)
                            : setJobExpanded((current) => !current)
                      }
                    >
                      <span
                        className={`w-[22px] font-mono text-[9px] ${active ? 'text-app-accent' : 'text-app-subtle'}`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      <span className="ml-auto grid h-4 w-4 shrink-0 place-items-center text-app-muted transition-colors group-hover:text-app-text group-focus-visible:text-app-text">
                        {expanded ? (
                          <ChevronUp size={16} strokeWidth={1.75} />
                        ) : (
                          <ChevronDown size={16} strokeWidth={1.75} />
                        )}
                      </span>
                    </button>
                  )}
                  {!sidebarCollapsed && (
                    <div
                      aria-label={`${item.label} 하위 탐색`}
                      className={`ml-8 gap-1 border-l border-app-border pl-3 ${expanded ? 'grid' : 'hidden'}`}
                      id={childrenId}
                    >
                      {item.children.map((child) => {
                        const childActive = view === child.id

                        return (
                          <button
                            aria-current={childActive ? 'page' : undefined}
                            className={`rounded-lg border-0 px-3 py-2 text-left text-[11px] font-semibold transition-colors ${childActive ? 'bg-app-accent-bg text-app-text' : 'bg-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text'}`}
                            key={child.id}
                            type="button"
                            onClick={() => onNavigate(child.id)}
                          >
                            {child.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const active = view === item.id

            return (
              <button
                aria-current={active ? 'page' : undefined}
                aria-label={sidebarCollapsed ? item.label : undefined}
                className={`${sidebarCollapsed ? 'grid h-11 place-items-center' : 'flex items-center gap-[13px] px-[13px] py-3 text-left text-[12px] font-semibold'} w-full rounded-lg border-0 transition-colors ${active ? 'bg-app-accent-bg text-app-text' : 'bg-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text'}`}
                key={item.id}
                title={sidebarCollapsed ? item.label : undefined}
                type="button"
                onClick={() => onNavigate(item.id)}
              >
                {sidebarCollapsed ? (
                  <Icon aria-hidden="true" size={19} />
                ) : (
                  <>
                    <span
                      className={`w-[22px] font-mono text-[9px] ${active ? 'text-app-accent' : 'text-app-subtle'}`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="mt-auto flex items-center gap-2.5 border-t border-app-border px-3 pt-4">
            <StatusDot state="done" />
            <div>
              <strong className="block text-[10px] font-semibold text-app-muted">
                Local workspace
              </strong>
              <small className="block text-[9px] text-app-subtle">main process connected</small>
            </div>
          </div>
        )}
      </aside>

      <main className="col-start-2 min-w-0 max-[767px]:col-start-auto">
        <div className="sticky top-0 z-5 flex h-[65px] items-center justify-between border-b border-app-border bg-app-header px-[34px] text-[11px] text-app-muted backdrop-blur-xl max-[767px]:h-auto max-[767px]:flex-col max-[767px]:items-stretch max-[767px]:gap-3 max-[767px]:px-4 max-[767px]:py-3">
          <span>{viewLabel(view)}</span>
          <div className="flex items-center gap-[18px] max-[767px]:flex-wrap max-[767px]:gap-2">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadNotificationCount}
              open={isNotificationsOpen}
              onToggle={onToggleNotifications}
              onClose={onCloseNotifications}
              onDismiss={onDismissNotification}
              onClear={onClearNotifications}
            />
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
        <div
          className={
            layout === 'workspace'
              ? 'h-[calc(100vh-65px)] min-h-0 w-full overflow-auto max-[767px]:h-auto max-[767px]:overflow-visible'
              : layout === 'document'
                ? 'w-full'
                : 'mx-auto max-w-[1240px] px-[42px] pt-[42px] pb-[76px] max-[1200px]:px-7'
          }
        >
          {children}
        </div>
      </main>
    </div>
  )
}
