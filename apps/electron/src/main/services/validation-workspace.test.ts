import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createValidationWorkspace } from './validation-workspace'

const temporaryDirectories: string[] = []

async function createDataRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'maple-validation-workspace-'))
  temporaryDirectories.push(root)
  const versionDirectory = join(root, 'production', '1.2.419')
  await mkdir(join(versionDirectory, 'json', 'nested'), { recursive: true })
  await writeFile(join(versionDirectory, 'json', 'jobs.json'), '[{"jobID":"000"}]\n')
  await writeFile(join(versionDirectory, 'json', 'nested', 'skills.json'), '[]\n')
  await writeFile(
    join(versionDirectory, 'manifest.json'),
    `${JSON.stringify({
      version: '1.2.419',
      files: [
        { output: 'json/jobs.json', records: 1 },
        { output: 'json/nested/skills.json', records: 0 }
      ]
    })}\n`
  )
  return root
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true }))
  )
})

describe('validation workspace', () => {
  it('creates a deterministic working copy outside the converted version directory', async () => {
    const dataRoot = await createDataRoot()
    const created = await createValidationWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })

    expect(created.directory).toBe(join(dataRoot, '.workspaces', 'production', '1.2.419'))
    expect(created.manifest).toMatchObject({
      schemaVersion: 1,
      version: '1.2.419',
      environment: 'production',
      status: 'pending',
      files: [
        { workspace: 'json/jobs.json', records: 1 },
        { workspace: 'json/nested/skills.json', records: 0 }
      ]
    })
    expect(await readFile(join(created.jsonDirectory, 'jobs.json'), 'utf8')).toContain('000')
    expect(created.manifest.input.inputSha256).toMatch(/^[a-f0-9]{64}$/)
  })

  it('reuses only a workspace created from the same input', async () => {
    const dataRoot = await createDataRoot()
    const first = await createValidationWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const reused = await createValidationWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production',
      conflictPolicy: 'reuse'
    })

    expect(reused.reused).toBe(true)
    expect(reused.manifest.input.inputSha256).toBe(first.manifest.input.inputSha256)

    await writeFile(
      join(dataRoot, 'production', '1.2.419', 'json', 'jobs.json'),
      '[{"jobID":"100"}]\n'
    )
    await expect(
      createValidationWorkspace({
        dataRoot,
        sessionId: randomUUID(),
        version: '1.2.419',
        environment: 'production',
        conflictPolicy: 'reuse'
      })
    ).rejects.toThrow('different input')
  })

  it('replaces a workspace explicitly and preserves the source JSON', async () => {
    const dataRoot = await createDataRoot()
    await createValidationWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production'
    })
    const sourcePath = join(dataRoot, 'production', '1.2.419', 'json', 'jobs.json')
    await writeFile(sourcePath, '[{"jobID":"100"}]\n')

    const replaced = await createValidationWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      version: '1.2.419',
      environment: 'production',
      conflictPolicy: 'replace'
    })

    expect(replaced.reused).toBe(false)
    expect(await readFile(join(replaced.jsonDirectory, 'jobs.json'), 'utf8')).toContain('100')
    expect(await readFile(sourcePath, 'utf8')).toBe('[{"jobID":"100"}]\n')
  })

  it('removes partial staging output when creation is cancelled', async () => {
    const dataRoot = await createDataRoot()
    const sessionId = randomUUID()
    const controller = new AbortController()
    controller.abort()

    await expect(
      createValidationWorkspace({
        dataRoot,
        sessionId,
        version: '1.2.419',
        environment: 'production',
        signal: controller.signal
      })
    ).rejects.toMatchObject({ name: 'AbortError' })
    await expect(
      readFile(join(dataRoot, '.workspaces', '.staging', sessionId, 'workspace.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('does not remove a staging directory owned by another session', async () => {
    const dataRoot = await createDataRoot()
    const sessionId = randomUUID()
    const stagingDirectory = join(dataRoot, '.workspaces', '.staging', sessionId)
    const markerPath = join(stagingDirectory, 'owner.txt')
    await mkdir(stagingDirectory, { recursive: true })
    await writeFile(markerPath, 'active')

    await expect(
      createValidationWorkspace({
        dataRoot,
        sessionId,
        version: '1.2.419',
        environment: 'production'
      })
    ).rejects.toMatchObject({ code: 'EEXIST' })
    expect(await readFile(markerPath, 'utf8')).toBe('active')
  })

  it('removes partial staging output when the converted manifest is inconsistent', async () => {
    const dataRoot = await createDataRoot()
    const sessionId = randomUUID()
    await writeFile(
      join(dataRoot, 'production', '1.2.419', 'manifest.json'),
      `${JSON.stringify({ files: [{ output: 'json/jobs.json', records: 1 }] })}\n`
    )

    await expect(
      createValidationWorkspace({
        dataRoot,
        sessionId,
        version: '1.2.419',
        environment: 'production'
      })
    ).rejects.toThrow('missing from the manifest')
    await expect(
      readFile(join(dataRoot, '.workspaces', '.staging', sessionId, 'json', 'jobs.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
