import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  cleanupIncompleteVersionCopyFiles,
  commitVersionCopyFiles,
  prepareVersionCopyFiles,
  rollbackVersionCopyFiles
} from './version-copy-files'

const roots: string[] = []
const version = '1.2.419'

async function fixture(withWorkspace = true): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'maple-copy-files-'))
  roots.push(root)
  const source = join(root, 'production', version)
  await mkdir(join(source, 'csv'), { recursive: true })
  await mkdir(join(source, 'json'), { recursive: true })
  await writeFile(join(source, 'csv', 'data.csv'), 'id\n1\n')
  await writeFile(join(source, 'json', 'data.json'), '[{"id":1}]\n')
  await writeFile(
    join(source, 'manifest.json'),
    JSON.stringify({
      version,
      environment: 'production',
      status: 'converted',
      totalFiles: 1,
      totalRecords: 1,
      files: [
        {
          source: 'csv/data.csv',
          output: 'json/data.json',
          records: 1,
          sha256: createHash('sha256').update('id\n1\n').digest('hex')
        }
      ]
    })
  )
  if (withWorkspace) {
    const workspace = join(root, '.workspaces', 'production', version)
    await mkdir(join(workspace, 'json'), { recursive: true })
    await writeFile(join(workspace, 'json', 'data.json'), '[{"id":1}]\n')
    await writeFile(
      join(workspace, 'validation.json'),
      JSON.stringify({ version, environment: 'production', status: 'ready', publishable: true })
    )
    await writeFile(
      join(workspace, 'workspace.json'),
      JSON.stringify({
        schemaVersion: 1,
        version,
        environment: 'production',
        status: 'ready',
        input: { manifest: 'manifest.json', manifestSha256: 'old', inputSha256: 'old' },
        files: [
          { source: 'json/data.json', workspace: 'json/data.json', records: 1, sha256: 'old' }
        ]
      })
    )
  }
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

const options = (dataRoot: string) => ({
  dataRoot,
  sourceEnvironment: 'production' as const,
  sourceVersion: version,
  targetVersion: '1.2.420'
})

