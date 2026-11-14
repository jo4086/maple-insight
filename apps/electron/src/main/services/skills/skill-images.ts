import { execFile, spawn } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

import { is } from '@electron-toolkit/utils'
import { app } from 'electron'

import type {
  ExtractSkillImagesResult,
  SkillImageData,
  SkillImageIdentity
} from '../../../shared/skill-images'

const execFileAsync = promisify(execFile)
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const iconNames = ['icon', 'iconMouseOver', 'iconDisabled'] as const
const summaryPattern =
  /SUMMARY jobs=(\d+) created=(\d+) reused=(\d+) missing=(\d+) failed=(\d+) missingJobs=(\d+)/

function repositoryRoot(): string {
  return resolve(app.getAppPath(), '../..')
}

export function resolveSkillImageRoot(): string {
  if (process.env.MAPLE_SKILL_IMAGE_ROOT) return resolve(process.env.MAPLE_SKILL_IMAGE_ROOT)
  if (is.dev) return join(repositoryRoot(), 'tools/maple-skill-extractor/output/skills')
  return join(app.getPath('userData'), 'skill-images', 'skills')
}

function resolveWzPath(): string {
  if (process.env.MAPLE_SKILL_WZ_PATH) return process.env.MAPLE_SKILL_WZ_PATH
  if (is.dev && process.platform === 'linux') return '/mnt/d/Game/Maple/Data/Base/Base.wz'
  throw new Error('Base.wz 경로가 설정되지 않았습니다. MAPLE_SKILL_WZ_PATH를 지정하세요.')
}

function resolveExtractorPath(): string {
  if (process.env.MAPLE_SKILL_EXTRACTOR_DLL) return process.env.MAPLE_SKILL_EXTRACTOR_DLL
  if (is.dev)
    return join(
      repositoryRoot(),
      'tools/maple-skill-extractor/bin/Debug/net8.0-windows/maple-skill-extractor.dll'
    )
  return join(process.resourcesPath, 'skill-extractor', 'maple-skill-extractor.dll')
}

function isWindowsPath(path: string): boolean {
  return /^[a-z]:[\\/]/i.test(path) || path.startsWith('\\\\')
}

async function pathForWindows(path: string): Promise<string> {
  if (process.platform === 'win32' || isWindowsPath(path)) return path
  const kernel = await readFile('/proc/version', 'utf8')
  if (!kernel.toLowerCase().includes('microsoft'))
    throw new Error('Windows 스킬 추출기는 WSL 또는 Windows에서 실행해야 합니다.')
  const { stdout } = await execFileAsync('wslpath', ['-w', path])
  return stdout.trim()
}

export function normalizeSkillJobId(jobId: string): string {
  return jobId.replace(/^0+/, '').padStart(3, '0')
}

async function readIcon(
  root: string,
  identity: SkillImageIdentity,
  name: (typeof iconNames)[number]
): Promise<string | null> {
  const filePath = join(root, normalizeSkillJobId(identity.jobId), identity.skillId, `${name}.png`)
  let bytes: Buffer
  try {
    bytes = await readFile(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
  if (bytes.length < 24 || bytes.length > 1024 * 1024 || !bytes.subarray(0, 8).equals(pngSignature))
    return null
  return `data:image/png;base64,${bytes.toString('base64')}`
}

export async function listSkillImageData(
  version: string,
  identities: SkillImageIdentity[],
  root = resolveSkillImageRoot()
): Promise<SkillImageData[]> {
  const versionRoot = join(root, version)
  return Promise.all(
    identities.map(async (identity) => {
      const [icon, iconMouseOver, iconDisabled] = await Promise.all(
        iconNames.map((name) => readIcon(versionRoot, identity, name))
      )
      return { ...identity, icon, iconMouseOver, iconDisabled }
    })
  )
}

function runProcess(command: string, args: string[]): Promise<string> {
  return new Promise((resolveOutput, reject) => {
    const child = spawn(command, args, {
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let output = ''
    const append = (chunk: Buffer): void => {
      output += chunk.toString('utf8')
      if (output.length > 512_000) {
        child.kill()
        reject(new Error('스킬 추출기 출력이 허용 크기를 초과했습니다.'))
      }
    }
    child.stdout.on('data', append)
    child.stderr.on('data', append)
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolveOutput(output)
      else
        reject(
          new Error(
            `스킬 이미지 추출 실패 (${code}): ${output.trim().split('\n').slice(-8).join('\n')}`
          )
        )
    })
  })
}

export async function extractSkillImages(
  version: string,
  jobIds: string[]
): Promise<ExtractSkillImagesResult> {
  const wzPath = resolveWzPath()
  const extractorPath = resolveExtractorPath()
  const outputRoot = join(resolveSkillImageRoot(), version)
  if (!isWindowsPath(wzPath)) await access(wzPath)
  if (!isWindowsPath(extractorPath)) await access(extractorPath)
  const [windowsWzPath, windowsExtractorPath, windowsOutputRoot] = await Promise.all([
    pathForWindows(wzPath),
    pathForWindows(extractorPath),
    pathForWindows(outputRoot)
  ])
  const orderedJobIds = [...new Set(jobIds.map(normalizeSkillJobId))].sort(
    (left, right) => Number(left) - Number(right)
  )
  const command =
    process.env.MAPLE_DOTNET_EXE || (process.platform === 'win32' ? 'dotnet' : 'dotnet.exe')
  const output = await runProcess(command, [
    windowsExtractorPath,
    '--wz',
    windowsWzPath,
    '--output',
    windowsOutputRoot,
    '--job-ids',
    orderedJobIds.join(',')
  ])
  const match = output.match(summaryPattern)
  if (!match) throw new Error('스킬 추출기 결과 요약을 읽을 수 없습니다.')
  const [, jobs, created, reused, missing, failed, missingJobs] = match.map(Number)
  return { jobs, created, reused, missing, failed, missingJobs }
}
