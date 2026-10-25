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
const longMarker = `nested-${'x'.repeat(640)}-complete`

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function rectangleDelta(before, after) {
  assert(before && after, 'Element has no bounding box.')
  return Math.max(
    Math.abs(before.x - after.x),
    Math.abs(before.y - after.y),
    Math.abs(before.width - after.width),
    Math.abs(before.height - after.height)
  )
}

async function assertLucideIcon(icon, lucideName, size, context) {
  assert((await icon.count()) === 1, `${context} must contain one ${lucideName} icon.`)
  const details = await icon.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--color-app-muted)'
    document.body.append(probe)
    const mutedColor = getComputedStyle(probe).color
    probe.remove()
    const box = element.getBoundingClientRect()
    return {
      className: element.getAttribute('class') ?? '',
      width: element.getAttribute('width'),
      height: element.getAttribute('height'),
      strokeWidth: element.getAttribute('stroke-width'),
      ariaHidden: element.getAttribute('aria-hidden'),
      color: getComputedStyle(element).color,
      mutedColor,
      box: { x: box.x, y: box.y, width: box.width, height: box.height }
    }
  })
  assert(
    details.className.split(/\s+/).includes(`lucide-${lucideName}`),
    `${context} does not use ${lucideName}.`
  )
  assert(
    details.width === String(size) && details.height === String(size),
    `${context} ${lucideName} must be ${size}px.`
  )
  assert(details.strokeWidth === '1.75', `${context} ${lucideName} strokeWidth must be 1.75.`)
  assert(details.ariaHidden === 'true', `${context} ${lucideName} must be decorative.`)
  assert(details.color === details.mutedColor, `${context} ${lucideName} must use muted color.`)
  return details.box
}

async function verifySelectChevron(select, context, interactive = false) {
  const wrapper = select.locator('xpath=..')
  const icon = wrapper.locator(':scope > svg')
  await select.evaluate((element) => element.blur())
  await select.page().mouse.move(0, 0)
  await select.page().waitForFunction(
    (element) => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--color-app-muted)'
      document.body.append(probe)
      const mutedColor = getComputedStyle(probe).color
      probe.remove()
      return getComputedStyle(element).color === mutedColor
    },
    await icon.elementHandle()
  )
  const iconBox = await assertLucideIcon(icon, 'chevron-down', 16, context)
  const wrapperBox = await wrapper.boundingBox()
  assert(wrapperBox, `${context} wrapper has no bounding box.`)
  assert(
    Math.abs(wrapperBox.x + wrapperBox.width - (iconBox.x + iconBox.width) - 12) <= 0.5,
    `${context} ChevronDown does not keep fixed 12px right inset.`
  )
  assert(
    Math.abs(iconBox.y + iconBox.height / 2 - (wrapperBox.y + wrapperBox.height / 2)) <= 0.5,
    `${context} ChevronDown is not vertically centered.`
  )
  if (interactive) {
    const relativeBox = (childBox, parentBox) => ({
      x: childBox.x - parentBox.x,
      y: childBox.y - parentBox.y,
      width: childBox.width,
      height: childBox.height
    })
    const baseRelativeBox = relativeBox(iconBox, wrapperBox)
    const baseColor = await icon.evaluate((element) => getComputedStyle(element).color)
    await wrapper.hover()
    assert(
      (await icon.evaluate((element) => getComputedStyle(element).color)) !== baseColor,
      `${context} ChevronDown color did not change on hover.`
    )
    assert(
      rectangleDelta(
        baseRelativeBox,
        relativeBox(await icon.boundingBox(), await wrapper.boundingBox())
      ) <= 0.5,
      `${context} ChevronDown shifted or resized on hover.`
    )
    await select.page().mouse.move(0, 0)
    await select.focus()
    await select.page().keyboard.press('Tab')
    await select.page().keyboard.press('Shift+Tab')
    assert(
      await select.evaluate((element) => element === document.activeElement),
      `${context} select did not receive keyboard focus.`
    )
    assert(
      (await icon.evaluate((element) => getComputedStyle(element).color)) !== baseColor,
      `${context} ChevronDown color did not change on focus-within.`
    )
    assert(
      rectangleDelta(
        baseRelativeBox,
        relativeBox(await icon.boundingBox(), await wrapper.boundingBox())
      ) <= 0.5,
      `${context} ChevronDown shifted or resized on keyboard focus.`
    )
    await select.evaluate((element) => element.blur())
  }
  return { wrapper, icon, wrapperBox, iconBox }
}