describe('version copy files', () => {
  it('cleans target-owned staging after prepare without touching other targets or source', async () => {
    const root = await fixture()
    const prepared = await prepareVersionCopyFiles(options(root))
    expect(prepared.stagingDirectory).toMatch(/version-copy-1\.2\.420-[0-9a-f-]{36}$/)
    expect(prepared.workspaceStagingDirectory).toMatch(/version-copy-1\.2\.420-[0-9a-f-]{36}$/)
    const other = join(
      root,
      '.staging',
      'version-copy-1.2.4200-00000000-0000-4000-8000-000000000000'
    )
    const otherVersion = join(root, 'copy', '1.2.421')
    const otherStaging = join(
      root,
      '.workspaces',
      '.staging',
      'version-copy-1.2.421-00000000-0000-4000-8000-000000000000'
    )
    const otherWorkspace = join(root, '.workspaces', 'copy', '1.2.421')
    await mkdir(other)
    await mkdir(otherVersion, { recursive: true })
    await mkdir(otherStaging, { recursive: true })
    await mkdir(otherWorkspace, { recursive: true })
    await cleanupIncompleteVersionCopyFiles(root, '1.2.420')
    await expect(readFile(join(prepared.stagingDirectory, 'manifest.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    })
    await expect(
      readFile(join(prepared.workspaceStagingDirectory!, 'workspace.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await readFile(join(root, 'production', version, 'manifest.json'), 'utf8')).toContain(
      version
    )
    await writeFile(join(other, 'keep'), 'ok')
    await writeFile(join(otherVersion, 'keep'), 'ok')
    await writeFile(join(otherStaging, 'keep'), 'ok')
    await writeFile(join(otherWorkspace, 'keep'), 'ok')
    await cleanupIncompleteVersionCopyFiles(root, '1.2.420')
    expect(await readFile(join(other, 'keep'), 'utf8')).toBe('ok')
    expect(await readFile(join(otherVersion, 'keep'), 'utf8')).toBe('ok')
    expect(await readFile(join(otherStaging, 'keep'), 'utf8')).toBe('ok')
    expect(await readFile(join(otherWorkspace, 'keep'), 'utf8')).toBe('ok')
  })

  it('cleans target data and workspace after committed copy on a later invocation', async () => {
    const root = await fixture()
    const prepared = await prepareVersionCopyFiles(options(root))
    await commitVersionCopyFiles(prepared)
    await cleanupIncompleteVersionCopyFiles(root, '1.2.420')
    await expect(
      readFile(join(prepared.destinationDirectory, 'manifest.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(
      readFile(join(prepared.workspaceDestinationDirectory!, 'workspace.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await readFile(join(root, 'production', version, 'manifest.json'), 'utf8')).toContain(
      version
    )
  })

  it('rejects unsafe cleanup paths and leaves all target paths untouched', async () => {
    const root = await fixture(false)
    const prepared = await prepareVersionCopyFiles(options(root))
    await symlink(join(root, 'production', version), join(prepared.stagingDirectory, 'unsafe'))
    await expect(cleanupIncompleteVersionCopyFiles(root, '1.2.420')).rejects.toThrow(
      'Symbolic link'
    )
    expect(await readFile(join(prepared.stagingDirectory, 'manifest.json'), 'utf8')).toContain(
      '1.2.420'
    )
    await rm(join(prepared.stagingDirectory, 'unsafe'))
    const workspaceCopy = join(root, '.workspaces', 'copy')
    await mkdir(join(root, '.workspaces'), { recursive: true })
    await symlink(join(root, 'production'), workspaceCopy)
    await expect(cleanupIncompleteVersionCopyFiles(root, '1.2.420')).rejects.toThrow(
      'Symbolic link'
    )
    expect(await readFile(join(prepared.stagingDirectory, 'manifest.json'), 'utf8')).toContain(
      '1.2.420'
    )
    await expect(cleanupIncompleteVersionCopyFiles(root, '../escape')).rejects.toThrow('Invalid')
  })

  it('stages data and workspace with new metadata and no stale ready report', async () => {
    const root = await fixture()
    const prepared = await prepareVersionCopyFiles(options(root))
    await expect(readFile(prepared.destinationDirectory)).rejects.toMatchObject({ code: 'ENOENT' })
    await commitVersionCopyFiles(prepared)
    const manifest = JSON.parse(
      await readFile(join(prepared.destinationDirectory, 'manifest.json'), 'utf8')
    )
    const workspace = JSON.parse(
      await readFile(join(prepared.workspaceDestinationDirectory!, 'workspace.json'), 'utf8')
    )
    const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
    expect(manifest).toMatchObject({ version: '1.2.420', environment: 'copy' })
    expect(workspace).toMatchObject({ version: '1.2.420', environment: 'copy', status: 'pending' })
    expect(workspace.input.manifestSha256).toBe(
      hash(await readFile(join(prepared.destinationDirectory, 'manifest.json')))
    )
    expect(workspace.input.inputSha256).toBe(
      hash(
        JSON.stringify({
          manifestSha256: workspace.input.manifestSha256,
          files: workspace.files.map(
            ({ workspace: path, sha256 }: { workspace: string; sha256: string }) => ({
              workspace: path,
              sha256
            })
          )
        })
      )
    )
    expect(await readFile(join(prepared.destinationDirectory, 'json', 'data.json'), 'utf8')).toBe(
      '[{"id":1}]\n'
    )
    await expect(
      readFile(join(prepared.workspaceDestinationDirectory!, 'validation.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
    expect(
      JSON.parse(
        await readFile(join(root, '.workspaces', 'production', version, 'workspace.json'), 'utf8')
      ).status
    ).toBe('ready')
    await rollbackVersionCopyFiles(prepared)
    await expect(
      readFile(join(prepared.destinationDirectory, 'manifest.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('copies data without workspace and refuses destination collision', async () => {
    const root = await fixture(false)
    const prepared = await prepareVersionCopyFiles(options(root))
    await commitVersionCopyFiles(prepared)
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('already exists')
    await rollbackVersionCopyFiles(prepared)
  })

  it('does not commit staged copy after a listed file disappears', async () => {
    const root = await fixture(false)
    const prepared = await prepareVersionCopyFiles(options(root))
    await rm(join(prepared.stagingDirectory, 'json', 'data.json'))
    await expect(commitVersionCopyFiles(prepared)).rejects.toThrow('Missing manifest output')
    await expect(
      readFile(join(prepared.destinationDirectory, 'manifest.json'))
    ).rejects.toMatchObject({ code: 'ENOENT' })
    await rollbackVersionCopyFiles(prepared)
  })

  it('keeps staging and source on a workspace destination collision at commit', async () => {
    const root = await fixture()
    const prepared = await prepareVersionCopyFiles(options(root))
    await mkdir(prepared.workspaceDestinationDirectory!, { recursive: true })
    await expect(commitVersionCopyFiles(prepared)).rejects.toThrow('already exists')
    expect(await readFile(join(prepared.stagingDirectory, 'manifest.json'), 'utf8')).toContain(
      '1.2.420'
    )
    expect(await readFile(join(root, 'production', version, 'manifest.json'), 'utf8')).toContain(
      version
    )
    await rm(prepared.workspaceDestinationDirectory!, { recursive: true })
    await rollbackVersionCopyFiles(prepared)
  })

  it.each(['csv/data.csv', 'json/data.json'])('rejects missing listed %s', async (relative) => {
    const root = await fixture(false)
    await rm(join(root, 'production', version, relative))
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('Missing manifest')
    await expect(readFile(join(root, 'copy', '1.2.420', 'manifest.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })

  it('rejects mismatched source hash and output record count', async () => {
    const root = await fixture(false)
    await writeFile(join(root, 'production', version, 'csv', 'data.csv'), 'id\n2\n')
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('hash mismatch')
    await writeFile(join(root, 'production', version, 'csv', 'data.csv'), 'id\n1\n')
    await writeFile(join(root, 'production', version, 'json', 'data.json'), '[]')
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('record count mismatch')
  })

  it('rejects unlisted managed files and listed file symlinks', async () => {
    const root = await fixture(false)
    const directory = join(root, 'production', version)
    await writeFile(join(directory, 'json', 'extra.json'), '[]')
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('differ from manifest')
    await rm(join(directory, 'json', 'extra.json'))
    await rm(join(directory, 'csv', 'data.csv'))
    await symlink(join(directory, 'json', 'data.json'), join(directory, 'csv', 'data.csv'))
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('Symbolic link')
  })

  it('rejects path traversal and symlinks without writing targets', async () => {
    const root = await fixture(false)
    await expect(
      prepareVersionCopyFiles({ ...options(root), targetVersion: '../escape' })
    ).rejects.toThrow('Invalid')
    await symlink(
      join(root, 'production', version, 'json', 'data.json'),
      join(root, 'production', version, 'json', 'link.json')
    )
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('Symbolic link')
    await expect(readFile(join(root, 'copy', '1.2.420', 'manifest.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })

  it('rejects inconsistent workspace metadata and cleans staging', async () => {
    const root = await fixture()
    const path = join(root, '.workspaces', 'production', version, 'workspace.json')
    const workspace = JSON.parse(await readFile(path, 'utf8'))
    workspace.input.manifest = '../other.json'
    await writeFile(path, JSON.stringify(workspace))
    await expect(prepareVersionCopyFiles(options(root))).rejects.toThrow('inconsistent')
    await expect(readFile(join(root, 'copy', '1.2.420', 'manifest.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })
})
