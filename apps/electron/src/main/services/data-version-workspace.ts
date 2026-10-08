import { once } from 'node:events'
import { createReadStream, createWriteStream } from 'node:fs'
import { access, copyFile, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'

import type { DataDirectoryConversionSummary } from '../../shared/data-import'

export type PreparedDataVersionWorkspace = {
  stagingDirectory: string
  versionDirectory: string
  csvDirectory: string
  jsonDirectory: string
  manifestPath: string
  legacySourceDirectory?: string
  backupDirectory?: string
}

export type PrepareDataVersionWorkspaceOptions = {
  dataRoot: string
  sessionId: string
  sourceDirectory: string
  conversion: DataDirectoryConversionSummary
  environment: 'test' | 'production'
  releasedOn: string | null
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

function normalizeManagedRelativePath(relativePath: string): string {
  return relativePath.startsWith('csv/') ? relativePath.slice('csv/'.length) : relativePath
}

async function writeChunk(
  output: ReturnType<typeof createWriteStream>,
  chunk: string
): Promise<void> {
  if (!output.write(chunk)) await once(output, 'drain')
}

async function convertNdjsonToJsonArray(sourcePath: string, outputPath: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true })
  const input = createReadStream(sourcePath, { encoding: 'utf8' })
  const lines = createInterface({ input, crlfDelay: Infinity })
  const output = createWriteStream(outputPath, { encoding: 'utf8', flags: 'wx' })
  output.on('error', () => undefined)

  try {
    await writeChunk(output, '[\n')
    let first = true
    for await (const line of lines) {
      if (!line) continue
      await writeChunk(output, `${first ? '' : ',\n'}  ${line}`)
      first = false
    }
    output.end('\n]\n')
    await once(output, 'finish')
  } catch (error) {
    input.destroy()
    output.destroy()
    throw error
  } finally {
    lines.close()
  }
}

export async function prepareDataVersionWorkspace(
  options: PrepareDataVersionWorkspaceOptions
): Promise<PreparedDataVersionWorkspace> {
  const versionDirectory = join(
    options.dataRoot,
    options.environment,
    options.conversion.targetVersion
  )
  const versionDirectoryExists = await pathExists(versionDirectory)
  const isLegacySourceDirectory =
    versionDirectoryExists && resolve(options.sourceDirectory) === resolve(versionDirectory)
  if (versionDirectoryExists && !isLegacySourceDirectory) {
    throw new Error(`Version data directory already exists: ${versionDirectory}`)
  }
  if (isLegacySourceDirectory && (await pathExists(join(versionDirectory, 'manifest.json')))) {
    throw new Error(`Managed version data directory already exists: ${versionDirectory}`)
  }

  const stagingDirectory = join(options.dataRoot, '.staging', options.sessionId)
  const csvDirectory = join(stagingDirectory, 'csv')
  const jsonDirectory = join(stagingDirectory, 'json')
  const manifestPath = join(stagingDirectory, 'manifest.json')
  await mkdir(join(options.dataRoot, '.staging'), { recursive: true })
  await mkdir(join(options.dataRoot, options.environment), { recursive: true })
  await mkdir(stagingDirectory)
  await mkdir(csvDirectory)
  await mkdir(jsonDirectory, { recursive: true })

  try {
    for (const file of options.conversion.files) {
      const relativePath = normalizeManagedRelativePath(file.relativePath)
      const csvPath = join(csvDirectory, ...relativePath.split('/'))
      const jsonPath = join(jsonDirectory, ...relativePath.replace(/\.csv$/i, '.json').split('/'))
      const sourcePath = join(options.sourceDirectory, ...file.relativePath.split('/'))
      await mkdir(dirname(csvPath), { recursive: true })
      await copyFile(sourcePath, csvPath)
      await convertNdjsonToJsonArray(file.outputPath, jsonPath)
    }

    const manifest = {
      version: options.conversion.targetVersion,
      environment: options.environment,
      releasedOn: options.releasedOn,
      status: 'converted',
      totalFiles: options.conversion.totalFiles,
      totalRecords: options.conversion.totalRecords,
      files: options.conversion.files.map((file) => {
        const relativePath = normalizeManagedRelativePath(file.relativePath)
        return {
          source: `csv/${relativePath}`,
          output: `json/${relativePath.replace(/\.csv$/i, '.json')}`,
          records: file.convertedRecords,
          sha256: file.sha256
        }
      })
    }
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    return {
      stagingDirectory,
      versionDirectory,
      csvDirectory: join(versionDirectory, 'csv'),
      jsonDirectory: join(versionDirectory, 'json'),
      manifestPath: join(versionDirectory, 'manifest.json'),
      ...(isLegacySourceDirectory
        ? {
            legacySourceDirectory: versionDirectory,
            backupDirectory: join(options.dataRoot, '.backup', options.sessionId)
          }
        : {})
    }
  } catch (error) {
    await rm(stagingDirectory, { recursive: true, force: true })
    throw error
  }
}

export async function commitDataVersionWorkspace(
  prepared: PreparedDataVersionWorkspace
): Promise<void> {
  if (!prepared.legacySourceDirectory || !prepared.backupDirectory) {
    await rename(prepared.stagingDirectory, prepared.versionDirectory)
    return
  }

  await mkdir(dirname(prepared.backupDirectory), { recursive: true })
  await rename(prepared.legacySourceDirectory, prepared.backupDirectory)
  try {
    await rename(prepared.stagingDirectory, prepared.versionDirectory)
  } catch (error) {
    await rename(prepared.backupDirectory, prepared.legacySourceDirectory)
    throw error
  }
  await rm(prepared.backupDirectory, { recursive: true, force: true }).catch(() => undefined)
}

export async function discardDataVersionWorkspace(
  prepared: Pick<PreparedDataVersionWorkspace, 'stagingDirectory'>
): Promise<void> {
  await rm(prepared.stagingDirectory, { recursive: true, force: true })
}
