import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { _electron as electron } from 'playwright'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.resolve(currentDirectory, '..')
const repositoryRoot = path.resolve(appDirectory, '../..')
const outputDirectory = path.join(repositoryRoot, 'screenshots', 'playwright', 'electron')
const viewLabels = {
  overview: '대시보드',
  upload: '데이터 업로드',
  'version-list': '리스트',
  compare: '비교',
  equipment: '장비 데이터',
  class: '직업 데이터',
  operations: 'DB · 타입 작업'
}

const viewsWithoutPageTitle = new Set(['overview', 'upload', 'equipment', 'class', 'operations'])

function getTargetViews() {
  if (process.argv.includes('--all')) return Object.keys(viewLabels)

  const viewArgument = process.argv.find((argument) => argument.startsWith('--view='))
  const view = viewArgument?.slice('--view='.length) ?? 'overview'
  if (!(view in viewLabels)) {
    throw new Error(`지원하지 않는 화면입니다: ${view}`)
  }

  return [view]
}

function createTimestamp() {
  return new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

function getTargetTheme() {
  const themeArgument = process.argv.find((argument) => argument.startsWith('--theme='))
  if (!themeArgument) return null

  const theme = themeArgument.slice('--theme='.length)
  if (theme !== 'dark' && theme !== 'light') {
    throw new Error(`지원하지 않는 테마입니다: ${theme}`)
  }

  return theme
}

async function launchElectron(profileDirectory, environment = {}) {
  return electron.launch({
    args: [
      path.join(appDirectory, 'out', 'main', 'index.js'),
      `--user-data-dir=${profileDirectory}`
    ],
    cwd: appDirectory,
    env: {
      ...process.env,
      MAPLE_SCREENSHOT_ROOT: path.join(repositoryRoot, 'screenshots'),
      ...environment
    },
    timeout: 30_000
  })
}

async function getFirstWindow(electronApp, mobile) {
  const page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1480, height: 920 })
  return page
}

async function applyTheme(page, theme) {
  const currentTheme = await page.locator('html').getAttribute('data-theme')
  if (currentTheme === theme) return

  await page.getByRole('button', { name: theme === 'light' ? /라이트/ : /다크/ }).click()
  await page.waitForFunction((expectedTheme) => {
    return document.documentElement.dataset.theme === expectedTheme
  }, theme)
}

async function navigateToView(page, view) {
  const navigation = page.getByRole('navigation', { name: '주 탐색' })
  const nestedView = view === 'version-list' || view === 'compare'
  if (nestedView) {
    const versionNavigation = navigation.getByRole('button', { name: /버전 관리/ })
    if ((await versionNavigation.getAttribute('aria-expanded')) !== 'true') {
      await versionNavigation.click()
    }
  }

  const navigationButton = navigation.getByRole('button', {
    name: viewLabels[view],
    exact: nestedView
  })
  await navigationButton.click()
  await page.waitForFunction(
    ({ label }) =>
      [...document.querySelectorAll('button')].some(
        (button) =>
          button.textContent?.trim().endsWith(label) &&
          button.getAttribute('aria-current') === 'page'
      ),
    { label: viewLabels[view] }
  )
}

