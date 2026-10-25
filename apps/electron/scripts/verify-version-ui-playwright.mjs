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

async function verifyVersionNavigation(page, expectedView) {
  const parent = page.getByLabel('주 탐색').getByRole('button', { name: '버전 관리' })
  const navigation = page.getByLabel('버전 하위 탐색')
  const list = navigation.getByRole('button', { name: '리스트' })
  const compare = navigation.getByRole('button', { name: '비교' })
  const activeView =
    expectedView === '대시보드'
      ? page.getByRole('button', { name: '대시보드' })
      : page.getByRole('heading', { name: expectedView })

  if ((await parent.getAttribute('aria-expanded')) === 'true') await parent.click()
  assert(
    (await parent.getAttribute('aria-expanded')) === 'false',
    'Version navigation did not collapse.'
  )
  await page.mouse.move(0, 0)
  const collapsedIconBox = await assertLucideIcon(
    parent.locator('svg'),
    'chevron-down',
    16,
    'Collapsed version navigation'
  )
  await list.waitFor({ state: 'hidden' })
  await compare.waitFor({ state: 'hidden' })
  await activeView.waitFor()
  if (expectedView === '대시보드')
    assert((await activeView.getAttribute('aria-current')) === 'page', 'Dashboard view changed.')

  await parent.click()
  assert(
    (await parent.getAttribute('aria-expanded')) === 'true',
    'Version navigation did not expand.'
  )
  await page.mouse.move(0, 0)
  const expandedIconBox = await assertLucideIcon(
    parent.locator('svg'),
    'chevron-up',
    16,
    'Expanded version navigation'
  )
  assert(
    rectangleDelta(collapsedIconBox, expandedIconBox) <= 0.5,
    'Version navigation icon shifted when expanded.'
  )
  await list.waitFor({ state: 'visible' })
  await compare.waitFor({ state: 'visible' })
  await list.click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  assert((await list.getAttribute('aria-current')) === 'page', 'List selection is not marked.')
  assert(
    (await compare.getAttribute('aria-current')) !== 'page',
    'Compare is incorrectly selected.'
  )

  await parent.click()
  await list.waitFor({ state: 'hidden' })
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  await parent.click()
  await compare.click()
  await page.getByRole('heading', { name: '버전 비교' }).waitFor()
  assert(
    (await compare.getAttribute('aria-current')) === 'page',
    'Compare selection is not marked.'
  )
  assert((await list.getAttribute('aria-current')) !== 'page', 'List is incorrectly selected.')
  await list.click()
  await page.getByRole('heading', { name: '등록 버전' }).waitFor()
  assert((await list.getAttribute('aria-current')) === 'page', 'List selection was not restored.')
}

async function verifyVersionList(page, registered, missingVersion) {
  await verifyVersionNavigation(page, '대시보드')

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
    assert(
      (await row.locator('td').nth(1).textContent())?.includes(
        version.releasedOn ? dateText(version.releasedOn, true) : '미등록'
      ),
      `Release date differs for ${version.version}: ${await row.locator('td').nth(1).textContent()}`
    )
    await row.getByText(dateText(version.createdAt)).waitFor()
    await row.getByText(version.environment === 'production' ? '운영' : '테스트').waitFor()
    await row.getByText(version.status === 'ready' ? '준비됨' : '가져오는 중').waitFor()
  }
  assert(
    (await rows.filter({ hasText: missingVersion.version }).count()) === 1,
    'DB version without local JSON was not visible.'
  )
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

async function layoutSnapshot(page) {
  return {
    table: await page.locator('table').boundingBox(),
    sidebar: await page.getByLabel('주 탐색').boundingBox(),
    scrollLeft: await page
      .locator('section.overflow-x-auto')
      .first()
      .evaluate((element) => element.scrollLeft),
    rows: await page.locator('tbody tr').evaluateAll((rows) =>
      rows.map((row) => {
        const box = row.getBoundingClientRect()
        return { x: box.x, y: box.y, width: box.width, height: box.height }
      })
    ),
    cells: await page.locator('tbody td').evaluateAll((cells) =>
      cells.map((cell) => {
        const box = cell.getBoundingClientRect()
        return { x: box.x, y: box.y, width: box.width, height: box.height }
      })
    )
  }
}

