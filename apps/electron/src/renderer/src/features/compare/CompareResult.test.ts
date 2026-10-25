import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type {
  RawDataComparison,
  RawDataModifiedRecord,
  RawDataRecord
} from '../../../../shared/raw-data-diff'

import { CompareDetailView } from './CompareDetailView'
import { ResultCard } from './CompareResult'
import {
  compareAndSaveRawDataFile,
  comparisonCounts,
  comparisonFiles,
  filterResultItems,
  getCompareErrorMessage,
  isComparisonForContext,
  isStaleInputHashError
} from './CompareResultModel'
import { CompareView } from './CompareView'

const fullChange = {
  identity: { skillID: '0100' },
  fields: [
    {
      field: 'description',
      before: { kind: 'value' as const, value: '이전 설명' },
      after: { kind: 'value' as const, value: '변경 설명' }
    }
  ],
  before: { skillID: '0100', name: '중립 이름', description: '이전 설명' },
  after: { skillID: '0100', name: '중립 이름', description: '변경 설명' }
} satisfies RawDataModifiedRecord & { before: RawDataRecord; after: RawDataRecord }

function htmlText(markup: string): string {
  return markup
    .replace(/<!--.*?-->/gs, '')
    .replace(/<[^>]+>/g, '')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

const result: RawDataComparison = {
  baseVersion: '1.2.419',
  compareVersion: '1.2.424',
  filename: 'ms_skill.json',
  inputHash: 'hash',
  add: [
    { skillID: '0001', name: '새 스킬' },
    { skillID: '0002', name: '다른 스킬' }
  ],
  modify: [fullChange],
  delete: [{ skillID: '0900', name: '삭제 스킬' }]
}

describe('integrated comparison workspace', () => {
  it('shows only baseline and file selectors with an initially empty file selection', () => {
    const markup = renderToStaticMarkup(
      createElement(CompareView, {
        versions: ['1.2.419', '1.2.424'],
        currentVersion: '1.2.424',
        compareVersion: '1.2.419',
        changeCompareVersion: vi.fn()
      })
    )

    for (const filename of comparisonFiles) expect(markup).toContain(filename)
    expect(markup).toContain('비교 버전')
    expect(markup).toContain('파일 선택')
    expect(markup).toContain('<option value="" disabled="" selected="">파일 선택</option>')
    expect(markup).toContain('5개 파일 비교·저장')
    expect(markup).not.toContain('현재 버전')
    expect(markup).not.toContain('선택 파일 저장 결과 열기')
    expect(markup).not.toContain('비교 방향: 기준 → 현재')
  })

  it('renders compact category rows and adjacent responsive panels', () => {
    const markup = renderToStaticMarkup(
      createElement(CompareView, {
        versions: ['1.2.419', '1.2.424'],
        currentVersion: '1.2.424',
        compareVersion: '1.2.419',
        changeCompareVersion: vi.fn()
      })
    )

    expect(markup).toContain('xl:grid-cols-[290px_minmax(0,1fr)_230px]')
    expect(markup).toContain('border-x border-app-border')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('aria-pressed="false"')
    expect(markup).toContain('전체')
    expect(markup).toContain('추가')
    expect(markup).toContain('수정')
    expect(markup).toContain('삭제')
    expect(markup).toContain('결과 검색')
    expect(markup).not.toContain('추가 필터 없음')
    expect(markup).not.toContain('rounded-[9px]')
  })
})

describe('stored result loading state', () => {
  const contextKey = '1.2.419\u00001.2.424\u0000ms_skill.json'
  const conflictState: Parameters<typeof CompareView.beginStoredResultOpen>[0] = {
    status: 'conflict',
    result,
    replacement: { ...result, inputHash: 'replacement-hash' },
    error: '',
    notice: '기존 저장 결과와 입력이 다릅니다.',
    contextKey,
    retryKind: null
  }

  it('shows the stored artifact without clearing pending replacement approval', () => {
    const opening = CompareView.beginStoredResultOpen(conflictState, contextKey)
    const stored = { ...result, inputHash: 'stored-hash' }
    const loaded = CompareView.finishStoredResultOpen(opening, stored, contextKey)

    expect(opening.status).toBe('conflict')
    expect(opening.replacement).toBe(conflictState.replacement)
    expect(loaded).toMatchObject({
      status: 'conflict',
      result: stored,
      replacement: conflictState.replacement,
      error: '',
      contextKey
    })
    expect(loaded.notice).toContain('교체를 확인')
  })

  it('keeps pending replacement approval when opening the stored artifact fails', () => {
    const opening = CompareView.beginStoredResultOpen(conflictState, contextKey)
    const failed = CompareView.failStoredResultOpen(opening, '저장 결과 열기 실패', contextKey)

    expect(failed).toMatchObject({
      status: 'conflict',
      result,
      replacement: conflictState.replacement,
      error: '저장 결과 열기 실패',
      contextKey,
      retryKind: 'open'
    })
  })
})

describe('per-file comparison flow', () => {
  const request = {
    baseVersion: '1.2.419',
    compareVersion: '1.2.424',
    filename: 'ms_skill.json' as const
  }

  it('compares, checks saved input, and saves one file with its computed hash', async () => {
    const api = {
      compareRawData: vi.fn().mockResolvedValue(result),
      openRawDataDiff: vi.fn().mockResolvedValue(null),
      saveRawDataDiff: vi.fn().mockResolvedValue({ status: 'created', result })
    }

    await expect(compareAndSaveRawDataFile(api, request)).resolves.toEqual({
      kind: 'saved',
      result,
      reused: false
    })
    expect(api.compareRawData).toHaveBeenCalledWith(request)
    expect(api.openRawDataDiff).toHaveBeenCalledWith(request)
    expect(api.saveRawDataDiff).toHaveBeenCalledWith({ ...request, inputHash: 'hash' })
  })

  it('retains per-file conflict approval instead of replacing automatically', async () => {
    const api = {
      compareRawData: vi.fn().mockResolvedValue(result),
      openRawDataDiff: vi.fn().mockResolvedValue({ ...result, inputHash: 'old-hash' }),
      saveRawDataDiff: vi.fn()
    }

    await expect(compareAndSaveRawDataFile(api, request)).resolves.toEqual({
      kind: 'conflict',
      result
    })
    expect(api.saveRawDataDiff).not.toHaveBeenCalled()
  })

  it('requires per-file approval when saved output is corrupted', async () => {
    const api = {
      compareRawData: vi.fn().mockResolvedValue(result),
      openRawDataDiff: vi.fn().mockRejectedValue(new Error('Invalid saved raw data diff')),
      saveRawDataDiff: vi.fn()
    }

    await expect(compareAndSaveRawDataFile(api, request)).resolves.toEqual({
      kind: 'conflict',
      result
    })
    expect(api.saveRawDataDiff).not.toHaveBeenCalled()
  })

  it('returns a missing-file failure for targeted retry without calling save', async () => {
    const missing = new Error('Missing input: /data/production/1.2.424/json/ms_skill.json')
    const api = {
      compareRawData: vi.fn().mockRejectedValue(missing),
      openRawDataDiff: vi.fn(),
      saveRawDataDiff: vi.fn()
    }

    await expect(compareAndSaveRawDataFile(api, request)).resolves.toEqual({
      kind: 'error',
      result: null,
      error: missing
    })
    expect(api.openRawDataDiff).not.toHaveBeenCalled()
    expect(api.saveRawDataDiff).not.toHaveBeenCalled()
    expect(getCompareErrorMessage(missing)).toContain('버전 1.2.424')
  })

  it('summarizes every result category for each file card', () => {
    expect(comparisonCounts(result)).toEqual({ all: 4, add: 2, modify: 1, delete: 1 })
    expect(comparisonCounts(null)).toEqual({ all: 0, add: 0, modify: 0, delete: 0 })
  })
})

describe('result rendering', () => {
  function jsonDocuments(markup: string): RawDataRecord[] {
    return [...markup.matchAll(/<pre[^>]*>(.*?)<\/pre>/gs)].map((match) =>
      JSON.parse(htmlText(match[1]))
    )
  }

  function changedValues(markup: string): unknown[] {
    return [...markup.matchAll(/<mark[^>]*data-changed="true"[^>]*>(.*?)<\/mark>/gs)].map((match) =>
      JSON.parse(htmlText(match[1]))
    )
  }

  it('renders ms_job snapshots as complete valid JSON and highlights only changed leaves', () => {
    const jobChange = {
      identity: { jobID: '100' },
      fields: [
        {
          field: 'metadata',
          before: { kind: 'value' as const, value: { damage: 10, label: '유지' } },
          after: { kind: 'value' as const, value: { damage: 20, label: '유지' } }
        }
      ],
      before: {
        jobID: '100',
        name: '중립 직업명',
        metadata: { damage: 10, label: '유지' },
        steps: [{ level: 1, name: '동일' }]
      },
      after: {
        jobID: '100',
        name: '중립 직업명',
        metadata: { damage: 20, label: '유지' },
        steps: [{ level: 1, name: '동일' }]
      }
    } satisfies RawDataModifiedRecord & { before: RawDataRecord; after: RawDataRecord }
    const markup = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'modify', key: 'modify-job', change: jobChange }
      })
    )

    expect(markup).toContain('>수정</strong>')
    expect(markup).toContain('aria-label="이전"')
    expect(markup).toContain('aria-label="이후"')
    expect(markup).toContain('sm:grid-cols-2')
    expect(markup).toContain('border-app-warning-border')
    expect(jsonDocuments(markup)).toEqual([jobChange.before, jobChange.after])
    expect(changedValues(markup)).toEqual([10, 20])
    expect(markup).not.toMatch(/<mark[^>]*>[^<]*(?:유지|동일|중립 직업명)/)
  })

  it('builds the same two-box ms_skill card from identity and legacy field values', () => {
    const snapshotFreeChange: RawDataModifiedRecord = {
      identity: { skillID: '0100' },
      fields: fullChange.fields
    }
    const markup = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'modify', key: 'modify-skill', change: snapshotFreeChange }
      })
    )

    expect(jsonDocuments(markup)).toEqual([
      { skillID: '0100', description: '이전 설명' },
      { skillID: '0100', description: '변경 설명' }
    ])
    expect(changedValues(markup)).toEqual(['이전 설명', '변경 설명'])
    expect(markup).not.toContain('레거시 저장 결과')
  })

  it('omits absent add and remove fields while preserving valid fallback JSON', () => {
    const fieldChange: RawDataModifiedRecord = {
      identity: { skillID: '0200' },
      fields: [
        {
          field: 'addedValue',
          before: { kind: 'absent' },
          after: { kind: 'value', value: { amount: 3 } }
        },
        {
          field: 'removedValue',
          before: { kind: 'value', value: ['old'] },
          after: { kind: 'absent' }
        }
      ]
    }
    const markup = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'modify', key: 'modify-fields', change: fieldChange }
      })
    )

    expect(jsonDocuments(markup)).toEqual([
      { skillID: '0200', removedValue: ['old'] },
      { skillID: '0200', addedValue: { amount: 3 } }
    ])
    expect(changedValues(markup)).toEqual(['old', 3])
    expect(markup).not.toContain('필드 없음')
  })

  it('preserves legacy __proto__ fields without prototype pollution', () => {
    const change = JSON.parse(`{
      "identity": { "skillID": "0250" },
      "fields": [
        {
          "field": "__proto__",
          "before": { "kind": "value", "value": { "state": "before" } },
          "after": { "kind": "value", "value": { "state": "after" } }
        }
      ]
    }`) as RawDataModifiedRecord
    const markup = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'modify', key: 'modify-proto', change }
      })
    )
    const documents = jsonDocuments(markup)

    expect(documents).toEqual([
      JSON.parse('{"skillID":"0250","__proto__":{"state":"before"}}'),
      JSON.parse('{"skillID":"0250","__proto__":{"state":"after"}}')
    ])
    expect(Object.getPrototypeOf(documents[0])).toBe(Object.prototype)
    expect(Object.getPrototypeOf(documents[1])).toBe(Object.prototype)
    expect(Object.prototype).not.toHaveProperty('state')
  })

  it('highlights changed empty containers and keeps unchanged empty containers neutral', () => {
    const emptyContainerChange = {
      identity: { skillID: '0300' },
      fields: [
        {
          field: 'options',
          before: { kind: 'value' as const, value: null },
          after: { kind: 'value' as const, value: {} }
        },
        {
          field: 'levels',
          before: { kind: 'value' as const, value: [] },
          after: { kind: 'value' as const, value: null }
        }
      ],
      before: { skillID: '0300', options: null, levels: [], unchanged: {} },
      after: { skillID: '0300', options: {}, levels: null, unchanged: {} }
    } satisfies RawDataModifiedRecord & { before: RawDataRecord; after: RawDataRecord }
    const markup = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'modify', key: 'modify-empty-containers', change: emptyContainerChange }
      })
    )

    expect(jsonDocuments(markup)).toEqual([emptyContainerChange.before, emptyContainerChange.after])
    expect(changedValues(markup)).toEqual([null, [], {}, null])
    expect(markup.match(/data-changed="true"/g)).toHaveLength(4)
  })

  it('keeps add and delete records as full JSON cards', () => {
    const added = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'add', key: 'add-0', record: result.add[0] }
      })
    )
    const deleted = renderToStaticMarkup(
      createElement(ResultCard, {
        item: { kind: 'delete', key: 'delete-0', record: result.delete[0] }
      })
    )

    expect(added).toContain('추가')
    expect(added).toContain('&quot;skillID&quot;: &quot;0001&quot;')
    expect(added).toContain('새 스킬')
    expect(deleted).toContain('삭제')
    expect(deleted).toContain('&quot;skillID&quot;: &quot;0900&quot;')
    expect(deleted).toContain('삭제 스킬')
    expect(added).not.toContain('data-changed="true"')
    expect(deleted).not.toContain('data-changed="true"')
  })
})