async function verifyView(page, view, mobile) {
  if (viewsWithoutPageTitle.has(view)) {
    const pageTitleCount = await page.locator('.page-title').count()
    if (pageTitleCount !== 0) {
      throw new Error(`${view} 화면에 큰 페이지 제목이 남아 있습니다.`)
    }
  }

  if (view === 'version-list') {
    await page.waitForFunction(() => {
      const content = document.body.textContent ?? ''
      return content.includes('등록 버전') || content.includes('버전 목록을 불러오지 못했습니다.')
    })

    const loadFailed = await page
      .getByText('버전 목록을 불러오지 못했습니다.', { exact: true })
      .count()
    if (loadFailed === 0) {
      await page.getByRole('heading', { name: '등록 버전', exact: true, level: 1 }).waitFor()
    }
  }

  if (view === 'compare') {
    const comparison = page
      .getByRole('heading', { name: '비교', exact: true })
      .locator('xpath=../../..')
    const rightPanel = page.getByRole('heading', { name: '필터', exact: true }).locator('..')
    const [comparisonCount, rightPanelCount] = await Promise.all([
      comparison.count(),
      rightPanel.count()
    ])
    const [borderBottomWidth, borderRightWidth] = await Promise.all([
      comparisonCount > 0
        ? comparison.evaluate((element) => getComputedStyle(element).borderBottomWidth)
        : null,
      rightPanelCount > 0
        ? rightPanel.evaluate((element) => getComputedStyle(element).borderRightWidth)
        : null
    ])

    if (borderBottomWidth === '0px' || borderRightWidth === '0px') {
      throw new Error('비교 화면 패널 border 너비가 맞지 않습니다.')
    }

    if (!mobile) {
      const [comparisonBox, rightPanelBox, documentSize] = await Promise.all([
        comparison.boundingBox(),
        rightPanel.boundingBox(),
        page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        }))
      ])

      if (!comparisonBox || !rightPanelBox) {
        throw new Error('비교 화면 geometry를 측정할 수 없습니다.')
      }

      const comparisonRight = comparisonBox.x + comparisonBox.width
      const comparisonBottom = comparisonBox.y + comparisonBox.height
      const rightPanelRight = rightPanelBox.x + rightPanelBox.width
      const rightPanelBottom = rightPanelBox.y + rightPanelBox.height
      if (
        Math.abs(comparisonRight - documentSize.width) > 1 ||
        Math.abs(comparisonBottom - documentSize.height) > 1 ||
        Math.abs(rightPanelRight - comparisonRight) > 1 ||
        Math.abs(rightPanelBottom - comparisonBottom) > 1
      ) {
        throw new Error('비교 화면의 오른쪽 또는 아래쪽 border geometry가 맞지 않습니다.')
      }
    }
  }
}

async function createCancellationFixture(profileDirectory) {
  const directory = path.join(profileDirectory, '1.2.420')
  await mkdir(directory, { recursive: true })

  const rows = Array.from({ length: 100_000 }, (_, index) => `${index},테스트-${index}`)
  await writeFile(path.join(directory, 'large.csv'), `id,name\n${rows.join('\n')}\n`, 'utf8')
  return directory
}

async function verifyCancellationFlow(electronApp, page, fixtureDirectory) {
  await electronApp.evaluate(({ dialog }, selectedDirectory) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [selectedDirectory]
    })
  }, fixtureDirectory)

  await page.getByRole('button', { name: viewLabels.upload }).click()
  await page.getByRole('button', { name: '폴더 선택' }).click()
  await page.getByText('CSV 1개', { exact: true }).waitFor()

  await electronApp.evaluate(({ dialog }) => {
    dialog.showOpenDialog = async () => ({ canceled: true, filePaths: [] })
  })
  await page.getByRole('button', { name: '다른 폴더 선택' }).click()
  await page.getByText(fixtureDirectory, { exact: true }).waitFor()
  console.log('verified cancelling the folder dialog preserves the existing selection')

  await page.getByRole('button', { name: 'CSV 1개 변환' }).click()
  await page.getByText(/CONVERTING/).waitFor()
  await page.getByRole('button', { name: '변환 취소' }).click()
  await page.getByText('CONVERSION CANCELLED').waitFor()
  await page.getByRole('button', { name: 'CSV 1개 변환' }).waitFor()
  console.log('verified renderer responsiveness, cancellation, and retry readiness')
}

