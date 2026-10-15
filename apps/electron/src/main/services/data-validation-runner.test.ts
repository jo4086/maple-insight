import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

const fileSystem = vi.hoisted(() => ({
  rename: vi.fn(),
  originalRename: undefined as unknown as typeof import('node:fs/promises').rename
}))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  fileSystem.originalRename = actual.rename
  fileSystem.rename.mockImplementation(actual.rename)
  return { ...actual, rename: fileSystem.rename }
})

import {
  updateValidationWarningAcknowledgement,
  validateDataVersion
} from './data-validation-runner'

const temporaryDirectories: string[] = []

async function createDataRoot(
  records?: unknown[],
  additionalFiles: Record<string, unknown[]> = {}
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'maple-validation-runner-'))
  temporaryDirectories.push(root)
  const versionDirectory = join(root, 'production', '1.2.419')
  const files = {
    ...(records ? { 'json/ms_job.json': records } : {}),
    ...additionalFiles
  }

  await Promise.all(
    Object.entries(files).map(async ([output, fileRecords]) => {
      const path = join(versionDirectory, output)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, JSON.stringify(fileRecords))
    })
  )
  await writeFile(
    join(versionDirectory, 'manifest.json'),
    JSON.stringify({
      files: Object.entries(files).map(([output, fileRecords]) => ({
        output,
        records: fileRecords.length
      }))
    })
  )
  return root
}

afterEach(async () => {
  fileSystem.rename.mockImplementation(fileSystem.originalRename)
  fileSystem.rename.mockClear()
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true }))
  )
})