describe('compare result selection', () => {
  it('searches unchanged full-record fields as well as identity and changed fields', () => {
    expect(filterResultItems(result, 'modify', '중립 이름')).toHaveLength(1)
    expect(filterResultItems(result, 'modify', '0100')).toHaveLength(1)
    expect(filterResultItems(result, 'modify', 'description')).toHaveLength(1)
    expect(filterResultItems(result, 'modify', '이전 설명')).toHaveLength(1)
    expect(filterResultItems(result, 'modify', '변경 설명')).toHaveLength(1)
    expect(filterResultItems(result, 'delete', '새 스킬')).toEqual([])
  })

  it('keeps the ten-item first-page pagination model', () => {
    const paginatedResult: RawDataComparison = {
      ...result,
      add: Array.from({ length: 12 }, (_, index) => ({
        skillID: index.toString().padStart(4, '0'),
        name: `페이지 항목 ${index}`
      })),
      modify: [],
      delete: []
    }
    const markup = renderToStaticMarkup(
      createElement(CompareDetailView, {
        result: paginatedResult,
        category: 'all',
        selectionKey: 'pagination',
        isBusy: false,
        error: '',
        notice: ''
      })
    )

    expect(markup).toContain('1 / 2 페이지 · 12건')
    expect(markup).toContain('페이지 항목 9')
    expect(markup).not.toContain('페이지 항목 10')
  })

  it('rejects stale results for a changed version or file context', () => {
    expect(isComparisonForContext(result, '1.2.419', '1.2.424', 'ms_skill.json')).toBe(true)
    expect(isComparisonForContext(result, '1.2.420', '1.2.424', 'ms_skill.json')).toBe(false)
    expect(isComparisonForContext(result, '1.2.419', '1.2.425', 'ms_skill.json')).toBe(false)
    expect(isComparisonForContext(result, '1.2.419', '1.2.424', 'ms_job.json')).toBe(false)
  })

  it('distinguishes stale input-hash rejection from retryable save errors', () => {
    expect(isStaleInputHashError(new Error('Raw data input hash is stale'))).toBe(true)
    expect(isStaleInputHashError(new Error('Unable to save comparison'))).toBe(false)
    expect(isStaleInputHashError('Raw data input hash is stale')).toBe(false)
  })
})
