import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppShell } from '../../components/layout/AppShell'

import type { View } from './model'

const hookState = vi.hoisted(() => ({ versionExpanded: undefined as boolean | undefined }))

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>()

  return {
    ...react,
    useState: (initial: boolean | (() => boolean)) => {
      if (hookState.versionExpanded === undefined) {
        hookState.versionExpanded = typeof initial === 'function' ? initial() : initial
      }

      return [
        hookState.versionExpanded,
        (next: boolean | ((expanded: boolean) => boolean)) => {
          hookState.versionExpanded =
            typeof next === 'function' ? next(hookState.versionExpanded as boolean) : next
        }
      ]
    }
  }
})

type ButtonElement = ReactElement<{
  'aria-current'?: string
  'aria-expanded'?: boolean
  children?: ReactNode
  disabled?: boolean
  onClick?: () => void
}>

describe('version navigation', () => {
  beforeEach(() => {
    hookState.versionExpanded = undefined
  })

  function render(
    view: View,
    onNavigate = vi.fn(),
    layout: 'default' | 'workspace' = 'default'
  ): ReactElement {
    return AppShell({
      layout,
      view,
      currentVersion: '1.2.3',
      versions: [],
      onNavigate,
      onCurrentVersionChange: () => {},
      onCaptureScreenshot: () => {},
      isCapturingScreenshot: false,
      theme: 'dark',
      onToggleTheme: () => {},
      children: 'Content'
    })
  }

  function text(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (!isValidElement<{ children?: ReactNode }>(node)) return ''
    return Children.toArray(node.props.children).map(text).join('')
  }

  function buttons(node: ReactNode): ButtonElement[] {
    if (!isValidElement<{ children?: ReactNode }>(node)) return []

    const descendants = Children.toArray(node.props.children).flatMap(buttons)
    return node.type === 'button' ? [node as ButtonElement, ...descendants] : descendants
  }

  function button(root: ReactElement, label: string): ButtonElement {
    const match = buttons(root).find((candidate) => text(candidate.props.children) === label)
    expect(match).toBeDefined()
    return match as ButtonElement
  }

  function versionGroup(root: ReactElement): ButtonElement {
    const match = buttons(root).find((candidate) => candidate.props['aria-expanded'] !== undefined)
    expect(match).toBeDefined()
    return match as ButtonElement
  }

  it('shows one comparison destination', () => {
    const root = render('overview')

    expect(
      buttons(root).filter((candidate) => text(candidate.props.children) === '비교')
    ).toHaveLength(1)
    expect(buttons(root).some((candidate) => text(candidate.props.children) === '상세 결과')).toBe(
      false
    )
  })

  it('navigates to comparison', () => {
    const onNavigate = vi.fn()

    button(render('overview', onNavigate), '비교').props.onClick?.()

    expect(onNavigate).toHaveBeenCalledOnce()
    expect(onNavigate).toHaveBeenCalledWith('compare')
  })

  it('marks comparison active', () => {
    const root = render('compare')
    const activeChildren = buttons(root).filter(
      (candidate) => candidate.props['aria-current'] === 'page'
    )

    expect(button(root, '비교').props['aria-current']).toBe('page')
    expect(activeChildren).toHaveLength(1)
  })

  it('collapses and expands version navigation', () => {
    let root = render('overview')
    const group = versionGroup(root)

    expect(group.props['aria-expanded']).toBe(false)
    group.props.onClick?.()
    root = render('overview')
    expect(versionGroup(root).props['aria-expanded']).toBe(true)
    versionGroup(root).props.onClick?.()
    root = render('overview')
    expect(versionGroup(root).props['aria-expanded']).toBe(false)
    expect(button(root, '비교')).toBeDefined()
  })

  it('starts expanded on comparison and derives its label from navigation', () => {
    const root = render('compare')
    const markup = renderToStaticMarkup(root)

    expect(versionGroup(root).props['aria-expanded']).toBe(true)
    expect(markup).toContain('<span>비교</span>')
  })

  it('uses the requested page layout', () => {
    const root = render('compare')
    const workspace = render('compare', vi.fn(), 'workspace')

    expect(renderToStaticMarkup(root)).toContain('max-w-[1240px]')
    expect(renderToStaticMarkup(workspace)).toContain('h-[calc(100vh-65px)]')
    expect(renderToStaticMarkup(workspace)).toContain('max-[767px]:h-auto')
    expect(renderToStaticMarkup(workspace)).not.toContain('max-w-[1240px]')
  })
})