describe('data validation runner', () => {
  it('creates a workspace, validates class data and persists the report', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    const onProgress = vi.fn()
    const result = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production',
      onProgress
    })

    expect(result.status).toBe('ready')
    expect(result.publishable).toBe(true)
    expect(result.files).toEqual([
      {
        file: 'json/ms_job.json',
        domain: 'class',
        records: 1,
        errors: 0,
        warnings: 0
      }
    ])
    expect(
      JSON.parse(await readFile(join(result.workspacePath, 'validation.json'), 'utf8'))
    ).toMatchObject({
      status: 'ready',
      publishable: true
    })
    expect(onProgress.mock.calls.at(-1)?.[0]).toMatchObject({ stage: 'completed', percent: 100 })
    expect(
      JSON.parse(await readFile(`${result.workspacePath}.validation-runs.json`, 'utf8'))
    ).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        inputHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        status: 'success',
        processed: { files: 1, records: 1 },
        issues: { errors: 0, warnings: 0, unresolvedWarnings: 0 }
      })
    ])
  })

  it('fails closed when parsed records differ from the workspace manifest', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    const manifestPath = join(dataRoot, 'production', '1.2.419', 'manifest.json')
    await writeFile(
      manifestPath,
      JSON.stringify({ files: [{ output: 'json/ms_job.json', records: 2 }] })
    )

    await expect(
      validateDataVersion({
        dataRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production'
      })
    ).rejects.toThrow('작업본 레코드 수가 manifest와 일치하지 않습니다')

    const workspacePath = join(dataRoot, '.workspaces', 'production', '1.2.419')
    await expect(readFile(join(workspacePath, 'validation.json'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    })
    expect(JSON.parse(await readFile(`${workspacePath}.validation-runs.json`, 'utf8'))).toEqual([
      expect.objectContaining({
        status: 'failed',
        processed: { files: 0, records: 0 },
        issues: { errors: 0, warnings: 0, unresolvedWarnings: 0 }
      })
    ])
  })

  it('cancels after writing progress before report commit', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    const controller = new AbortController()

    await expect(
      validateDataVersion({
        dataRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production',
        signal: controller.signal,
        onProgress: ({ stage }) => {
          if (stage === 'writing') controller.abort()
        }
      })
    ).rejects.toMatchObject({ name: 'AbortError' })

    const workspacePath = join(dataRoot, '.workspaces', 'production', '1.2.419')
    await expect(readFile(join(workspacePath, 'validation.json'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    })
    expect(JSON.parse(await readFile(`${workspacePath}.validation-runs.json`, 'utf8'))).toEqual([
      expect.objectContaining({ status: 'cancelled' })
    ])
  })

  it('persists cancelled and failed run metadata without report issues', async () => {
    const cancelledRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    const controller = new AbortController()
    await expect(
      validateDataVersion({
        dataRoot: cancelledRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production',
        signal: controller.signal,
        onProgress: ({ stage }) => {
          if (stage === 'validating') controller.abort()
        }
      })
    ).rejects.toThrow(/abort/i)
    const cancelledWorkspace = join(cancelledRoot, '.workspaces', 'production', '1.2.419')
    expect(
      JSON.parse(await readFile(`${cancelledWorkspace}.validation-runs.json`, 'utf8'))
    ).toEqual([
      expect.objectContaining({ status: 'cancelled', processed: { files: 0, records: 0 } })
    ])

    const failedRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    await writeFile(join(failedRoot, 'production', '1.2.419', 'json', 'ms_job.json'), '{')
    await expect(
      validateDataVersion({
        dataRoot: failedRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production'
      })
    ).rejects.toThrow()
    const failedWorkspace = join(failedRoot, '.workspaces', 'production', '1.2.419')
    expect(
      JSON.parse(await readFile(join(failedWorkspace, 'workspace.json'), 'utf8'))
    ).toMatchObject({
      status: 'pending'
    })
    const failedHistory = JSON.parse(
      await readFile(`${failedWorkspace}.validation-runs.json`, 'utf8')
    )
    expect(failedHistory).toEqual([
      expect.objectContaining({
        status: 'failed',
        processed: { files: 0, records: 0 },
        issues: { errors: 0, warnings: 0, unresolvedWarnings: 0 }
      })
    ])
    expect(JSON.stringify(failedHistory)).not.toContain('모험의 기술')
  })

  it('persists pre-workspace failures and serializes concurrent history writes', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    const first = new AbortController()
    const second = new AbortController()
    first.abort()
    second.abort()
    await Promise.all([
      expect(
        validateDataVersion({
          dataRoot,
          sessionId: randomUUID(),
          version: '1.2.419',
          environment: 'production',
          signal: first.signal
        })
      ).rejects.toThrow(/abort/i),
      expect(
        validateDataVersion({
          dataRoot,
          sessionId: randomUUID(),
          version: '1.2.419',
          environment: 'production',
          signal: second.signal
        })
      ).rejects.toThrow(/abort/i)
    ])
    const workspacePath = join(dataRoot, '.workspaces', 'production', '1.2.419')
    const history = JSON.parse(await readFile(`${workspacePath}.validation-runs.json`, 'utf8'))
    expect(history).toEqual([
      expect.objectContaining({ status: 'cancelled', inputHash: null }),
      expect.objectContaining({ status: 'cancelled', inputHash: null })
    ])
    await expect(readFile(join(workspacePath, 'workspace.json'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })

  it('records unavailable input hashes for source-manifest and pre-workspace failures', async () => {
    const missingManifestRoot = await createDataRoot([{ jobID: '000', jobName: 'one' }])
    const missingManifestPath = join(missingManifestRoot, 'production', '1.2.419', 'manifest.json')
    await rm(missingManifestPath)
    await expect(
      validateDataVersion({
        dataRoot: missingManifestRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production'
      })
    ).rejects.toThrow()

    const firstRoot = await createDataRoot([{ jobID: '000', jobName: 'one' }])
    const secondRoot = await createDataRoot([{ jobID: '001', jobName: 'two' }])
    fileSystem.rename.mockImplementation(async (oldPath, newPath) => {
      if (newPath.endsWith('/.workspaces/production/1.2.419')) {
        throw new Error('workspace activation failed')
      }
      return fileSystem.originalRename(oldPath, newPath)
    })
    for (const dataRoot of [firstRoot, secondRoot]) {
      await expect(
        validateDataVersion({
          dataRoot,
          sessionId: randomUUID(),
          version: '1.2.419',
          environment: 'production'
        })
      ).rejects.toThrow('workspace activation failed')
      const historyPath = `${join(dataRoot, '.workspaces', 'production', '1.2.419')}.validation-runs.json`
      expect(JSON.parse(await readFile(historyPath, 'utf8'))).toEqual([
        expect.objectContaining({ status: 'failed', inputHash: null })
      ])
    }
    const missingHistoryPath = `${join(missingManifestRoot, '.workspaces', 'production', '1.2.419')}.validation-runs.json`
    expect(JSON.parse(await readFile(missingHistoryPath, 'utf8'))).toEqual([
      expect.objectContaining({ status: 'failed', inputHash: null })
    ])
  })

  it('preserves history when explicit replace rebuilds the workspace', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }])
    const first = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production',
      conflictPolicy: 'replace'
    })
    expect(
      JSON.parse(await readFile(`${first.workspacePath}.validation-runs.json`, 'utf8'))
    ).toEqual([
      expect.objectContaining({ status: 'success' }),
      expect.objectContaining({ status: 'success' })
    ])
  })

  it('persists invalid status when duplicate class IDs are found', async () => {
    const dataRoot = await createDataRoot([
      { jobID: '000', jobName: '첫 번째' },
      { jobID: '000', jobName: '두 번째' }
    ])
    const result = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })

    expect(result.status).toBe('invalid')
    expect(result.publishable).toBe(false)
    expect(result.issues[0]).toMatchObject({
      code: 'DUPLICATE_JOB_ID',
      location: { file: 'json/ms_job.json', record: 1, field: 'jobID' }
    })
  })

  it('cancels during a large streamed JSON read', async () => {
    const dataRoot = await createDataRoot(
      Array.from({ length: 4096 }, (_, index) => ({
        jobID: String(index).padStart(6, '0'),
        jobName: `job-${index}`
      }))
    )
    const controller = new AbortController()

    await expect(
      validateDataVersion({
        dataRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production',
        signal: controller.signal,
        onProgress: ({ stage }) => {
          if (stage === 'validating') queueMicrotask(() => controller.abort())
        }
      })
    ).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('blocks unsupported domains even when valid class data is present', async () => {
    const unsupportedOnlyRoot = await createDataRoot(undefined, { 'json/skills.json': [] })
    const unsupportedOnly = await validateDataVersion({
      dataRoot: unsupportedOnlyRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })

    expect(unsupportedOnly.status).toBe('invalid')
    expect(unsupportedOnly.publishable).toBe(false)
    expect(unsupportedOnly.issues).toContainEqual(
      expect.objectContaining({
        source: 'domain',
        domain: 'skill',
        severity: 'error',
        code: 'UNSUPPORTED_VALIDATION_DOMAIN',
        location: { file: 'json/skills.json' }
      })
    )
    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot: unsupportedOnlyRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: unsupportedOnly.issues[0].id,
        acknowledged: true
      })
    ).rejects.toThrow('오류 issue')

    const mixedRoot = await createDataRoot([{ jobID: '000', jobName: '모험의 기술' }], {
      'json/ms_skillPVPCommon.json': [
        { skillID: '000001', commonName: 'damage', commonValue: '10' }
      ],
      'json/skills.json': []
    })
    const mixed = await validateDataVersion({
      dataRoot: mixedRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })

    expect(mixed.status).toBe('invalid')
    expect(mixed.publishable).toBe(false)
    expect(mixed.files).toEqual([
      { file: 'json/ms_job.json', domain: 'class', records: 1, errors: 0, warnings: 0 },
      {
        file: 'json/ms_skillPVPCommon.json',
        domain: 'skill',
        records: 1,
        errors: 0,
        warnings: 0
      },
      { file: 'json/skills.json', domain: 'skill', records: 0, errors: 1, warnings: 0 }
    ])
    expect(mixed.issues).toContainEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_VALIDATION_DOMAIN',
        location: { file: 'json/skills.json' }
      })
    )
  })
})

