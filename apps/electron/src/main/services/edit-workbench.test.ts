import { createHash, randomUUID } from 'node:crypto'
import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  openOrCreateEditWorkbench,
  readJobMetadataRecords,
  saveJobMetadataRecord,
  saveRecoveredJobMetadataFirstRevision,
  type JobMetadataAfter,
  type RecoveryCopyProvenance
} from './edit-workbench'

const environment = 'production'
const version = '1.2.420'
const roots: string[] = []

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

async function createRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'edit-workbench-'))
  roots.push(root)
  const convertedDirectory = join(root, environment, version)
  const workspace = join(root, '.workspaces', environment, version)
  await mkdir(join(workspace, 'json'), { recursive: true })
  await mkdir(convertedDirectory, { recursive: true })

  const convertedManifest = `${JSON.stringify({ schemaVersion: 1, files: [{ output: 'json/jobs.json', records: 1 }] }, null, 2)}\n`
  const workspaceJson = `${JSON.stringify([{ id: 100, name: 'Beginner' }], null, 2)}\n`
  const manifestSha256 = sha256(convertedManifest)
  const fileSha256 = sha256(workspaceJson)
  const files = [
    {
      source: 'json/jobs.json',
      workspace: 'json/jobs.json',
      records: 1,
      sha256: fileSha256
    }
  ]
  const inputSha256 = sha256(
    JSON.stringify({
      manifestSha256,
      files: files.map(({ workspace: path, sha256: digest }) => ({
        workspace: path,
        sha256: digest
      }))
    })
  )
  const workspaceManifest = {
    schemaVersion: 1,
    version,
    environment,
    status: 'ready',
    input: { manifest: 'manifest.json', manifestSha256, inputSha256 },
    files
  }

  await writeFile(join(convertedDirectory, 'manifest.json'), convertedManifest)
  await writeFile(join(workspace, 'json/jobs.json'), workspaceJson)
  await writeFile(
    join(workspace, 'workspace.json'),
    `${JSON.stringify(workspaceManifest, null, 2)}\n`
  )
  await writeFile(
    join(workspace, 'validation.json'),
    `${JSON.stringify({ version, environment, status: 'ready' }, null, 2)}\n`
  )
  return root
}

function options(dataRoot: string) {
  return { dataRoot, environment, version, creatorLocalId: 'local-user' } as const
}

const metadataAfter: JobMetadataAfter = {
  englishName: 'Beginner',
  classGroup: 'beginner',
  affiliation: 'adventurer',
  mainStat: 'STR',
  subStat: 'DEX',
  primaryWeapons: ['01'],
  secondaryWeapons: []
}

function metadataOptions(dataRoot: string, changeSetId: string, jobID = '00001') {
  return { ...options(dataRoot), changeSetId, jobID }
}

function recoveryProvenance(
  validationWorkspaceManifestSha256: string,
  rawInputSha256: string
): RecoveryCopyProvenance {
  return {
    source: {
      environment,
      version,
      recoveryId: '4a523105-6e64-4aaa-9f2f-b1b1816c1224',
      sourceSha256: 'b'.repeat(64),
      jobId: '00001',
      revision: 3
    },
    excluded: {
      jobName: '초보자',
      newWeaponTypes: [
        {
          key: '72e8ac77-d450-486c-8763-3a26161388c6',
          category: 'weapon',
          part: '검',
          englishName: 'Sword',
          classGroupKeys: ['warrior'],
          handType: 'oneHanded',
          weaponConstant: '1.2'
        }
      ],
      advancementJobIds: { present: true, value: ['00001', '00002'] }
    },
    target: { validationWorkspaceManifestSha256, rawInputSha256 }
  }
}

function recoveredOptions(
  dataRoot: string,
  workbench: Awaited<ReturnType<typeof openOrCreateEditWorkbench>>
) {
  return {
    ...metadataOptions(dataRoot, workbench.manifest.changeSetId),
    expectedRevision: 0 as const,
    after: metadataAfter,
    provenance: recoveryProvenance(
      workbench.manifest.validationWorkspaceManifestSha256,
      workbench.manifest.rawInputSha256
    ),
    expectedValidationWorkspaceManifestSha256: workbench.manifest.validationWorkspaceManifestSha256,
    expectedRawInputSha256: workbench.manifest.rawInputSha256
  }
}

async function updateWorkspaceJobs(
  root: string,
  jobs: { id: number; name: string }[]
): Promise<void> {
  const workspaceDirectory = join(root, '.workspaces', environment, version)
  const workspacePath = join(workspaceDirectory, 'workspace.json')
  const workspace = JSON.parse(await readFile(workspacePath, 'utf8'))
  const jobsBytes = `${JSON.stringify(jobs, null, 2)}\n`
  workspace.files[0].records = jobs.length
  workspace.files[0].sha256 = sha256(jobsBytes)
  workspace.input.inputSha256 = sha256(
    JSON.stringify({
      manifestSha256: workspace.input.manifestSha256,
      files: workspace.files.map(({ workspace: path, sha256: digest }) => ({
        workspace: path,
        sha256: digest
      }))
    })
  )
  await writeFile(join(workspaceDirectory, 'json/jobs.json'), jobsBytes)
  await writeFile(workspacePath, `${JSON.stringify(workspace, null, 2)}\n`)
  await writeFile(
    join(workspaceDirectory, 'validation.json'),
    `${JSON.stringify({ version, environment, status: 'ready' }, null, 2)}\n`
  )
}

