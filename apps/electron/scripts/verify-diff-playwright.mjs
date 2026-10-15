import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { _electron as electron } from 'playwright'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.resolve(currentDirectory, '..')
const repositoryRoot = path.resolve(appDirectory, '../..')
const baseVersion = '1.2.419'
const compareVersion = '1.2.424'
const filename = 'ms_job.json'
const changedFilename = 'ms_skill.json'
const unchangedFilename = 'ms_skillH.json'
const largeFilename = 'ms_skillLevel.json'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function versionDirectory(dataRoot, version) {
  return path.join(dataRoot, 'production', version)
}

function diffPath(dataRoot) {
  return path.join(dataRoot, 'diff', `${baseVersion}_to_${compareVersion}`, filename)
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

async function writeFixture(dataRoot, version, records) {
  const directory = path.join(versionDirectory(dataRoot, version), 'json')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, filename), `${JSON.stringify(records, null, 2)}\n`)
  await writeFile(
    path.join(directory, changedFilename),
    `${JSON.stringify([{ skillID: '000100', name: version }], null, 2)}\n`
  )
  await writeFile(
    path.join(directory, unchangedFilename),
    `${JSON.stringify([{ skillID: '000200', name: 'unchanged' }], null, 2)}\n`
  )
}

async function createFixtures(dataRoot) {
  const source = path.join(repositoryRoot, 'data', 'production', baseVersion, 'json', filename)
  const sourceBefore = await readFile(source, 'utf8')
  const largeSource = path.join(
    repositoryRoot,
    'data',
    'production',
    baseVersion,
    'json',
    largeFilename
  )
  const largeSourceBefore = await readFile(largeSource, 'utf8')
  const largeRecordCount = JSON.parse(largeSourceBefore).length

  await writeFixture(dataRoot, baseVersion, [
    { jobID: '00001', jobName: 'before', retained: true },
    { jobID: '00002', jobName: 'deleted' }
  ])
  await writeFixture(dataRoot, compareVersion, [
    { jobID: '00001', jobName: 'after', retained: true },
    { jobID: '00003', jobName: 'added' }
  ])

  await copyFile(
    largeSource,
    path.join(versionDirectory(dataRoot, baseVersion), 'json', largeFilename)
  )
  await writeFile(
    path.join(versionDirectory(dataRoot, compareVersion), 'json', largeFilename),
    '[]\n'
  )

  return { source, sourceBefore, largeSource, largeSourceBefore, largeRecordCount }
}

async function selectOption(page, label, value) {
  const select = page.getByLabel(label).first()
  await select.waitFor({ state: 'visible' })
  await select.selectOption(value)
}

async function selectVersionsAndFile(page) {
  await selectOption(page, '비교 기준', baseVersion)
  await selectOption(page, '현재 작업 버전', compareVersion)
  await selectOption(page, '공통 파일', filename)
}

async function assertNoResult(page) {
  await page.getByText('비교할 공통 파일을 선택하세요.', { exact: true }).waitFor()
}

async function runComparison(page) {
  await page.getByRole('button', { name: '비교 실행' }).click()
  await page.getByRole('heading', { name: '추가 · 수정' }).waitFor({ timeout: 15_000 })
}

async function verifyResult(page) {
  await page.getByRole('heading', { name: '추가 · 수정' }).waitFor()
  await page.getByRole('heading', { name: '삭제' }).waitFor()
  await page.locator('pre').filter({ hasText: '"jobID": "00003"' }).waitFor()
  await page.locator('pre').filter({ hasText: '"jobID": "00002"' }).waitFor()

  const modifiedRecord = page.locator('article').filter({ hasText: '수정 · jobID: 00001' })
  await modifiedRecord.getByText('jobName', { exact: true }).waitFor()
  await modifiedRecord.getByText('이전', { exact: true }).waitFor()
  await modifiedRecord.getByText('이후', { exact: true }).waitFor()
  await modifiedRecord.locator('pre').filter({ hasText: '"before"' }).waitFor()
  await modifiedRecord.locator('pre').filter({ hasText: '"after"' }).waitFor()
}

async function saveResult(page, dataRoot) {
  await page.getByRole('button', { name: '비교 결과 저장' }).click()
  await page.getByRole('status').getByText('비교 결과를 저장했습니다.').waitFor()
  const saved = JSON.parse(await readFile(diffPath(dataRoot), 'utf8'))
  assert(saved.baseVersion === baseVersion, 'Saved result baseVersion differs.')
  assert(saved.compareVersion === compareVersion, 'Saved result compareVersion differs.')
  assert(saved.add.length === 1, 'Saved result must contain one added record.')
  assert(saved.modify.length === 1, 'Saved result must contain one modified record.')
  assert(saved.delete.length === 1, 'Saved result must contain one deleted record.')
}

async function verifyReopen(page) {
  await page.getByRole('button', { name: '저장 결과 열기' }).click()
  await page.getByRole('status').getByText('저장된 비교 결과를 열었습니다.').waitFor()
  await verifyResult(page)
}

async function verifyStaleResult(page) {
  await selectOption(page, '현재 작업 버전', baseVersion)
  await assertNoResult(page)
  await selectOption(page, '현재 작업 버전', compareVersion)
  await selectOption(page, '비교 기준', baseVersion)
  await selectOption(page, '공통 파일', changedFilename)
  await assertNoResult(page)
  await selectOption(page, '공통 파일', filename)
}

async function verifyNoChanges(page) {
  await selectOption(page, '공통 파일', unchangedFilename)
  await runComparison(page)
  await page.getByText('조건에 맞는 추가·수정 항목이 없습니다.', { exact: true }).waitFor()
  await page.getByText('삭제 항목이 없습니다.', { exact: true }).waitFor()
  await selectOption(page, '공통 파일', filename)
}