async function setTheme(page, theme) {
  if ((await page.locator('html').getAttribute('data-theme')) === theme) return
  await page.getByRole('button', { name: theme === 'light' ? /라이트/ : /다크/ }).click()
  await page.waitForFunction(
    (expectedTheme) => document.documentElement.dataset.theme === expectedTheme,
    theme
  )
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

async function installComparisonIpcCounter(electronApp) {
  await electronApp.evaluate(({ ipcMain }) => {
    const channel = 'raw-data-diff:compare'
    const handlers = ipcMain._invokeHandlers
    const handler = handlers?.get(channel)
    if (!handler) throw new Error(`No IPC handler registered for ${channel}.`)
    globalThis.__mapleComparisonIpcCount = 0
    handlers.set(channel, (...args) => {
      globalThis.__mapleComparisonIpcCount += 1
      return handler(...args)
    })
  })
}

async function comparisonIpcCount(electronApp) {
  return electronApp.evaluate(() => globalThis.__mapleComparisonIpcCount)
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
    {
      jobID: '00001',
      jobName: 'before',
      retained: true,
      nested: { values: [{ text: `before-${longMarker}` }] }
    },
    { jobID: '00002', jobName: 'deleted' },
    { jobID: '00004', jobName: 'unchanged' }
  ])
  await writeFixture(dataRoot, compareVersion, [
    {
      jobID: '00001',
      jobName: 'after',
      retained: true,
      nested: { values: [{ text: `after-${longMarker}` }] }
    },
    { jobID: '00003', jobName: 'added', nested: { values: [{ text: longMarker }] } },
    { jobID: '00004', jobName: 'unchanged' },
    ...Array.from({ length: 11 }, (_, index) => ({
      jobID: String(index + 5).padStart(5, '0'),
      jobName: `added-${index + 2}`
    }))
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

async function verifySelectKeyboardInteraction(page, select, context) {
  const options = await select
    .locator('option:not([disabled])')
    .evaluateAll((elements) =>
      elements.map((element) => ({ value: element.value, text: element.textContent ?? '' }))
    )
  assert(options.length >= 2, `${context} needs at least two enabled options.`)
  const originalValue = await select.inputValue()
  const shortest = options.reduce((left, right) =>
    left.text.length <= right.text.length ? left : right
  )
  const longest = options.reduce((left, right) =>
    left.text.length >= right.text.length ? left : right
  )
  assert(shortest.text.length < longest.text.length, `${context} needs short and long options.`)
  await select.selectOption(options[0].value)
  await select.focus()
  await select.press('Space')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  assert(
    (await select.inputValue()) === options[1].value,
    `${context} native select did not accept open and keyboard selection.`
  )
  await select.selectOption(shortest.value)
  const before = await verifySelectChevron(select, `${context} short option`)
  const beforeSelectBox = await select.boundingBox()
  await select.selectOption(longest.value)
  const after = await verifySelectChevron(select, `${context} long option`)
  assert(
    rectangleDelta(before.iconBox, after.iconBox) <= 0.5,
    `${context} ChevronDown shifted between short and long options.`
  )
  assert(
    rectangleDelta(before.wrapperBox, after.wrapperBox) <= 0.5 &&
      rectangleDelta(beforeSelectBox, await select.boundingBox()) <= 0.5,
    `${context} layout shifted between short and long options.`
  )
  await select.selectOption(originalValue)
}

async function verifyComparisonControls(page, viewport, theme) {
  const controls = page
    .locator('section')
    .filter({ has: page.getByLabel('비교 기준') })
    .first()
  const baseSelect = page.getByLabel('비교 기준')
  const targetSelect = page.getByLabel('현재 작업 버전')
  const fileSelect = page.getByLabel('공통 파일')
  await verifySelectChevron(baseSelect, `${viewport} ${theme} comparison base select`, true)
  await verifySelectChevron(targetSelect, `${viewport} ${theme} comparison target select`, true)
  await verifySelectChevron(fileSelect, `${viewport} ${theme} comparison file select`, true)

  const controlOrder = await controls
    .locator(':scope > label, :scope > div')
    .evaluateAll((elements) =>
      elements
        .map((element) => element.textContent?.trim() ?? '')
        .filter((text) =>
          ['현재 작업 버전', 'DIFF', '비교 기준'].some((label) => text.startsWith(label))
        )
        .map((text) =>
          ['현재 작업 버전', 'DIFF', '비교 기준'].find((label) => text.startsWith(label))
        )
    )
  assert(
    JSON.stringify(controlOrder.slice(0, 3)) ===
      JSON.stringify(['현재 작업 버전', 'DIFF', '비교 기준']),
    `${viewport} ${theme} selector order is not current to DIFF to base.`
  )

  const diffLabelBox = await controls.getByText('DIFF', { exact: true }).boundingBox()
  const [baseBox, targetBox] = await Promise.all([
    baseSelect.boundingBox(),
    targetSelect.boundingBox()
  ])
  assert(diffLabelBox && baseBox && targetBox, 'Comparison controls have no bounding boxes.')
  assert(
    targetBox.x + targetBox.width < diffLabelBox.x &&
      diffLabelBox.x + diffLabelBox.width < baseBox.x,
    `${viewport} ${theme} selector geometry is not current to DIFF to base.`
  )
  assert(
    Math.abs(
      diffLabelBox.x +
        diffLabelBox.width / 2 -
        (baseBox.x + baseBox.width / 2 + targetBox.x + targetBox.width / 2) / 2
    ) <= 1,
    `${viewport} ${theme} DIFF label is not centered between versions.`
  )
}

async function verifyDisplayedDiffArrow(page, viewport, theme) {
  const heading = page
    .getByRole('heading', { level: 2 })
    .filter({ hasText: `${baseVersion}` })
    .filter({ hasText: `${compareVersion}` })
    .first()
  const arrow = heading.locator('svg')
  const arrowBox = await assertLucideIcon(
    arrow,
    'arrow-right',
    16,
    `${viewport} ${theme} displayed diff`
  )
  const labels = heading.locator(':scope > span')
  assert((await labels.count()) === 2, 'Displayed diff must show base and target labels.')
  assert((await labels.nth(0).textContent()) === baseVersion, 'Displayed diff base label differs.')
  assert(
    (await labels.nth(1).textContent()) === compareVersion,
    'Displayed diff target label differs.'
  )
  const [baseBox, targetBox] = await Promise.all([
    labels.nth(0).boundingBox(),
    labels.nth(1).boundingBox()
  ])
  assert(baseBox && targetBox, 'Displayed diff labels have no bounding boxes.')
  assert(
    baseBox.x < arrowBox.x && arrowBox.x + arrowBox.width < targetBox.x,
    `${viewport} ${theme} displayed diff ArrowRight does not point base-to-target.`
  )
  assert(
    Math.abs(
      arrowBox.y +
        arrowBox.height / 2 -
        (baseBox.y + baseBox.height / 2 + targetBox.y + targetBox.height / 2) / 2
    ) <= 1,
    `${viewport} ${theme} displayed diff ArrowRight is not vertically centered.`
  )
}

async function assertNoResult(page) {
  await page.getByText('비교할 공통 파일을 선택하세요.', { exact: true }).waitFor()
}

function versionNavigation(page) {
  const navigation = page.getByLabel('버전 하위 탐색')
  return {
    parent: page.getByLabel('주 탐색').getByRole('button', { name: '버전 관리' }),
    navigation,
    list: navigation.getByRole('button', { name: '리스트' }),
    compare: navigation.getByRole('button', { name: '비교', exact: true }),
    detail: navigation.getByRole('button', { name: '상세 결과' })
  }
}

async function verifyDirectDetailNavigation(page, viewport, size) {
  await page.setViewportSize(size)
  const { parent, list, compare, detail } = versionNavigation(page)
  if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
  await detail.waitFor({ state: 'visible' })
  assert(await detail.isEnabled(), `${viewport} detail navigation is disabled.`)
  await parent.click()
  assert(
    (await parent.getAttribute('aria-expanded')) === 'false',
    `${viewport} group did not collapse.`
  )
  await Promise.all([
    list.waitFor({ state: 'hidden' }),
    compare.waitFor({ state: 'hidden' }),
    detail.waitFor({ state: 'hidden' })
  ])
  await parent.click()
  assert(
    (await parent.getAttribute('aria-expanded')) === 'true',
    `${viewport} group did not expand.`
  )
  await detail.waitFor({ state: 'visible' })
  assert(await detail.isEnabled(), `${viewport} expanded detail navigation is disabled.`)

  await detail.click()
  await page.getByRole('heading', { name: '전체 비교 결과' }).waitFor()
  await page.getByText('현재 선택에 맞는 비교 결과가 없습니다.', { exact: true }).waitFor()
  const cta = page.getByRole('button', { name: '버전 비교로 이동', exact: true })
  await cta.waitFor()
  assert(
    (await detail.getAttribute('aria-current')) === 'page',
    `${viewport} detail navigation is not active.`
  )
  assert(
    (await compare.getAttribute('aria-current')) !== 'page',
    `${viewport} compare navigation stayed active on detail.`
  )
  await cta.click()
  await page.getByRole('heading', { name: '버전 비교' }).waitFor()
  assert(
    (await compare.getAttribute('aria-current')) === 'page',
    `${viewport} compare navigation is not active after empty CTA.`
  )
  assert(
    (await detail.getAttribute('aria-current')) !== 'page',
    `${viewport} detail navigation stayed active after empty CTA.`
  )
  await assertNoPageOverflow(page, `${viewport} direct detail navigation`)
}

async function runComparison(page) {
  await page.getByRole('button', { name: '비교 실행' }).click()
  await page.getByRole('heading', { name: '레코드 미리보기' }).waitFor({ timeout: 15_000 })
}

async function verifyOverview(page) {
  const preview = page.locator('section').filter({ hasText: '레코드 미리보기' })
  await preview.getByRole('button', { name: '추가 12' }).waitFor()
  await preview.getByRole('button', { name: '수정 1' }).waitFor()
  await preview.getByRole('button', { name: '삭제 1' }).waitFor()
  assert((await preview.locator('article').count()) === 1, 'Overview must render one preview card.')
  await preview.locator('pre').filter({ hasText: '"jobID": "00003"' }).waitFor()
  assert(
    !(await preview.getByRole('button', { name: '이전' }).isEnabled()),
    'First preview enables previous.'
  )
  assert(
    await preview.getByRole('button', { name: '다음' }).isEnabled(),
    'Multi-item preview disables next.'
  )
  await preview.getByRole('button', { name: '다음' }).click()
  await preview.locator('pre').filter({ hasText: '"jobID": "00005"' }).waitFor()
  assert(
    (await preview.locator('article').count()) === 1,
    'Preview navigation rendered multiple cards.'
  )

  await preview.getByRole('button', { name: '수정 1' }).click()
  const modifiedRecord = preview.locator('article').filter({ hasText: '수정 · jobID: 00001' })
  await modifiedRecord.getByText('jobName', { exact: true }).waitFor()
  await modifiedRecord.getByText('이전', { exact: true }).first().waitFor()
  await modifiedRecord.getByText('이후', { exact: true }).first().waitFor()
  await modifiedRecord.locator('pre').filter({ hasText: '"before"' }).waitFor()
  await modifiedRecord.locator('pre').filter({ hasText: '"after"' }).waitFor()

  await preview.getByRole('button', { name: '삭제 1' }).click()
  await preview.locator('pre').filter({ hasText: '"jobID": "00002"' }).waitFor()
  await preview.getByRole('button', { name: '추가 12' }).click()
}

async function verifyEmptyOverview(page) {
  const preview = page.locator('section').filter({ hasText: '레코드 미리보기' })
  for (const [name, message] of [
    ['추가 0', '추가 항목이 없습니다.'],
    ['수정 0', '수정 항목이 없습니다.'],
    ['삭제 0', '삭제 항목이 없습니다.']
  ]) {
    await preview.getByRole('button', { name }).click()
    await preview.getByText(message, { exact: true }).waitFor()
    assert(
      (await preview.locator('article').count()) === 0,
      `${name} empty preview rendered a card.`
    )
    assert(
      !(await preview.getByRole('button', { name: '이전' }).isEnabled()),
      `${name} enables previous.`
    )
    assert(
      !(await preview.getByRole('button', { name: '다음' }).isEnabled()),
      `${name} enables next.`
    )
  }
}

function detailToolbar(page) {
  return page.getByLabel('결과 검색').locator('xpath=..').locator('xpath=..')
}

async function resultTypography(page) {
  const header = page
    .locator('section')
    .filter({ has: page.locator('.page-eyebrow') })
    .first()
  const filename = header.locator('.page-eyebrow')
  const versions = header.getByRole('heading', { level: 2 }).locator(':scope > span')
  return {
    filename: await filename.evaluate((element) => getComputedStyle(element).fontSize),
    versions: await versions.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).fontSize)
    )
  }
}

