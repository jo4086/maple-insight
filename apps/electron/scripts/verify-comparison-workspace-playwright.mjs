import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { _electron as electron } from 'playwright'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.resolve(currentDirectory, '..')
const repositoryRoot = path.resolve(appDirectory, '../..')
const screenshotDirectory = path.join(repositoryRoot, 'screenshots', 'playwright', 'electron')
const filenames = [
  'ms_job.json',
  'ms_skill.json',
  'ms_skillH.json',
  'ms_skillCommon.json',
  'ms_skillLevel.json'
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function versionDirectory(dataRoot, version) {
  return path.join(dataRoot, version.environment, version.version, 'json')
}

function artifactPath(dataRoot, base, target, filename) {
  return path.join(dataRoot, 'diff', `${base.version}_to_${target.version}`, filename)
}

async function writeFixtures(dataRoot, version, fixtures) {
  const directory = versionDirectory(dataRoot, version)
  await mkdir(directory, { recursive: true })
  await Promise.all(
    filenames.map((filename) => writeFile(path.join(directory, filename), json(fixtures[filename])))
  )
}

async function createFixtures(dataRoot, base, target) {
  await writeFixtures(dataRoot, base, {
    'ms_job.json': [
      {
        jobID: '00001',
        jobName: 'before',
        retained: 'unchanged-context',
        nested: { labels: ['before', 'complete'] }
      },
      { jobID: '00002', jobName: 'deleted' },
      { jobID: '00004', jobName: 'unchanged-record' }
    ],
    'ms_skill.json': [
      { skillID: '100001', name: 'skill-before', retained: true },
      { skillID: '100002', name: 'skill-unchanged' }
    ],
    'ms_skillH.json': [{ skillID: '200001', desc: 'unchanged-hint' }],
    'ms_skillCommon.json': [
      { skillID: '300001', commonName: 'damage', value: '100', retained: 'common-context' }
    ],
    'ms_skillLevel.json': [
      { skillID: '400001', level: '1', desc: 'level-before', retained: ['a', 'b'] }
    ]
  })

  await writeFixtures(dataRoot, target, {
    'ms_job.json': [
      {
        jobID: '00001',
        jobName: 'after',
        retained: 'unchanged-context',
        nested: { labels: ['after', 'complete'] }
      },
      { jobID: '00003', jobName: 'added-1' },
      { jobID: '00004', jobName: 'unchanged-record' },
      ...Array.from({ length: 11 }, (_, index) => ({
        jobID: String(index + 5).padStart(5, '0'),
        jobName: `added-${index + 2}`
      }))
    ],
    'ms_skill.json': [
      { skillID: '100001', name: 'skill-after', retained: true },
      { skillID: '100002', name: 'skill-unchanged' }
    ],
    'ms_skillH.json': [{ skillID: '200001', desc: 'unchanged-hint' }],
    'ms_skillCommon.json': [
      { skillID: '300001', commonName: 'damage', value: '120', retained: 'common-context' }
    ],
    'ms_skillLevel.json': [
      { skillID: '400001', level: '1', desc: 'level-after', retained: ['a', 'b'] },
      { skillID: '400001', level: '2', desc: 'level-added' }
    ]
  })
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

async function getPage(electronApp) {
  const page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize({ width: 1480, height: 920 })
  await page.getByRole('button', { name: '대시보드' }).waitFor()
  return page
}

function navigation(page) {
  const primary = page.getByLabel('주 탐색')
  const children = page.getByLabel('버전 하위 탐색')
  return {
    dashboard: primary.getByRole('button', { name: '대시보드' }),
    parent: primary.getByRole('button', { name: '버전 관리' }),
    list: children.getByRole('button', { name: '리스트' }),
    compare: children.getByRole('button', { name: '비교', exact: true })
  }
}

async function openComparison(page) {
  const { parent, compare } = navigation(page)
  if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
  await compare.click()
  await page.getByRole('heading', { name: '비교', exact: true }).waitFor()
}

function comparisonSidebar(page) {
  return page.locator('aside').filter({
    has: page.getByRole('heading', { name: '비교', exact: true })
  })
}

function detailSection(page) {
  return page.getByLabel('결과 검색').locator('xpath=ancestor::section')
}

function categoryButton(page, label) {
  return page
    .getByLabel('변경 유형')
    .locator('button')
    .filter({ has: page.getByText(label, { exact: true }) })
}

async function assertCategoryCounts(page, expected) {
  for (const [label, count] of Object.entries(expected)) {
    const text = await categoryButton(page, label).locator('strong').textContent()
    assert(text === String(count), `${label} count differs: ${text}`)
  }
}

async function modifiedCard(page, identityText) {
  const cards = detailSection(page)
    .locator('article')
    .filter({ has: page.getByText('수정', { exact: true }) })
    .filter({ hasText: identityText })
  assert((await cards.count()) === 1, `Expected one modified card for ${identityText}.`)
  return cards.first()
}

async function assertSideBySideJsonBoxes(card, identityText) {
  const before = card.getByLabel('이전')
  const after = card.getByLabel('이후')
  assert((await card.locator('pre').count()) === 2, `${identityText} does not have two JSON boxes.`)
  const [beforeBox, afterBox] = await Promise.all([before.boundingBox(), after.boundingBox()])
  assert(beforeBox && afterBox, `${identityText} JSON box bounds are unavailable.`)
  assert(
    Math.abs(beforeBox.y - afterBox.y) < 2 && afterBox.x > beforeBox.x + beforeBox.width,
    `${identityText} JSON boxes are not side by side.`
  )
}

async function assertFullSnapshotModifiedCard(
  page,
  { identityText, beforeRecord, afterRecord, beforeChanged, afterChanged, neutralValues }
) {
  const card = await modifiedCard(page, identityText)
  await card.getByText('수정', { exact: true }).waitFor()
  await assertSideBySideJsonBoxes(card, identityText)

  const before = card.getByLabel('이전')
  const after = card.getByLabel('이후')
  assert(
    (await before.textContent()) === JSON.stringify(beforeRecord, null, 2),
    'Previous snapshot differs.'
  )
  assert(
    (await after.textContent()) === JSON.stringify(afterRecord, null, 2),
    'After snapshot differs.'
  )
  assert(
    JSON.stringify(await before.locator('mark[data-changed="true"]').allTextContents()) ===
      JSON.stringify(beforeChanged),
    'Previous changed leaves differ.'
  )
  assert(
    JSON.stringify(await after.locator('mark[data-changed="true"]').allTextContents()) ===
      JSON.stringify(afterChanged),
    'After changed leaves differ.'
  )
  for (const value of neutralValues) {
    assert(
      (await card.locator('mark').filter({ hasText: value }).count()) === 0,
      `${value} is highlighted.`
    )
  }
}

async function verifyInitialSelection(page, target) {
  const sidebar = comparisonSidebar(page)
  const currentVersion = page.getByLabel('현재 버전')
  const compareVersion = sidebar.getByLabel('비교 버전')
  const file = sidebar.getByLabel('파일 선택')
  const batch = sidebar.getByRole('button', { name: '5개 파일 비교·저장' })

  assert(
    (await currentVersion.inputValue()) === target.version,
    'Global current version is not selected.'
  )
  assert(
    (await page.getByLabel('현재 버전').count()) === 1,
    'Current version selector is duplicated.'
  )
  assert(
    (await page.getByLabel('비교 버전').count()) === 1,
    'Compare version selector is duplicated.'
  )
  assert((await page.getByLabel('파일 선택').count()) === 1, 'File selector is duplicated.')
  assert((await compareVersion.inputValue()) === '', 'Compare version placeholder is not selected.')
  assert((await file.inputValue()) === '', 'File placeholder is not selected.')
  assert(!(await batch.isEnabled()), 'Batch button is enabled without a compare version.')
  assert((await page.getByLabel('비교 파일').count()) === 0, 'Legacy file cards remain visible.')
  assert(
    (await page.getByText('선택 파일 저장 결과 열기', { exact: true }).count()) === 0,
    'Legacy manual-open action remains visible.'
  )
  await detailSection(page).getByText('표시할 비교 결과가 없습니다.', { exact: true }).waitFor()
  await assertCategoryCounts(page, { 전체: 0, 추가: 0, 수정: 0, 삭제: 0 })

  const filter = page.locator('aside').filter({
    has: page.getByRole('heading', { name: '필터', exact: true })
  })
  assert((await filter.innerText()).trim() === '필터', 'Reserved filter panel is not blank.')
}

async function selectContext(page, base, filename) {
  const sidebar = comparisonSidebar(page)
  await sidebar.getByLabel('비교 버전').selectOption(base.version)
  await sidebar.getByLabel('파일 선택').selectOption(filename)
  assert(
    (await sidebar.getByLabel('비교 버전').inputValue()) === base.version,
    'Compare version selection differs.'
  )
  assert(
    (await sidebar.getByLabel('파일 선택').inputValue()) === filename,
    'File selection differs.'
  )
}

async function selectFile(page, filename) {
  await comparisonSidebar(page).getByLabel('파일 선택').selectOption(filename)
}

async function waitForEmptyResult(page) {
  await detailSection(page).getByText('표시할 비교 결과가 없습니다.', { exact: true }).waitFor()
}

async function waitForLoadedFile(page, filename) {
  assert(
    (await comparisonSidebar(page).getByLabel('파일 선택').inputValue()) === filename,
    `Selected file differs from ${filename}.`
  )
  await detailSection(page).locator('article').first().waitFor()
}

async function runAll(page) {
  const start = comparisonSidebar(page).getByRole('button', { name: '5개 파일 비교·저장' })
  await start.click()
  await comparisonSidebar(page).getByRole('button', { name: '비교·저장 진행 중' }).waitFor()
  await comparisonSidebar(page).getByRole('button', { name: '5개 파일 비교·저장' }).waitFor({
    timeout: 30_000
  })
}

async function verifyArtifacts(dataRoot, base, target) {
  for (const filename of filenames) {
    const artifact = JSON.parse(
      await readFile(artifactPath(dataRoot, base, target, filename), 'utf8')
    )
    assert(artifact.baseVersion === base.version, `${filename} base version differs.`)
    assert(artifact.compareVersion === target.version, `${filename} compare version differs.`)
    assert(artifact.filename === filename, `${filename} artifact identity differs.`)
    assert(/^[a-f0-9]{64}$/.test(artifact.inputHash), `${filename} input hash is invalid.`)
    if (filename === 'ms_job.json') {
      assert(artifact.modify[0]?.before, 'ms_job.json fixture lacks previous full snapshot.')
      assert(artifact.modify[0]?.after, 'ms_job.json fixture lacks after full snapshot.')
    }
  }
}

async function verifyTopPagerAndResultRendering(page) {
  await waitForLoadedFile(page, 'ms_job.json')
  const detail = detailSection(page)
  assert((await detail.getByRole('button', { name: '이전' }).count()) === 1, 'Pager is duplicated.')
  assert((await detail.getByRole('button', { name: '다음' }).count()) === 1, 'Pager is duplicated.')
  await detail.getByText('1 / 2 페이지 · 14건', { exact: true }).waitFor()
  await detail.getByRole('button', { name: '다음' }).click()
  await detail.getByText('2 / 2 페이지 · 14건', { exact: true }).waitFor()
  assert(
    !(await detail.getByRole('button', { name: '다음' }).isEnabled()),
    'Next enables on last page.'
  )
  await detail.getByRole('button', { name: '이전' }).click()

  await page.getByLabel('결과 검색').fill('added-12')
  await detail.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  await detail.locator('pre').filter({ hasText: 'added-12' }).waitFor()
  await page.getByLabel('결과 검색').fill('')

  await categoryButton(page, '추가').click()
  await detail.getByText('1 / 2 페이지 · 12건', { exact: true }).waitFor()
  await detail.locator('pre').filter({ hasText: '"jobID": "00003"' }).waitFor()

  await categoryButton(page, '삭제').click()
  await detail.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  await detail.locator('pre').filter({ hasText: '"jobID": "00002"' }).waitFor()

  await categoryButton(page, '수정').click()
  await detail.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  await assertFullSnapshotModifiedCard(page, {
    identityText: '"jobID": "00001"',
    beforeRecord: {
      jobID: '00001',
      jobName: 'before',
      retained: 'unchanged-context',
      nested: { labels: ['before', 'complete'] }
    },
    afterRecord: {
      jobID: '00001',
      jobName: 'after',
      retained: 'unchanged-context',
      nested: { labels: ['after', 'complete'] }
    },
    beforeChanged: ['"before"', '"before"'],
    afterChanged: ['"after"', '"after"'],
    neutralValues: ['00001', 'unchanged-context', 'complete']
  })
  await categoryButton(page, '전체').click()
}

async function verifyFileSwitchResetsState(page) {
  const detail = detailSection(page)
  await categoryButton(page, '추가').click()
  await page.getByLabel('결과 검색').fill('added')
  await detail.getByText('1 / 2 페이지 · 12건', { exact: true }).waitFor()
  await detail.getByRole('button', { name: '다음' }).click()
  await detail.getByText('2 / 2 페이지 · 12건', { exact: true }).waitFor()

  await selectFile(page, 'ms_skill.json')
  await waitForLoadedFile(page, 'ms_skill.json')
  assert((await page.getByLabel('결과 검색').inputValue()) === '', 'File switch retained search.')
  assert(
    (await categoryButton(page, '전체').getAttribute('aria-pressed')) === 'true',
    'File switch retained category.'
  )
  await detail.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  await assertCategoryCounts(page, { 전체: 1, 추가: 0, 수정: 1, 삭제: 0 })
  await assertFullSnapshotModifiedCard(page, {
    identityText: '"skillID": "100001"',
    beforeRecord: { skillID: '100001', name: 'skill-before', retained: true },
    afterRecord: { skillID: '100001', name: 'skill-after', retained: true },
    beforeChanged: ['"skill-before"'],
    afterChanged: ['"skill-after"'],
    neutralValues: ['100001', 'true']
  })

  await selectFile(page, 'ms_job.json')
  await waitForLoadedFile(page, 'ms_job.json')
  await detail.getByText('1 / 2 페이지 · 14건', { exact: true }).waitFor()
  await assertCategoryCounts(page, { 전체: 14, 추가: 12, 수정: 1, 삭제: 1 })
}

async function verifyBaselineSwitchAutoLoad(page, base, alternate) {
  const compareVersion = comparisonSidebar(page).getByLabel('비교 버전')
  await compareVersion.selectOption(alternate.version)
  await waitForEmptyResult(page)
  await assertCategoryCounts(page, { 전체: 0, 추가: 0, 수정: 0, 삭제: 0 })

  await compareVersion.selectOption(base.version)
  await waitForLoadedFile(page, 'ms_job.json')
  const detail = detailSection(page)
  await detail.getByText('1 / 2 페이지 · 14건', { exact: true }).waitFor()
  assert(
    (await detail.getByText('저장된 비교 결과를 열었습니다.', { exact: true }).count()) === 0,
    'Stored auto-open success banner remains visible.'
  )
  assert(
    (await detail.locator(':scope > div').nth(1).locator(':scope > [role="status"]').count()) === 0,
    'Stored auto-open reserves an empty status banner.'
  )
}

async function verifyMissingArtifactClearsResult(page, dataRoot, base, target) {
  const artifact = artifactPath(dataRoot, base, target, 'ms_skillH.json')
  const saved = await readFile(artifact, 'utf8')
  await rm(artifact)
  try {
    await selectFile(page, 'ms_skillH.json')
    await waitForEmptyResult(page)
    await assertCategoryCounts(page, { 전체: 0, 추가: 0, 수정: 0, 삭제: 0 })
    assert(
      (await detailSection(page).getByText('ms_job.json', { exact: true }).count()) === 0,
      'Missing artifact retained previous file result.'
    )
  } finally {
    await mkdir(path.dirname(artifact), { recursive: true })
    await writeFile(artifact, saved)
  }
}

async function installDelayedOpen(electronApp, filename) {
  return electronApp.evaluate(async ({ ipcMain }, delayedFilename) => {
    const handlers = ipcMain._invokeHandlers
    const channel = 'raw-data-diff:open'
    const original = handlers?.get(channel)
    if (typeof original !== 'function') return false
    ipcMain.removeHandler(channel)
    ipcMain.handle(channel, async (event, request) => {
      if (request?.filename === delayedFilename)
        await new Promise((resolve) => setTimeout(resolve, 400))
      return original(event, request)
    })
    return true
  }, filename)
}

async function installDelayedReplacementSave(electronApp, filename) {
  return electronApp.evaluate(async ({ ipcMain }, delayedFilename) => {
    const handlers = ipcMain._invokeHandlers
    const channel = 'raw-data-diff:save'
    const original = handlers?.get(channel)
    if (typeof original !== 'function') return false
    ipcMain.removeHandler(channel)
    ipcMain.handle(channel, async (event, request) => {
      if (request?.filename === delayedFilename && request?.replaceExisting)
        await new Promise((resolve) => setTimeout(resolve, 500))
      return original(event, request)
    })
    return true
  }, filename)
}

async function verifyLateOpenRace(page, electronApp) {
  assert(
    await installDelayedOpen(electronApp, 'ms_job.json'),
    'Could not install delayed open IPC race fixture.'
  )
  await selectFile(page, 'ms_skill.json')
  await waitForLoadedFile(page, 'ms_skill.json')
  await selectFile(page, 'ms_job.json')
  await selectFile(page, 'ms_skill.json')
  await waitForLoadedFile(page, 'ms_skill.json')
  await page.waitForTimeout(550)
  assert(
    (await comparisonSidebar(page).getByLabel('파일 선택').inputValue()) === 'ms_skill.json',
    'Late open changed selected file.'
  )
  assert(
    (await detailSection(page)
      .locator('article')
      .filter({ hasText: '"skillID": "100001"' })
      .count()) === 1,
    'Late open replaced current file result.'
  )
  assert(
    (await detailSection(page)
      .locator('article')
      .filter({ hasText: '"jobID": "00001"' })
      .count()) === 0,
    'Late job result remained visible.'
  )
}

async function verifyIndependentDesktopScroll(page) {
  await page.setViewportSize({ width: 1480, height: 920 })
  await selectFile(page, 'ms_job.json')
  await waitForLoadedFile(page, 'ms_job.json')
  const detail = detailSection(page)
  const body = detail.locator(':scope > div').nth(1)
  const workspace = page.locator('main > div').last()
  const state = await body.evaluate((element) => ({
    overflowY: getComputedStyle(element).overflowY,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight
  }))
  assert(state.overflowY === 'auto', 'Desktop result body is not independently scrollable.')
  assert(state.scrollHeight > state.clientHeight, 'Desktop fixture does not overflow result body.')
  const workspaceBefore = await workspace.evaluate((element) => element.scrollTop)
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  assert((await body.evaluate((element) => element.scrollTop)) > 0, 'Result body did not scroll.')
  assert(
    (await workspace.evaluate((element) => element.scrollTop)) === workspaceBefore,
    'Result body scrolling moved outer workspace.'
  )
  await body.evaluate((element) => {
    element.scrollTop = 0
  })
}

async function verifyNavigationAndReturn(page) {
  const { dashboard, parent, list, compare } = navigation(page)
  await dashboard.click()
  await page.getByRole('heading', { name: '작업할 데이터 버전' }).waitFor()
  if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
  await list.click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  await compare.click()
  await page.getByRole('heading', { name: '비교', exact: true }).waitFor()
  await waitForLoadedFile(page, 'ms_job.json')
}

async function captureResponsiveScreenshots(page) {
  await mkdir(screenshotDirectory, { recursive: true })
  await categoryButton(page, '수정').click()
  const card = await modifiedCard(page, '"jobID": "00001"')
  await page.setViewportSize({ width: 1480, height: 920 })
  assert(
    (await page.evaluate(() => [innerWidth, innerHeight])).join('x') === '1480x920',
    'Desktop viewport differs.'
  )
  await assertSideBySideJsonBoxes(card, 'ms_job.json desktop')
  await page.screenshot({
    path: path.join(screenshotDirectory, 'comparison-workspace-desktop.png'),
    fullPage: false
  })

  await page.getByRole('button', { name: '☀ 라이트' }).click()
  await page.screenshot({
    path: path.join(screenshotDirectory, 'comparison-workspace-desktop-light.png'),
    fullPage: false
  })
  await page.getByRole('button', { name: '☾ 다크' }).click()

  await page.setViewportSize({ width: 390, height: 844 })
  assert((await page.evaluate(() => innerWidth)) === 390, 'Mobile viewport width differs.')
  assert(
    !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    'Mobile comparison workspace has global horizontal overflow.'
  )
  const [beforeBox, afterBox] = await Promise.all([
    card.getByLabel('이전').boundingBox(),
    card.getByLabel('이후').boundingBox()
  ])
  assert(beforeBox && afterBox, 'Mobile JSON box bounds are unavailable.')
  assert(afterBox.y >= beforeBox.y + beforeBox.height, 'Mobile JSON boxes are not stacked.')
  for (const box of [card, card.getByLabel('이전'), card.getByLabel('이후')]) {
    const dimensions = await box.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth
    }))
    assert(
      dimensions.scrollWidth <= dimensions.clientWidth,
      'Mobile modified card has horizontal overflow.'
    )
  }
  for (const control of [
    page.getByRole('button', { name: '5개 파일 비교·저장' }),
    page.getByLabel('파일 선택'),
    page.getByLabel('결과 검색'),
    detailSection(page).getByRole('button', { name: '다음' }),
    page.getByRole('heading', { name: '필터', exact: true })
  ])
    assert(await control.isVisible(), 'Mobile workspace control is not visible.')
  await page.screenshot({
    path: path.join(screenshotDirectory, 'comparison-workspace-mobile.png'),
    fullPage: true
  })
  await page.setViewportSize({ width: 1480, height: 920 })
}

