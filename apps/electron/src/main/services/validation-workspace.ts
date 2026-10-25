import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { Transform, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import type { ValidationWorkspaceManifest } from '../../shared/data-validation'

export type ValidationWorkspaceConflictPolicy = 'error' | 'reuse' | 'replace'

export type CreateValidationWorkspaceOptions = {
  dataRoot: string
  sessionId: string
  version: string
  environment: 'test' | 'production' | 'copy'
  conflictPolicy?: ValidationWorkspaceConflictPolicy
  signal?: AbortSignal
}

export type ValidationWorkspace = {
  directory: string
  jsonDirectory: string
  manifestPath: string
  manifest: ValidationWorkspaceManifest
  reused: boolean
}

type ConvertedDataManifest = {
  files: readonly {
    output: string
    records: number
  }[]
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/
const SESSION_PATTERN = /^[0-9a-f-]{8,}$/i

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

function validateIdentity(sessionId: string, version: string): void {
  if (!SESSION_PATTERN.test(sessionId)) throw new Error('Invalid validation session ID')
  if (!VERSION_PATTERN.test(version)) throw new Error('Invalid game data version')
}

async function listJsonFiles(root: string): Promise<string[]> {
  const files: string[] = []

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))

    for (const entry of entries) {
      const path = join(directory, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        await visit(path)
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.json') {
        files.push(path)
      }
    }
  }

  await visit(root)
  return files
}

async function hashFile(path: string, signal?: AbortSignal): Promise<string> {
  const hash = createHash('sha256')
  const sink = new Writable({
    write(chunk, _encoding, callback) {
      hash.update(chunk)
      callback()
    }
  })
  await pipeline(createReadStream(path), sink, { signal })
  return hash.digest('hex')
}

async function copyAndHash(
  source: string,
  destination: string,
  signal?: AbortSignal
): Promise<string> {
  await mkdir(dirname(destination), { recursive: true })
  const hash = createHash('sha256')
  const hasher = new Transform({
    transform(chunk, _encoding, callback) {
      hash.update(chunk)
      callback(null, chunk)
    }
  })
  await pipeline(
    createReadStream(source),
    hasher,
    createWriteStream(destination, { flags: 'wx' }),
    {
      signal
    }
  )
  return hash.digest('hex')
}

async function readWorkspaceManifest(path: string): Promise<ValidationWorkspaceManifest> {
  return JSON.parse(await readFile(path, 'utf8')) as ValidationWorkspaceManifest
}

function calculateInputHash(
  manifestSha256: string,
  files: readonly { workspace: string; sha256: string }[]
): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        manifestSha256,
        files: files.map(({ workspace, sha256 }) => ({ workspace, sha256 }))
      })
    )
    .digest('hex')
}

export async function createValidationWorkspace(
  options: CreateValidationWorkspaceOptions
): Promise<ValidationWorkspace> {
  validateIdentity(options.sessionId, options.version)
  if (!['test', 'production', 'copy'].includes(options.environment)) {
    throw new Error('Invalid validation environment')
  }
  options.signal?.throwIfAborted()

  const versionDirectory = join(options.dataRoot, options.environment, options.version)
  const sourceJsonDirectory = join(versionDirectory, 'json')
  const sourceManifestPath = join(versionDirectory, 'manifest.json')
  const workspaceRoot = join(options.dataRoot, '.workspaces')
  const workspaceDirectory = join(workspaceRoot, options.environment, options.version)
  const stagingDirectory = join(workspaceRoot, '.staging', options.sessionId)
  const backupDirectory = join(workspaceRoot, '.backup', options.sessionId)
  const stagingManifestPath = join(stagingDirectory, 'workspace.json')
  const conflictPolicy = options.conflictPolicy ?? 'error'
  let ownsStagingDirectory = false

  await mkdir(join(workspaceRoot, '.staging'), { recursive: true })
  await mkdir(join(workspaceRoot, options.environment), { recursive: true })

  try {
    await mkdir(stagingDirectory)
    ownsStagingDirectory = true
    const manifestSha256 = await hashFile(sourceManifestPath, options.signal)
    const convertedManifest = JSON.parse(
      await readFile(sourceManifestPath, 'utf8')
    ) as ConvertedDataManifest
    const recordCounts = new Map(
      convertedManifest.files.map((file) => [file.output.replaceAll('\\', '/'), file.records])
    )
    const sourceFiles = await listJsonFiles(sourceJsonDirectory)
    if (sourceFiles.length === 0) throw new Error('Converted JSON files were not found')

    const files: ValidationWorkspaceManifest['files'][number][] = []
    for (const sourcePath of sourceFiles) {
      options.signal?.throwIfAborted()
      const relativePath = relative(sourceJsonDirectory, sourcePath).split('\\').join('/')
      const workspacePath = `json/${relativePath}`
      const destinationPath = join(stagingDirectory, ...workspacePath.split('/'))
      const sha256 = await copyAndHash(sourcePath, destinationPath, options.signal)
      const records = recordCounts.get(`json/${relativePath}`)
      if (records === undefined) {
        throw new Error(`Converted JSON is missing from the manifest: ${relativePath}`)
      }
      files.push({
        source: `json/${relativePath}`,
        workspace: workspacePath,
        records,
        sha256
      })
    }

    const manifest: ValidationWorkspaceManifest = {
      schemaVersion: 1,
      version: options.version,
      environment: options.environment,
      status: 'pending',
      input: {
        manifest: 'manifest.json',
        manifestSha256,
        inputSha256: calculateInputHash(manifestSha256, files)
      },
      files
    }
    await writeFile(stagingManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    if (await pathExists(workspaceDirectory)) {
      if (conflictPolicy === 'error') {
        throw new Error(`Validation workspace already exists: ${workspaceDirectory}`)
      }
      if (conflictPolicy === 'reuse') {
        const existingManifest = await readWorkspaceManifest(
          join(workspaceDirectory, 'workspace.json')
        )
        if (existingManifest.input.inputSha256 !== manifest.input.inputSha256) {
          throw new Error('Existing validation workspace was created from different input')
        }
        await rm(stagingDirectory, { recursive: true, force: true })
        ownsStagingDirectory = false
        return {
          directory: workspaceDirectory,
          jsonDirectory: join(workspaceDirectory, 'json'),
          manifestPath: join(workspaceDirectory, 'workspace.json'),
          manifest: existingManifest,
          reused: true
        }
      }

      await mkdir(dirname(backupDirectory), { recursive: true })
      await rename(workspaceDirectory, backupDirectory)
      try {
        await rename(stagingDirectory, workspaceDirectory)
        ownsStagingDirectory = false
      } catch (error) {
        await rename(backupDirectory, workspaceDirectory)
        throw error
      }
      await rm(backupDirectory, { recursive: true, force: true }).catch(() => undefined)
    } else {
      await rename(stagingDirectory, workspaceDirectory)
      ownsStagingDirectory = false
    }

    return {
      directory: workspaceDirectory,
      jsonDirectory: join(workspaceDirectory, 'json'),
      manifestPath: join(workspaceDirectory, 'workspace.json'),
      manifest,
      reused: false
    }
  } catch (error) {
    if (ownsStagingDirectory) {
      await rm(stagingDirectory, { recursive: true, force: true })
    }
    if ((await pathExists(backupDirectory)) && !(await pathExists(workspaceDirectory))) {
      await rename(backupDirectory, workspaceDirectory)
    }
    throw error
  }
}
