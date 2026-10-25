import { isValidElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const hooks = vi.hoisted(() => ({
  state: [] as unknown[],
  refs: [] as { current: unknown }[],
  cursor: 0,
  refCursor: 0,
  effects: [] as (() => void)[]
}))
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useLayoutEffect: (effect: () => void): void => {
      hooks.effects.push(effect)
    },
    useRef: <T,>(initial: T): { current: T } => {
      const index = hooks.refCursor++
      if (index >= hooks.refs.length) hooks.refs[index] = { current: initial }
      return hooks.refs[index] as { current: T }
    },
    useState: <T,>(initial: T): [T, (value: T) => void] => {
      const index = hooks.cursor++
      if (index >= hooks.state.length) hooks.state[index] = initial
      return [
        hooks.state[index] as T,
        (value: T) => {
          hooks.state[index] = value
        }
      ]
    }
  }
})

import { VersionListView } from './VersionListView'

describe('VersionListView', () => {
  it('formats UTC-midnight release dates as UTC calendar dates', () => {
    const markup = renderToStaticMarkup(
      <VersionListView
        currentVersion="1.2.421"
        registeredVersions={[
          {
            version: '1.2.421',
            releasedOn: '2026-10-15T00:00:00.000Z',
            createdAt: '2026-10-15T00:00:00.000Z',
            environment: 'production',
            status: 'ready'
          }
        ]}
        versionStatus="ready"
      />
    )

    expect(markup).toContain('2026. 10. 15.')
  })

  it('renders registered production and test versions', () => {
    const markup = renderToStaticMarkup(
      <VersionListView
        currentVersion="1.2.419"
        registeredVersions={[
          {
            version: '1.2.419',
            releasedOn: '2024-01-02',
            createdAt: '2024-01-03T04:05:00.000Z',
            environment: 'production',
            status: 'ready'
          },
          {
            version: '1.2.420',
            releasedOn: null,
            createdAt: '2024-01-04T05:06:00.000Z',
            environment: 'test',
            status: 'importing'
          }
        ]}
        versionStatus="ready"
      />
    )

    expect(markup).toContain('2024. 1. 2.')
    expect(markup).toContain('미등록')
    expect(markup).toContain('운영')
    expect(markup).toContain('테스트')
    expect(markup).toContain('준비됨')
    expect(markup).toContain('가져오는 중')
    expect(markup).toContain('1.2.419<span class="ml-2')
    expect(markup).toContain('>현재</span>')
  })
})

type Node = ReactElement<Record<string, unknown>>

function findNode(root: unknown, predicate: (node: Node) => boolean): Node {
  if (Array.isArray(root)) {
    for (const child of root) {
      try {
        return findNode(child, predicate)
      } catch {
        /* Keep searching siblings. */
      }
    }
  }
  if (isValidElement<Record<string, unknown>>(root)) {
    if (predicate(root)) return root
    return findNode(root.props.children, predicate)
  }
  throw new Error('Element not found')
}

function renderRow(props: Partial<Parameters<typeof VersionListView>[0]> = {}): Node {
  hooks.cursor = 0
  hooks.refCursor = 0
  hooks.effects = []
  const view = VersionListView({
    currentVersion: '1.2.421',
    registeredVersions: [
      {
        version: '1.2.421',
        releasedOn: '2026-10-15T00:00:00.000Z',
        createdAt: '2026-10-15T00:00:00.000Z',
        environment: 'copy',
        status: 'ready'
      }
    ],
    versionStatus: 'ready',
    ...props
  })
  hooks.effects.forEach((effect) => effect())
  return view
}

function click(root: Node, label: string): ReturnType<typeof vi.fn> {
  const button = findNode(
    root,
    (node) =>
      node.type === 'button' &&
      (node.props['aria-label'] === label || node.props.children === label)
  )
  expect(button.props.disabled).not.toBe(true)
  const focus = vi.fn()
  const currentTarget = {
    focus,
    closest: () => null,
    disabled: false,
    isConnected: true,
    getAttribute: (name: string) => (name === 'aria-label' ? label : null)
  }
  ;(button.props.onClick as (event: { currentTarget: typeof currentTarget }) => void)({
    currentTarget
  })
  return focus
}

function change(root: Node, label: string, value: string): void {
  const input = findNode(
    root,
    (node) => node.type === 'input' && node.props['aria-label'] === label
  )
  ;(input.props.onChange as (event: { target: { value: string } }) => void)({ target: { value } })
}