function snapshotDeltas(before, after) {
  assert(before.rows.length === after.rows.length, 'Opening date edit changed row count.')
  assert(before.cells.length === after.cells.length, 'Opening date edit changed cell count.')
  const inTableCoordinates = (box, scrollLeft) => ({ ...box, x: box.x + scrollLeft })
  const tableDelta = (beforeBox, afterBox) =>
    rectangleDelta(
      inTableCoordinates(beforeBox, before.scrollLeft),
      inTableCoordinates(afterBox, after.scrollLeft)
    )
  const deltas = {
    table: tableDelta(before.table, after.table),
    sidebar: rectangleDelta(before.sidebar, after.sidebar),
    rows: Math.max(...before.rows.map((box, index) => tableDelta(box, after.rows[index]))),
    cells: Math.max(...before.cells.map((box, index) => tableDelta(box, after.cells[index]))),
    scrollLeft: Math.abs(before.scrollLeft - after.scrollLeft),
    viewportShift: Math.max(
      rectangleDelta(before.table, after.table),
      ...before.rows.map((box, index) => rectangleDelta(box, after.rows[index])),
      ...before.cells.map((box, index) => rectangleDelta(box, after.cells[index]))
    )
  }
  return { ...deltas, maximum: Math.max(deltas.table, deltas.sidebar, deltas.rows, deltas.cells) }
}

async function visualStyle(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth
    }
  })
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
  const before = await assertLucideIcon(icon, 'chevron-down', 16, context)
  const wrapperBox = await wrapper.boundingBox()
  assert(wrapperBox, `${context} wrapper has no bounding box.`)
  assert(
    Math.abs(wrapperBox.x + wrapperBox.width - (before.x + before.width) - 12) <= 0.5,
    `${context} ChevronDown does not keep fixed 12px right inset.`
  )
  assert(
    Math.abs(before.y + before.height / 2 - (wrapperBox.y + wrapperBox.height / 2)) <= 0.5,
    `${context} ChevronDown is not vertically centered.`
  )
  if (!interactive) return { icon, box: before }

  const relativeBox = (iconBox, parentBox) => ({
    x: iconBox.x - parentBox.x,
    y: iconBox.y - parentBox.y,
    width: iconBox.width,
    height: iconBox.height
  })
  const baseRelativeBox = relativeBox(before, wrapperBox)
  const baseColor = await icon.evaluate((element) => getComputedStyle(element).color)
  await wrapper.hover()
  const hoverColor = await icon.evaluate((element) => getComputedStyle(element).color)
  assert(hoverColor !== baseColor, `${context} ChevronDown color did not change on hover.`)
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
    `${context} select lost keyboard focus.`
  )
  const focusColor = await icon.evaluate((element) => getComputedStyle(element).color)
  assert(focusColor !== baseColor, `${context} ChevronDown color did not change on focus-within.`)
  assert(
    rectangleDelta(
      baseRelativeBox,
      relativeBox(await icon.boundingBox(), await wrapper.boundingBox())
    ) <= 0.5,
    `${context} ChevronDown shifted or resized on keyboard focus.`
  )
  await select.evaluate((element) => element.blur())
  return { icon, box: before }
}

async function verifyNativeSelectKeyboardSelection(select, context) {
  const originalValue = await select.inputValue()
  const enabledValues = await select
    .locator('option:not([disabled])')
    .evaluateAll((options) => options.map((option) => option.value))
  assert(enabledValues.length >= 2, `${context} needs at least two enabled options.`)
  const startValue = enabledValues.find((value) => value !== originalValue) ?? enabledValues[0]
  await select.selectOption(startValue)
  await select.focus()
  await select.press('Space')
  await select.page().keyboard.press('ArrowDown')
  await select.page().keyboard.press('Enter')
  assert(
    (await select.inputValue()) !== startValue,
    `${context} native select did not accept open and keyboard selection.`
  )
  await select.selectOption(originalValue)
}

async function verifyReleaseDateSelectStates(page, viewport, theme) {
  await page.getByRole('button', { name: '데이터 업로드' }).click()
  await page.getByText('게임사 업데이트 날짜 (선택)', { exact: true }).waitFor()
  const selects = [
    page.getByLabel('연도', { exact: true }),
    page.getByLabel('월', { exact: true }),
    page.getByLabel('일', { exact: true })
  ]
  for (const [index, select] of selects.entries())
    await verifySelectChevron(select, `${viewport} ${theme} release date select ${index + 1}`, true)
  await verifyNativeSelectKeyboardSelection(
    page.getByLabel('연도'),
    `${viewport} ${theme} release date year select`
  )
}

