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
  compare: '버전 비교',
  equipment: '장비 데이터',
  class: '직업 데이터',
  operations: 'DB · 타입 작업'
}

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

async function getFirstWindow(electronApp) {
  const page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize({ width: 1480, height: 920 })
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
    let page = await getFirstWindow(electronApp)

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
      page = await getFirstWindow(electronApp)

      const persistedTheme = await page.locator('html').getAttribute('data-theme')
      if (persistedTheme !== targetTheme) {
        throw new Error(`테마 유지 실패: expected ${targetTheme}, received ${persistedTheme}`)
      }
      console.log(`verified ${targetTheme} theme persistence after app restart`)
    }

    const timestamp = createTimestamp()
    for (const view of getTargetViews()) {
      if (view !== 'overview') {
        await page.getByRole('button', { name: viewLabels[view] }).click()
      }

      const labels = [targetTheme ?? 'current', simulateDatabaseFailure ? 'db-failure' : null]
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
