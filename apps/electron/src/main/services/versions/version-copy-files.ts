import { createHash, randomUUID } from 'node:crypto'
import { constants, createReadStream } from 'node:fs'
import { copyFile, lstat, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, parse, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'

import { streamArray } from 'stream-json/streamers/stream-array.js'

export type PrepareVersionCopyFilesOptions = {
  dataRoot: string
  sourceEnvironment: 'test' | 'production' | 'copy'
  sourceVersion: string
  targetVersion: string
}

export type PreparedVersionCopyFiles = {
  stagingDirectory: string
  destinationDirectory: string
  workspaceStagingDirectory?: string
  workspaceDestinationDirectory?: string
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ownedCopies = new WeakMap<PreparedVersionCopyFiles, 'staged' | 'committed'>()

async function kind(path: string): Promise<'directory' | 'file' | 'missing'> {
  try {
    const stat = await lstat(path)
    if (stat.isSymbolicLink()) throw new Error(`Symbolic link is not allowed: ${path}`)
    if (stat.isDirectory()) return 'directory'
    if (stat.isFile()) return 'file'
    throw new Error(`Unsupported file type: ${path}`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'missing'
    throw error
  }
}

async function assertSafeAncestors(path: string): Promise<void> {
  let current = resolve(path)
  const paths: string[] = []
  while (current !== parse(current).root) {
    paths.push(current)
    current = dirname(current)
  }
  for (const component of paths.reverse()) {
    const type = await kind(component)
    if (type === 'file') throw new Error(`Path is not a directory: ${component}`)
  }
}

async function copyTree(source: string, destination: string, skipReport = false): Promise<void> {
  if ((await kind(source)) !== 'directory') throw new Error(`Missing source directory: ${source}`)
  await mkdir(destination)
  for (const name of await readdir(source)) {
    const from = join(source, name)
    const to = join(destination, name)
    const type = await kind(from)
    if (skipReport && !['json', 'workspace.json', 'validation.json'].includes(name)) {
      throw new Error(`Unsupported workspace metadata: ${from}`)
    }
    if (type === 'directory') await copyTree(from, to)
    else if (type === 'file') {
      if (skipReport && name === 'validation.json') continue
      await copyFile(from, to, constants.COPYFILE_EXCL)
    } else throw new Error(`Source file disappeared: ${from}`)
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid version metadata')
  }
  return value as Record<string, unknown>
}

async function listManagedFiles(root: string): Promise<Set<string>> {
  const found = new Set<string>()
  async function visit(directory: string, prefix: string): Promise<void> {
    if ((await kind(directory)) !== 'directory')
      throw new Error(`Missing managed directory: ${directory}`)
    for (const name of await readdir(directory)) {
      const path = join(directory, name)
      const relative = `${prefix}/${name}`
      const type = await kind(path)
      if (type === 'directory') await visit(path, relative)
      else if (type === 'file') found.add(relative)
      else throw new Error(`Missing managed file: ${path}`)
    }
  }
  await visit(join(root, 'csv'), 'csv')
  await visit(join(root, 'json'), 'json')
  return found
}

async function countRecords(path: string): Promise<number> {
  const parser = streamArray.withParserAsStream()
  let count = 0
  parser.on('data', () => {
    count++
  })
  await pipeline(createReadStream(path), parser)
  return count
}

async function validateManagedFiles(
  root: string,
  manifest: Record<string, unknown>
): Promise<void> {
  const entries = manifest.files as unknown[]
  if (!entries.length) throw new Error('Source manifest has no files')
  const expected = new Set<string>()
  let totalRecords = 0
  for (const value of entries) {
    const entry = object(value)
    const output = safeRelative(entry.output)
    if (!output.startsWith('json/') || !output.endsWith('.json') || expected.has(output)) {
      throw new Error('Invalid or duplicate manifest output')
    }
    expected.add(output)
    if (!Number.isSafeInteger(entry.records) || (entry.records as number) < 0) {
      throw new Error('Invalid manifest record count')
    }
    const outputPath = join(root, ...output.split('/'))
    if ((await kind(outputPath)) !== 'file') throw new Error(`Missing manifest output: ${output}`)
    if ((await countRecords(outputPath)) !== entry.records)
      throw new Error(`Manifest record count mismatch: ${output}`)
    totalRecords += entry.records as number
    if (entry.source !== undefined) {
      const source = safeRelative(entry.source)
      if (!source.startsWith('csv/') || !source.endsWith('.csv') || expected.has(source)) {
        throw new Error('Invalid or duplicate manifest source')
      }
      expected.add(source)
      const sourcePath = join(root, ...source.split('/'))
      if ((await kind(sourcePath)) !== 'file') throw new Error(`Missing manifest source: ${source}`)
      if (entry.sha256 !== undefined) {
        if (
          typeof entry.sha256 !== 'string' ||
          !/^[a-f0-9]{64}$/.test(entry.sha256) ||
          createHash('sha256')
            .update(await readFile(sourcePath))
            .digest('hex') !== entry.sha256
        ) {
          throw new Error(`Manifest source hash mismatch: ${source}`)
        }
      }
    } else if (entry.sha256 !== undefined) {
      throw new Error('Manifest hash has no source file')
    }
  }
  if (manifest.totalFiles !== undefined && manifest.totalFiles !== entries.length)
    throw new Error('Manifest file count mismatch')
  if (manifest.totalRecords !== undefined && manifest.totalRecords !== totalRecords)
    throw new Error('Manifest total record count mismatch')
  const actual = await listManagedFiles(root)
  if (actual.size !== expected.size || [...actual].some((path) => !expected.has(path))) {
    throw new Error('Managed files differ from manifest')
  }
}

async function rewriteManifest(
  path: string,
  sourceVersion: string,
  environment: string,
  target: string
): Promise<void> {
  const manifest = object(JSON.parse(await readFile(path, 'utf8')))
  if (
    manifest.version !== sourceVersion ||
    manifest.environment !== environment ||
    manifest.status !== 'converted' ||
    !Array.isArray(manifest.files)
  ) {
    throw new Error('Source manifest identity is inconsistent')
  }
  manifest.version = target
  manifest.environment = 'copy'
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

function safeRelative(path: unknown): string {
  if (
    typeof path !== 'string' ||
    !path ||
    isAbsolute(path) ||
    path.includes('\\') ||
    path.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error('Invalid workspace file path')
  }
  return path
}

async function rewriteWorkspace(
  staging: string,
  manifestPath: string,
  sourceVersion: string,
  environment: string,
  target: string
): Promise<void> {
  const path = join(staging, 'workspace.json')
  if ((await kind(path)) !== 'file') throw new Error('Workspace manifest is missing')
  const workspace = object(JSON.parse(await readFile(path, 'utf8')))
  const input = object(workspace.input)
  if (
    workspace.schemaVersion !== 1 ||
    workspace.version !== sourceVersion ||
    workspace.environment !== environment ||
    input.manifest !== 'manifest.json' ||
    !Array.isArray(workspace.files) ||
    workspace.files.length === 0
  ) {
    throw new Error('Source workspace metadata is inconsistent')
  }
  const files = workspace.files.map(object)
  const converted = object(JSON.parse(await readFile(manifestPath, 'utf8')))
  const outputs = new Set(
    (converted.files as unknown[]).map((entry) => safeRelative(object(entry).output))
  )
  const listed = new Set<string>()
  for (const file of files) {
    const source = safeRelative(file.source)
    const relative = safeRelative(file.workspace)
    if (
      !source.startsWith('json/') ||
      source !== relative ||
      !outputs.has(source) ||
      listed.has(relative) ||
      (await kind(join(staging, ...relative.split('/')))) !== 'file'
    ) {
      throw new Error('Source workspace file is inconsistent')
    }
    listed.add(relative)
    file.sha256 = createHash('sha256')
      .update(await readFile(join(staging, ...relative.split('/'))))
      .digest('hex')
  }
  if (listed.size !== outputs.size) throw new Error('Source workspace file list is inconsistent')
  async function verifyJsonFiles(directory: string): Promise<void> {
    for (const name of await readdir(directory)) {
      const path = join(directory, name)
      if ((await kind(path)) === 'directory') await verifyJsonFiles(path)
      else if (
        !listed.has(
          path
            .slice(staging.length + 1)
            .split('\\')
            .join('/')
        )
      ) {
        throw new Error('Unlisted workspace file')
      }
    }
  }
  await verifyJsonFiles(join(staging, 'json'))
  input.manifestSha256 = createHash('sha256')
    .update(await readFile(manifestPath))
    .digest('hex')
  input.inputSha256 = createHash('sha256')
    .update(
      JSON.stringify({
        manifestSha256: input.manifestSha256,
        files: files.map((file) => ({ workspace: file.workspace, sha256: file.sha256 }))
      })
    )
    .digest('hex')
  workspace.version = target
  workspace.environment = 'copy'
  workspace.status = 'pending'
  await writeFile(path, `${JSON.stringify(workspace, null, 2)}\n`)
}

export async function prepareVersionCopyFiles(
  options: PrepareVersionCopyFilesOptions
): Promise<PreparedVersionCopyFiles> {
  const { dataRoot, sourceEnvironment, sourceVersion, targetVersion } = options
  if (
    !VERSION_PATTERN.test(sourceVersion) ||
    !VERSION_PATTERN.test(targetVersion) ||
    !['test', 'production', 'copy'].includes(sourceEnvironment) ||
    sourceVersion === targetVersion
  ) {
    throw new Error('Invalid version copy identity')
  }
  const root = resolve(dataRoot)
  await assertSafeAncestors(root)
  const source = join(root, sourceEnvironment, sourceVersion)
  const destinationDirectory = join(root, 'copy', targetVersion)
  const workspaceSource = join(root, '.workspaces', sourceEnvironment, sourceVersion)
  const workspaceDestinationDirectory = join(root, '.workspaces', 'copy', targetVersion)
  await assertSafeAncestors(source)
  await assertSafeAncestors(workspaceSource)
  if ((await kind(source)) !== 'directory') throw new Error('Source version does not exist')
  if (
    (await kind(destinationDirectory)) !== 'missing' ||
    (await kind(workspaceDestinationDirectory)) !== 'missing'
  ) {
    throw new Error('Version copy destination already exists')
  }
  const hasWorkspace = (await kind(workspaceSource)) === 'directory'
  const stagingDirectory = join(root, '.staging', `version-copy-${targetVersion}-${randomUUID()}`)
  const workspaceStagingDirectory = hasWorkspace
    ? join(root, '.workspaces', '.staging', `version-copy-${targetVersion}-${randomUUID()}`)
    : undefined
  await assertSafeAncestors(dirname(stagingDirectory))
  if (workspaceStagingDirectory) await assertSafeAncestors(dirname(workspaceStagingDirectory))
  await mkdir(dirname(stagingDirectory), { recursive: true })
  if (workspaceStagingDirectory)
    await mkdir(dirname(workspaceStagingDirectory), { recursive: true })
  try {
    await copyTree(source, stagingDirectory)
    const manifestPath = join(stagingDirectory, 'manifest.json')
    if ((await kind(manifestPath)) !== 'file') throw new Error('Source manifest is missing')
    const sourceManifest = object(JSON.parse(await readFile(manifestPath, 'utf8')))
    if (
      sourceManifest.version !== sourceVersion ||
      sourceManifest.environment !== sourceEnvironment ||
      sourceManifest.status !== 'converted' ||
      !Array.isArray(sourceManifest.files)
    ) {
      throw new Error('Source manifest identity is inconsistent')
    }
    await validateManagedFiles(stagingDirectory, sourceManifest)
    await rewriteManifest(manifestPath, sourceVersion, sourceEnvironment, targetVersion)
    if (workspaceStagingDirectory) {
      await copyTree(workspaceSource, workspaceStagingDirectory, true)
      await rewriteWorkspace(
        workspaceStagingDirectory,
        manifestPath,
        sourceVersion,
        sourceEnvironment,
        targetVersion
      )
    }
    const prepared = {
      stagingDirectory,
      destinationDirectory,
      ...(workspaceStagingDirectory
        ? { workspaceStagingDirectory, workspaceDestinationDirectory }
        : {})
    }
    ownedCopies.set(prepared, 'staged')
    return prepared
  } catch (error) {
    await rm(stagingDirectory, { recursive: true, force: true })
    if (workspaceStagingDirectory)
      await rm(workspaceStagingDirectory, { recursive: true, force: true })
    throw error
  }
}

export async function commitVersionCopyFiles(prepared: PreparedVersionCopyFiles): Promise<void> {
  if (ownedCopies.get(prepared) !== 'staged') throw new Error('Version copy is not staged')
  const manifest = object(
    JSON.parse(await readFile(join(prepared.stagingDirectory, 'manifest.json'), 'utf8'))
  )
  if (
    manifest.environment !== 'copy' ||
    manifest.status !== 'converted' ||
    manifest.version !== basename(prepared.destinationDirectory) ||
    !Array.isArray(manifest.files)
  ) {
    throw new Error('Staged manifest identity is inconsistent')
  }
  await validateManagedFiles(prepared.stagingDirectory, manifest)
  const {
    destinationDirectory,
    workspaceDestinationDirectory,
    stagingDirectory,
    workspaceStagingDirectory
  } = prepared
  await assertSafeAncestors(dirname(destinationDirectory))
  if (workspaceDestinationDirectory)
    await assertSafeAncestors(dirname(workspaceDestinationDirectory))
  if (
    (await kind(destinationDirectory)) !== 'missing' ||
    (workspaceDestinationDirectory && (await kind(workspaceDestinationDirectory)) !== 'missing')
  ) {
    throw new Error('Version copy destination already exists')
  }
  await mkdir(dirname(destinationDirectory), { recursive: true })
  if (workspaceDestinationDirectory)
    await mkdir(dirname(workspaceDestinationDirectory), { recursive: true })
  let committed = false
  try {
    await rename(stagingDirectory, destinationDirectory)
    committed = true
    if (workspaceStagingDirectory && workspaceDestinationDirectory) {
      await rename(workspaceStagingDirectory, workspaceDestinationDirectory)
    }
    ownedCopies.set(prepared, 'committed')
  } catch (error) {
    if (committed) await rename(destinationDirectory, stagingDirectory)
    throw error
  }
}

async function assertSafeRemovalTree(path: string): Promise<void> {
  const type = await kind(path)
  if (type === 'missing') return
  if (type !== 'directory') throw new Error(`Copy cleanup path is not a directory: ${path}`)
  for (const name of await readdir(path)) {
    const child = join(path, name)
    const childType = await kind(child)
    if (childType === 'directory') await assertSafeRemovalTree(child)
    else if (childType !== 'file') throw new Error(`Copy cleanup file disappeared: ${child}`)
  }
}

// Caller must confirm the target DB status is copying before removing its files.
export async function cleanupIncompleteVersionCopyFiles(
  dataRoot: string,
  targetVersion: string
): Promise<void> {
  if (!VERSION_PATTERN.test(targetVersion)) throw new Error('Invalid version copy target')
  const root = resolve(dataRoot)
  const dataDirectory = join(root, 'copy', targetVersion)
  const workspaceDirectory = join(root, '.workspaces', 'copy', targetVersion)
  const stagingRoots = [join(root, '.staging'), join(root, '.workspaces', '.staging')]
  const targets = [dataDirectory, workspaceDirectory]
  for (const path of [...targets, ...stagingRoots]) await assertSafeAncestors(path)
  for (const stagingRoot of stagingRoots) {
    if ((await kind(stagingRoot)) === 'missing') continue
    for (const name of await readdir(stagingRoot)) {
      const prefix = `version-copy-${targetVersion}-`
      if (name.startsWith(prefix) && UUID_PATTERN.test(name.slice(prefix.length))) {
        targets.push(join(stagingRoot, name))
      }
    }
  }
  for (const path of targets) await assertSafeRemovalTree(path)
  for (const path of targets) {
    if ((await kind(path)) !== 'missing') await rm(path, { recursive: true })
  }
}

export async function rollbackVersionCopyFiles(prepared: PreparedVersionCopyFiles): Promise<void> {
  const state = ownedCopies.get(prepared)
  if (!state) throw new Error('Version copy is not owned by this process')
  if (state === 'committed') {
    await rm(prepared.destinationDirectory, { recursive: true, force: true })
    if (prepared.workspaceDestinationDirectory)
      await rm(prepared.workspaceDestinationDirectory, { recursive: true, force: true })
  }
  await rm(prepared.stagingDirectory, { recursive: true, force: true })
  if (prepared.workspaceStagingDirectory)
    await rm(prepared.workspaceStagingDirectory, { recursive: true, force: true })
  ownedCopies.delete(prepared)
}