async function verifyImportDatabaseFailure(electronApp, page, fixtureDirectory, managedDataRoot) {
  await electronApp.evaluate(({ dialog }, selectedDirectory) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [selectedDirectory]
    })
  }, fixtureDirectory)

  await page.getByRole('button', { name: viewLabels.upload }).click()
  await page.getByRole('button', { name: '폴더 선택' }).click()
  await page.getByRole('button', { name: 'CSV 1개 변환' }).click()
  await page.getByText('CONVERSION FAILED').waitFor({ timeout: 60_000 })
  await page.getByText(/VERSION_IMPORT_FAILED/).waitFor()
  await page.getByRole('button', { name: 'CSV 1개 변환' }).waitFor()

  await access(path.join(fixtureDirectory, 'large.csv'))
  try {
    await access(path.join(managedDataRoot, 'production', '1.2.420'))
    throw new Error('DB 등록 실패 후 부분 버전 디렉터리가 남았습니다.')
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  console.log('verified database import failure preserves the source and removes partial output')
}

async function main() {
  config({ path: path.join(repositoryRoot, 'packages', 'database', 'db', '.env') })
  await mkdir(outputDirectory, { recursive: true })
  const targetTheme = getTargetTheme()
  const mobile = process.argv.includes('--mobile')
  const verifyThemePersistence = process.argv.includes('--verify-theme-persistence')
  const simulateDatabaseFailure = process.argv.includes('--simulate-db-failure')
  const verifyCancellation = process.argv.includes('--verify-cancellation')
  const verifyDatabaseImportFailure = process.argv.includes('--verify-import-db-failure')
  const launchEnvironment =
    simulateDatabaseFailure || verifyCancellation || verifyDatabaseImportFailure
      ? {
          DATABASE_URL:
            'postgresql://invalid:invalid@127.0.0.1:1/invalid?schema=public&connect_timeout=1'
        }
      : {}
  const profileDirectory = await mkdtemp(path.join(tmpdir(), 'maple-electron-playwright-'))
  const managedDataRoot = path.join(profileDirectory, 'managed-data')
  launchEnvironment.MAPLE_DATA_ROOT = managedDataRoot
  const conversionFixture =
    verifyCancellation || verifyDatabaseImportFailure
      ? await createCancellationFixture(profileDirectory)
      : null
  let electronApp

  try {
    electronApp = await launchElectron(profileDirectory, launchEnvironment)
    let page = await getFirstWindow(electronApp, mobile)

    if (simulateDatabaseFailure) {
      const errorNotice = page.getByRole('alert')
      await errorNotice.waitFor({ state: 'visible' })
      const message = await errorNotice.textContent()
      if (!message?.trim()) throw new Error('DB 연결 실패 메시지가 비어 있습니다.')
      console.log('verified database failure remains inside the running app')
    }

    if (conversionFixture && verifyCancellation) {
      await verifyCancellationFlow(electronApp, page, conversionFixture)
    }

    if (conversionFixture && verifyDatabaseImportFailure) {
      await verifyImportDatabaseFailure(electronApp, page, conversionFixture, managedDataRoot)
    }

    if (targetTheme) await applyTheme(page, targetTheme)

    if (targetTheme && verifyThemePersistence) {
      await electronApp.close()
      electronApp = await launchElectron(profileDirectory, launchEnvironment)
      page = await getFirstWindow(electronApp, mobile)

      const persistedTheme = await page.locator('html').getAttribute('data-theme')
      if (persistedTheme !== targetTheme) {
        throw new Error(`테마 유지 실패: expected ${targetTheme}, received ${persistedTheme}`)
      }
      console.log(`verified ${targetTheme} theme persistence after app restart`)
    }

    const timestamp = createTimestamp()
    for (const view of getTargetViews()) {
      await navigateToView(page, view)
      await verifyView(page, view, mobile)

      const labels = [
        targetTheme ?? 'current',
        simulateDatabaseFailure ? 'db-failure' : null,
        mobile ? 'mobile' : null
      ]
        .filter(Boolean)
        .join('-')
      const outputPath = path.join(outputDirectory, `${timestamp}-${labels}-${view}.png`)
      await page.screenshot({ path: outputPath, fullPage: true })
      console.log(`captured ${path.relative(repositoryRoot, outputPath)}`)
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