async function verifyAccordionIconStates(page, viewport, theme) {
  const button = page.getByLabel('주 탐색').getByRole('button', { name: '버전 관리' })
  const iconSlot = button.locator('span').last()
  const expanded = (await button.getAttribute('aria-expanded')) === 'true'
  const iconName = expanded ? 'chevron-up' : 'chevron-down'
  const icon = iconSlot.locator('svg')
  const before = await assertLucideIcon(
    icon,
    iconName,
    16,
    `${viewport} ${theme} version accordion ${expanded ? 'expanded' : 'collapsed'}`
  )
  const slotBox = await iconSlot.boundingBox()
  assert(slotBox, 'Version accordion icon slot has no bounding box.')
  const relativeBox = (iconBox, parentBox) => ({
    x: iconBox.x - parentBox.x,
    y: iconBox.y - parentBox.y,
    width: iconBox.width,
    height: iconBox.height
  })
  const baseRelativeBox = relativeBox(before, slotBox)
  const baseColor = await icon.evaluate((element) => getComputedStyle(element).color)
  await button.hover()
  await page.waitForFunction(({ element, color }) => getComputedStyle(element).color !== color, {
    element: await icon.elementHandle(),
    color: baseColor
  })
  assert(
    (await icon.evaluate((element) => getComputedStyle(element).color)) !== baseColor,
    `${viewport} ${theme} version accordion icon color did not change on hover.`
  )
  assert(
    rectangleDelta(
      baseRelativeBox,
      relativeBox(await icon.boundingBox(), await iconSlot.boundingBox())
    ) <= 0.5,
    `${viewport} ${theme} version accordion icon shifted or resized on hover.`
  )
  await page.mouse.move(0, 0)
  await button.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  assert(
    await button.evaluate((element) => element === document.activeElement),
    `${viewport} ${theme} version accordion did not receive keyboard focus.`
  )
  assert(
    (await icon.evaluate((element) => getComputedStyle(element).color)) !== baseColor,
    `${viewport} ${theme} version accordion icon color did not change on focus-visible.`
  )
  assert(
    rectangleDelta(
      baseRelativeBox,
      relativeBox(await icon.boundingBox(), await iconSlot.boundingBox())
    ) <= 0.5,
    `${viewport} ${theme} version accordion icon shifted or resized on keyboard focus.`
  )

  await button.press('Enter')
  assert(
    (await button.getAttribute('aria-expanded')) === String(!expanded),
    `${viewport} ${theme} version accordion did not toggle by keyboard.`
  )
  await button.evaluate((element) => element.blur())
  await page.mouse.move(0, 0)
  const toggledIcon = iconSlot.locator('svg')
  await page.waitForFunction(({ element, color }) => getComputedStyle(element).color === color, {
    element: await toggledIcon.elementHandle(),
    color: baseColor
  })
  const toggledBox = await assertLucideIcon(
    toggledIcon,
    expanded ? 'chevron-down' : 'chevron-up',
    16,
    `${viewport} ${theme} toggled version accordion`
  )
  assert(
    rectangleDelta(baseRelativeBox, relativeBox(toggledBox, await iconSlot.boundingBox())) <= 0.5,
    `${viewport} ${theme} version accordion icon shifted or resized after toggle.`
  )
  await button.press('Enter')
  assert(
    (await button.getAttribute('aria-expanded')) === String(expanded),
    `${viewport} ${theme} version accordion state was not restored.`
  )
}

async function setTheme(page, theme) {
  if ((await page.locator('html').getAttribute('data-theme')) === theme) return
  await page.getByRole('button', { name: theme === 'light' ? /라이트/ : /다크/ }).click()
  await page.waitForFunction(
    (expectedTheme) => document.documentElement.dataset.theme === expectedTheme,
    theme
  )
}

async function verifyActionIcon(button, name) {
  assert((await button.getAttribute('aria-label')) === name, `${name} accessible name differs.`)
  assert((await button.getAttribute('title')) === name, `${name} tooltip differs.`)
  const svg = button.locator('svg')
  assert((await svg.count()) === 1, `${name} does not contain one SVG icon.`)
  assert((await svg.getAttribute('aria-hidden')) === 'true', `${name} SVG is not aria-hidden.`)
}

