import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { _electron as electron } from 'playwright'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.resolve(currentDirectory, '..')
const repositoryRoot = path.resolve(appDirectory, '../..')
const productionVersion = '1.2.419'
const warningVersion = '1.2.424'
const warningReason = 'native IPC persistence check'
const expectedProductionRecords = 254_206
const pvpOutput = 'json/ms_skillPVPCommon.json'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function dataVersionDirectory(version) {
  return path.join(repositoryRoot, 'data', 'production', version)
}

async function launchElectron(profileDirectory, dataRoot) {
  return electron.launch({
    args: [
      path.join(appDirectory, 'out', 'main', 'index.js'),
      `--user-data-dir=${profileDirectory}`
    ],
    cwd: appDirectory,
    env: { ...process.env, MAPLE_DATA_ROOT: dataRoot },
    timeout: 30_000
  })
}

async function getFirstWindow(electronApp) {
  const page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize({ width: 1480, height: 920 })
  return page
}

async function copyProductionFixture(dataRoot, version) {
  const sourceDirectory = dataVersionDirectory(productionVersion)
  const targetDirectory = path.join(dataRoot, 'production', version)
  const sourceManifest = JSON.parse(
    await readFile(path.join(sourceDirectory, 'manifest.json'), 'utf8')
  )
  const manifest = { ...sourceManifest, version }

  assert(manifest.totalFiles === 6, 'Production fixture manifest must contain six files.')
  assert(
    manifest.totalRecords === expectedProductionRecords,
    'Production fixture record count changed.'
  )
  assert(
    manifest.files.some((file) => file.output === pvpOutput),
    'Production fixture lacks PVP data.'
  )

  await mkdir(path.join(targetDirectory, 'json'), { recursive: true })
  await writeFile(
    path.join(targetDirectory, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  )
  await Promise.all(
    manifest.files.map((file) =>
      copyFile(path.join(sourceDirectory, file.output), path.join(targetDirectory, file.output))
    )
  )
}

async function createWarningFixture(dataRoot) {
  const targetDirectory = path.join(dataRoot, 'production', warningVersion)
  const sourceManifest = JSON.parse(
    await readFile(path.join(dataVersionDirectory(productionVersion), 'manifest.json'), 'utf8')
  )
  const records = [
    { jobID: '100', jobName: ' 전사 ' },
    { jobID: '200', jobName: '마법사' }
  ]
  const jobFile = sourceManifest.files.find((file) => file.output === 'json/ms_job.json')
  assert(jobFile, 'Source manifest lacks ms_job.json.')

  await mkdir(path.join(targetDirectory, 'json'), { recursive: true })
  await writeFile(
    path.join(targetDirectory, 'manifest.json'),
    `${JSON.stringify(
      {
        ...sourceManifest,
        version: warningVersion,
        totalFiles: 1,
        totalRecords: records.length,
        files: [{ ...jobFile, records: records.length }]
      },
      null,
      2
    )}\n`
  )
  await writeFile(path.join(targetDirectory, 'json', 'ms_job.json'), `${JSON.stringify(records)}\n`)
}

async function selectVersion(page, version) {
  const select = page.getByLabel('현재 버전').first()
  await select.waitFor({ state: 'visible' })
  await page.waitForFunction(
    (requestedVersion) =>
      Array.from(document.querySelectorAll('select')).some((candidate) =>
        Array.from(candidate.options).some((option) => option.value === requestedVersion)
      ),
    version,
    { timeout: 15_000 }
  )
  await select.selectOption(version)
}

async function openOperations(page, version) {
  await page.getByRole('button', { name: 'DB · 타입 작업' }).click()
  await page.getByText(`VALIDATION · ${version}`, { exact: true }).waitFor()
}

async function startValidationAndObserveProgress(page) {
  await page.getByRole('button', { name: '현재 버전 검증' }).click()
  await page.getByRole('button', { name: '검증 취소' }).waitFor({ timeout: 15_000 })
  const before = await page.evaluate(() => document.body.textContent)
  await page.waitForTimeout(100)
  const after = await page.evaluate(() => document.body.textContent)
  assert(before !== null && after !== null, 'Renderer did not respond while validation was active.')
}

async function waitForValidationResult(page) {
  await page
    .getByText(/검토가 필요한 작업본|검증 완료 · 다음 단계 가능|오류가 있는 작업본/)
    .waitFor({ timeout: 120_000 })
}

async function expandIssues(page, issueCode) {
  const issues = page.locator('details').filter({ hasText: '오류 및 경고' })
  await issues.locator('summary').click()
  await issues.getByText(`[${issueCode}]`, { exact: true }).waitFor()
}

async function verifyProductionRun(page, dataRoot) {
  await selectVersion(page, productionVersion)
  await openOperations(page, productionVersion)
  await startValidationAndObserveProgress(page)
  await waitForValidationResult(page)

  const reportPath = path.join(
    dataRoot,
    '.workspaces',
    'production',
    productionVersion,
    'validation.json'
  )
  const report = JSON.parse(await readFile(reportPath, 'utf8'))
  assert(
    report.summary.records === expectedProductionRecords,
    `Expected ${expectedProductionRecords} records.`
  )
  assert(report.summary.files === 6, 'Production validation did not process all six files.')
  const pvp = report.files.find((file) => file.file.endsWith('ms_skillPVPCommon.json'))
  assert(pvp, 'PVP file was not validated.')
  assert(pvp.domain === 'skill', 'PVP file resolved to an unsupported domain.')
  assert(
    !report.issues.some(
      (issue) =>
        issue.location?.file?.endsWith('ms_skillPVPCommon.json') &&
        issue.code === 'UNSUPPORTED_VALIDATION_DOMAIN'
    ),
    'PVP file produced unsupported-domain validation error.'
  )
  assert(report.status === 'ready', 'Production fixture must finish ready.')
  assert(report.publishable === true, 'Production fixture must be publishable.')
  assert(report.summary.errors === 0, 'Production fixture must not report validation errors.')
  console.log(
    `production result: status=${report.status}, publishable=${report.publishable}, errors=${report.summary.errors}, warnings=${report.summary.warnings}, issueCodes=${report.issues.map((issue) => `${issue.location.file}:${issue.code}`).join(',')}`
  )
}

async function verifyWarningPersistence(page, dataRoot) {
  await selectVersion(page, warningVersion)
  await openOperations(page, warningVersion)
  await startValidationAndObserveProgress(page)
  await waitForValidationResult(page)
  await expandIssues(page, 'TRIMMED_JOB_NAME')

  const reason = page.getByLabel('예외 사유 (선택)').first()
  await reason.fill(warningReason)
  await page.getByRole('button', { name: '경고 확인' }).first().click()
  await page.getByText(`확인됨 · ${warningReason}`).waitFor()
  await page.getByText('검증 완료 · 다음 단계 가능').waitFor()

  const reportPath = path.join(
    dataRoot,
    '.workspaces',
    'production',
    warningVersion,
    'validation.json'
  )
  const report = JSON.parse(await readFile(reportPath, 'utf8'))
  const storedWarning = report.issues.find((issue) => issue.code === 'TRIMMED_JOB_NAME')
  assert(storedWarning?.acknowledgement?.acknowledged, 'Acknowledged warning was not saved.')
  assert(
    storedWarning.acknowledgement.exceptionReason === warningReason,
    'Saved warning reason differs.'
  )

  await startValidationAndObserveProgress(page)
  await waitForValidationResult(page)
  await expandIssues(page, 'TRIMMED_JOB_NAME')
  await page.getByText(`확인됨 · ${warningReason}`).waitFor()
  await page.getByRole('button', { name: '확인 해제' }).first().click()
  await page.getByRole('button', { name: '경고 확인' }).first().waitFor()
}

async function verifyCancellation(page, dataRoot) {
  await rm(path.join(dataRoot, '.workspaces', 'production', warningVersion), {
    recursive: true,
    force: true
  })
  await copyProductionFixture(dataRoot, warningVersion)
  await selectVersion(page, warningVersion)
  await openOperations(page, warningVersion)
  await page.getByRole('button', { name: '현재 버전 검증' }).click()

  const cancel = page.getByRole('button', { name: '검증 취소' })
  await cancel.waitFor({ timeout: 15_000 })
  await cancel.dispatchEvent('click')
  await page.getByText('데이터 검증이 취소되었습니다.').waitFor({ timeout: 120_000 })
}

async function verifySharedScreens(page) {
  for (const size of [
    { width: 1480, height: 920 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(size)
    for (const screen of [
      '대시보드',
      '데이터 업로드',
      '버전 비교',
      '장비 데이터',
      '직업 데이터',
      'DB · 타입 작업'
    ]) {
      await page.getByRole('button', { name: screen }).click()
      await page.getByText(screen, { exact: true }).first().waitFor()
      assert(
        (await page.getByLabel('현재 버전').first().inputValue()) === warningVersion,
        `Version changed on ${screen}.`
      )
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    assert(!overflow, `Horizontal overflow at ${size.width}px.`)
  }
}

async function main() {
  config({ path: path.join(repositoryRoot, 'packages', 'database', 'db', '.env') })
  await access(path.join(appDirectory, 'out', 'main', 'index.js'))

  const profileDirectory = await mkdtemp(
    path.join(tmpdir(), 'maple-electron-validation-playwright-')
  )
  const dataRoot = path.join(profileDirectory, 'data')
  let electronApp

  try {
    await copyProductionFixture(dataRoot, productionVersion)
    await createWarningFixture(dataRoot)
    electronApp = await launchElectron(profileDirectory, dataRoot)
    const page = await getFirstWindow(electronApp)

    await verifyProductionRun(page, dataRoot)
    await verifyWarningPersistence(page, dataRoot)
    await verifyCancellation(page, dataRoot)
    await verifySharedScreens(page)
    console.log(
      'verified native Electron validation, strict cancellation, version switching, and shared screens'
    )
  } finally {
    if (electronApp) await electronApp.close()
    await rm(profileDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