async function assertNoPageOverflow(page, context) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  assert(!overflow, `${context} has horizontal page overflow.`)
}

async function verifyDetailRoute(page) {
  await page.getByRole('button', { name: '전체 결과 자세히' }).click()
  await page.getByRole('heading', { name: '전체 비교 결과' }).waitFor()
  assert(
    (await page.locator('main > div').first().locator(':scope > span').textContent()) ===
      '상세 결과',
    'Detail route header is not active.'
  )
  const { compare, detail } = versionNavigation(page)
  assert(
    (await detail.getAttribute('aria-current')) === 'page',
    'Detail route does not activate detail navigation.'
  )
  assert(
    (await compare.getAttribute('aria-current')) !== 'page',
    'Detail route keeps comparison navigation active.'
  )
}

async function verifyLatestDetailResult(page) {
  const header = page
    .locator('section')
    .filter({ has: page.locator('.page-eyebrow') })
    .first()
  await header.locator('.page-eyebrow').getByText(filename, { exact: true }).waitFor()
  for (const [label, count] of [
    ['추가', '12'],
    ['수정', '1'],
    ['삭제', '1']
  ]) {
    const summary = header.getByText(label, { exact: true }).locator('..')
    await summary.getByText(count, { exact: true }).waitFor()
  }
}

