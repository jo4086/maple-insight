import { useEffect } from 'react'

import { useWorkspace } from '../../app/WorkspaceContext'

export function useNavigationWarning(message: string): void {
  const { setNavigationGuard } = useWorkspace()

  useEffect(() => {
    setNavigationGuard(message)
    if (!message) return

    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
      event.returnValue = message
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      window.removeEventListener('beforeunload', warn)
      setNavigationGuard('')
    }
  }, [message, setNavigationGuard])
}
