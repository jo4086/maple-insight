import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { _electron as electron } from 'playwright'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.resolve(currentDirectory, '..')
const repositoryRoot = path.resolve(appDirectory, '../..')
const filename = 'ms_job.json'
const storageKey = 'maple-insight-current-version'

function assert(condition, message) {
  if (!condition) throw new Error(message)
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

async function getPage(electronApp, size = { width: 1480, height: 920 }) {
  const page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize(size)
  await page.getByRole('button', { name: '대시보드' }).waitFor()
  await page.waitForFunction(() =>
    [...document.querySelectorAll('select')].some(
      (select) => !select.disabled && Boolean(select.value)
    )
  )
  return page
}

async function selectOption(page, label, value) {
  const select = page.getByLabel(label).first()
  await select.waitFor({ state: 'visible' })
  await select.selectOption(value)
}

async function writeFixture(dataRoot, version, records) {
  const directory = path.join(dataRoot, version.environment, version.version, 'json')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, filename), `${JSON.stringify(records, null, 2)}\n`)
}

function dateText(value, releaseDate = false) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    ...(releaseDate ? { timeZone: 'UTC' } : { timeStyle: 'short' })
  }).format(new Date(value))
}

async function verifyVersionList(page, registered, missingVersion) {
  await page.getByLabel('주 탐색').getByRole('button', { name: /버전$/ }).click()
  const navigation = page.getByLabel('버전 하위 탐색')
  await navigation.getByRole('button', { name: '리스트' }).click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()

  const rows = page.locator('tbody tr')
  assert(
    (await rows.count()) === registered.length,
    'Version list row count differs from selectable DB versions.'
  )
  for (const version of registered) {
    const row = rows.filter({ hasText: version.version })
    assert((await row.count()) === 1, `Version list has no unique row for ${version.version}.`)
    assert(
      (await row.locator('td').nth(0).textContent())?.includes(version.version),
      `Version cell differs for ${version.version}.`
    )
    await row
      .getByText(version.releasedOn ? dateText(version.releasedOn, true) : '미등록', {
        exact: true
      })
      .waitFor()
    await row.getByText(dateText(version.createdAt)).waitFor()
    await row.getByText(version.environment === 'production' ? '운영' : '테스트').waitFor()
    await row.getByText(version.status === 'ready' ? '준비됨' : '가져오는 중').waitFor()
  }
  assert(
    (await rows.filter({ hasText: missingVersion.version }).count()) === 1,
    'DB version without local JSON was not visible.'
  )
}

async function verifyDashboardArrows(page) {
  await page.getByRole('button', { name: '대시보드' }).click()
  const context = page
    .locator('section')
    .filter({ has: page.getByLabel('비교 버전') })
    .first()
  await context.waitFor()
  const arrow = context.locator('span.grid.place-items-center.self-end svg')
  assert((await arrow.count()) === 1, 'Dashboard comparison arrow is missing.')
  assert(
    Number(await arrow.getAttribute('stroke-width')) >= 2.5,
    'Dashboard arrow strokeWidth must be at least 2.5.'
  )
  const [baseBox, arrowBox, currentBox] = await Promise.all([
    page.getByLabel('비교 버전').boundingBox(),
    arrow.boundingBox(),
    page.getByLabel('현재 버전').last().boundingBox()
  ])
  assert(baseBox && arrowBox && currentBox, 'Dashboard version controls have no bounding boxes.')
  const selectCenter = (baseBox.y + baseBox.height / 2 + currentBox.y + currentBox.height / 2) / 2
  return Math.abs(arrowBox.y + arrowBox.height / 2 - selectCenter) <= 1
    ? ''
    : 'Dashboard arrow is not centered.'
}

async function verifyRestoration(profileDirectory, dataRoot, expectedVersion, fallbackVersion) {
  let electronApp
  let issue = ''
  try {
    electronApp = await launchElectron(profileDirectory, dataRoot)
    const page = await getPage(electronApp)
    const restoredVersion = await page.getByLabel('현재 버전').first().inputValue()
    if (restoredVersion !== expectedVersion)
      issue = `Stored current version was not restored: expected ${expectedVersion}, got ${restoredVersion}.`
  } finally {
    if (electronApp) await electronApp.close()
  }

  const fallbackProfile = await mkdtemp(path.join(tmpdir(), 'maple-electron-version-fallback-'))
  try {
    electronApp = await launchElectron(fallbackProfile, dataRoot)
    let page = await getPage(electronApp)
    await page.evaluate((key) => localStorage.setItem(key, '9.9.999'), storageKey)
    await electronApp.close()
    electronApp = await launchElectron(fallbackProfile, dataRoot)
    page = await getPage(electronApp)
    const selectedFallback = await page.getByLabel('현재 버전').first().inputValue()
    if (selectedFallback !== fallbackVersion)
      issue ||= `Unknown stored version did not fall back: expected ${fallbackVersion}, got ${selectedFallback}.`
  } finally {
    if (electronApp) await electronApp.close()
    await rm(fallbackProfile, { recursive: true, force: true })
  }
  return issue
}