describe('validation warning acknowledgements', () => {
  it('persists acknowledgements, reloads them, and updates status and publishability', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: ' 모험의 기술 ' }])
    const first = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const warning = first.issues.find((issue) => issue.severity === 'warning')
    expect(warning).toBeDefined()

    const updated = await updateValidationWarningAcknowledgement({
      dataRoot,
      version: '1.2.419',
      environment: 'production',
      issueId: warning!.id,
      acknowledged: true,
      exceptionReason: '원본 공백 유지 확인'
    })
    expect(updated.status).toBe('ready')
    expect(updated.publishable).toBe(true)
    expect(updated.summary.unresolvedWarnings).toBe(0)
    expect(
      JSON.parse(await readFile(join(updated.workspacePath, 'workspace.json'), 'utf8'))
    ).toMatchObject({ status: 'ready' })

    const unacknowledged = await updateValidationWarningAcknowledgement({
      dataRoot,
      version: '1.2.419',
      environment: 'production',
      issueId: warning!.id,
      acknowledged: false
    })
    expect(unacknowledged.status).toBe('review')
    expect(unacknowledged.publishable).toBe(false)

    const restored = await updateValidationWarningAcknowledgement({
      dataRoot,
      version: '1.2.419',
      environment: 'production',
      issueId: warning!.id,
      acknowledged: true,
      exceptionReason: '원본 공백 유지 확인'
    })
    expect(restored.status).toBe('ready')

    const report = JSON.parse(
      await readFile(join(updated.workspacePath, 'validation.json'), 'utf8')
    )
    expect(report.issues[0].acknowledgement).toEqual({
      acknowledged: true,
      exceptionReason: '원본 공백 유지 확인'
    })

    const revalidated = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    expect(revalidated.status).toBe('ready')
    expect(revalidated.issues[0].acknowledgement).toEqual({
      acknowledged: true,
      exceptionReason: '원본 공백 유지 확인'
    })
  })

  it('restores the report when writing the workspace manifest fails', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: ' 모험의 기술 ' }])
    const result = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const warning = result.issues.find((issue) => issue.severity === 'warning')
    expect(warning).toBeDefined()

    const reportPath = join(result.workspacePath, 'validation.json')
    const manifestPath = join(result.workspacePath, 'workspace.json')
    const originalReport = await readFile(reportPath, 'utf8')
    fileSystem.rename.mockImplementation(async (oldPath, newPath) => {
      if (newPath === manifestPath) throw new Error('workspace manifest write failed')
      return fileSystem.originalRename(oldPath, newPath)
    })

    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: warning!.id,
        acknowledged: true
      })
    ).rejects.toThrow('workspace manifest write failed')

    expect(await readFile(reportPath, 'utf8')).toBe(originalReport)
    await expect(readFile(`${manifestPath}.tmp`, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('replaces interrupted workspace on revalidation but keeps safe run history', async () => {
    const records = [{ jobID: '000', jobName: ' 모험의 기술 ' }]
    const dataRoot = await createDataRoot(records)
    const first = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const warning = first.issues.find((issue) => issue.severity === 'warning')
    const reportPath = join(first.workspacePath, 'validation.json')
    const manifestPath = join(first.workspacePath, 'workspace.json')
    const report = JSON.parse(await readFile(reportPath, 'utf8'))
    await writeFile(reportPath, JSON.stringify({ ...report, status: 'ready' }))
    await writeFile(
      `${manifestPath}.validation-update`,
      JSON.stringify({
        operation: 'validation-report-manifest-update',
        startedAt: new Date().toISOString()
      })
    )

    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: warning!.id,
        acknowledged: true
      })
    ).rejects.toThrow('저장이 중단되었습니다')

    const recovered = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production',
      conflictPolicy: 'reuse'
    })
    expect(recovered.status).toBe('review')
    expect(recovered.issues[0].acknowledgement).toBeUndefined()
    expect(
      JSON.parse(await readFile(`${first.workspacePath}.validation-runs.json`, 'utf8'))
    ).toEqual([
      expect.objectContaining({ status: 'success' }),
      expect.objectContaining({ status: 'success' })
    ])
    await expect(readFile(`${manifestPath}.validation-update`, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    })
    expect(
      JSON.parse(
        await readFile(join(dataRoot, 'production', '1.2.419', 'json', 'ms_job.json'), 'utf8')
      )
    ).toEqual(records)
  })

  it('fails closed when report and manifest statuses differ', async () => {
    const dataRoot = await createDataRoot([{ jobID: '000', jobName: ' 모험의 기술 ' }])
    const result = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const warning = result.issues.find((issue) => issue.severity === 'warning')
    const manifestPath = join(result.workspacePath, 'workspace.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    await writeFile(manifestPath, JSON.stringify({ ...manifest, status: 'ready' }))

    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: warning!.id,
        acknowledged: true
      })
    ).rejects.toThrow('상태가 일치하지 않습니다')
  })

  it('rejects missing reports, unknown issue IDs, and error acknowledgements', async () => {
    const dataRoot = await createDataRoot([
      { jobID: '000', jobName: '첫 번째', extra: true },
      { jobID: '000', jobName: '두 번째' }
    ])
    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: 'missing',
        acknowledged: true
      })
    ).rejects.toThrow('검증 보고서를 찾을 수 없습니다')

    const result = await validateDataVersion({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const warning = result.issues.find((issue) => issue.severity === 'warning')
    const error = result.issues.find((issue) => issue.severity === 'error')
    expect(warning).toBeDefined()
    expect(error).toBeDefined()

    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: 'unknown',
        acknowledged: true
      })
    ).rejects.toThrow('없는 issue ID')
    await expect(
      updateValidationWarningAcknowledgement({
        dataRoot,
        version: '1.2.419',
        environment: 'production',
        issueId: error!.id,
        acknowledged: true
      })
    ).rejects.toThrow('오류 issue')

    const updated = await updateValidationWarningAcknowledgement({
      dataRoot,
      version: '1.2.419',
      environment: 'production',
      issueId: warning!.id,
      acknowledged: true
    })
    expect(updated.status).toBe('invalid')
    expect(updated.publishable).toBe(false)
  })
})
