import { useEffect, useRef, useState } from 'react'

import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import type { CanvasViewportMetrics } from '../types'

export function useCanvasViewport() {
  const { movementMode, setViewport, viewport } = useEditorSession()
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<{
    originLeft: number
    originTop: number
    startX: number
    startY: number
  } | null>(null)
  const [viewportMetrics, setViewportMetrics] = useState<CanvasViewportMetrics>({
    clientHeight: 0,
    clientWidth: 0,
    scrollHeight: CANVAS_HEIGHT,
    scrollLeft: viewport.scrollLeft,
    scrollTop: viewport.scrollTop,
    scrollWidth: CANVAS_WIDTH,
  })

  useEffect(() => {
    const element = viewportRef.current

    if (!element) {
      return
    }

    const updateMetrics = () => {
      setViewportMetrics({
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
        scrollWidth: element.scrollWidth,
      })
    }

    updateMetrics()

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const element = viewportRef.current

    if (!element) {
      return
    }

    element.scrollLeft = viewport.scrollLeft
    element.scrollTop = viewport.scrollTop
  }, [viewport.scrollLeft, viewport.scrollTop, viewport.zoom])

  useEffect(() => {
    const handleScrollSync = () => {
      const element = viewportRef.current

      if (!element) {
        return
      }

      setViewportMetrics({
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
        scrollWidth: element.scrollWidth,
      })

      setViewport((currentViewport) => ({
        ...currentViewport,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      }))
    }

    const element = viewportRef.current
    element?.addEventListener('scroll', handleScrollSync, { passive: true })

    return () => {
      element?.removeEventListener('scroll', handleScrollSync)
    }
  }, [setViewport])

  const startCanvasPan = (clientX: number, clientY: number) => {
    const element = viewportRef.current

    if (!element) {
      return
    }

    dragStateRef.current = {
      originLeft: element.scrollLeft,
      originTop: element.scrollTop,
      startX: clientX,
      startY: clientY,
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dragState = dragStateRef.current
      const currentElement = viewportRef.current

      if (!dragState || !currentElement) {
        return
      }

      const deltaX = moveEvent.clientX - dragState.startX
      const deltaY = moveEvent.clientY - dragState.startY

      currentElement.scrollLeft = dragState.originLeft - deltaX
      currentElement.scrollTop = dragState.originTop - deltaY
    }

    const handlePointerUp = () => {
      dragStateRef.current = null
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleCanvasPanStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (movementMode !== 'free' || event.button !== 0) {
      return
    }

    startCanvasPan(event.clientX, event.clientY)
  }

  const handleViewportMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 1) {
      return
    }

    event.preventDefault()
    startCanvasPan(event.clientX, event.clientY)
  }

  const handleViewportAuxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault()
    }
  }

  const moveViewportToRatio = (ratioX: number, ratioY: number) => {
    const element = viewportRef.current

    if (!element) {
      return
    }

    const targetLeft = ratioX * element.scrollWidth - element.clientWidth / 2
    const targetTop = ratioY * element.scrollHeight - element.clientHeight / 2

    element.scrollTo({
      left: Math.max(0, Math.min(element.scrollWidth - element.clientWidth, targetLeft)),
      top: Math.max(0, Math.min(element.scrollHeight - element.clientHeight, targetTop)),
      behavior: 'auto',
    })
  }

  return {
    handleCanvasPanStart,
    handleViewportAuxClick,
    handleViewportMouseDown,
    moveViewportToRatio,
    movementMode,
    viewport,
    viewportMetrics,
    viewportRef,
  }
}
