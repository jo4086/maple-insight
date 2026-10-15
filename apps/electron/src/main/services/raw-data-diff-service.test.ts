import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  compareRawData,
  listComparableRawDataFiles,
  openRawDataDiff,
  saveRawDataDiff
} from './raw-data-diff-service'

const baseVersion = '1.2.419'
const compareVersion = '1.2.420'
const roots: string[] = []

async function createRootAt(root: string): Promise<void> {
  await Promise.all(
    [baseVersion, compareVersion].map((version) =>
      mkdir(join(root, 'production', version, 'json'), { recursive: true })
    )
  )
}

async function createRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'raw-data-diff-'))
  roots.push(root)
  await createRootAt(root)
  return root
}

async function writeRaw(
  root: string,
  version: string,
  filename: string,
  records: unknown
): Promise<void> {
  await writeFile(
    join(root, 'production', version, 'json', filename),
    `${JSON.stringify(records)}\n`,
    'utf8'
  )
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('raw data diff service', () => {
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
  ] as const)('compares required identity for %s', async (filename, base, changed) => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, filename, [base])
    await writeRaw(root, compareVersion, filename, [changed])

    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename })
    ).resolves.toMatchObject({ filename, add: [changed], delete: [base], modify: [] })
  })

  it('lists shared allowlisted files when other allowlisted files are missing', async () => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, 'ms_job.json', [])
    await writeRaw(root, compareVersion, 'ms_job.json', [])
    await writeRaw(root, baseVersion, 'ms_skill.json', [])
    await writeRaw(root, compareVersion, 'ms_skillPVPCommon.json', [])

    await expect(
      listComparableRawDataFiles(root, { baseVersion, compareVersion })
    ).resolves.toEqual(['ms_job.json'])
  })

  it('rejects a one-sided allowlisted file with its missing version and import guidance', async () => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, 'ms_job.json', [])

    await expect(listComparableRawDataFiles(root, { baseVersion, compareVersion })).rejects.toThrow(
      'Missing raw JSON file ms_job.json for compare version 1.2.420. Import raw JSON for this version.'
    )
  })

  it('returns no files when both version directories have no allowlisted files', async () => {
    const root = await createRoot()

    await expect(
      listComparableRawDataFiles(root, { baseVersion, compareVersion })
    ).resolves.toEqual([])
  })

  it('rejects missing, malformed, duplicate, PVP, and symlink inputs', async () => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, 'ms_job.json', [{ jobID: '1' }])
    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename: 'ms_job.json' })
    ).rejects.toThrow('Missing input')

    await writeRaw(root, compareVersion, 'ms_job.json', [{ jobID: '1' }, { jobID: '1' }])
    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename: 'ms_job.json' })
    ).rejects.toThrow('Duplicate compare identity')
    await writeFile(join(root, 'production', compareVersion, 'json', 'ms_job.json'), '{', 'utf8')
    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename: 'ms_job.json' })
    ).rejects.toThrow('Invalid JSON input')
    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename: 'ms_skillPVPCommon.json' })
    ).rejects.toThrow('Unsupported raw data diff filename')
    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename: '../ms_job.json' })
    ).rejects.toThrow('Unsupported raw data diff filename')

    const outside = join(root, 'outside.json')
    await writeFile(outside, '[]', 'utf8')
    const linked = join(root, 'production', compareVersion, 'json', 'ms_job.json')
    await rm(linked)
    await symlink(outside, linked)
    await expect(
      compareRawData(root, { baseVersion, compareVersion, filename: 'ms_job.json' })
    ).rejects.toThrow('Symbolic links are not allowed')
  })

  it('rejects a symlink ancestor of the managed data root', async () => {
    const container = await mkdtemp(join(tmpdir(), 'raw-data-diff-parent-'))
    roots.push(container)
    const actualRoot = join(container, 'actual', 'data')
    await createRootAt(actualRoot)
    await writeRaw(actualRoot, baseVersion, 'ms_job.json', [])
    await writeRaw(actualRoot, compareVersion, 'ms_job.json', [])
    await symlink(join(container, 'actual'), join(container, 'linked'))

    await expect(
      compareRawData(join(container, 'linked', 'data'), {
        baseVersion,
        compareVersion,
        filename: 'ms_job.json'
      })
    ).rejects.toThrow('Symbolic links are not allowed')
  })

  it('rejects a tampered artifact and explicitly repairs it', async () => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, 'ms_job.json', [{ jobID: '1', name: 'before' }])
    await writeRaw(root, compareVersion, 'ms_job.json', [{ jobID: '1', name: 'after' }])
    const compared = await compareRawData(root, {
      baseVersion,
      compareVersion,
      filename: 'ms_job.json'
    })
    await saveRawDataDiff(root, compared)
    const stored = join(root, 'diff', `${baseVersion}_to_${compareVersion}`, 'ms_job.json')
    const tampered = JSON.parse(await readFile(stored, 'utf8'))
    tampered.modify = []
    await writeFile(stored, `${JSON.stringify(tampered)}\n`, 'utf8')

    await expect(openRawDataDiff(root, compared)).rejects.toThrow('Invalid saved raw data diff')
    await expect(saveRawDataDiff(root, compared)).rejects.toThrow('Invalid saved raw data diff')
    await expect(
      saveRawDataDiff(root, { ...compared, replaceExisting: true })
    ).resolves.toMatchObject({
      status: 'replaced'
    })
    await expect(openRawDataDiff(root, compared)).resolves.toEqual(compared)

    await writeRaw(root, compareVersion, 'ms_job.json', [{ jobID: '1', name: 'newer' }])
    await expect(openRawDataDiff(root, compared)).resolves.toEqual(compared)
  })

  it('keeps existing artifact when explicit repair write fails', async () => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, 'ms_job.json', [{ jobID: '1', name: 'before' }])
    await writeRaw(root, compareVersion, 'ms_job.json', [{ jobID: '1', name: 'after' }])
    const compared = await compareRawData(root, {
      baseVersion,
      compareVersion,
      filename: 'ms_job.json'
    })
    await saveRawDataDiff(root, compared)
    const stored = join(root, 'diff', `${baseVersion}_to_${compareVersion}`, 'ms_job.json')
    const tampered = JSON.parse(await readFile(stored, 'utf8'))
    tampered.modify = []
    await writeFile(stored, `${JSON.stringify(tampered)}\n`, 'utf8')
    const beforeFailure = await readFile(stored, 'utf8')
    const directory = dirname(stored)
    await chmod(directory, 0o500)
    try {
      await expect(saveRawDataDiff(root, { ...compared, replaceExisting: true })).rejects.toThrow()
    } finally {
      await chmod(directory, 0o700)
    }
    await expect(readFile(stored, 'utf8')).resolves.toBe(beforeFailure)
    await expect(openRawDataDiff(root, compared)).rejects.toThrow('Invalid saved raw data diff')
  })

  it('rejects stale hashes, reuses equal input, replaces only explicitly, and preserves rejected replacement', async () => {
    const root = await createRoot()
    await writeRaw(root, baseVersion, 'ms_job.json', [{ jobID: '1', name: 'before' }])
    await writeRaw(root, compareVersion, 'ms_job.json', [{ jobID: '1', name: 'after' }])
    const compared = await compareRawData(root, {
      baseVersion,
      compareVersion,
      filename: 'ms_job.json'
    })

    await expect(
      saveRawDataDiff(root, {
        baseVersion,
        compareVersion,
        filename: 'ms_job.json',
        inputHash: '0'.repeat(64)
      })
    ).rejects.toThrow('stale')
    await expect(saveRawDataDiff(root, compared)).resolves.toMatchObject({ status: 'created' })
    await expect(saveRawDataDiff(root, compared)).resolves.toMatchObject({ status: 'reused' })

    await writeRaw(root, compareVersion, 'ms_job.json', [{ jobID: '1', name: 'newer' }])
    const changed = await compareRawData(root, {
      baseVersion,
      compareVersion,
      filename: 'ms_job.json'
    })
    await expect(saveRawDataDiff(root, changed)).rejects.toThrow('replaceExisting is required')
    await expect(openRawDataDiff(root, changed)).resolves.toMatchObject({
      inputHash: compared.inputHash
    })
    await expect(
      saveRawDataDiff(root, { ...changed, replaceExisting: true })
    ).resolves.toMatchObject({
      status: 'replaced'
    })
    await expect(openRawDataDiff(root, changed)).resolves.toMatchObject({
      inputHash: changed.inputHash
    })

    const stored = join(root, 'diff', `${baseVersion}_to_${compareVersion}`, 'ms_job.json')
    expect(JSON.parse(await readFile(stored, 'utf8'))).toMatchObject({
      inputHash: changed.inputHash
    })
  })
})