async function verifyProductionSizedSkillLevel(page, expectedDeleteCount) {
  await selectOption(page, '공통 파일', largeFilename)
  await assertNoResult(page)

  const compareStarted = performance.now()
  await runComparison(page)
  const compareElapsed = Math.round(performance.now() - compareStarted)
  const deleteSection = page
    .locator('section')
    .filter({ hasText: '기준 버전에는 있고 현재 작업 버전에서는 삭제된 레코드를 검토합니다.' })
  const expectedCount = String(expectedDeleteCount)
  await deleteSection
    .getByText(new RegExp(`1 / \\d+ 페이지 · ${expectedCount}건`))
    .waitFor({ timeout: 5_000 })
  assert(
    (await deleteSection.locator('article').count()) === 10,
    'Large deletion result rendered more than one page of records.'
  )

  const deleteSearch = deleteSection.getByLabel('검색')
  const searchStarted = performance.now()
  await deleteSearch.fill('80004444')
  await deleteSection.locator('pre').filter({ hasText: '"skillID": "80004444"' }).waitFor()
  const searchElapsed = Math.round(performance.now() - searchStarted)

  await deleteSearch.fill('')
  await deleteSection.getByText(new RegExp(`1 / [\\d,]+ 페이지 · ${expectedCount}건`)).waitFor()
  const paginationStarted = performance.now()
  await deleteSection.getByRole('button', { name: '다음' }).click()
  await deleteSection.getByText(new RegExp(`2 / [\\d,]+ 페이지 · ${expectedCount}건`)).waitFor()
  const paginationElapsed = Math.round(performance.now() - paginationStarted)
  assert(
    (await deleteSection.locator('article').count()) === 10,
    'Large deletion pagination rendered more than one page of records.'
  )

  console.log(
    `ms_skillLevel (${expectedCount} deletions): compare ${compareElapsed}ms, search ${searchElapsed}ms, pagination ${paginationElapsed}ms`
  )

  await selectOption(page, '공통 파일', filename)
  await assertNoResult(page)
}

async function verifyReplacementConfirmation(page, dataRoot) {
  const compareFile = path.join(versionDirectory(dataRoot, compareVersion), 'json', filename)
  await writeFile(
    compareFile,
    `${JSON.stringify(
      [
        { jobID: '00001', jobName: 'after replacement', retained: true },
        { jobID: '00003', jobName: 'added' }
      ],
      null,
      2
    )}\n`
  )

  await runComparison(page)
  await page.getByRole('button', { name: '비교 결과 저장' }).click()
  const replacement = page
    .locator('section')
    .filter({ hasText: '입력 데이터가 달라 기존 저장 결과와 충돌합니다.' })
  await replacement.waitFor()
  await replacement.getByRole('button', { name: '취소' }).click()
  const unchanged = JSON.parse(await readFile(diffPath(dataRoot), 'utf8'))
  assert(
    unchanged.modify[0].fields.some((field) => field.after?.value === 'after'),
    'Cancelled replacement changed saved result.'
  )

  await page.getByRole('button', { name: '비교 결과 저장' }).click()
  await replacement.getByRole('button', { name: '기존 결과 교체' }).click()
  await page.getByRole('status').getByText('기존 비교 결과를 교체했습니다.').waitFor()
  const replaced = JSON.parse(await readFile(diffPath(dataRoot), 'utf8'))
  assert(
    replaced.modify[0].fields.some((field) => field.after?.value === 'after replacement'),
    'Confirmed replacement did not update saved result.'
  )
}

async function verifyMissingFile(page, dataRoot) {
  await rm(path.join(versionDirectory(dataRoot, compareVersion), 'json', filename))
  await page.getByRole('button', { name: '비교 실행' }).click()
  await page
    .getByRole('alert')
    .getByText(/관리 JSON/)
    .waitFor()
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
      '장비 데이터',
      '직업 데이터',
      'DB · 타입 작업'
    ]) {
      await page.getByRole('button', { name: screen }).click()
      await page.getByText(screen, { exact: true }).first().waitFor()
      assert(
        (await page.getByLabel('현재 버전').first().inputValue()) === compareVersion,
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

  const profileDirectory = await mkdtemp(path.join(tmpdir(), 'maple-electron-diff-playwright-'))
  const dataRoot = path.join(profileDirectory, 'data')
  let electronApp

  try {
    const source = await createFixtures(dataRoot)
    electronApp = await launchElectron(profileDirectory, dataRoot)
    const page = await getFirstWindow(electronApp)

    await page.getByLabel('버전 하위 탐색').getByRole('button', { name: '비교' }).click()
    await page.getByText('버전 비교', { exact: true }).first().waitFor()
    await selectVersionsAndFile(page)
    await runComparison(page)
    await verifyResult(page)
    await saveResult(page, dataRoot)
    await verifyReopen(page)
    await verifyStaleResult(page)
    await verifyNoChanges(page)
    await verifyProductionSizedSkillLevel(page, source.largeRecordCount)
    await runComparison(page)
    await verifyReplacementConfirmation(page, dataRoot)
    await verifyMissingFile(page, dataRoot)
    await verifySharedScreens(page)

    assert(
      (await readFile(source.source, 'utf8')) === source.sourceBefore,
      'Source raw file changed.'
    )
    assert(
      (await readFile(source.largeSource, 'utf8')) === source.largeSourceBefore,
      'Source production skill-level file changed.'
    )
    console.log(
      'verified native Electron raw diff, persistence, stale input, errors, and responsive views'
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
