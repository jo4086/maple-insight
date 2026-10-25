import { describe, expect, it } from 'vitest'

import { diffRawData } from './raw-data-diff'

describe('raw data diff', () => {
  it.each([
    ['ms_job.json', { jobID: '00001' }, { jobID: '00002' }],
    ['ms_skill.json', { skillID: '00001' }, { skillID: '00002' }],
    ['ms_skillH.json', { skillID: '00001' }, { skillID: '00002' }],
    [
      'ms_skillCommon.json',
      { skillID: '00001', commonName: 'damage' },
      { skillID: '00002', commonName: 'damage' }
    ],
    ['ms_skillLevel.json', { skillID: '00001', level: '1' }, { skillID: '00002', level: '1' }]
  ] as const)('uses the required identity for %s', (filename, base, compare) => {
    const result = diffRawData(filename, [base], [compare])

    expect(result).toEqual({ add: [compare], modify: [], delete: [base] })
  })

  it('separates add, modify, and delete with deterministic field changes', () => {
    const deleted = { jobID: '00001', jobName: 'old' }
    const unchanged = { jobID: '00002', jobName: 'same' }
    const modified = { jobID: '00003', jobName: 'before', rank: 1 }
    const added = { jobID: '00004', jobName: 'new' }

    const result = diffRawData(
      'ms_job.json',
      [modified, unchanged, deleted],
      [added, { jobID: '00003', jobName: 'after', rank: 2 }, unchanged]
    )

    expect(result).toEqual({
      add: [added],
      modify: [
        {
          identity: { jobID: '00003' },
          fields: [
            {
              field: 'jobName',
              before: { kind: 'value', value: 'before' },
              after: { kind: 'value', value: 'after' }
            },
            {
              field: 'rank',
              before: { kind: 'value', value: 1 },
              after: { kind: 'value', value: 2 }
            }
          ],
          before: modified,
          after: { jobID: '00003', jobName: 'after', rank: 2 }
        }
      ],
      delete: [deleted]
    })
  })

  it('ignores record and object key order but keeps array order significant', () => {
    const base = [
      { skillID: '00002', payload: { name: 'two', values: [1, 2] } },
      { skillID: '00001', payload: { name: 'one', values: [3, 4] } }
    ]
    const compare = [
      { payload: { values: [3, 4], name: 'one' }, skillID: '00001' },
      { payload: { values: [1, 2], name: 'two' }, skillID: '00002' }
    ]

    expect(diffRawData('ms_skill.json', base, compare)).toEqual({ add: [], modify: [], delete: [] })
    expect(
      diffRawData('ms_skill.json', base, [
        { skillID: '00001', payload: { name: 'one', values: [4, 3] } },
        compare[1]
      ])
    ).toMatchObject({ modify: [{ identity: { skillID: '00001' } }] })
  })

  it('preserves system and zero-padded identifiers', () => {
    const system = { jobID: '800000', jobName: 'system' }
    const padded = { jobID: '00001', jobName: 'padded' }

    expect(diffRawData('ms_job.json', [system], [padded])).toEqual({
      add: [padded],
      modify: [],
      delete: [system]
    })
  })

  it('keeps complete nested records while representing missing fields separately from null', () => {
    const before = {
      jobID: '00001',
      unchanged: { nested: { label: 'same' }, values: [1, null] },
      removed: 'value',
      nullable: null
    }
    const after = {
      jobID: '00001',
      unchanged: { values: [1, null], nested: { label: 'same' } },
      added: null
    }
    const result = diffRawData('ms_job.json', [before], [after])

    expect(result.modify[0]).toMatchObject({ before, after })
    expect(result.modify[0].fields).toEqual([
      {
        field: 'added',
        before: { kind: 'absent' },
        after: { kind: 'value', value: null }
      },
      {
        field: 'nullable',
        before: { kind: 'value', value: null },
        after: { kind: 'absent' }
      },
      {
        field: 'removed',
        before: { kind: 'value', value: 'value' },
        after: { kind: 'absent' }
      }
    ])
  })

  it('rejects inherited identity values', () => {
    const record = Object.create({ jobID: '00001' }) as { jobID?: string }

    expect(() => diffRawData('ms_job.json', [record], [])).toThrow(
      'Invalid base record at index 0: expected a JSON object'
    )
  })

  it('rejects duplicate and missing identity values before producing a diff', () => {
    expect(() =>
      diffRawData(
        'ms_skillCommon.json',
        [
          { skillID: '1', commonName: 'damage' },
          { skillID: '1', commonName: 'damage' }
        ],
        []
      )
    ).toThrow('Duplicate base identity for ms_skillCommon.json: skillID="1", commonName="damage"')
    expect(() => diffRawData('ms_skillLevel.json', [{ skillID: '1', level: '' }], [])).toThrow(
      'missing or empty string identity field level'
    )
  })

  it('rejects unsupported files, PVP, and malformed input', () => {
    expect(() => diffRawData('ms_skillPVPCommon.json', [], [])).toThrow(
      'Unsupported raw data diff filename'
    )
    expect(() => diffRawData('other.json', [], [])).toThrow('Unsupported raw data diff filename')
    expect(() => diffRawData('ms_job.json', {}, [])).toThrow(
      'Invalid base records: expected an array'
    )
    expect(() => diffRawData('ms_job.json', [null], [])).toThrow(
      'Invalid base record at index 0: expected a JSON object'
    )
    expect(() => diffRawData('ms_job.json', [{ jobID: '1', invalid: undefined }], [])).toThrow(
      'expected a JSON-compatible value'
    )
    expect(() => diffRawData('ms_job.json', [{ jobID: '1', invalid: new Date() }], [])).toThrow(
      'expected a JSON-compatible value'
    )
    const sparse = new Array(1)
    expect(() => diffRawData('ms_job.json', [{ jobID: '1', values: sparse }], [])).toThrow(
      'sparse arrays are not supported'
    )
    expect(() => diffRawData('ms_job.json', [{ jobID: '1', values: [undefined] }], [])).toThrow(
      'expected a JSON-compatible value'
    )
    expect(() =>
      diffRawData('ms_job.json', [{ jobID: '1', values: sparse }], [{ jobID: '1', values: [null] }])
    ).toThrow('sparse arrays are not supported')
  })
})