async function verifyVersionListInteractions(page, registered, viewport) {
  const rows = page.locator('tbody tr')
  const dated = registered.find((version) => version.releasedOn)
  const undated = registered.find((version) => !version.releasedOn)
  assert(dated && undated, `${viewport} needs rows with and without release dates.`)

  const editButtons = []
  for (const version of registered) {
    const row = rows.filter({ hasText: version.version })
    const editName = `${version.version} 릴리스 날짜 수정`
    const edit = row.getByRole('button', { name: editName })
    await verifyActionIcon(edit, editName)
    await verifyActionIcon(
      row.getByRole('button', { name: `${version.version} 복제` }),
      `${version.version} 복제`
    )
    await verifyActionIcon(
      row.getByRole('button', { name: `${version.version} 삭제` }),
      `${version.version} 삭제`
    )
    const box = await edit.boundingBox()
    assert(box, `${viewport} date edit icon has no bounding box for ${version.version}.`)
    editButtons.push({ version: version.version, x: box.x })
  }
  const iconXDelta =
    Math.max(...editButtons.map(({ x }) => x)) - Math.min(...editButtons.map(({ x }) => x))
  assert(iconXDelta <= 0.5, `${viewport} date edit icon x delta is ${iconXDelta}px.`)

  const ready = registered.find((version) => version.status === 'ready')
  assert(ready, `${viewport} needs one ready version for action style checks.`)
  const styleButton = rows
    .filter({ hasText: ready.version })
    .getByRole('button', { name: `${ready.version} 복제` })
  await styleButton.evaluate((element) => element.blur())
  await page.mouse.move(0, 0)
  const baseStyle = await visualStyle(styleButton)
  await styleButton.hover()
  await page.waitForTimeout(200)
  const hoverStyle = await visualStyle(styleButton)
  assert(
    hoverStyle.color !== baseStyle.color ||
      hoverStyle.backgroundColor !== baseStyle.backgroundColor ||
      hoverStyle.borderColor !== baseStyle.borderColor,
    `${viewport} action icon has no visible hover style.`
  )
  await page.mouse.move(0, 0)
  await styleButton.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  assert(
    await styleButton.evaluate((element) => element === document.activeElement),
    `${viewport} keyboard focus did not return to action icon.`
  )
  const focusStyle = await visualStyle(styleButton)
  assert(
    focusStyle.outlineStyle !== 'none' && Number.parseFloat(focusStyle.outlineWidth) >= 2,
    `${viewport} action icon has no visible keyboard focus outline.`
  )
  await styleButton.evaluate((element) => element.blur())

  let geometryDelta = 0
  let scrollLeftDelta = 0
  let viewportShift = 0
  const editGeometry = []
  for (const version of [dated, undated]) {
    const row = rows.filter({ hasText: version.version })
    const cell = row.locator('td').nth(1)
    const originalDate = await cell.textContent()
    const edit = row.getByRole('button', { name: `${version.version} 릴리스 날짜 수정` })
    await edit.evaluate((element) =>
      element.addEventListener(
        'click',
        (event) => {
          event.preventDefault()
          event.stopImmediatePropagation()
        },
        { capture: true, once: true }
      )
    )
    await edit.click()
    const before = await layoutSnapshot(page)
    await edit.evaluate((element) => element.click())
    const input = cell.locator('input[type="date"]')
    await input.waitFor()
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute('aria-label') === label,
      `${version.version} 릴리스 날짜`
    )
    assert(await edit.isDisabled(), `${viewport} hidden date edit trigger remains enabled.`)
    assert(
      !(await edit.evaluate((element) => element === document.activeElement)),
      `${viewport} hidden date edit trigger retained focus.`
    )
    const after = await layoutSnapshot(page)
    const deltas = snapshotDeltas(before, after)
    editGeometry.push({ version: version.version, ...deltas })
    geometryDelta = Math.max(geometryDelta, deltas.maximum)
    scrollLeftDelta = Math.max(scrollLeftDelta, deltas.scrollLeft)
    viewportShift = Math.max(viewportShift, deltas.viewportShift)
    assert(
      await input.evaluate((element) => element === document.activeElement),
      `${viewport} date input lost focus after opening editor.`
    )
    await input.fill(version.releasedOn?.startsWith('2001-01-01') ? '2002-01-01' : '2001-01-01')
    assert(
      await input.evaluate((element) => element === document.activeElement),
      `${viewport} date input lost focus after editing.`
    )
    await input.press('Escape')
    await input.waitFor({ state: 'detached' })
    await edit.waitFor({ state: 'visible' })
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute('aria-label') === label,
      `${version.version} 릴리스 날짜 수정`
    )
    assert(await edit.isEnabled(), `${viewport} date edit icon was not restored after Escape.`)
    assert((await cell.textContent()) === originalDate, `${viewport} Escape changed release date.`)
  }
  console.log(`version-list edit geometry ${viewport} ${JSON.stringify(editGeometry)}`)
  const metrics = {
    viewport,
    iconXDelta,
    geometryDelta,
    scrollLeftDelta,
    viewportShift,
    dateFocus: { hiddenTriggerSkipped: true, inputAutofocus: true, restoredAfterEscape: true },
    hover: { baseStyle, hoverStyle },
    focusStyle
  }
  console.log(`version-list metrics ${JSON.stringify(metrics)}`)
  assert(geometryDelta <= 0.5, `${viewport} date editor geometry delta is ${geometryDelta}px.`)
  assert(scrollLeftDelta === 0, `${viewport} date editor scrollLeft delta is ${scrollLeftDelta}px.`)
  assert(viewportShift === 0, `${viewport} date editor viewport shift is ${viewportShift}px.`)
}