async function verifySameInputReuse(page, dataRoot, base, target) {
  const before = Object.fromEntries(
    await Promise.all(
      filenames.map(async (filename) => [
        filename,
        await readFile(artifactPath(dataRoot, base, target, filename), 'utf8')
      ])
    )
  )
  await runAll(page)
  await detailSection(page)
    .getByText('같은 입력의 저장 결과를 재사용했습니다.', { exact: true })
    .waitFor()
  for (const filename of filenames)
    assert(
      (await readFile(artifactPath(dataRoot, base, target, filename), 'utf8')) === before[filename],
      `${filename} changed during same-input reuse.`
    )
}

function fileAction(page, filename) {
  return page
    .getByLabel('파일별 조치')
    .locator(':scope > div')
    .filter({ has: page.getByText(filename, { exact: true }) })
}

async function assertMissing(pathname, message) {
  try {
    await access(pathname)
  } catch (error) {
    if (error?.code === 'ENOENT') return
    throw error
  }
  throw new Error(message)
}

async function verifyMissingFilePartialFailure(page, dataRoot, base, target) {
  const filename = 'ms_skillH.json'
  const input = path.join(versionDirectory(dataRoot, target), filename)
  const artifact = artifactPath(dataRoot, base, target, filename)
  await Promise.all([rm(input), rm(artifact)])
  await runAll(page)
  const action = fileAction(page, filename)
  await action.getByRole('alert').waitFor()
  await action.getByRole('button', { name: '다시 시도' }).waitFor()
  await assertMissing(artifact, 'Missing-file failure created an artifact.')
  for (const successful of filenames.filter((candidate) => candidate !== filename))
    await access(artifactPath(dataRoot, base, target, successful))
  await writeFile(input, json([{ skillID: '200001', desc: 'unchanged-hint' }]))
}