async function verifyCompare(page, base, target, dataRoot) {
  const navigation = page.getByLabel('버전 하위 탐색')
  await navigation.getByRole('button', { name: '비교' }).click()
  await page.getByRole('heading', { name: '버전 비교' }).waitFor()
  await selectOption(page, '비교 기준', base.version)
  await selectOption(page, '현재 작업 버전', target.version)
  const fileSelect = page.getByLabel('공통 파일')
  await fileSelect
    .locator('option', { hasText: '파일 목록 조회 중' })
    .waitFor({ state: 'detached' })
  assert(
    !(await page.getByRole('button', { name: '비교 실행' }).isDisabled()),
    'Compare button is disabled.'
  )
  assert(
    !(await page.getByRole('button', { name: '저장 결과 열기' }).isDisabled()),
    'Open button is disabled.'
  )
  await fileSelect.selectOption(filename)
  await page.getByRole('button', { name: '비교 실행' }).click()
  await page.getByRole('heading', { name: '추가 · 수정' }).waitFor()
  await page.getByRole('button', { name: '비교 결과 저장' }).click()
  await page.getByRole('status').getByText('비교 결과를 저장했습니다.').waitFor()
  await page.getByRole('button', { name: '저장 결과 열기' }).click()
  await page.getByRole('status').getByText('저장된 비교 결과를 열었습니다.').waitFor()

  await rm(path.join(dataRoot, target.environment, target.version, 'json'), {
    recursive: true,
    force: true
  })
  await selectOption(page, '현재 작업 버전', base.version)
  await selectOption(page, '현재 작업 버전', target.version)
  await page
    .getByRole('alert')
    .getByText(/관리 JSON 디렉터리/)
    .waitFor()
  await fileSelect
    .locator('option', { hasText: '파일 목록 조회 중' })
    .waitFor({ state: 'detached' })
}

async function verifyMobile(page) {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('주 탐색').getByRole('button', { name: /버전$/ }).click()
  await page.getByLabel('버전 하위 탐색').getByRole('button', { name: '리스트' }).click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  const listScroll = page.locator('section.overflow-x-auto').first()
  assert(
    await listScroll.evaluate((element) => element.scrollWidth > element.clientWidth),
    'List is not scrollable on mobile.'
  )
  assert(
    !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    'List causes global mobile overflow.'
  )
  await page.getByLabel('버전 하위 탐색').getByRole('button', { name: '비교' }).click()
  await page.getByRole('heading', { name: '버전 비교' }).waitFor()
  assert(
    !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    'Compare causes global mobile overflow.'
  )
}

async function main() {
  config({ path: path.join(repositoryRoot, 'packages', 'database', 'db', '.env') })
  await access(path.join(appDirectory, 'out', 'main', 'index.js'))
  const { findGameDataVersions } = await import('@maple/db/admin/game-data-version')
  const allVersions = (await findGameDataVersions()).map((version) => ({
    version: version.version,
    environment: version.environment,
    releasedOn: version.releasedOn?.toISOString() ?? null,
    createdAt: version.createdAt.toISOString(),
    status: version.status
  }))
  const registered = allVersions.filter(
    (version) => version.status === 'ready' || version.status === 'importing'
  )
  assert(registered.length >= 2, 'Need at least two ready/importing database versions.')
  const exercised = {
    failed: allVersions.some((version) => version.status === 'failed'),
    ready: registered.some((version) => version.status === 'ready'),
    importing: registered.some((version) => version.status === 'importing'),
    production: registered.some((version) => version.environment === 'production'),
    test: registered.some((version) => version.environment === 'test')
  }

  const profileDirectory = await mkdtemp(path.join(tmpdir(), 'maple-electron-version-playwright-'))
  const dataRoot = path.join(profileDirectory, 'data')
  const [base, target] = registered
  let electronApp

  try {
    electronApp = await launchElectron(profileDirectory, dataRoot)
    const page = await getPage(electronApp)
    await verifyVersionList(page, registered, registered.at(-1))
    for (const version of allVersions.filter((version) => version.status === 'failed')) {
      assert(
        (await page.locator('tbody tr').filter({ hasText: version.version }).count()) === 0,
        'Failed database version is visible.'
      )
    }
    const dashboardIssue = await verifyDashboardArrows(page)
    await selectOption(page, '현재 버전', target.version)
    await electronApp.close()
    electronApp = undefined
    const restorationIssue = await verifyRestoration(
      profileDirectory,
      dataRoot,
      target.version,
      registered[0].version
    )

    await writeFixture(dataRoot, base, [{ jobID: '00001', name: 'before' }])
    await writeFixture(dataRoot, target, [{ jobID: '00001', name: 'after' }, { jobID: '00002' }])
    electronApp = await launchElectron(profileDirectory, dataRoot)
    const comparePage = await getPage(electronApp)
    await verifyCompare(comparePage, base, target, dataRoot)
    await verifyMobile(comparePage)
    assert(
      !dashboardIssue && !restorationIssue,
      [dashboardIssue, restorationIssue].filter(Boolean).join(' ')
    )
    console.log(
      'verified native Electron version navigation, metadata, restoration, comparison, arrows, and mobile'
    )
    for (const [state, covered] of Object.entries(exercised)) {
      if (!covered) console.log(`${state} metadata state not exercised: no matching DB row.`)
    }
  } finally {
    if (electronApp) await electronApp.close()
    await rm(profileDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