async function verifyCancelledActions(page, version) {
  const row = page.locator('tbody tr').filter({ hasText: version.version })
  const releasedOn = row.locator('td').nth(1)
  const createdAt = row.locator('td').nth(2)
  const originalDate = await releasedOn.textContent()
  const originalCreatedAt = await createdAt.textContent()

  await row.getByRole('button', { name: `${version.version} 릴리스 날짜 수정` }).click()
  const dateInput = releasedOn.locator('input[type="date"]')
  await dateInput.waitFor()
  assert(
    (await dateInput.inputValue()) === (version.releasedOn?.slice(0, 10) ?? ''),
    'Release date editor did not show stored date.'
  )
  await dateInput.fill(version.releasedOn?.startsWith('2001-01-01') ? '2002-01-01' : '2001-01-01')
  await dateInput.press('Escape')
  await dateInput.waitFor({ state: 'detached' })
  assert((await releasedOn.textContent()) === originalDate, 'Escape changed release date.')
  assert(
    (await createdAt.textContent()) === originalCreatedAt,
    'Date edit changed registration time.'
  )

  await row.getByRole('button', { name: `${version.version} 복제` }).click()
  const copyInput = row.getByRole('textbox', { name: `${version.version} 새 버전` })
  await copyInput.fill('9.9.999')
  assert((await copyInput.inputValue()) === '9.9.999', 'Copy target input differs.')
  await row.getByRole('button', { name: `${version.version} 복제 취소` }).click()
  await copyInput.waitFor({ state: 'detached' })
  assert((await page.locator('tbody tr').count()) > 0, 'Cancelled copy removed versions.')

  await row.getByRole('button', { name: `${version.version} 삭제` }).click()
  await row.getByText(`${version.version} 버전 삭제 확인`, { exact: false }).waitFor()
  await row.getByRole('button', { name: `${version.version} 삭제 확인` }).waitFor()
  await row.getByRole('button', { name: `${version.version} 삭제 취소` }).click()
  await row.getByRole('button', { name: `${version.version} 삭제` }).waitFor()
  assert(
    (await releasedOn.textContent()) === originalDate,
    'Cancelled actions changed release date.'
  )
  assert(
    (await createdAt.textContent()) === originalCreatedAt,
    'Cancelled actions changed registration time.'
  )
}

