import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, rename } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

import { parse } from 'dotenv'
import { _electron as electron } from 'playwright'

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.resolve(app, '../..')
const db = path.join(root, 'packages/database/db')
const source = '91.72.301'
const target = '91.72.302'
const models = [
  'gameDataRawFile',
  'gameDataRawRecord',
  'gameJob',
  'gameSkill',
  'gameSkillCommon',
  'gameSkillHint',
  'gameSkillLevel',
  'gameSkillPvpCommon',
  'equipmentItem'
]
const assert = (value, message) => {
  if (!value) throw new Error(message)
}
const hash = (value) => createHash('sha256').update(value).digest('hex')
const require = createRequire(import.meta.url)
const { PrismaClient } = require(path.join(db, 'src/generated/prisma/index.js'))
let client
let application
let temporary
let databaseName
let maintenanceUrl

function run(command, args, options = {}) {
  try {
    const result = execFileSync(command, args, { encoding: 'utf8', ...options }).trim()
    console.log(
      `${command} ${args.filter((arg) => !arg.includes('://')).join(' ')}: exit=0 ${result.slice(-350)}`
    )
  } catch (error) {
    console.error(
      `${command}: exit=${error.status ?? 'unknown'} ${String(error.stderr || error.message)
        .replace(/postgresql:\/\/\S+/g, 'postgresql://***')
        .slice(-500)}`
    )
    throw error
  }
}

async function files(directory) {
  const result = {}
  async function visit(folder, prefix = '') {
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const relative = path.join(prefix, item.name)
      if (item.isDirectory()) await visit(path.join(folder, item.name), relative)
      else result[relative] = hash(await readFile(path.join(folder, item.name)))
    }
  }
  await visit(directory)
  return result
}

async function graph(version) {
  const result = {}
  const raw = await client.gameDataRawFile.findMany({ where: { version }, orderBy: { id: 'asc' } })
  for (const model of models) {
    const rows =
      model === 'gameDataRawRecord'
        ? await client.gameDataRawRecord.findMany({
            where: { fileId: { in: raw.map((row) => row.id) } },
            orderBy: { rowIndex: 'asc' }
          })
        : await client[model].findMany({ where: { version } })
    result[model] = rows
      .map((row) => {
        const data = { ...row }
        delete data.version
        if (model === 'gameDataRawFile' || model === 'equipmentItem') delete data.id
        if (model === 'gameDataRawRecord') {
          delete data.id
          delete data.fileId
        }
        return JSON.parse(
          JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? String(value) : value))
        )
      })
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  }
  return result
}

async function launch() {
  application = await electron.launch({
    args: [
      path.join(app, 'out/main/index.js'),
      `--user-data-dir=${path.join(temporary, 'profile')}`
    ],
    cwd: app,
    env: { ...process.env, MAPLE_DATA_ROOT: path.join(temporary, 'data') },
    timeout: 30_000
  })
  const page = await application.firstWindow()
  await page.getByRole('button', { name: '대시보드' }).waitFor()
  await page.getByRole('button', { name: '버전 관리' }).click()
  await page.getByLabel('버전 하위 탐색').getByRole('button', { name: '리스트' }).click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  return page
}