async function verifyResultSurvivesNavigation(page, electronApp, expectedIpcCount) {
  await verifyLatestDetailResult(page)
  await page.getByRole('button', { name: '대시보드' }).click()
  await page.getByRole('heading', { name: '작업할 데이터 버전' }).waitFor()

  const { parent, list, compare, detail } = versionNavigation(page)
  if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
  await list.click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  assert((await list.getAttribute('aria-current')) === 'page', 'List navigation is not active.')
  assert(
    (await detail.getAttribute('aria-current')) !== 'page',
    'Detail is active on version list.'
  )

  await detail.click()
  await page.getByRole('heading', { name: '전체 비교 결과' }).waitFor()
  assert((await detail.getAttribute('aria-current')) === 'page', 'Detail navigation is not active.')
  assert(
    (await compare.getAttribute('aria-current')) !== 'page',
    'Compare is active on detail route.'
  )
  await verifyLatestDetailResult(page)
  assert(
    (await comparisonIpcCount(electronApp)) === expectedIpcCount,
    'Result navigation triggered another compareRawData IPC call.'
  )
}

async function verifyDetailResult(page) {
  const categories = page.getByLabel('결과 종류')
  const search = page.getByLabel('결과 검색')
  for (const category of ['전체', '추가', '수정', '삭제'])
    await categories.getByRole('button', { name: category, exact: true }).waitFor()

  await categories.getByRole('button', { name: '전체', exact: true }).click()
  await page.getByText('1 / 2 페이지 · 14건', { exact: true }).waitFor()
  await page.getByRole('button', { name: '다음' }).last().click()
  await page.getByText('2 / 2 페이지 · 14건', { exact: true }).waitFor()
  assert(
    !(await page.getByRole('button', { name: '다음' }).last().isEnabled()),
    'Last detail page enables next.'
  )

  await search.fill('00001')
  await page.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  await page.locator('article').filter({ hasText: '수정 · jobID: 00001' }).waitFor()
  await search.fill('no-matching-result')
  await page.getByText('조건에 맞는 항목이 없습니다.', { exact: true }).waitFor()
  await page.getByText('1 / 1 페이지 · 0건', { exact: true }).waitFor()
  await search.fill('')

  await categories.getByRole('button', { name: '추가', exact: true }).click()
  await page.getByText('1 / 2 페이지 · 12건', { exact: true }).waitFor()
  await page.getByRole('button', { name: '다음' }).last().click()
  await page.getByText('2 / 2 페이지 · 12건', { exact: true }).waitFor()
  await categories.getByRole('button', { name: '삭제', exact: true }).click()
  await page.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  await page.locator('pre').filter({ hasText: '"jobID": "00002"' }).waitFor()

  await categories.getByRole('button', { name: '수정', exact: true }).click()
  const longDetail = page.locator('article').filter({ hasText: '수정 · jobID: 00001' })
  await longDetail.getByText(`after-${longMarker}`, { exact: false }).waitFor()
  const detailState = await longDetail.evaluate(
    (element, marker) => ({
      hasMarker: element.textContent?.includes(`after-${marker}`) ?? false,
      clipped: [...element.querySelectorAll('pre')].some(
        (pre) => pre.scrollHeight > pre.clientHeight && getComputedStyle(pre).overflowY === 'hidden'
      )
    }),
    longMarker
  )
  assert(detailState.hasMarker && !detailState.clipped, 'Long nested detail is truncated.')
}

