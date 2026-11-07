import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = path.resolve(appDirectory, '../..')
const outputDirectory = path.join(repositoryRoot, 'screenshots', 'playwright', 'electron')
const url = 'http://localhost:5173'

function startRenderer() {
  const serverScript = `
    import { resolveConfig } from 'electron-vite'
    import { createServer } from 'vite'
    const loaded = await resolveConfig({}, 'serve', 'development')
    const server = await createServer(loaded.config.renderer)
    await server.listen()
    server.printUrls()
  `
  const child = spawn('node', ['--input-type=module', '--eval', serverScript], {
    cwd: appDirectory,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  child.stdout.on('data', (chunk) => (output += chunk))
  child.stderr.on('data', (chunk) => (output += chunk))
  return { child, output: () => output }
}

async function waitForRenderer(process) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (process.child.exitCode !== null) throw new Error(process.output())
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Renderer did not start.\n${process.output()}`)
}

async function installMock(context) {
  await context.addInitScript(() => {
    const versions = ['1.2.420', '1.2.419', '1.2.418']
    const jobs = [
      { jobId: '100', jobName: '히어로' },
      { jobId: '200', jobName: '아크메이지(불,독)' },
      { jobId: '400', jobName: '나이트로드' },
      ...Array.from({ length: 24 }, (_, index) => ({
        jobId: String(1000 + index),
        jobName: `테스트 직업 ${String(index + 1).padStart(2, '0')}`
      }))
    ]
    const initialDrafts = [
      {
        jobId: '100',
        jobName: '히어로',
        englishName: 'Hero',
        classGroup: '전사',
        affiliation: '모험가',
        mainStat: 'STR',
        subStat: 'DEX',
        primaryWeapons: ['sword'],
        secondaryWeapons: ['medallion'],
        newWeaponTypes: [],
        revision: 1
      },
      {
        jobId: '200',
        jobName: '아크메이지(불,독)',
        englishName: 'Arch Mage Fire Poison',
        classGroup: '마법사',
        affiliation: '모험가',
        mainStat: 'INT',
        subStat: 'LUK',
        primaryWeapons: ['staff'],
        secondaryWeapons: [],
        newWeaponTypes: [],
        revision: 1
      },
      {
        jobId: '400',
        jobName: '나이트로드',
        englishName: 'Night Lord',
        classGroup: '도적',
        affiliation: '모험가',
        mainStat: 'LUK',
        subStat: 'DEX',
        primaryWeapons: [],
        secondaryWeapons: [],
        newWeaponTypes: [],
        revision: 1
      }
    ]
    const weaponTypes = [
      {
        key: 'sword',
        category: 'weapon',
        part: '한손검',
        classGroupKeys: ['warrior'],
        handType: 'oneHanded',
        weaponConstant: '1.2'
      },
      {
        key: 'staff',
        category: 'weapon',
        part: '스태프',
        classGroupKeys: ['mage'],
        handType: 'twoHanded',
        weaponConstant: '1.0'
      },
      {
        key: 'medallion',
        category: 'subWeapon',
        part: '메달',
        classGroupKeys: ['warrior'],
        handType: null,
        weaponConstant: null
      }
    ]
    const storageKey = 'job-playwright-drafts'
    const readStore = () =>
      JSON.parse(localStorage.getItem(storageKey) || 'null') ||
      Object.fromEntries(versions.map((version) => [version, structuredClone(initialDrafts)]))
    const writeStore = (store) => localStorage.setItem(storageKey, JSON.stringify(store))
    if (!localStorage.getItem(storageKey)) writeStore(readStore())
    const control = (window.__jobMock = {
      failVersion: '',
      failNextSave: false,
      screenshotCount: 0
    })
    const noop = () => () => {}

    window.api = {
      listRegisteredDataVersions: async () =>
        versions.map((version) => ({
          version,
          environment: 'production',
          releasedOn: '2026-10-01',
          createdAt: '2026-10-01T00:00:00.000Z',
          status: 'ready'
        })),
      listDataVersions: async () => versions,
      listJobData: async (version) => {
        if (control.failVersion === version) {
          throw new Error('Mock job list failure')
        }
        return {
          jobs: version === '1.2.420' ? jobs : jobs.slice(0, 2),
          weaponTypes,
          drafts: readStore()[version] || []
        }
      },
      saveJobDraft: async ({ version, draft }) => {
        if (control.failNextSave) {
          control.failNextSave = false
          throw new Error('Mock draft save failure')
        }
        const store = readStore()
        const current = (store[version] || []).find((candidate) => candidate.jobId === draft.jobId)
        const expectedRevision = current?.revision || 0
        if (draft.revision !== expectedRevision)
          throw new Error('Mock optimistic revision conflict')
        const saved = structuredClone({ ...draft, revision: expectedRevision + 1 })
        store[version] = [
          ...(store[version] || []).filter((candidate) => candidate.jobId !== saved.jobId),
          saved
        ]
        writeStore(store)
        return saved
      },
      openRawDataDiff: async ({ baseVersion, compareVersion, filename }) => ({
        baseVersion,
        compareVersion,
        filename,
        inputHash: `mock-${baseVersion}`,
        add:
          baseVersion === '1.2.419'
            ? [{ jobID: '650', jobName: '렌' }]
            : [{ jobID: '550', jobName: '칼리' }],
        modify: [],
        delete: []
      }),
      listComparableFiles: async () => ['ms_job.json'],
      compareRawData: async ({ baseVersion, compareVersion, filename }) => ({
        baseVersion,
        compareVersion,
        filename,
        inputHash: 'mock',
        add: [],
        modify: [],
        delete: []
      }),
      saveRawDataDiff: async (request) => ({
        status: 'created',
        result: await window.api.compareRawData(request)
      }),
      openDataDirectory: async () => null,
      convertDataDirectory: async () => {
        throw new Error('Mock conversion unavailable')
      },
      cancelDataFileConversion: async () => true,
      onDataDirectoryConversionProgress: noop,
      validateDataVersion: async () => {
        throw new Error('Mock validation unavailable')
      },
      cancelDataValidation: async () => true,
      updateDataValidationWarning: async () => {
        throw new Error('Mock warning unavailable')
      },
      onDataValidationProgress: noop,
      captureScreenshot: async () => {
        control.screenshotCount += 1
        return {
          path: `/mock/screenshots/job-data-${control.screenshotCount}.png`,
          capturedAt: `2026-11-07T00:00:0${control.screenshotCount}.000Z`
        }
      },
      onScreenshotCaptured: noop,
      updateDataVersionReleaseDate: async () => {},
      copyDataVersion: async () => {},
      deleteDataVersion: async () => {}
    }
  })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function navigate(page, name, exact = false) {
  const navigation = page.getByRole('navigation', { name: '주 탐색' })
  const parentName = {
    리스트: '버전 관리',
    비교: '버전 관리',
    '직업 정보': '직업 데이터',
    에디터: '직업 데이터'
  }[name]
  if (parentName) {
    const parent = navigation.getByRole('button', { name: parentName })
    if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click()
  }
  const button = navigation.getByRole('button', { name, exact })
  await button.click()
  await page.waitForFunction(
    (element) => element.getAttribute('aria-current') === 'page',
    await button.elementHandle()
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

async function verifyJobFlow(page) {
  await navigate(page, '직업 정보')
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()

  const jobList = page.getByRole('button', { name: '히어로', exact: true }).locator('..')
  const scrollState = await jobList.evaluate((element) => {
    const style = getComputedStyle(element)
    element.scrollTop = element.scrollHeight
    return {
      clientHeight: element.clientHeight,
      overflowY: style.overflowY,
      scrollbarWidth: style.scrollbarWidth,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop
    }
  })
  assert(
    scrollState.scrollHeight > scrollState.clientHeight && scrollState.scrollTop > 0,
    'Job list did not scroll.'
  )
  assert(['auto', 'scroll'].includes(scrollState.overflowY), 'Job list overflow is not scrollable.')
  assert(scrollState.scrollbarWidth === 'none', 'Job list scrollbar is not hidden.')
  await jobList.evaluate((element) => {
    element.scrollTop = 0
  })

  const classFilter = page.getByRole('group', { name: '직업군' })
  const affiliationFilter = page.getByRole('group', { name: '소속' })
  const mageFilter = classFilter.getByRole('checkbox', { name: '마법사' })
  const adventurerFilter = affiliationFilter.getByRole('checkbox', { name: '모험가' })
  await mageFilter.check()
  await adventurerFilter.check()
  await page.getByRole('button', { name: '아크메이지(불,독)' }).waitFor()
  assert(
    (await page.getByRole('button', { name: '히어로', exact: true }).count()) === 0,
    'Multi-filter kept non-matching job.'
  )
  await page.getByRole('button', { name: '초기화' }).click()
  assert(!(await mageFilter.isChecked()) && !(await adventurerFilter.isChecked()), 'Reset failed.')
  await page.getByRole('button', { name: '히어로', exact: true }).waitFor()
  await page.getByRole('button', { name: '나이트로드', exact: true }).waitFor()
  await page.getByPlaceholder('직업명 검색...').fill('fire poison')
  await page.getByRole('button', { name: '아크메이지(불,독)' }).click()
  await page.getByRole('heading', { name: '아크메이지(불,독)', level: 1 }).waitFor()
  await page.getByPlaceholder('직업명 검색...').fill('')

  const detail = page.locator('main section').first()
  const beforeHeights = await detail
    .locator('dl > div')
    .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
  assert(
    beforeHeights.length === 7 && beforeHeights.every((height) => height === 56),
    `Unexpected basic-info row heights: ${beforeHeights.join(',')}`
  )
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  const afterHeights = await detail
    .locator('dl > div')
    .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
  assert(
    JSON.stringify(afterHeights) === JSON.stringify(beforeHeights),
    'Inline edit shifted rows.'
  )
  await page.getByRole('button', { name: '편집 취소' }).click()

  const tabs = page.getByRole('tablist', { name: '직업 상세 탭' })
  for (const name of ['기본 정보', '전직 정보', '스킬 정보', '링크 스킬', '기타 데이터']) {
    const tab = tabs.getByRole('tab', { name })
    await tab.click()
    assert((await tab.getAttribute('aria-selected')) === 'true', `${name} tab did not activate.`)
    if (name !== '기본 정보')
      assert((await detail.locator('dl').count()) === 0, `${name} is not empty.`)
  }
  await tabs.getByRole('tab', { name: '기본 정보' }).click()

  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  await page.getByLabel('영문 이름').fill('Unsaved Mage')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: '히어로', exact: true }).click()
  await page.getByRole('heading', { name: '아크메이지(불,독)', level: 1 }).waitFor()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '히어로', exact: true }).click()
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()

  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  await page.getByLabel('영문 이름').fill('Hero Applied')
  await page.getByRole('button', { name: '작업본에 적용' }).click()
  await page.getByText('Hero Applied', { exact: true }).waitFor()

  await page.getByRole('button', { name: '히어로 전체 편집' }).click()
  await page.getByText(/저장됨 · revision/).waitFor()
  const primary = page.getByRole('heading', { name: '주무기' }).locator('../..')
  await primary.getByRole('button', { name: /새 무기 유형 등록/ }).click()
  await primary.getByLabel('부위').fill('테스트 블레이드')
  await primary.getByLabel('영문 이름').fill('Test Blade')
  await primary.getByLabel('한손/두손').selectOption('oneHanded')
  await primary.getByLabel('무기 상수').fill('1.3')
  await primary.getByRole('button', { name: '전사' }).click()
  await primary.getByRole('button', { name: '작업본에 옵션 추가' }).click()
  const stagedLabel = page.getByText('테스트 블레이드', { exact: true })
  await stagedLabel.first().waitFor()
  await page.getByText(/저장됨 · revision [3-9]/).waitFor({ timeout: 5_000 })
  await page.reload()
  await navigate(page, '직업 정보')
  await page.getByRole('button', { name: '히어로 전체 편집' }).click()
  await page.getByText('테스트 블레이드', { exact: true }).waitFor()

  await page.evaluate(() => {
    window.__jobMock.failNextSave = true
  })
  await page.getByLabel('영문 이름').fill('Hero Retry')
  await page
    .getByRole('alert')
    .filter({ hasText: 'Mock draft save failure' })
    .waitFor({ timeout: 5_000 })
  await page.getByRole('button', { name: '저장하기' }).click()
  await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
  await page.getByRole('button', { name: '목록으로' }).click()

  const notice = page.getByRole('button', { name: /새 직업 알림/ })
  await notice.click()
  await page.getByRole('button', { name: '1.2.418 → 1.2.420' }).click()
  await page.getByRole('button', { name: /칼리/ }).click()
  await page.getByText('기준 버전에 없던 신규 직업입니다.').waitFor()
  await page.getByRole('button', { name: '1.2.419 → 1.2.420' }).click()
  await page.getByRole('button', { name: /렌/ }).click()
  await page.getByRole('button', { name: 'ID와 이름으로 편집 시작' }).click()
  await page.getByRole('heading', { name: '렌', level: 1 }).waitFor()
  await page.getByLabel('영문 이름').fill('Ren')
  await page.getByLabel('직업군').selectOption('전사')
  await page.getByLabel('소속').selectOption('아니마')
  await page.getByLabel('주스탯').selectOption('STR')
  await page.getByLabel('부스탯').selectOption('DEX')
  await page.getByText(/저장됨 · revision 1/).waitFor({ timeout: 5_000 })
  await page.reload()
  await navigate(page, '직업 정보')
  await page.getByRole('button', { name: '렌', exact: true }).click()
  await page.getByRole('button', { name: '렌 전체 편집' }).click()
  if ((await page.getByLabel('영문 이름').inputValue()) !== 'Ren')
    throw new Error('New-job draft did not reload')

  await page.getByRole('button', { name: '목록으로' }).click()
  await navigate(page, '대시보드')
  const errorVersion = await page.getByLabel('현재 버전').first().inputValue()
  await page.evaluate((version) => {
    window.__jobMock.failVersion = version
  }, errorVersion)
  await navigate(page, '직업 정보')
  await page.getByRole('alert').filter({ hasText: 'Mock job list failure' }).waitFor()
  await page.evaluate(() => {
    window.__jobMock.failVersion = ''
  })
  await navigate(page, '대시보드')
  await navigate(page, '직업 정보')
  await page.getByRole('heading', { name: /히어로|렌/, level: 1 }).waitFor()
}

async function verifyEditorPicker(page) {
  await navigate(page, '에디터')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
  await page.getByRole('button', { name: /히어로\s*100/ }).click()
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
  await page.getByRole('button', { name: '목록으로' }).click()
  await page.getByRole('button', { name: '기본 정보 수정' }).waitFor()
}

async function verifyScreenshotNotifications(page) {
  const capture = page.getByRole('button', { name: '전체 스크린샷 Ctrl+Shift+S' })
  await capture.click()
  await page.getByRole('button', { name: '알림, 읽지 않음 1개' }).waitFor()
  await capture.click()
  await page.getByRole('button', { name: '알림, 읽지 않음 2개' }).waitFor()
  assert(
    (await page.getByRole('status').filter({ hasText: '스크린샷 저장 완료' }).count()) === 0,
    'Screenshot capture rendered a green status banner.'
  )

  await navigate(page, '에디터')
  await page.getByRole('button', { name: '알림, 읽지 않음 2개' }).click()
  const center = page.getByRole('region', { name: '전체 알림' })
  await center.waitFor()
  assert(
    (await center.getByText('스크린샷 저장 완료', { exact: true }).count()) === 2,
    'Notifications did not persist across route change.'
  )
  await center.getByText('/mock/screenshots/job-data-1.png', { exact: true }).waitFor()
  await center.getByText('/mock/screenshots/job-data-2.png', { exact: true }).waitFor()
  const timestamps = await center.locator('time').allTextContents()
  assert(
    timestamps.length === 2 && new Set(timestamps).size === 2,
    'Capture timestamps are not distinct.'
  )
  await page.getByRole('button', { name: '알림', exact: true }).waitFor()
  await center.getByRole('button', { name: '스크린샷 저장 완료 알림 지우기' }).first().click()
  assert(
    (await center.getByText('스크린샷 저장 완료', { exact: true }).count()) === 1,
    'Single notification clear failed.'
  )
  await center.getByRole('button', { name: '모두 지우기' }).click()
  await center.getByText('새 알림이 없습니다.', { exact: true }).waitFor()
}

async function verifyRelatedRoutes(page) {
  for (const size of [
    { width: 1480, height: 920 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(size)
    for (const theme of ['dark', 'light']) {
      await setTheme(page, theme)
      await navigate(page, '직업 정보')
      await page.getByRole('heading', { name: /히어로|렌/, level: 1 }).waitFor()
      await navigate(page, '에디터')
      await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
      await page.getByRole('button', { name: /히어로\s*100/ }).click()
      await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
      assert(
        (await page.locator('html').getAttribute('data-theme')) === theme,
        'Theme changed on route.'
      )
      await page.getByRole('button', { name: '목록으로' }).click()
      await page.getByRole('button', { name: '기본 정보 수정' }).waitFor()
    }
  }
}

async function verifyRouteRegression(page) {
  for (const name of [
    '대시보드',
    '데이터 업로드',
    '리스트',
    '비교',
    '장비 데이터',
    'DB · 타입 작업',
    '직업 정보',
    '에디터'
  ]) {
    await navigate(page, name)
  }
}

async function main() {
  await mkdir(outputDirectory, { recursive: true })
  const renderer = startRenderer()
  let browser
  try {
    await waitForRenderer(renderer)
    browser = await chromium.launch()
    const context = await browser.newContext({ viewport: { width: 1480, height: 920 } })
    await installMock(context)
    const page = await context.newPage()
    page.on('pageerror', (error) => console.error('renderer page error:', error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') console.error('renderer console error:', message.text())
    })
    await page.goto(url)
    if ((await page.getByRole('navigation', { name: '주 탐색' }).count()) === 0) {
      throw new Error(
        `Renderer shell missing at ${page.url()}: ${(await page.locator('body').innerText()).slice(0, 500)}`
      )
    }
    await verifyEditorPicker(page)
    await verifyScreenshotNotifications(page)
    await verifyJobFlow(page)
    await verifyRouteRegression(page)
    await page.setViewportSize({ width: 1480, height: 920 })
    await setTheme(page, 'dark')
    await navigate(page, '직업 정보')
    await page.screenshot({
      path: path.join(outputDirectory, 'job-data-e2e-desktop.png'),
      fullPage: true
    })
    await verifyRelatedRoutes(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await setTheme(page, 'light')
    await navigate(page, '직업 정보')
    await page.getByRole('heading', { name: /히어로|렌/, level: 1 }).waitFor()
    await page.screenshot({
      path: path.join(outputDirectory, 'job-data-e2e-mobile.png'),
      fullPage: true
    })
    console.log(
      'verified mocked job renderer flow, routes, themes, notifications, desktop 1480x920, and mobile 390x844'
    )
  } finally {
    await browser?.close()
    renderer.child.kill('SIGTERM')
    await Promise.race([
      new Promise((resolve) => renderer.child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 2_000))
    ])
    if (renderer.child.exitCode === null) renderer.child.kill('SIGKILL')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