async function workbenchEntries(root: string): Promise<string[]> {
  try {
    return await readdir(join(root, '.edit-workbenches', environment, version))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

function linuxProcessStartTime(stat: string): string {
  return stat
    .slice(stat.lastIndexOf(') ') + 2)
    .trim()
    .split(/\s+/)[19]
}

async function writeLock(
  lockPath: string,
  record: { pid: number; processStartTime: string | null; token?: string }
): Promise<string> {
  const bytes = `${JSON.stringify({
    schemaVersion: 1,
    pid: record.pid,
    processStartTime: record.processStartTime,
    token: record.token ?? randomUUID()
  })}\n`
  await writeFile(lockPath, bytes, { flag: 'wx' })
  return bytes
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('edit workbench', () => {
  it('publishes a complete immutable manifest and reopens the same input', async () => {
    const root = await createRoot()
    const workspacePath = join(root, '.workspaces', environment, version, 'workspace.json')
    const workspaceBytes = await readFile(workspacePath)

    const created = await openOrCreateEditWorkbench(options(root))
    const storedBytes = await readFile(created.manifestPath)
    const stored = JSON.parse(storedBytes.toString('utf8'))

    expect(created.reused).toBe(false)
    expect(created.manifest.changeSetId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
    expect(stored).toEqual(created.manifest)
    expect(stored).toMatchObject({
      environment,
      version,
      validationWorkspaceManifestSha256: sha256(workspaceBytes),
      status: 'draft',
      creatorLocalId: 'local-user'
    })
    expect(await readdir(created.directory)).toEqual(['manifest.json'])

    const reopened = await openOrCreateEditWorkbench({
      ...options(root),
      creatorLocalId: 'another-local-user'
    })
    expect(reopened).toEqual({ ...created, reused: true })
    expect(await readFile(created.manifestPath)).toEqual(storedBytes)
  })

  it('does not supersede when only ready workspace manifest bytes change', async () => {
    const root = await createRoot()
    const created = await openOrCreateEditWorkbench(options(root))
    const storedBytes = await readFile(created.manifestPath)
    const workspacePath = join(root, '.workspaces', environment, version, 'workspace.json')
    const workspace = JSON.parse(await readFile(workspacePath, 'utf8'))
    await writeFile(workspacePath, JSON.stringify(workspace))

    const reopened = await openOrCreateEditWorkbench(options(root))

    expect(reopened.manifest.changeSetId).toBe(created.manifest.changeSetId)
    expect(reopened.reused).toBe(true)
    expect(await readFile(created.manifestPath)).toEqual(storedBytes)
  })

  it('supersedes changed input and publishes a linked draft without altering old records', async () => {
    const root = await createRoot()
    const created = await openOrCreateEditWorkbench(options(root))
    const oldManifest = JSON.parse(await readFile(created.manifestPath, 'utf8'))
    const recordPath = join(created.directory, 'records.ndjson')
    const recordBytes = '{"recordId":"kept"}\n'
    await writeFile(recordPath, recordBytes)
    await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])

    const child = await openOrCreateEditWorkbench(options(root))
    const superseded = JSON.parse(await readFile(created.manifestPath, 'utf8'))

    expect(child.reused).toBe(false)
    expect(child.manifest.changeSetId).not.toBe(created.manifest.changeSetId)
    expect(child.manifest.parentChangeSetId).toBe(created.manifest.changeSetId)
    expect(superseded).toEqual({
      ...oldManifest,
      status: 'superseded',
      updatedAt: superseded.updatedAt
    })
    expect(superseded.updatedAt > oldManifest.updatedAt).toBe(true)
    expect(await readFile(recordPath, 'utf8')).toBe(recordBytes)
    expect((await readdir(created.directory)).sort()).toEqual(['manifest.json', 'records.ndjson'])
    expect((await workbenchEntries(root)).sort()).toEqual(
      [created.manifest.changeSetId, child.manifest.changeSetId].sort()
    )
  })

  it('links three successive input versions into one history chain', async () => {
    const root = await createRoot()
    const first = await openOrCreateEditWorkbench(options(root))
    await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])
    const second = await openOrCreateEditWorkbench(options(root))
    await updateWorkspaceJobs(root, [{ id: 300, name: 'Magician' }])
    const third = await openOrCreateEditWorkbench(options(root))

    expect(second.manifest.parentChangeSetId).toBe(first.manifest.changeSetId)
    expect(third.manifest.parentChangeSetId).toBe(second.manifest.changeSetId)
    expect(JSON.parse(await readFile(first.manifestPath, 'utf8')).status).toBe('superseded')
    expect(JSON.parse(await readFile(second.manifestPath, 'utf8')).status).toBe('superseded')
    expect(JSON.parse(await readFile(third.manifestPath, 'utf8')).status).toBe('draft')
  })

  it('completes a child after a crash left one unambiguous superseded tip', async () => {
    const root = await createRoot()
    const first = await openOrCreateEditWorkbench(options(root))
    await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])
    const superseded = {
      ...JSON.parse(await readFile(first.manifestPath, 'utf8')),
      status: 'superseded',
      updatedAt: new Date(Date.now() + 1_000).toISOString()
    }
    await writeFile(first.manifestPath, `${JSON.stringify(superseded, null, 2)}\n`)

    const recovered = await openOrCreateEditWorkbench(options(root))

    expect(recovered.manifest.parentChangeSetId).toBe(first.manifest.changeSetId)
    expect(recovered.manifest.status).toBe('draft')
    expect(JSON.parse(await readFile(first.manifestPath, 'utf8'))).toEqual(superseded)
  })

  it('retains the superseded parent when workspace changes during transition', async () => {
    const root = await createRoot()
    const first = await openOrCreateEditWorkbench(options(root))
    await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])
    const probe = await open(join(root, 'probe'), 'w')
    const prototype = Object.getPrototypeOf(probe) as {
      sync: (...args: unknown[]) => Promise<void>
    }
    await probe.close()
    const originalSync = prototype.sync
    let syncCalls = 0
    const syncSpy = vi.spyOn(prototype, 'sync').mockImplementation(async function (
      this: unknown,
      ...args: unknown[]
    ) {
      await originalSync.apply(this, args)
      syncCalls += 1
      if (syncCalls === 2) await updateWorkspaceJobs(root, [{ id: 300, name: 'Magician' }])
    })

    try {
      await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
        'Validation workspace changed while opening'
      )
    } finally {
      syncSpy.mockRestore()
    }
    const retained = JSON.parse(await readFile(first.manifestPath, 'utf8'))
    expect(retained.status).toBe('superseded')
    expect(await workbenchEntries(root)).toEqual([first.manifest.changeSetId])
  })

  it('fails closed and preserves corrupt or ambiguous history', async () => {
    const corruptRoot = await createRoot()
    const corrupt = await openOrCreateEditWorkbench(options(corruptRoot))
    await writeFile(corrupt.manifestPath, '{')
    await expect(openOrCreateEditWorkbench(options(corruptRoot))).rejects.toThrow(
      `Edit workbench manifest ${corrupt.manifest.changeSetId} contains invalid JSON`
    )
    expect(await readFile(corrupt.manifestPath, 'utf8')).toBe('{')

    const ambiguousRoot = await createRoot()
    const draft = await openOrCreateEditWorkbench(options(ambiguousRoot))
    const extraId = randomUUID()
    const extraDirectory = join(dirname(draft.directory), extraId)
    const extra = {
      ...draft.manifest,
      changeSetId: extraId,
      status: 'superseded',
      parentChangeSetId: null
    }
    await mkdir(extraDirectory)
    await writeFile(join(extraDirectory, 'manifest.json'), `${JSON.stringify(extra, null, 2)}\n`)
    const before = await readFile(join(extraDirectory, 'manifest.json'))

    await expect(openOrCreateEditWorkbench(options(ambiguousRoot))).rejects.toThrow(
      'Ambiguous edit workbench history'
    )
    expect(await readFile(join(extraDirectory, 'manifest.json'))).toEqual(before)
    expect(JSON.parse(await readFile(draft.manifestPath, 'utf8')).status).toBe('draft')
  })

  it('fails closed when the validation report is missing', async () => {
    const root = await createRoot()
    await rm(join(root, '.workspaces', environment, version, 'validation.json'))

    await expect(openOrCreateEditWorkbench(options(root))).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await workbenchEntries(root)).toEqual([])
  })

  it('fails closed when validation report status does not match the ready manifest', async () => {
    const root = await createRoot()
    const reportPath = join(root, '.workspaces', environment, version, 'validation.json')
    await writeFile(reportPath, JSON.stringify({ version, environment, status: 'review' }))

    await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
      'Validation report does not match ready validation workspace'
    )
    expect(await workbenchEntries(root)).toEqual([])
  })

  it('fails closed when a validation update marker exists for an otherwise ready workspace', async () => {
    const root = await createRoot()
    const markerPath = join(
      root,
      '.workspaces',
      environment,
      version,
      'workspace.json.validation-update'
    )
    await writeFile(markerPath, '{}')

    await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
      'Validation workspace update is incomplete'
    )
    expect(await workbenchEntries(root)).toEqual([])
  })

  it('rejects malformed and forged ready workspaces', async () => {
    for (const mutate of [
      (manifest: Record<string, unknown>) => ({ ...manifest, files: [] }),
      (manifest: Record<string, unknown>) => ({
        ...manifest,
        files: [{ workspace: '../escape.json' }]
      }),
      (manifest: Record<string, unknown>) => ({ ...manifest, status: 'review' }),
      (manifest: Record<string, unknown>) => ({ ...manifest, input: { inputSha256: 'bad' } })
    ]) {
      const root = await createRoot()
      const path = join(root, '.workspaces', environment, version, 'workspace.json')
      const manifest = JSON.parse(await readFile(path, 'utf8'))
      await writeFile(path, JSON.stringify(mutate(manifest)))
      await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow()
      expect(await workbenchEntries(root)).toEqual([])
    }
  })

  it('rejects tampered converted manifest, workspace digest, aggregate hash, and JSON', async () => {
    const cases: ((root: string) => Promise<void>)[] = [
      async (root) => writeFile(join(root, environment, version, 'manifest.json'), '{}'),
      async (root) =>
        writeFile(join(root, '.workspaces', environment, version, 'json/jobs.json'), '[]'),
      async (root) => {
        const path = join(root, '.workspaces', environment, version, 'workspace.json')
        const manifest = JSON.parse(await readFile(path, 'utf8'))
        manifest.input.inputSha256 = 'a'.repeat(64)
        await writeFile(path, JSON.stringify(manifest))
      },
      async (root) => {
        const path = join(root, '.workspaces', environment, version, 'json/jobs.json')
        const bytes = '{'
        await writeFile(path, bytes)
        const workspacePath = join(root, '.workspaces', environment, version, 'workspace.json')
        const manifest = JSON.parse(await readFile(workspacePath, 'utf8'))
        manifest.files[0].sha256 = sha256(bytes)
        manifest.input.inputSha256 = sha256(
          JSON.stringify({
            manifestSha256: manifest.input.manifestSha256,
            files: [{ workspace: 'json/jobs.json', sha256: manifest.files[0].sha256 }]
          })
        )
        await writeFile(workspacePath, JSON.stringify(manifest))
      }
    ]

    for (const mutate of cases) {
      const root = await createRoot()
      await mutate(root)
      await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow()
      expect(await workbenchEntries(root)).toEqual([])
    }
  })

  it('ignores existing staging and quarantine entries and publishes a final UUID directory', async () => {
    const root = await createRoot()
    const workbenchRoot = join(root, '.edit-workbenches', environment, version)
    const staging = join(workbenchRoot, `.staging-${randomUUID()}`)
    const quarantine = join(workbenchRoot, `.create.lock.quarantine-${randomUUID()}`)
    await mkdir(staging, { recursive: true })
    await writeFile(join(staging, 'partial'), 'incomplete')
    await writeFile(quarantine, 'preserved')

    const created = await openOrCreateEditWorkbench(options(root))

    expect((await workbenchEntries(root)).sort()).toEqual(
      [
        created.manifest.changeSetId,
        staging.slice(staging.lastIndexOf('/') + 1),
        quarantine.slice(quarantine.lastIndexOf('/') + 1)
      ].sort()
    )
    expect(await readdir(created.directory)).toEqual(['manifest.json'])
    expect(await readFile(join(staging, 'partial'), 'utf8')).toBe('incomplete')
    expect(await readFile(quarantine, 'utf8')).toBe('preserved')
  })

  it('removes its lock when lock initialization fails', async () => {
    const root = await createRoot()
    const probe = await open(join(root, 'probe'), 'w')
    const sync = vi
      .spyOn(Object.getPrototypeOf(probe) as { sync: () => Promise<void> }, 'sync')
      .mockRejectedValueOnce(new Error('sync failed'))
    await probe.close()

    await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow('sync failed')
    sync.mockRestore()
    expect(await workbenchEntries(root)).toEqual([])
  })

  it.skipIf(process.platform !== 'linux')(
    'blocks creation and preserves a valid dead process lock',
    async () => {
      const root = await createRoot()
      const workbenchRoot = join(root, '.edit-workbenches', environment, version)
      await mkdir(workbenchRoot, { recursive: true })
      const lockPath = join(workbenchRoot, '.create.lock')
      const deadPid = 2_147_483_647
      const staleBytes = await writeLock(lockPath, {
        pid: deadPid,
        processStartTime: '1'
      })

      await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
        `Edit workbench creation lock belongs to dead process ${deadPid}; close all app processes and, after checking ownership, move the stale .create.lock to a backup manually`
      )
      expect(await readFile(lockPath, 'utf8')).toBe(staleBytes)
      expect(await workbenchEntries(root)).toEqual(['.create.lock'])
    }
  )

  it.skipIf(process.platform !== 'linux')(
    'refuses and preserves an active process lock',
    async () => {
      const root = await createRoot()
      const workbenchRoot = join(root, '.edit-workbenches', environment, version)
      await mkdir(workbenchRoot, { recursive: true })
      const lockPath = join(workbenchRoot, '.create.lock')
      const bytes = await writeLock(lockPath, {
        pid: process.pid,
        processStartTime: linuxProcessStartTime(await readFile('/proc/self/stat', 'utf8'))
      })

      await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
        `Edit workbench creation is already locked by active process ${process.pid}`
      )
      expect(await readFile(lockPath, 'utf8')).toBe(bytes)
      expect(await workbenchEntries(root)).toEqual(['.create.lock'])
    }
  )

  it('fails closed on a malformed lock and preserves it', async () => {
    const root = await createRoot()
    const workbenchRoot = join(root, '.edit-workbenches', environment, version)
    await mkdir(workbenchRoot, { recursive: true })
    const lockPath = join(workbenchRoot, '.create.lock')
    await writeFile(lockPath, 'other-process', { flag: 'wx' })

    await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
      'Edit workbench creation lock is malformed; lock preserved'
    )
    expect(await readFile(lockPath, 'utf8')).toBe('other-process')
    expect(await workbenchEntries(root)).toEqual(['.create.lock'])
  })

  it.skipIf(process.platform !== 'linux')(
    'cannot acquire when a lock is replaced during observation',
    async () => {
      const root = await createRoot()
      const workbenchRoot = join(root, '.edit-workbenches', environment, version)
      await mkdir(workbenchRoot, { recursive: true })
      const lockPath = join(workbenchRoot, '.create.lock')
      const originalBytes = await writeLock(lockPath, {
        pid: 2_147_483_647,
        processStartTime: '1'
      })
      const replacementBytes = `${JSON.stringify({
        schemaVersion: 1,
        pid: 2_147_483_647,
        processStartTime: '2',
        token: randomUUID()
      })}\n`
      const probe = await open(join(root, 'probe'), 'w')
      const prototype = Object.getPrototypeOf(probe) as {
        readFile: (...args: unknown[]) => Promise<Buffer | string>
      }
      await probe.close()
      const originalReadFile = prototype.readFile
      let replaced = false
      const readFileSpy = vi.spyOn(prototype, 'readFile').mockImplementation(async function (
        this: unknown,
        ...args: unknown[]
      ) {
        const result = await originalReadFile.apply(this, args)
        if (!replaced && Buffer.isBuffer(result) && result.toString('utf8') === originalBytes) {
          replaced = true
          await rename(lockPath, join(workbenchRoot, '.race-original-lock'))
          await writeFile(lockPath, replacementBytes, { flag: 'wx' })
        }
        return result
      })

      try {
        await expect(openOrCreateEditWorkbench(options(root))).rejects.toThrow(
          'Edit workbench creation lock changed while reading; lock preserved'
        )
      } finally {
        readFileSpy.mockRestore()
      }
      expect(await readFile(lockPath, 'utf8')).toBe(replacementBytes)
      expect(await readFile(join(workbenchRoot, '.race-original-lock'), 'utf8')).toBe(originalBytes)
    }
  )

  it('rejects symlinked roots, workspace files, and workbench ancestors', async () => {
    const actualRoot = await createRoot()
    const container = await mkdtemp(join(tmpdir(), 'edit-workbench-links-'))
    roots.push(container)
    const linkedRoot = join(container, 'linked-data')
    await symlink(actualRoot, linkedRoot)
    await expect(openOrCreateEditWorkbench(options(linkedRoot))).rejects.toThrow(
      'Symbolic links are not allowed'
    )

    const fileRoot = await createRoot()
    const filePath = join(fileRoot, '.workspaces', environment, version, 'json/jobs.json')
    const outside = join(container, 'outside.json')
    await writeFile(outside, '[]')
    await rm(filePath)
    await symlink(outside, filePath)
    await expect(openOrCreateEditWorkbench(options(fileRoot))).rejects.toThrow(
      'Symbolic links are not allowed'
    )

    const ancestorRoot = await createRoot()
    const workbenchRoot = join(ancestorRoot, '.edit-workbenches', environment, version)
    await mkdir(dirname(workbenchRoot), { recursive: true })
    await symlink(container, workbenchRoot)
    await expect(openOrCreateEditWorkbench(options(ancestorRoot))).rejects.toThrow(
      'Symbolic links are not allowed'
    )
  })

  it('writes a strict recovered job metadata first revision', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)

    const saved = await saveRecoveredJobMetadataFirstRevision(request)

    expect(saved).toMatchObject({
      operation: 'add',
      rawIdentity: { jobID: '00001' },
      beforeSha256: null,
      after: metadataAfter,
      recoveryCopy: request.provenance,
      revision: 1
    })
    await expect(readJobMetadataRecords(request)).resolves.toEqual({
      latest: saved,
      history: [saved]
    })
  })

  it('keeps recovered provenance immutable while later generic revisions omit it', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)
    const first = await saveRecoveredJobMetadataFirstRevision(request)
    const firstPath = join(
      workbench.directory,
      'records/job-metadata',
      first.recordId,
      '000001.json'
    )
    const firstBytes = await readFile(firstPath)

    const second = await saveJobMetadataRecord({
      ...metadataOptions(root, workbench.manifest.changeSetId),
      expectedRevision: 1,
      after: { ...metadataAfter, englishName: 'Novice' }
    })

    expect(second).not.toHaveProperty('recoveryCopy')
    expect(await readFile(firstPath)).toEqual(firstBytes)
    await expect(readJobMetadataRecords(request)).resolves.toEqual({
      latest: second,
      history: [first, second]
    })
  })

  it('returns the persisted recovered first revision unchanged after response loss', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)
    const persisted = await saveRecoveredJobMetadataFirstRevision(request)
    const path = join(
      workbench.directory,
      'records/job-metadata',
      persisted.recordId,
      '000001.json'
    )
    const bytes = await readFile(path)

    const retried = await saveRecoveredJobMetadataFirstRevision(request)

    expect(retried).toEqual(persisted)
    expect(await readFile(path)).toEqual(bytes)
    expect(await readdir(dirname(path))).toEqual(['000001.json'])
  })

  it('rejects mismatched recovered source and target identities', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)

    await expect(
      saveRecoveredJobMetadataFirstRevision({
        ...request,
        provenance: {
          ...request.provenance,
          source: { ...request.provenance.source, jobId: '2' }
        }
      })
    ).rejects.toThrow('Recovery copy source identity does not match request')
    await expect(
      saveRecoveredJobMetadataFirstRevision({
        ...request,
        provenance: {
          ...request.provenance,
          target: {
            ...request.provenance.target,
            rawInputSha256: 'c'.repeat(64)
          }
        }
      })
    ).rejects.toThrow('Recovery copy provenance target does not match request')
    await expect(
      saveRecoveredJobMetadataFirstRevision({
        ...request,
        provenance: {
          ...request.provenance,
          target: {
            validationWorkspaceManifestSha256: 'c'.repeat(64),
            rawInputSha256: 'd'.repeat(64)
          }
        },
        expectedValidationWorkspaceManifestSha256: 'c'.repeat(64),
        expectedRawInputSha256: 'd'.repeat(64)
      })
    ).rejects.toThrow('Recovery copy target does not match current edit workbench')
  })

  it('rejects a recovered first revision when a generic record already exists', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)
    const generic = await saveJobMetadataRecord({
      ...metadataOptions(root, workbench.manifest.changeSetId),
      expectedRevision: 0,
      after: metadataAfter
    })

    await expect(saveRecoveredJobMetadataFirstRevision(request)).rejects.toThrow(
      'Job metadata first revision already exists'
    )
    await expect(readJobMetadataRecords(request)).resolves.toEqual({
      latest: generic,
      history: [generic]
    })
  })

  it('rejects invalid nested recovered provenance and arbitrary fields', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)
    const invalidCandidate = structuredClone(request.provenance) as RecoveryCopyProvenance & {
      excluded: {
        newWeaponTypes: (RecoveryCopyProvenance['excluded']['newWeaponTypes'][number] & {
          arbitrary?: string
        })[]
      }
    }
    invalidCandidate.excluded.newWeaponTypes[0].arbitrary = 'no'
    const invalidAdvancement = structuredClone(request.provenance)
    invalidAdvancement.excluded.advancementJobIds.value = ['not-an-id']

    await expect(
      saveRecoveredJobMetadataFirstRevision({
        ...request,
        provenance: invalidCandidate
      })
    ).rejects.toThrow('Invalid recovery copy weapon candidate fields')
    await expect(
      saveRecoveredJobMetadataFirstRevision({
        ...request,
        provenance: invalidAdvancement
      })
    ).rejects.toThrow('Invalid recovery copy advancement jobId')
  })

  it('snapshots all recovered nested arrays before the first await', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)
    request.after = {
      ...request.after,
      primaryWeapons: [...request.after.primaryWeapons],
      secondaryWeapons: [...request.after.secondaryWeapons]
    }
    const expectedAfter = structuredClone(request.after)
    const expectedProvenance = structuredClone(request.provenance)

    const saving = saveRecoveredJobMetadataFirstRevision(request)
    request.after.primaryWeapons.push('\u0000invalid')
    request.provenance.excluded.newWeaponTypes[0].classGroupKeys.push('\u0000invalid')
    request.provenance.excluded.advancementJobIds.value?.push('\u0000invalid')
    const saved = await saving

    expect(saved.after).toEqual(expectedAfter)
    expect(saved.recoveryCopy).toEqual(expectedProvenance)
  })

  it('rejects when the validation workspace changes before recovered publish', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, workbench)
    const workspacePath = join(root, '.workspaces', environment, version, 'workspace.json')
    const originalWorkspaceBytes = await readFile(workspacePath)
    const probe = await open(join(root, 'recovery-read-probe'), 'w')
    const prototype = Object.getPrototypeOf(probe) as {
      readFile: (...args: unknown[]) => Promise<Buffer | string>
    }
    await probe.close()
    const originalReadFile = prototype.readFile
    let workspaceReads = 0
    const readSpy = vi.spyOn(prototype, 'readFile').mockImplementation(async function (
      this: unknown,
      ...args: unknown[]
    ) {
      const result = await originalReadFile.apply(this, args)
      if (Buffer.isBuffer(result) && result.equals(originalWorkspaceBytes)) {
        workspaceReads += 1
        if (workspaceReads === 2) await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])
      }
      return result
    })

    try {
      await expect(saveRecoveredJobMetadataFirstRevision(request)).rejects.toThrow(
        'Validation workspace'
      )
    } finally {
      readSpy.mockRestore()
    }
    expect(await readdir(workbench.directory)).toEqual(['manifest.json'])
  })

  it('rejects recovered writes to an archived change set', async () => {
    const root = await createRoot()
    const first = await openOrCreateEditWorkbench(options(root))
    const request = recoveredOptions(root, first)
    await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])
    await openOrCreateEditWorkbench(options(root))

    await expect(saveRecoveredJobMetadataFirstRevision(request)).rejects.toThrow(
      'Job metadata changeSetId is not the current draft'
    )
    expect(await readdir(first.directory)).toEqual(['manifest.json'])
  })

  it('appends two immutable job metadata revisions and reopens zero-padded identity history', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const target = metadataOptions(root, workbench.manifest.changeSetId)

    const first = await saveJobMetadataRecord({
      ...target,
      expectedRevision: 0,
      after: metadataAfter
    })
    const firstPath = join(
      workbench.directory,
      'records/job-metadata',
      first.recordId,
      '000001.json'
    )
    const firstBytes = await readFile(firstPath)
    const secondAfter = { ...metadataAfter, englishName: 'Novice' }
    const second = await saveJobMetadataRecord({
      ...target,
      expectedRevision: 1,
      after: secondAfter
    })

    expect(first).toMatchObject({
      domain: 'job-metadata',
      operation: 'add',
      rawIdentity: { jobID: '00001' },
      beforeSha256: null,
      revision: 1,
      reviewStatus: 'pending'
    })
    expect(second).toMatchObject({
      recordId: first.recordId,
      operation: 'update',
      revision: 2,
      createdAt: first.createdAt,
      after: secondAfter
    })
    expect(second.beforeSha256).toBe(
      sha256(
        JSON.stringify({
          affiliation: 'adventurer',
          classGroup: 'beginner',
          englishName: 'Beginner',
          mainStat: 'STR',
          primaryWeapons: ['01'],
          secondaryWeapons: [],
          subStat: 'DEX'
        })
      )
    )
    expect(await readFile(firstPath)).toEqual(firstBytes)
    expect(await openOrCreateEditWorkbench(options(root))).toMatchObject({ reused: true })
    await expect(readJobMetadataRecords(target)).resolves.toEqual({
      latest: second,
      history: [first, second]
    })
  })

  it('preserves and ignores strict orphan staging entries while reading and saving', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const target = metadataOptions(root, workbench.manifest.changeSetId)
    const first = await saveJobMetadataRecord({
      ...target,
      expectedRevision: 0,
      after: metadataAfter
    })
    const domainDirectory = join(workbench.directory, 'records/job-metadata')
    const firstStage = join(domainDirectory, `.staging-${randomUUID()}`)
    const firstStageBytes = Buffer.from('orphan first revision')
    await mkdir(firstStage)
    await writeFile(join(firstStage, 'partial'), firstStageBytes)
    const recordDirectory = join(domainDirectory, first.recordId)
    const laterStage = join(recordDirectory, `.staging-${randomUUID()}`)
    const laterStageBytes = Buffer.from('orphan later revision')
    await writeFile(laterStage, laterStageBytes)

    await expect(readJobMetadataRecords(target)).resolves.toEqual({
      latest: first,
      history: [first]
    })
    const second = await saveJobMetadataRecord({
      ...target,
      expectedRevision: 1,
      after: { ...metadataAfter, englishName: 'Novice' }
    })

    await expect(readJobMetadataRecords(target)).resolves.toEqual({
      latest: second,
      history: [first, second]
    })
    expect(await readFile(join(firstStage, 'partial'))).toEqual(firstStageBytes)
    expect(await readFile(laterStage)).toEqual(laterStageBytes)
  })

  it('snapshots mutable job metadata arrays before the first await', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const target = metadataOptions(root, workbench.manifest.changeSetId)
    const after: JobMetadataAfter = {
      ...metadataAfter,
      primaryWeapons: [...metadataAfter.primaryWeapons],
      secondaryWeapons: [...metadataAfter.secondaryWeapons]
    }

    const saving = saveJobMetadataRecord({ ...target, expectedRevision: 0, after })
    after.primaryWeapons[0] = '\u0000invalid'
    after.secondaryWeapons.push('\u0000invalid')
    const saved = await saving

    expect(saved.after).toEqual(metadataAfter)
    await expect(readJobMetadataRecords(target)).resolves.toEqual({
      latest: saved,
      history: [saved]
    })
  })

  it('rejects stale and unsupported job metadata saves without changing prior bytes', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const target = metadataOptions(root, workbench.manifest.changeSetId)
    const first = await saveJobMetadataRecord({
      ...target,
      expectedRevision: 0,
      after: metadataAfter
    })
    const firstPath = join(
      workbench.directory,
      'records/job-metadata',
      first.recordId,
      '000001.json'
    )
    const firstBytes = await readFile(firstPath)

    await expect(
      saveJobMetadataRecord({ ...target, expectedRevision: 0, after: metadataAfter })
    ).rejects.toThrow('Stale job metadata revision')
    await expect(
      saveJobMetadataRecord({
        ...target,
        expectedRevision: 1,
        after: { ...metadataAfter, newWeaponTypes: [] } as never
      })
    ).rejects.toThrow('Unsupported job metadata after fields')
    expect(await readFile(firstPath)).toEqual(firstBytes)
    expect(await readdir(dirname(firstPath))).toEqual(['000001.json'])
  })

  it('fails closed on malformed, gapped, duplicate, unexpected, and symlinked record entries', async () => {
    const malformedRoot = await createRoot()
    const malformedWorkbench = await openOrCreateEditWorkbench(options(malformedRoot))
    const malformedTarget = metadataOptions(malformedRoot, malformedWorkbench.manifest.changeSetId)
    const malformed = await saveJobMetadataRecord({
      ...malformedTarget,
      expectedRevision: 0,
      after: metadataAfter
    })
    const malformedPath = join(
      malformedWorkbench.directory,
      'records/job-metadata',
      malformed.recordId,
      '000001.json'
    )
    await writeFile(malformedPath, '{')
    await expect(readJobMetadataRecords(malformedTarget)).rejects.toThrow('contains invalid JSON')

    const gapRoot = await createRoot()
    const gapWorkbench = await openOrCreateEditWorkbench(options(gapRoot))
    const gapTarget = metadataOptions(gapRoot, gapWorkbench.manifest.changeSetId)
    const gap = await saveJobMetadataRecord({
      ...gapTarget,
      expectedRevision: 0,
      after: metadataAfter
    })
    const gapDirectory = join(gapWorkbench.directory, 'records/job-metadata', gap.recordId)
    await rename(join(gapDirectory, '000001.json'), join(gapDirectory, '000002.json'))
    await expect(readJobMetadataRecords(gapTarget)).rejects.toThrow(
      'Corrupt job metadata revision sequence'
    )

    const duplicateRoot = await createRoot()
    const duplicateWorkbench = await openOrCreateEditWorkbench(options(duplicateRoot))
    const firstTarget = metadataOptions(duplicateRoot, duplicateWorkbench.manifest.changeSetId, '1')
    const secondTarget = metadataOptions(
      duplicateRoot,
      duplicateWorkbench.manifest.changeSetId,
      '2'
    )
    await saveJobMetadataRecord({ ...firstTarget, expectedRevision: 0, after: metadataAfter })
    const duplicate = await saveJobMetadataRecord({
      ...secondTarget,
      expectedRevision: 0,
      after: metadataAfter
    })
    const duplicatePath = join(
      duplicateWorkbench.directory,
      'records/job-metadata',
      duplicate.recordId,
      '000001.json'
    )
    const duplicateValue = JSON.parse(await readFile(duplicatePath, 'utf8'))
    duplicateValue.rawIdentity.jobID = '1'
    await writeFile(duplicatePath, `${JSON.stringify(duplicateValue, null, 2)}\n`)
    await expect(readJobMetadataRecords(firstTarget)).rejects.toThrow(
      'Duplicate job metadata raw identity: 1'
    )

    const unexpectedRoot = await createRoot()
    const unexpectedWorkbench = await openOrCreateEditWorkbench(options(unexpectedRoot))
    const unexpectedTarget = metadataOptions(
      unexpectedRoot,
      unexpectedWorkbench.manifest.changeSetId
    )
    await saveJobMetadataRecord({
      ...unexpectedTarget,
      expectedRevision: 0,
      after: metadataAfter
    })
    await writeFile(join(unexpectedWorkbench.directory, 'records/unexpected'), 'x')
    await expect(readJobMetadataRecords(unexpectedTarget)).rejects.toThrow(
      'Unexpected edit workbench records entry'
    )

    const symlinkRoot = await createRoot()
    const symlinkWorkbench = await openOrCreateEditWorkbench(options(symlinkRoot))
    const symlinkTarget = metadataOptions(symlinkRoot, symlinkWorkbench.manifest.changeSetId)
    const outside = join(symlinkRoot, 'outside-record')
    await mkdir(outside)
    await mkdir(join(symlinkWorkbench.directory, 'records/job-metadata'), { recursive: true })
    await symlink(outside, join(symlinkWorkbench.directory, 'records/job-metadata', randomUUID()))
    await expect(readJobMetadataRecords(symlinkTarget)).rejects.toThrow(
      'Unexpected job metadata record entry'
    )
  })

  it('reads superseded history but keeps the archived change set read-only and child empty', async () => {
    const root = await createRoot()
    const first = await openOrCreateEditWorkbench(options(root))
    const oldTarget = metadataOptions(root, first.manifest.changeSetId)
    const saved = await saveJobMetadataRecord({
      ...oldTarget,
      expectedRevision: 0,
      after: metadataAfter
    })
    const revisionPath = join(
      first.directory,
      'records/job-metadata',
      saved.recordId,
      '000001.json'
    )
    const revisionBytes = await readFile(revisionPath)
    await updateWorkspaceJobs(root, [{ id: 200, name: 'Warrior' }])
    const child = await openOrCreateEditWorkbench(options(root))

    await expect(readJobMetadataRecords(oldTarget)).resolves.toEqual({
      latest: saved,
      history: [saved]
    })
    await expect(
      saveJobMetadataRecord({ ...oldTarget, expectedRevision: 1, after: metadataAfter })
    ).rejects.toThrow('Job metadata changeSetId is not the current draft')
    expect(await readFile(revisionPath)).toEqual(revisionBytes)
    await expect(
      readJobMetadataRecords(metadataOptions(root, child.manifest.changeSetId))
    ).resolves.toEqual({ latest: null, history: [] })
  })

  it('preserves previous job metadata revision when the next staged write fails', async () => {
    const root = await createRoot()
    const workbench = await openOrCreateEditWorkbench(options(root))
    const target = metadataOptions(root, workbench.manifest.changeSetId)
    const first = await saveJobMetadataRecord({
      ...target,
      expectedRevision: 0,
      after: metadataAfter
    })
    const firstPath = join(
      workbench.directory,
      'records/job-metadata',
      first.recordId,
      '000001.json'
    )
    const firstBytes = await readFile(firstPath)
    const probe = await open(join(root, 'record-probe'), 'w')
    const prototype = Object.getPrototypeOf(probe) as { sync: () => Promise<void> }
    await probe.close()
    const originalSync = prototype.sync
    let calls = 0
    const syncSpy = vi.spyOn(prototype, 'sync').mockImplementation(async function (this: unknown) {
      calls += 1
      if (calls === 2) throw new Error('record sync failed')
      await originalSync.apply(this)
    })

    try {
      await expect(
        saveJobMetadataRecord({
          ...target,
          expectedRevision: 1,
          after: { ...metadataAfter, englishName: 'Novice' }
        })
      ).rejects.toThrow('record sync failed')
    } finally {
      syncSpy.mockRestore()
    }
    expect(await readFile(firstPath)).toEqual(firstBytes)
    await expect(readJobMetadataRecords(target)).resolves.toEqual({
      latest: first,
      history: [first]
    })
  })

  it('rejects traversal-shaped options', async () => {
    const root = await createRoot()
    await expect(
      openOrCreateEditWorkbench({ ...options(root), environment: '../production' as never })
    ).rejects.toThrow('Invalid edit workbench environment')
    await expect(
      openOrCreateEditWorkbench({ ...options(root), version: '../1.2.420' })
    ).rejects.toThrow('Invalid edit workbench version')
    expect(await workbenchEntries(root)).toEqual([])
  })
})