function keyDown(root: Node, label: string, key: string): void {
  const input = findNode(
    root,
    (node) => node.type === 'input' && node.props['aria-label'] === label
  )
  ;(input.props.onKeyDown as (event: { key: string; preventDefault: () => void }) => void)({
    key,
    preventDefault: vi.fn()
  })
}

function findNodes(root: unknown, predicate: (node: Node) => boolean): Node[] {
  if (Array.isArray(root)) return root.flatMap((child) => findNodes(child, predicate))
  if (!isValidElement<Record<string, unknown>>(root)) return []
  return [...(predicate(root) ? [root] : []), ...findNodes(root.props.children, predicate)]
}

describe('VersionListView actions', () => {
  beforeEach(() => {
    hooks.state = []
    hooks.refs = []
    hooks.cursor = 0
    hooks.refCursor = 0
    hooks.effects = []
    vi.unstubAllGlobals()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
  })

  it('edits and clears release date, keeping createdAt untouched', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    let view = renderRow({ onUpdateReleasedOn: update })
    click(view, '1.2.421 릴리스 날짜 수정')
    view = renderRow({ onUpdateReleasedOn: update })
    expect(
      findNode(view, (node) => node.type === 'input' && node.props.type === 'date').props.value
    ).toBe('2026-10-15')
    click(view, '1.2.421 릴리스 날짜 비우기')
    expect(
      findNode(
        renderRow({ onUpdateReleasedOn: update }),
        (node) => node.type === 'input' && node.props.type === 'date'
      ).props.value
    ).toBe('')
    view = renderRow({ onUpdateReleasedOn: update })
    click(view, '1.2.421 릴리스 날짜 저장')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('1.2.421', null))
    await vi.waitFor(() => expect(hooks.state[0]).toBeNull())
    expect(renderToStaticMarkup(renderRow({ onUpdateReleasedOn: update }))).toContain(
      '2026. 10. 15.'
    )
  })

  it('rejects invalid date and preserves edit after failed save; cancel closes it', async () => {
    const update = vi.fn().mockRejectedValue(new Error('저장 실패'))
    let view = renderRow({ onUpdateReleasedOn: update })
    click(view, '1.2.421 릴리스 날짜 수정')
    view = renderRow({ onUpdateReleasedOn: update })
    change(view, '1.2.421 릴리스 날짜', '2026-02-30')
    view = renderRow({ onUpdateReleasedOn: update })
    click(view, '1.2.421 릴리스 날짜 저장')
    expect(update).not.toHaveBeenCalled()
    expect(renderToStaticMarkup(renderRow({ onUpdateReleasedOn: update }))).toContain('유효한 날짜')
    change(renderRow({ onUpdateReleasedOn: update }), '1.2.421 릴리스 날짜', '2026-02-28')
    click(renderRow({ onUpdateReleasedOn: update }), '1.2.421 릴리스 날짜 저장')
    await vi.waitFor(() =>
      expect(renderToStaticMarkup(renderRow({ onUpdateReleasedOn: update }))).toContain('저장 실패')
    )
    expect(update).toHaveBeenCalledWith('1.2.421', '2026-02-28')
    click(renderRow({ onUpdateReleasedOn: update }), '1.2.421 릴리스 날짜 취소')
    expect(renderToStaticMarkup(renderRow({ onUpdateReleasedOn: update }))).not.toContain(
      '저장 실패'
    )
  })

  it('validates target semver and requests copy; shows copy environment', async () => {
    const copy = vi.fn().mockResolvedValue(undefined)
    let view = renderRow({ onCopyVersion: copy })
    expect(renderToStaticMarkup(view)).toContain('>복사</td>')
    click(view, '1.2.421 복제')
    view = renderRow({ onCopyVersion: copy })
    change(view, '1.2.421 새 버전', 'bad')
    click(renderRow({ onCopyVersion: copy }), '1.2.421 복제 실행')
    expect(copy).not.toHaveBeenCalled()
    change(renderRow({ onCopyVersion: copy }), '1.2.421 새 버전', '1.2.421')
    click(renderRow({ onCopyVersion: copy }), '1.2.421 복제 실행')
    expect(copy).not.toHaveBeenCalled()
    change(renderRow({ onCopyVersion: copy }), '1.2.421 새 버전', '1.2.422')
    click(renderRow({ onCopyVersion: copy }), '1.2.421 복제 실행')
    await vi.waitFor(() => expect(copy).toHaveBeenCalledWith('1.2.421', '1.2.422'))
  })

  it('disables copying importing versions without calling copy', () => {
    const copy = vi.fn()
    const view = renderRow({
      onCopyVersion: copy,
      registeredVersions: [
        {
          version: '1.2.421',
          releasedOn: null,
          createdAt: '2026-10-15T00:00:00.000Z',
          environment: 'test',
          status: 'importing'
        }
      ]
    })
    const button = findNode(
      view,
      (node) => node.type === 'button' && node.props['aria-label'] === '1.2.421 복제'
    )
    expect(button.props.disabled).toBe(true)
    expect(button.props.className).toContain('focus-visible:')
    expect(copy).not.toHaveBeenCalled()
  })

  it('cancels copy and delete without calling mutation callbacks', () => {
    const copy = vi.fn()
    const remove = vi.fn()
    click(renderRow({ onCopyVersion: copy, onDeleteVersion: remove }), '1.2.421 복제')
    click(renderRow({ onCopyVersion: copy, onDeleteVersion: remove }), '1.2.421 복제 취소')
    expect(copy).not.toHaveBeenCalled()
    click(renderRow({ onCopyVersion: copy, onDeleteVersion: remove }), '1.2.421 삭제')
    click(renderRow({ onCopyVersion: copy, onDeleteVersion: remove }), '1.2.421 삭제 취소')
    expect(remove).not.toHaveBeenCalled()
  })

  it('requires explicit delete confirmation and disables controls while busy', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    let view = renderRow({ onDeleteVersion: remove })
    click(view, '1.2.421 삭제')
    view = renderRow({ onDeleteVersion: remove })
    expect(renderToStaticMarkup(view)).toContain('버전 소유 DB 데이터와 관리 파일에 영향')
    expect(remove).not.toHaveBeenCalled()
    expect(
      findNode(
        renderRow({ onDeleteVersion: remove, busy: true }),
        (node) => node.type === 'button' && node.props.children === '삭제 확인'
      ).props.disabled
    ).toBe(true)
    click(view, '1.2.421 삭제 확인')
    await vi.waitFor(() => expect(remove).toHaveBeenCalledWith('1.2.421'))
  })
  it('keeps reserved date structure stable and opens only the clicked row', () => {
    const versions = [
      {
        version: '1.2.421',
        releasedOn: '2026-10-15T00:00:00.000Z',
        createdAt: '2026-10-15T00:00:00.000Z',
        environment: 'copy' as const,
        status: 'ready' as const
      },
      {
        version: '1.2.422',
        releasedOn: null,
        createdAt: '2026-10-16T00:00:00.000Z',
        environment: 'test' as const,
        status: 'ready' as const
      }
    ]
    const props = { registeredVersions: versions, onUpdateReleasedOn: vi.fn() }
    let view = renderRow(props)
    const table = findNode(view, (node) => node.type === 'table')
    const rowsBefore = findNodes(view, (node) => node.type === 'tr').slice(1)
    const dateCellsBefore = findNodes(
      view,
      (node) => node.type === 'td' && String(node.props.className).includes('w-[400px]')
    )

    expect(table.props.className).toContain('table-fixed')
    expect(rowsBefore).toHaveLength(2)
    expect(rowsBefore.every((row) => String(row.props.className).includes('h-16'))).toBe(true)
    expect(
      rowsBefore.every((row) => String(row.props.className).includes('whitespace-nowrap'))
    ).toBe(true)
    expect(dateCellsBefore).toHaveLength(2)
    expect(
      dateCellsBefore.every((cell) => cell.props.className === dateCellsBefore[0].props.className)
    ).toBe(true)

    click(view, '1.2.422 릴리스 날짜 수정')
    view = renderRow(props)
    expect(
      findNodes(view, (node) => node.type === 'input' && node.props.type === 'date')
    ).toHaveLength(1)
    expect(
      findNodes(
        view,
        (node) => node.type === 'button' && node.props['aria-label'] === '1.2.421 릴리스 날짜 수정'
      )
    ).toHaveLength(1)
    expect(renderToStaticMarkup(view)).toContain('미등록')
    expect(renderToStaticMarkup(view)).not.toContain('✎')
  })

  it('moves focus into date editing and restores trigger focus after save, Escape, or cancel', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    const enterTriggerFocus = click(
      renderRow({ onUpdateReleasedOn: update }),
      '1.2.421 릴리스 날짜 수정'
    )
    let editingView = renderRow({ onUpdateReleasedOn: update })
    const editingTrigger = findNode(
      editingView,
      (node) => node.type === 'button' && node.props['aria-label'] === '1.2.421 릴리스 날짜 수정'
    )
    const dateInput = findNode(
      editingView,
      (node) => node.type === 'input' && node.props['aria-label'] === '1.2.421 릴리스 날짜'
    )
    expect(editingTrigger.props.disabled).toBe(true)
    expect(dateInput.props.autoFocus).toBeUndefined()
    const dateInputFocus = vi.fn()
    ;(
      dateInput.props.ref as (node: { focus: typeof dateInputFocus; isConnected: boolean }) => void
    )({
      focus: dateInputFocus,
      isConnected: true
    })
    expect(dateInputFocus).toHaveBeenCalledWith({ preventScroll: true })

    change(editingView, '1.2.421 릴리스 날짜', '2026-10-16')
    const changedDateInput = findNode(
      renderRow({ onUpdateReleasedOn: update }),
      (node) => node.type === 'input' && node.props['aria-label'] === '1.2.421 릴리스 날짜'
    )
    expect(changedDateInput.props.ref).toBe(dateInput.props.ref)
    expect(dateInputFocus).toHaveBeenCalledOnce()
    keyDown(renderRow({ onUpdateReleasedOn: update }), '1.2.421 릴리스 날짜', 'Enter')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('1.2.421', '2026-10-16'))
    await vi.waitFor(() => expect(hooks.state[0]).toBeNull())
    renderRow({ onUpdateReleasedOn: update })
    expect(enterTriggerFocus).toHaveBeenCalledWith({ preventScroll: true })

    const escapeTriggerFocus = click(
      renderRow({ onUpdateReleasedOn: update }),
      '1.2.421 릴리스 날짜 수정'
    )
    editingView = renderRow({ onUpdateReleasedOn: update })
    keyDown(editingView, '1.2.421 릴리스 날짜', 'Escape')
    expect(hooks.state[0]).toBeNull()
    renderRow({ onUpdateReleasedOn: update })
    expect(escapeTriggerFocus).toHaveBeenCalledWith({ preventScroll: true })

    const cancelTriggerFocus = click(
      renderRow({ onUpdateReleasedOn: update }),
      '1.2.421 릴리스 날짜 수정'
    )
    click(renderRow({ onUpdateReleasedOn: update }), '1.2.421 릴리스 날짜 취소')
    renderRow({ onUpdateReleasedOn: update })
    expect(cancelTriggerFocus).toHaveBeenCalledWith({ preventScroll: true })
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('restores horizontal table scroll after date focus and cancel focus', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    const section = { scrollLeft: 380 }
    const triggerFocus = vi.fn(() => {
      section.scrollLeft = 65
    })
    let view = renderRow({ onUpdateReleasedOn: vi.fn() })
    const trigger = findNode(
      view,
      (node) => node.type === 'button' && node.props['aria-label'] === '1.2.421 릴리스 날짜 수정'
    )
    ;(
      trigger.props.onClick as (event: {
        currentTarget: {
          focus: typeof triggerFocus
          closest: (selector: string) => typeof section
          isConnected: boolean
          disabled: boolean
          getAttribute: (name: string) => string | null
        }
      }) => void
    )({
      currentTarget: {
        focus: triggerFocus,
        closest: () => section,
        isConnected: true,
        disabled: false,
        getAttribute: (name) => (name === 'aria-label' ? '1.2.421 릴리스 날짜 수정' : null)
      }
    })

    view = renderRow({ onUpdateReleasedOn: vi.fn() })
    const input = findNode(
      view,
      (node) => node.type === 'input' && node.props['aria-label'] === '1.2.421 릴리스 날짜'
    )
    const inputFocus = vi.fn(() => {
      section.scrollLeft = 65
    })
    ;(input.props.ref as (node: { focus: typeof inputFocus; isConnected: boolean }) => void)({
      focus: inputFocus,
      isConnected: true
    })
    expect(inputFocus).toHaveBeenCalledWith({ preventScroll: true })
    expect(section.scrollLeft).toBe(380)

    click(view, '1.2.421 릴리스 날짜 취소')
    renderRow({ onUpdateReleasedOn: vi.fn() })
    expect(triggerFocus).toHaveBeenCalledWith({ preventScroll: true })
    expect(section.scrollLeft).toBe(380)
  })

  it('keeps populated table mounted and restores focus only after enabled render', async () => {
    let resolveUpdate: (() => void) | undefined
    const frames: FrameRequestCallback[] = []
    const update = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveUpdate = resolve
        })
    )
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })

    expect(
      renderToStaticMarkup(
        renderRow({ registeredVersions: [], versionStatus: 'loading', onUpdateReleasedOn: update })
      )
    ).toContain('버전 목록을 불러오는 중입니다.')

    const triggerFocus = click(
      renderRow({ onUpdateReleasedOn: update }),
      '1.2.421 릴리스 날짜 수정'
    )
    const editingView = renderRow({ onUpdateReleasedOn: update })
    change(editingView, '1.2.421 릴리스 날짜', '2026-10-16')
    keyDown(renderRow({ onUpdateReleasedOn: update }), '1.2.421 릴리스 날짜', 'Enter')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('1.2.421', '2026-10-16'))

    const revalidatingView = renderRow({
      versionStatus: 'loading',
      onUpdateReleasedOn: update
    })
    expect(findNode(revalidatingView, (node) => node.type === 'table')).toBeDefined()
    expect(
      findNode(
        revalidatingView,
        (node) => node.type === 'button' && node.props['aria-label'] === '1.2.421 릴리스 날짜 수정'
      ).props.disabled
    ).toBe(true)
    expect(renderToStaticMarkup(revalidatingView)).not.toContain('버전 목록을 불러오는 중입니다.')
    expect(triggerFocus).not.toHaveBeenCalled()

    resolveUpdate?.()
    await vi.waitFor(() => expect(hooks.state[0]).toBeNull())
    const settledView = renderRow({ onUpdateReleasedOn: update })
    expect(
      findNode(
        settledView,
        (node) => node.type === 'button' && node.props['aria-label'] === '1.2.421 릴리스 날짜 수정'
      ).props.disabled
    ).toBe(false)
    expect(triggerFocus).not.toHaveBeenCalled()
    expect(frames).toHaveLength(1)
    frames.shift()?.(0)
    expect(triggerFocus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('keeps date editor open and does not restore focus when revalidation save fails', async () => {
    const update = vi.fn().mockRejectedValue(new Error('저장 실패'))
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    const triggerFocus = click(
      renderRow({ onUpdateReleasedOn: update }),
      '1.2.421 릴리스 날짜 수정'
    )
    const editingView = renderRow({ onUpdateReleasedOn: update })
    keyDown(editingView, '1.2.421 릴리스 날짜', 'Enter')

    await vi.waitFor(() =>
      expect(
        renderToStaticMarkup(renderRow({ versionStatus: 'loading', onUpdateReleasedOn: update }))
      ).toContain('저장 실패')
    )
    expect(hooks.state[0]).toEqual({ version: '1.2.421', kind: 'date' })
    expect(triggerFocus).not.toHaveBeenCalled()
    expect(
      findNode(
        renderRow({ versionStatus: 'loading', onUpdateReleasedOn: update }),
        (node) => node.type === 'input' && node.props['aria-label'] === '1.2.421 릴리스 날짜'
      )
    ).toBeDefined()
  })

  it('uses titled SVG-only action icons with visible focus feedback', () => {
    const view = renderRow({
      onUpdateReleasedOn: vi.fn(),
      onCopyVersion: vi.fn(),
      onDeleteVersion: vi.fn()
    })
    for (const label of ['1.2.421 릴리스 날짜 수정', '1.2.421 복제', '1.2.421 삭제']) {
      const button = findNode(
        view,
        (node) => node.type === 'button' && node.props['aria-label'] === label
      )
      expect(button.props.title).toBe(label)
      expect(button.props.className).toContain('focus-visible:')
      expect(button.props.className).not.toContain('border')
      expect(button.props.className).not.toContain('bg-')
      expect(findNode(button, (node) => node.type === 'svg').props['aria-hidden']).toBe('true')
    }
  })
})