async function verifyPerFileConflict(page, electronApp, dataRoot, base, target) {
  const filename = 'ms_skill.json'
  const artifact = artifactPath(dataRoot, base, target, filename)
  const existing = await readFile(artifact, 'utf8')
  await writeFile(
    path.join(versionDirectory(dataRoot, target), filename),
    json([
      { skillID: '100001', name: 'skill-replacement', retained: true },
      { skillID: '100002', name: 'skill-unchanged' }
    ])
  )

  await runAll(page)
  const action = fileAction(page, filename)
  await action.getByText('파일별 교체 확인 필요', { exact: true }).waitFor()
  assert(
    (await readFile(artifact, 'utf8')) === existing,
    'Conflict replaced artifact before approval.'
  )

  await selectFile(page, filename)
  await waitForLoadedFile(page, filename)
  await detailSection(page).locator('pre').filter({ hasText: 'skill-after' }).waitFor()
  assert(
    (await detailSection(page).locator('pre').filter({ hasText: 'skill-replacement' }).count()) ===
      0,
    'Conflict selection showed replacement instead of stored result.'
  )
  await selectFile(page, 'ms_job.json')
  await waitForLoadedFile(page, 'ms_job.json')
  await selectFile(page, filename)
  await waitForLoadedFile(page, filename)
  await action.getByText('파일별 교체 확인 필요', { exact: true }).waitFor()
  await action.getByRole('button', { name: '이 파일 교체' }).waitFor()
  await detailSection(page).locator('pre').filter({ hasText: 'skill-after' }).waitFor()

  await action.getByRole('button', { name: '취소' }).click()
  assert((await readFile(artifact, 'utf8')) === existing, 'Conflict cancellation changed artifact.')

  await runAll(page)
  const repeated = fileAction(page, filename)
  await repeated.getByText('파일별 교체 확인 필요', { exact: true }).waitFor()
  assert((await readFile(artifact, 'utf8')) === existing, 'Second conflict changed artifact early.')
  assert(
    await installDelayedReplacementSave(electronApp, filename),
    'Could not install delayed replacement save IPC fixture.'
  )
  await repeated.getByRole('button', { name: '이 파일 교체' }).click()
  await repeated.getByText('기존 결과를 교체 중입니다.', { exact: true }).waitFor()
  assert(
    (await repeated.getByRole('button', { name: '취소' }).count()) === 0,
    'Conflict cancellation remained actionable during replacement save.'
  )
  assert(
    (await readFile(artifact, 'utf8')) === existing,
    'Delayed approval replaced artifact before save completed.'
  )
  await repeated.waitFor({ state: 'detached' })
  const replaced = await readFile(artifact, 'utf8')
  assert(replaced !== existing, 'Approved conflict did not replace artifact.')
  assert(replaced.includes('skill-replacement'), 'Replacement artifact has unexpected content.')
}