async function verifyBackToOverview(page) {
  await page.getByRole('button', { name: '비교 개요로' }).click()
  await page.getByRole('heading', { name: '버전 비교' }).waitFor()
  assert(
    (await page.locator('main > div').first().locator(':scope > span').textContent()) === '비교',
    'Overview route header did not restore.'
  )
}

async function saveResult(page, dataRoot) {
  await page.getByRole('button', { name: '비교 결과 저장' }).click()
  await page.getByRole('status').getByText('비교 결과를 저장했습니다.').waitFor()
  const saved = JSON.parse(await readFile(diffPath(dataRoot), 'utf8'))
  assert(saved.baseVersion === baseVersion, 'Saved result baseVersion differs.')
  assert(saved.compareVersion === compareVersion, 'Saved result compareVersion differs.')
  assert(saved.add.length === 12, 'Saved result must contain twelve added records.')
  assert(saved.modify.length === 1, 'Saved result must contain one modified record.')
  assert(saved.delete.length === 1, 'Saved result must contain one deleted record.')
}

async function verifyReopen(page) {
  await page.getByRole('button', { name: '저장 결과 열기' }).click()
  await page.getByRole('status').getByText('저장된 비교 결과를 열었습니다.').waitFor()
  await verifyOverview(page)
}

async function verifyStaleResult(page) {
  await verifyDetailRoute(page)
  await selectOption(page, '현재 버전', baseVersion)
  await page.getByText('현재 선택에 맞는 비교 결과가 없습니다.', { exact: true }).waitFor()
  assert(
    (await page.locator('article').count()) === 0,
    'Detail kept stale records after version change.'
  )
  await selectOption(page, '현재 버전', compareVersion)
  await page
    .getByLabel('공통 파일')
    .locator('option', { hasText: '파일 목록 조회 중' })
    .waitFor({ state: 'detached' })
  await selectOption(page, '공통 파일', changedFilename)
  await page.getByText('현재 선택에 맞는 비교 결과가 없습니다.', { exact: true }).waitFor()
  assert(
    (await page.locator('article').count()) === 0,
    'Detail kept stale records after file change.'
  )
  await page.getByRole('button', { name: '버전 비교로 이동' }).click()
  await assertNoResult(page)

  await selectOption(page, '현재 작업 버전', baseVersion)
  await assertNoResult(page)
  await selectOption(page, '현재 작업 버전', compareVersion)
  await selectOption(page, '비교 기준', baseVersion)
  await selectOption(page, '공통 파일', filename)
  await assertNoResult(page)
}

