import { useCallback, useState } from 'react'

export type NotificationKind = 'success' | 'error' | 'warning' | 'info'

export type WorkspaceNotification = {
  id: string
  kind: NotificationKind
  title: string
  message: string
  createdAt: string
  read: boolean
}

export type PushNotification = {
  kind: NotificationKind
  title: string
  message: string
  createdAt?: string
}

const MAX_NOTIFICATIONS = 50

export function useNotifications() {
  const [items, setItems] = useState<WorkspaceNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const push = useCallback((notification: PushNotification): void => {
    setItems((current) =>
      [
        {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: notification.createdAt ?? new Date().toISOString(),
          read: false
        },
        ...current
      ].slice(0, MAX_NOTIFICATIONS)
    )
  }, [])

  const close = useCallback((): void => setIsOpen(false), [])

  const toggle = useCallback((): void => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (nextOpen) setItems((current) => current.map((item) => ({ ...item, read: true })))
  }, [isOpen])

  const dismiss = useCallback((id: string): void => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback((): void => setItems([]), [])

  return {
    items,
    unreadCount: items.filter((item) => !item.read).length,
    isOpen,
    push,
    close,
    toggle,
    dismiss,
    clear
  }
}