async function verifyDashboardLucideSemantics(page, viewport, theme) {
  await page.getByRole('button', { name: '대시보드' }).click()
  await page.getByRole('heading', { name: '작업할 데이터 버전' }).waitFor()

  const versionContext = page
    .locator('section')
    .filter({ has: page.getByLabel('비교 버전') })
    .first()
  const baseSelect = page.getByLabel('비교 버전')
  const targetSelect = page.getByLabel('현재 버전').last()
  const comparisonArrow = versionContext.locator('svg.lucide-arrow-right:visible')
  const arrowBox = await assertLucideIcon(
    comparisonArrow,
    'arrow-right',
    18,
    `${viewport} ${theme} dashboard comparison`
  )
  const [baseBox, targetBox] = await Promise.all([
    baseSelect.boundingBox(),
    targetSelect.boundingBox()
  ])
  assert(baseBox && targetBox, 'Dashboard version controls have no bounding boxes.')
  const isMobile = viewport === 'mobile-390'
  if (isMobile) {
    assert(
      Math.abs(
        arrowBox.x +
          arrowBox.width / 2 -
          (baseBox.x + baseBox.width / 2 + targetBox.x + targetBox.width / 2) / 2
      ) <= 1,
      `${viewport} ${theme} dashboard ArrowRight is not horizontally centered.`
    )
    assert(
      baseBox.y + baseBox.height < arrowBox.y + arrowBox.height / 2 &&
        arrowBox.y + arrowBox.height / 2 < targetBox.y,
      `${viewport} ${theme} dashboard ArrowRight is not between base and target.`
    )
    assert(
      await comparisonArrow.evaluate(
        (element) =>
          element.classList.contains('rotate-90') || getComputedStyle(element).rotate === '90deg'
      ),
      `${viewport} ${theme} dashboard ArrowRight does not follow stacked flow.`
    )
  } else {
    assert(
      Math.abs(
        arrowBox.x +
          arrowBox.width / 2 -
          (baseBox.x + baseBox.width / 2 + targetBox.x + targetBox.width / 2) / 2
      ) <= 1,
      `${viewport} ${theme} dashboard ArrowRight is not centered base-to-target.`
    )
    assert(
      Math.abs(
        arrowBox.y +
          arrowBox.height / 2 -
          (baseBox.y + baseBox.height / 2 + targetBox.y + targetBox.height / 2) / 2
      ) <= 1,
      `${viewport} ${theme} dashboard ArrowRight is not vertically centered.`
    )
  }

  await verifySelectChevron(baseSelect, `${viewport} ${theme} dashboard base select`, true)
  await verifySelectChevron(targetSelect, `${viewport} ${theme} dashboard target select`, true)
  await verifySelectChevron(
    page.getByLabel('현재 버전').first(),
    `${viewport} ${theme} header compact select`,
    true
  )
  await verifyAccordionIconStates(page, viewport, theme)

  const workflowSteps = [
    '파일 수집',
    '형식 검증',
    '버전 비교',
    '변경 검토',
    'DB 반영',
    '타입 생성'
  ].map((label) => page.getByText(label, { exact: true }).locator('..'))
  for (let index = 0; index < workflowSteps.length - 1; index += 1) {
    const iconBox = await assertLucideIcon(
      workflowSteps[index].locator('svg'),
      'chevron-right',
      16,
      `${viewport} ${theme} workflow step ${index + 1}`
    )
    const [currentMarker, nextMarker] = await Promise.all([
      workflowSteps[index].locator('span').first().boundingBox(),
      workflowSteps[index + 1].locator('span').first().boundingBox()
    ])
    assert(currentMarker && nextMarker, 'Dashboard workflow markers have no bounding boxes.')
    assert(
      Math.abs(
        iconBox.x +
          iconBox.width / 2 -
          (currentMarker.x + currentMarker.width / 2 + nextMarker.x + nextMarker.width / 2) / 2
      ) <= 1,
      `${viewport} ${theme} workflow ChevronRight is not centered between steps.`
    )
    assert(
      Math.abs(iconBox.y + iconBox.height / 2 - (currentMarker.y + currentMarker.height / 2)) <= 1,
      `${viewport} ${theme} workflow ChevronRight is not vertically centered.`
    )
  }

  const quickSection = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: '빠른 작업' }) })
  const quickActions = quickSection.getByRole('button')
  assert((await quickActions.count()) === 3, 'Dashboard must expose three quick actions.')
  const trailingCenters = []
  for (let index = 0; index < 3; index += 1) {
    const button = quickActions.nth(index)
    if (index === 1)
      await assertLucideIcon(
        button.locator('svg.lucide-arrow-right'),
        'arrow-right',
        14,
        `${viewport} ${theme} quick action diff detail`
      )
    const icon = button.locator('svg.lucide-arrow-up-right')
    const baseIconBox = await assertLucideIcon(
      icon,
      'arrow-up-right',
      18,
      `${viewport} ${theme} quick action ${index + 1}`
    )
    const buttonBox = await button.boundingBox()
    assert(buttonBox, 'Quick action has no bounding box.')
    const relativeIconBox = (iconBox, parentBox) => ({
      x: iconBox.x - parentBox.x,
      y: iconBox.y - parentBox.y,
      width: iconBox.width,
      height: iconBox.height
    })
    const baseRelativeBox = relativeIconBox(baseIconBox, buttonBox)
    trailingCenters.push(baseRelativeBox.x + baseRelativeBox.width / 2)
    const baseColor = await icon.evaluate((element) => getComputedStyle(element).color)
    await button.hover()
    await page.waitForTimeout(200)
    const hoverColor = await icon.evaluate((element) => getComputedStyle(element).color)
    assert(
      hoverColor !== baseColor,
      `${viewport} ${theme} quick action has no icon hover contrast.`
    )
    assert(
      rectangleDelta(
        baseRelativeBox,
        relativeIconBox(await icon.boundingBox(), await button.boundingBox())
      ) <= 0.5,
      `${viewport} ${theme} quick action icon shifted within button on hover.`
    )
    await page.mouse.move(0, 0)
    await button.focus()
    const focusColor = await icon.evaluate((element) => getComputedStyle(element).color)
    assert(
      focusColor !== baseColor,
      `${viewport} ${theme} quick action has no icon focus contrast.`
    )
    assert(
      rectangleDelta(
        baseRelativeBox,
        relativeIconBox(await icon.boundingBox(), await button.boundingBox())
      ) <= 0.5,
      `${viewport} ${theme} quick action icon shifted within button on focus.`
    )
    await button.evaluate((element) => element.blur())
  }
  assert(
    Math.max(...trailingCenters) - Math.min(...trailingCenters) <= 0.5,
    `${viewport} ${theme} quick action icons do not keep fixed trailing x.`
  )
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
  const parent = page.getByLabel('주 탐색').getByRole('button', { name: '버전 관리' })
  if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
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
  await page.getByRole('heading', { name: '레코드 미리보기' }).waitFor()
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