async function main() {
  config({ path: path.join(repositoryRoot, 'packages', 'database', 'db', '.env') })
  await access(path.join(appDirectory, 'out', 'main', 'index.js'))
  const { findGameDataVersions } = await import('@maple/db/admin/game-data-version')
  const registered = (await findGameDataVersions())
    .filter(({ status }) => status === 'ready' || status === 'importing')
    .map(({ version, environment }) => ({ version, environment }))
  assert(registered.length >= 3, 'Need three ready/importing database versions.')
  const [target, base, alternate] = registered
  const profileDirectory = await mkdtemp(
    path.join(tmpdir(), 'maple-electron-comparison-workspace-playwright-')
  )
  const dataRoot = path.join(profileDirectory, 'data')
  let electronApp

  try {
    await createFixtures(dataRoot, base, target)
    electronApp = await launchElectron(profileDirectory, dataRoot)
    const page = await getPage(electronApp)
    await openComparison(page)
    await verifyInitialSelection(page, target)
    await selectContext(page, base, 'ms_job.json')
    await waitForEmptyResult(page)
    await runAll(page)
    await verifyArtifacts(dataRoot, base, target)
    await verifyTopPagerAndResultRendering(page)
    await verifyFileSwitchResetsState(page)
    await verifyBaselineSwitchAutoLoad(page, base, alternate)
    await verifyMissingArtifactClearsResult(page, dataRoot, base, target)
    await verifyLateOpenRace(page, electronApp)
    await verifyIndependentDesktopScroll(page)
    await verifyNavigationAndReturn(page)
    await captureResponsiveScreenshots(page)
    await verifySameInputReuse(page, dataRoot, base, target)
    await verifyMissingFilePartialFailure(page, dataRoot, base, target)
    await verifyPerFileConflict(page, electronApp, dataRoot, base, target)
    console.log(
      `verified comparison workspace for ${base.version} -> ${target.version}: initial placeholders, selector auto-load/reset/race behavior, five artifacts, top pager, responsive light/dark layout, navigation, reuse, partial failure, and persistent conflict approval with guarded replacement save`
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