async function verifyNoChanges(page) {
  await selectOption(page, '공통 파일', unchangedFilename)
  await runComparison(page)
  await verifyEmptyOverview(page)
  await selectOption(page, '공통 파일', filename)
}

async function verifyStickyToolbar(page, context) {
  const toolbar = detailToolbar(page)
  for (const fraction of [0.5, 1]) {
    if (fraction === 1) {
      await toolbar.evaluate((element) =>
        element.closest('section')?.scrollIntoView({ block: 'end' })
      )
    } else {
      await page.evaluate(
        (position) =>
          window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * position),
        fraction
      )
    }
    await page.waitForTimeout(100)
    const state = await toolbar.evaluate((element) => {
      const box = element.getBoundingClientRect()
      return { top: box.top, bottom: box.bottom, viewportHeight: innerHeight }
    })
    assert(
      state.top >= -1 && state.bottom <= state.viewportHeight + 1,
      `${context} sticky search, pager, and save toolbar left viewport at ${fraction}: ${JSON.stringify(state)}.`
    )
    for (const control of [
      page.getByLabel('결과 검색'),
      toolbar.getByRole('button', { name: '이전' }),
      toolbar.getByRole('button', { name: '다음' }),
      toolbar.getByRole('button', { name: '비교 결과 저장' })
    ])
      assert(await control.isVisible(), `${context} sticky toolbar control is not visible.`)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  const lastRecord = page.locator('article').last()
  if (await lastRecord.count()) {
    const recordBox = await lastRecord.boundingBox()
    const toolbarBox = await toolbar.boundingBox()
    assert(
      recordBox && toolbarBox && recordBox.y + recordBox.height <= toolbarBox.y + 1,
      `${context} final record is hidden behind the persistent controls.`
    )
  }
}