async function verifyMobile(page, registered) {
  await page.setViewportSize({ width: 390, height: 844 })
  await verifyVersionNavigation(page, '버전 비교')
  await verifyVersionListInteractions(page, registered, 'mobile-390')
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
    const uploadDirectory = path.join(profileDirectory, '91.72.401')
    await mkdir(uploadDirectory, { recursive: true })
    await writeFile(path.join(uploadDirectory, 'sample.csv'), 'id,name\n1,test\n')
    await electronApp.evaluate(({ dialog }, selectedDirectory) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [selectedDirectory] })
    }, uploadDirectory)
    await page.getByRole('button', { name: '데이터 업로드' }).click()
    await page.getByRole('button', { name: '폴더 선택' }).click()
    await page.getByLabel('연도').waitFor()
    await page.getByRole('button', { name: '대시보드' }).click()
    await verifyVersionList(page, registered, registered.at(-1))
    await verifyVersionListInteractions(page, registered, 'desktop-1480')
    await verifyCancelledActions(
      page,
      registered.find((version) => version.status === 'ready')
    )
    for (const version of allVersions.filter((version) => version.status === 'failed')) {
      assert(
        (await page.locator('tbody tr').filter({ hasText: version.version }).count()) === 0,
        'Failed database version is visible.'
      )
    }
    for (const [viewport, size] of [
      ['desktop-1480', { width: 1480, height: 920 }],
      ['mobile-390', { width: 390, height: 844 }]
    ]) {
      await page.setViewportSize(size)
      for (const theme of ['dark', 'light']) {
        await setTheme(page, theme)
        await verifyDashboardLucideSemantics(page, viewport, theme)
        await verifyReleaseDateSelectStates(page, viewport, theme)
      }
    }
    await page.setViewportSize({ width: 1480, height: 920 })
    await setTheme(page, 'dark')
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
    await verifyMobile(comparePage, registered)
    const versionsAfter = (await findGameDataVersions()).map((version) => ({
      version: version.version,
      environment: version.environment,
      releasedOn: version.releasedOn?.toISOString() ?? null,
      createdAt: version.createdAt.toISOString(),
      status: version.status
    }))
    assert(
      JSON.stringify(versionsAfter) === JSON.stringify(allVersions),
      'Version actions changed database metadata.'
    )
    assert(!restorationIssue, restorationIssue)
    console.log(
      'verified native Electron desktop/mobile icon alignment, stable date overlay geometry, hover/focus, SVG labels/tooltips, Escape cancellation, no project DB mutation, navigation, restoration, comparison, and arrows'
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