async function main() {
  const original = new URL(parse(await readFile(path.join(db, '.env'))).DATABASE_URL)
  original.search = ''
  assert(original.pathname !== '/', 'Original database path missing')
  databaseName = `maple_distill_test_${randomBytes(7).toString('hex')}`
  maintenanceUrl = new URL(original)
  maintenanceUrl.pathname = '/postgres'
  const disposable = new URL(original)
  disposable.pathname = `/${databaseName}`
  temporary = await mkdtemp(path.join(tmpdir(), 'maple-distill-mutation-'))
  run('createdb', [`--maintenance-db=${maintenanceUrl.href}`, databaseName])
  process.env.DATABASE_URL = `${disposable.href}?schema=game_data`
  run(
    path.join(db, 'node_modules/.bin/prisma'),
    ['migrate', 'deploy', '--schema', path.join(db, 'prisma/schema.prisma')],
    { cwd: db, env: process.env }
  )
  client = new PrismaClient()
  const data = path.join(temporary, 'data')
  const sourcePath = path.join(data, 'production', source)
  await mkdir(path.join(sourcePath, 'csv'), { recursive: true })
  await mkdir(path.join(sourcePath, 'json'), { recursive: true })
  const csv = 'id\n1\n'
  const json = '[{"jobID":"100","jobName":"Sample"}]\n'
  await writeFile(path.join(sourcePath, 'csv/data.csv'), csv)
  await writeFile(path.join(sourcePath, 'json/data.json'), json)
  await writeFile(
    path.join(sourcePath, 'manifest.json'),
    JSON.stringify({
      version: source,
      environment: 'production',
      status: 'converted',
      totalFiles: 1,
      totalRecords: 1,
      files: [{ source: 'csv/data.csv', output: 'json/data.json', records: 1, sha256: hash(csv) }]
    })
  )
  const workspace = path.join(data, '.workspaces', 'production', source)
  await mkdir(path.join(workspace, 'json'), { recursive: true })
  await writeFile(path.join(workspace, 'json/data.json'), json)
  await writeFile(path.join(workspace, 'validation.json'), JSON.stringify({ status: 'ready' }))
  await writeFile(
    path.join(workspace, 'workspace.json'),
    JSON.stringify({
      schemaVersion: 1,
      version: source,
      environment: 'production',
      status: 'ready',
      input: { manifest: 'manifest.json', manifestSha256: 'old', inputSha256: 'old' },
      files: [{ source: 'json/data.json', workspace: 'json/data.json', records: 1, sha256: 'old' }]
    })
  )
  await client.gameDataVersion.create({
    data: {
      version: source,
      major: 91,
      minor: 72,
      patch: 301,
      environment: 'production',
      status: 'ready'
    }
  })
  const raw = await client.gameDataRawFile.create({
    data: { version: source, fileName: 'data.json', rowCount: 1 }
  })
  await client.gameDataRawRecord.create({
    data: { fileId: raw.id, rowIndex: 0, sourceKey: '100', payload: { jobID: '100' } }
  })
  await client.gameJob.create({ data: { version: source, jobId: '100', jobName: 'Sample' } })
  await client.gameSkill.create({
    data: { version: source, skillId: '101', jobId: '100', skillName: 'Sample Skill' }
  })
  await client.gameSkillCommon.create({
    data: { version: source, skillId: '101', commonName: 'damage', commonValue: '100' }
  })
  await client.gameSkillHint.create({ data: { version: source, skillId: '101', desc: 'Hint' } })
  await client.gameSkillLevel.create({
    data: { version: source, skillId: '101', level: 1, levelDesc: 'Level' }
  })
  await client.gameSkillPvpCommon.create({
    data: { version: source, skillId: '101', commonName: 'damage', commonValue: '80' }
  })
  await client.equipmentItem.create({
    data: {
      version: source,
      name: 'Sample Hat',
      normalizedName: 'sample-hat',
      category: 'hat',
      keywords: ['sample'],
      part: 'head',
      requiredClass: ['warrior']
    }
  })
  const before = await graph(source)
  const originalFiles = await files(sourcePath)
  const originalWorkspace = await files(workspace)
  const createdAt = (
    await client.gameDataVersion.findUniqueOrThrow({ where: { version: source } })
  ).createdAt.toISOString()
  let page = await launch()
  const row = () => page.locator('tbody tr').filter({ hasText: source })
  const dateEditButton = () => row().getByRole('button', { name: `${source} 릴리스 날짜 수정` })
  await dateEditButton().click()
  let dateInput = row().locator('input[type="date"]')
  await dateInput.waitFor()
  assert(
    await dateInput.evaluate((input) => document.activeElement === input),
    'Date input not focused'
  )
  await dateInput.fill('2025-06-01')
  await dateInput.press('Enter')
  await page.getByText('2025. 6. 1.').waitFor()
  assert(
    (await client.gameDataVersion.findUniqueOrThrow({ where: { version: source } })).releasedOn
      .toISOString()
      .startsWith('2025-06-01'),
    'Date save failed'
  )
  try {
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute('aria-label') === label,
      `${source} 릴리스 날짜 수정`,
      { timeout: 5_000 }
    )
  } catch {
    throw new Error('Date edit focus not restored after Enter save')
  }
  await dateEditButton().click()
  await row()
    .getByRole('button', { name: `${source} 릴리스 날짜 비우기` })
    .click()
  await row()
    .getByRole('button', { name: `${source} 릴리스 날짜 저장` })
    .click()
  await row().getByText('미등록').waitFor()
  assert(
    (await client.gameDataVersion.findUniqueOrThrow({ where: { version: source } })).releasedOn ===
      null,
    'Date clear failed'
  )
  await dateEditButton().click()
  dateInput = row().locator('input[type="date"]')
  await dateInput.fill('2025-06-02')
  await dateInput.press('Escape')
  await row().getByText('미등록').waitFor()
  assert(
    (await client.gameDataVersion.findUniqueOrThrow({ where: { version: source } })).releasedOn ===
      null,
    'Date cancellation changed DB'
  )
  try {
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute('aria-label') === label,
      `${source} 릴리스 날짜 수정`,
      { timeout: 5_000 }
    )
  } catch {
    throw new Error('Date edit focus not restored after Escape cancellation')
  }
  const invalidRejected = await page.evaluate(async (version) => {
    try {
      await window.api.updateDataVersionReleaseDate({ version, releasedOn: '2025-02-30' })
      return false
    } catch {
      return true
    }
  }, source)
  assert(invalidRejected, 'Invalid date was accepted by IPC')
  assert(
    (await client.gameDataVersion.findUniqueOrThrow({ where: { version: source } })).releasedOn ===
      null,
    'Invalid date changed DB'
  )
  await row()
    .getByRole('button', { name: `${source} 복제` })
    .click()
  await row()
    .getByRole('textbox', { name: `${source} 새 버전` })
    .fill(source)
  await row()
    .getByRole('button', { name: `${source} 복제 실행` })
    .click()
  await page.getByRole('alert').getByText('이미 등록된 버전입니다.').waitFor()
  assert((await client.gameDataVersion.count()) === 1, 'Duplicate changed DB')
  await row()
    .getByRole('textbox', { name: `${source} 새 버전` })
    .fill(target)
  await row()
    .getByRole('button', { name: `${source} 복제 실행` })
    .click()
  const targetRow = page.locator('tbody tr').filter({ hasText: target })
  try {
    await Promise.race([
      targetRow.waitFor({ timeout: 10_000 }),
      page
        .getByRole('alert')
        .filter({ hasNotText: '이미 등록된 버전입니다.' })
        .first()
        .waitFor({ timeout: 10_000 })
        .then(async () => {
          throw new Error('Copy action reported error')
        })
    ])
  } catch (cause) {
    const alerts = await page.getByRole('alert').allTextContents()
    const targetState = await client.gameDataVersion.findUnique({
      where: { version: target },
      select: { environment: true, status: true }
    })
    console.error(
      'copy diagnostic:',
      JSON.stringify({
        alerts,
        targetState,
        targetRowCount: await targetRow.count(),
        sourceRowCount: await row().count()
      })
    )
    throw cause
  }
  const copied = await client.gameDataVersion.findUniqueOrThrow({ where: { version: target } })
  assert(
    copied.environment === 'copy' && copied.status === 'importing',
    'Copy identity/status wrong'
  )
  const targetPath = path.join(data, 'copy', target)
  const copiedManifest = JSON.parse(await readFile(path.join(targetPath, 'manifest.json')))
  assert(
    copiedManifest.version === target && copiedManifest.environment === 'copy',
    'Copied manifest identity wrong'
  )
  assert(
    hash(await readFile(path.join(targetPath, 'json/data.json'))) ===
      originalFiles['json/data.json'],
    'Copied JSON mismatch'
  )
  assert(
    hash(await readFile(path.join(targetPath, 'csv/data.csv'))) === originalFiles['csv/data.csv'],
    'Copied CSV mismatch'
  )
  const targetWorkspace = path.join(data, '.workspaces', 'copy', target)
  const workspaceMeta = JSON.parse(await readFile(path.join(targetWorkspace, 'workspace.json')))
  assert(
    workspaceMeta.version === target &&
      workspaceMeta.environment === 'copy' &&
      workspaceMeta.status === 'pending',
    'Copied workspace identity/status wrong'
  )
  assert(
    !('validation.json' in (await files(targetWorkspace))),
    'Copied validation evidence reused'
  )
  assert(JSON.stringify(await graph(target)) === JSON.stringify(before), 'Copied graph mismatch')
  assert(JSON.stringify(await graph(source)) === JSON.stringify(before), 'Source graph changed')
  assert(
    JSON.stringify(await files(sourcePath)) === JSON.stringify(originalFiles),
    'Source files changed'
  )
  assert(
    JSON.stringify(await files(workspace)) === JSON.stringify(originalWorkspace),
    'Source workspace changed'
  )
  assert(
    (
      await client.gameDataVersion.findUniqueOrThrow({ where: { version: source } })
    ).createdAt.toISOString() === createdAt,
    'Source creation time changed'
  )
  await page.getByLabel('현재 버전').first().selectOption(target)
  await page
    .locator('tbody tr')
    .filter({ hasText: target })
    .getByRole('button', { name: `${target} 삭제` })
    .click()
  await page
    .locator('tbody tr')
    .filter({ hasText: target })
    .getByRole('button', { name: `${target} 삭제 확인` })
    .click()
  await page.locator('tbody tr').filter({ hasText: target }).waitFor({ state: 'detached' })
  assert(
    (await client.gameDataVersion.findUniqueOrThrow({ where: { version: target } })).status ===
      'deleted',
    'Soft deletion failed'
  )
  assert(
    (await page.getByLabel('현재 버전').first().inputValue()) === source,
    'Active selection did not fall back'
  )
  assert(
    JSON.stringify(await graph(target)) === JSON.stringify(before),
    'Deleted graph not retained'
  )
  assert((await files(targetPath))['manifest.json'], 'Deleted files not retained')
  assert((await files(targetWorkspace))['workspace.json'], 'Deleted workspace not retained')
  await page.evaluate(
    (version) => localStorage.setItem('maple-insight-current-version', version),
    target
  )
  assert(
    (await page.evaluate(() => localStorage.getItem('maple-insight-current-version'))) === target,
    'Deleted selection was not stored before restart'
  )
  await application.close()
  application = undefined
  page = await launch()
  await page.waitForFunction(
    (version) =>
      [...document.querySelectorAll('label')].some(
        (label) =>
          label.querySelector('span')?.textContent?.trim() === '현재 버전' &&
          label.querySelector('select')?.value === version
      ),
    source
  )
  assert(
    (await page.getByLabel('현재 버전').first().inputValue()) === source,
    'Restart did not fall back from stored deleted version'
  )
  assert(
    (await page.locator('tbody tr').filter({ hasText: target }).count()) === 0,
    'Deleted target appeared in list after restart'
  )
  assert(
    (await page.getByLabel('현재 버전').first().locator(`option[value="${target}"]`).count()) === 0,
    'Deleted target appeared in selector after restart'
  )
  console.log(
    'restart after soft delete: stored deleted selection fell back to source; deleted version absent from list and selector'
  )
  const deletedFiles = await files(targetPath)
  const deletedWorkspace = await files(targetWorkspace)
  await row()
    .getByRole('button', { name: `${source} 복제` })
    .click()
  await row()
    .getByRole('textbox', { name: `${source} 새 버전` })
    .fill(target)
  await row()
    .getByRole('button', { name: `${source} 복제 실행` })
    .click()
  await page
    .getByRole('alert')
    .getByText(/Version copy target already exists/)
    .waitFor()
  assert(
    (await client.gameDataVersion.findUniqueOrThrow({ where: { version: target } })).status ===
      'deleted',
    'Deleted target collision changed status'
  )
  assert(
    JSON.stringify(await files(targetPath)) === JSON.stringify(deletedFiles),
    'Deleted target collision changed managed files'
  )
  assert(
    JSON.stringify(await files(targetWorkspace)) === JSON.stringify(deletedWorkspace),
    'Deleted target collision changed workspace'
  )
  console.log('deleted target collision: rejected; retained DB/files unchanged')

  const interrupted = '91.72.303'
  const interruptedPath = path.join(data, 'copy', interrupted)
  const interruptedWorkspace = path.join(data, '.workspaces', 'copy', interrupted)
  const staleStages = [
    path.join(data, '.staging', `version-copy-${interrupted}-11111111-1111-4111-8111-111111111111`),
    path.join(
      data,
      '.workspaces',
      '.staging',
      `version-copy-${interrupted}-22222222-2222-4222-8222-222222222222`
    )
  ]
  await client.gameDataVersion.create({
    data: {
      version: interrupted,
      major: 91,
      minor: 72,
      patch: 303,
      environment: 'copy',
      status: 'copying'
    }
  })
  for (const directory of [interruptedPath, interruptedWorkspace, ...staleStages]) {
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'stale-marker'), 'interrupted copy')
  }
  await row()
    .getByRole('textbox', { name: `${source} 새 버전` })
    .fill(interrupted)
  await row()
    .getByRole('button', { name: `${source} 복제 실행` })
    .click()
  try {
    await page.locator('tbody tr').filter({ hasText: interrupted }).waitFor({ timeout: 10_000 })
  } catch (cause) {
    console.error(
      'interrupted copy diagnostic:',
      JSON.stringify({
        alerts: await page.getByRole('alert').allTextContents(),
        targetState: await client.gameDataVersion.findUnique({
          where: { version: interrupted },
          select: { environment: true, status: true }
        })
      })
    )
    throw cause
  }
  const resumed = await client.gameDataVersion.findUniqueOrThrow({
    where: { version: interrupted }
  })
  assert(
    resumed.environment === 'copy' && resumed.status === 'importing',
    'Interrupted copy did not reach importing'
  )
  assert(
    JSON.stringify(await graph(interrupted)) === JSON.stringify(before),
    'Interrupted copy graph mismatch'
  )
  assert(
    JSON.stringify(await graph(source)) === JSON.stringify(before),
    'Interrupted copy modified source DB'
  )
  assert(
    JSON.stringify(await files(sourcePath)) === JSON.stringify(originalFiles),
    'Interrupted copy modified source files'
  )
  assert(
    JSON.stringify(await files(workspace)) === JSON.stringify(originalWorkspace),
    'Interrupted copy modified source workspace'
  )
  assert(
    hash(await readFile(path.join(interruptedPath, 'json/data.json'))) ===
      originalFiles['json/data.json'],
    'Interrupted copy JSON mismatch'
  )
  assert(
    hash(await readFile(path.join(interruptedPath, 'csv/data.csv'))) ===
      originalFiles['csv/data.csv'],
    'Interrupted copy CSV mismatch'
  )
  const resumedManifest = JSON.parse(await readFile(path.join(interruptedPath, 'manifest.json')))
  assert(
    resumedManifest.version === interrupted && resumedManifest.environment === 'copy',
    'Interrupted copy manifest mismatch'
  )
  const resumedWorkspace = JSON.parse(
    await readFile(path.join(interruptedWorkspace, 'workspace.json'))
  )
  assert(
    resumedWorkspace.version === interrupted &&
      resumedWorkspace.environment === 'copy' &&
      resumedWorkspace.status === 'pending',
    'Interrupted copy workspace mismatch'
  )
  assert(
    !('validation.json' in (await files(interruptedWorkspace))),
    'Interrupted copy reused validation evidence'
  )
  for (const directory of [interruptedPath, interruptedWorkspace])
    assert(
      !('stale-marker' in (await files(directory))),
      'Interrupted copy retained stale destination'
    )
  for (const directory of staleStages)
    assert(
      !(await readdir(path.dirname(directory))).includes(path.basename(directory)),
      'Interrupted copy retained stale staging'
    )
  console.log(
    'interrupted copy: reset/reclone, importing, graph(9 models), source unchanged, stale destination/staging removed'
  )

  const csvPath = path.join(sourcePath, 'csv/data.csv')
  const missingCsvPath = path.join(temporary, 'withheld-data.csv')
  await rename(csvPath, missingCsvPath)
  try {
    await row()
      .getByRole('button', { name: `${source} 복제` })
      .click()
    await row()
      .getByRole('textbox', { name: `${source} 새 버전` })
      .fill('91.72.304')
    await row()
      .getByRole('button', { name: `${source} 복제 실행` })
      .click()
    await page
      .getByRole('alert')
      .getByText(/Missing manifest source: csv\/data.csv/)
      .waitFor()
    assert(
      (await client.gameDataVersion.findUnique({ where: { version: '91.72.304' } })) === null,
      'Missing CSV created target DB row'
    )
    assert(
      !(await readdir(path.join(data, 'copy'))).includes('91.72.304'),
      'Missing CSV created managed target'
    )
    assert(
      JSON.stringify(await graph(source)) === JSON.stringify(before),
      'Missing CSV changed source DB'
    )
  } finally {
    await rename(missingCsvPath, csvPath)
  }
  assert(
    JSON.stringify(await files(sourcePath)) === JSON.stringify(originalFiles),
    'Missing CSV changed source after restoration'
  )
  console.log(
    'missing manifest CSV: rejected before target DB/files; source restored and unchanged'
  )
  console.log(
    'native mutations: exit=0 date save/clear, invalid date, duplicate, graph(9 models), managed files/workspace, importing, soft delete/fallback, deleted collision, interrupted recovery, missing CSV verified'
  )
}

try {
  await main()
} catch (error) {
  console.error('verification: exit=1', error.message)
  process.exitCode = 1
} finally {
  try {
    await application?.close()
  } catch (error) {
    console.error('Electron close:', error.message)
    process.exitCode = 1
  }
  try {
    await client?.$disconnect()
  } catch (error) {
    console.error('Prisma close:', error.message)
    process.exitCode = 1
  }
  if (databaseName) {
    try {
      run('dropdb', [
        `--maintenance-db=${maintenanceUrl.href}`,
        '--if-exists',
        '--force',
        databaseName
      ])
    } catch {
      process.exitCode = 1
    }
  }
  if (temporary) {
    try {
      await rm(temporary, { recursive: true, force: true })
      console.log('temporary filesystem cleanup: exit=0')
    } catch (error) {
      console.error('temporary cleanup: exit=1', error.message)
      process.exitCode = 1
    }
  }
}