async function verifyProductionSizedSkillLevel(page, expectedDeleteCount) {
  await selectOption(page, '공통 파일', largeFilename)
  await assertNoResult(page)

  const compareStarted = performance.now()
  await runComparison(page)
  const compareElapsed = Math.round(performance.now() - compareStarted)
  await verifyDetailRoute(page)
  const categories = page.getByLabel('결과 종류')
  await categories.getByRole('button', { name: '삭제', exact: true }).click()
  const expectedCount = String(expectedDeleteCount)
  const pager = detailToolbar(page).locator('[aria-live="polite"]')
  await pager.waitFor({ timeout: 30_000 })
  assert(
    (await pager.textContent())?.trim().endsWith(`페이지 · ${expectedCount}건`),
    `Large deletion pager count differs: ${(await pager.textContent())?.trim()}.`
  )
  assert(
    (await page.locator('article').count()) === 10,
    'Large deletion rendered more than one page.'
  )

  await verifyStickyToolbar(page, 'Large deletion desktop')
  const deleteSearch = page.getByLabel('결과 검색')
  const searchStarted = performance.now()
  await deleteSearch.fill('80004444')
  await page.locator('pre').filter({ hasText: '"skillID": "80004444"' }).waitFor()
  await page.getByText('1 / 1 페이지 · 1건', { exact: true }).waitFor()
  const searchElapsed = Math.round(performance.now() - searchStarted)

  await deleteSearch.fill('')
  await page.getByText(new RegExp(`1 / [\\d,]+ 페이지 · ${expectedCount}건`)).waitFor()
  const paginationStarted = performance.now()
  await detailToolbar(page).getByRole('button', { name: '다음' }).click()
  await page.getByText(new RegExp(`2 / [\\d,]+ 페이지 · ${expectedCount}건`)).waitFor()
  const paginationElapsed = Math.round(performance.now() - paginationStarted)
  assert(
    (await page.locator('article').count()) === 10,
    'Large deletion pagination rendered more than one page.'
  )

  await page.setViewportSize({ width: 390, height: 844 })
  await verifyStickyToolbar(page, 'Large deletion mobile')
  await assertNoPageOverflow(page, 'Large deletion mobile')
  await page.setViewportSize({ width: 1480, height: 920 })
  console.log(
    `ms_skillLevel (${expectedDeleteCount} deletions): compare ${compareElapsed}ms, search ${searchElapsed}ms, pagination ${paginationElapsed}ms`
  )

  await page.getByRole('button', { name: '비교 개요로' }).click()
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
      const selects = page.locator('select:visible')
      for (let index = 0; index < (await selects.count()); index += 1)
        await verifySelectChevron(
          selects.nth(index),
          `${screen} ${size.width}px select ${index + 1}`
        )
    }
    const parent = page.getByLabel('주 탐색').getByRole('button', { name: '버전 관리' })
    if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
    for (const [screen, heading] of [
      ['리스트', '등록 버전'],
      ['비교', '버전 비교']
    ]) {
      await page.getByLabel('버전 하위 탐색').getByRole('button', { name: screen }).click()
      await page.getByRole('heading', { name: heading }).waitFor()
      const selects = page.locator('select:visible')
      for (let index = 0; index < (await selects.count()); index += 1)
        await verifySelectChevron(
          selects.nth(index),
          `${screen} ${size.width}px select ${index + 1}`
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
    await installComparisonIpcCounter(electronApp)

    const directNavigationViewports = [
      ['desktop-1480', { width: 1480, height: 920 }],
      ['mobile-390', { width: 390, height: 844 }]
    ]
    for (const [viewport, size] of directNavigationViewports)
      await verifyDirectDetailNavigation(page, viewport, size)
    await page.setViewportSize({ width: 1480, height: 920 })
    await selectVersionsAndFile(page)
    await verifySelectKeyboardInteraction(page, page.getByLabel('공통 파일'), '공통 파일')
    await runComparison(page)
    assert((await comparisonIpcCount(electronApp)) === 1, 'Initial comparison IPC count differs.')
    await verifyOverview(page)
    const typographyByViewport = new Map()
    for (const [viewport, size] of [
      ['desktop-1480', { width: 1480, height: 920 }],
      ['mobile-390', { width: 390, height: 844 }]
    ]) {
      await page.setViewportSize(size)
      for (const theme of ['dark', 'light']) {
        await setTheme(page, theme)
        await verifyComparisonControls(page, viewport, theme)
        await verifyDisplayedDiffArrow(page, viewport, theme)
      }
      await assertNoPageOverflow(page, `${viewport} overview`)
      typographyByViewport.set(viewport, await resultTypography(page))
    }

    await page.setViewportSize({ width: 1480, height: 920 })
    await setTheme(page, 'dark')
    await verifyDetailRoute(page)
    await verifyResultSurvivesNavigation(page, electronApp, 1)
    await verifyDetailResult(page)
    for (const [viewport, size] of [
      ['desktop-1480', { width: 1480, height: 920 }],
      ['mobile-390', { width: 390, height: 844 }]
    ]) {
      await page.setViewportSize(size)
      await assertNoPageOverflow(page, `${viewport} detail`)
      const detailTypography = await resultTypography(page)
      assert(
        JSON.stringify(detailTypography) === JSON.stringify(typographyByViewport.get(viewport)),
        `${viewport} filename or version size changed between overview and detail.`
      )
      await verifyStickyToolbar(page, `${viewport} detail`)
      if (viewport === 'mobile-390') await verifyResultSurvivesNavigation(page, electronApp, 1)
    }
    await page.setViewportSize({ width: 1480, height: 920 })
    await saveResult(page, dataRoot)
    await verifyBackToOverview(page)
    await verifyReopen(page)
    await verifyDetailRoute(page)
    await page.getByLabel('결과 종류').getByRole('button', { name: '수정', exact: true }).click()
    await page.getByText(`after-${longMarker}`, { exact: false }).waitFor()
    await verifyBackToOverview(page)
    await verifyStaleResult(page)
    await verifyNoChanges(page)
    await verifyProductionSizedSkillLevel(page, source.largeRecordCount)
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
