import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const url = 'http://localhost:5173'
const issueCodes = [
  'UNCLASSIFIED_JOB_ID',
  'DUMMY_JOB_ID',
  'SKILL_GROUP_JOB_ID',
  'SYSTEM_JOB_ID',
  'AMBIGUOUS_JOB_ID',
  'EMPTY_EVAN_SIXTH_JOB_NAME'
]

function startRenderer() {
  const script = `
    import { resolveConfig } from 'electron-vite'
    import { createServer } from 'vite'
    const loaded = await resolveConfig({}, 'serve', 'development')
    const server = await createServer(loaded.config.renderer)
    await server.listen()
  `
  const child = spawn('node', ['--input-type=module', '--eval', script], {
    cwd: appDirectory,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  child.stdout.on('data', (chunk) => (output += chunk))
  child.stderr.on('data', (chunk) => (output += chunk))
  return { child, output: () => output }
}

async function waitForRenderer(renderer) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (renderer.child.exitCode !== null) throw new Error(renderer.output())
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // Renderer is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Renderer did not start.\n${renderer.output()}`)
}

async function installMock(context) {
  await context.addInitScript((codes) => {
    const version = '1.2.420'
    const makeIssues = () =>
      codes.map((code, index) => ({
        id: `classification-${index}`,
        validator: 'class.job-definition',
        source: 'domain',
        domain: 'class',
        severity: 'warning',
        code,
        message: `${code} representative warning`,
        location: {
          file: 'json/ms_job.json',
          record: index,
          field: code === 'EMPTY_EVAN_SIXTH_JOB_NAME' ? 'jobName' : 'jobID'
        },
        value: { before: code === 'EMPTY_EVAN_SIXTH_JOB_NAME' ? '' : String(index) }
      }))
    let issues = makeIssues()
    const report = (sessionId = 'mock-session') => ({
      sessionId,
      version,
      environment: 'production',
      workspacePath: '/mock/classification-validation',
      status: 'review',
      publishable: false,
      summary: {
        files: 1,
        records: 6,
        errors: 0,
        warnings: issues.length,
        unresolvedWarnings: issues.filter((issue) => !issue.acknowledgement?.acknowledged).length
      },
      files: [
        {
          file: 'json/ms_job.json',
          domain: 'class',
          records: 6,
          errors: 0,
          warnings: issues.length
        }
      ],
      issues: structuredClone(issues)
    })
    const noop = () => () => {}

    window.api = {
      listRegisteredDataVersions: async () => [
        {
          version,
          environment: 'production',
          releasedOn: '2026-10-01',
          createdAt: '2026-10-01T00:00:00.000Z',
          status: 'ready'
        }
      ],
      validateDataVersion: async ({ sessionId }) => {
        issues = makeIssues()
        return { status: 'success', validation: report(sessionId) }
      },
      updateDataValidationWarning: async ({ issueId, acknowledged, exceptionReason }) => {
        issues = issues.map((issue) =>
          issue.id === issueId
            ? { ...issue, acknowledgement: { acknowledged, exceptionReason } }
            : issue
        )
        const { sessionId: _, ...update } = report()
        return update
      },
      cancelDataValidation: async () => true,
      onDataValidationProgress: noop,
      onDataDirectoryConversionProgress: noop,
      listJobData: async () => ({
        jobs: [{ jobId: '100', jobName: '히어로' }],
        weaponTypes: [],
        drafts: []
      }),
      openRawDataDiff: async ({ baseVersion, compareVersion, filename }) => ({
        baseVersion,
        compareVersion,
        filename,
        inputHash: 'mock',
        add: [],
        modify: [],
        delete: []
      }),
      captureScreenshot: async () => ({ path: '', createdAt: '' }),
      onScreenshotCaptured: noop
    }
  }, issueCodes)
}

async function navigate(page, name) {
  await page.getByRole('navigation', { name: '주 탐색' }).getByRole('button', { name }).click()
}

async function verifyViewport(page, viewport) {
  await page.setViewportSize(viewport)
  await page.goto(url)
  await page.getByRole('navigation', { name: '주 탐색' }).waitFor()
  await navigate(page, 'DB · 타입 작업')
  await page.getByText('VALIDATION · 1.2.420', { exact: true }).waitFor()
  await page.getByRole('button', { name: '현재 버전 검증' }).click()
  try {
    await page.getByText('검토가 필요한 작업본', { exact: true }).waitFor()
  } catch (error) {
    throw new Error(`${error.message}\n${(await page.locator('body').innerText()).slice(0, 1_000)}`)
  }
  await page.getByText('파일 1 · 레코드 6 · 오류 0 · 경고 6', { exact: true }).waitFor()

  const details = page.locator('details').filter({ hasText: '오류 및 경고 6개' })
  await details.locator('summary').click()
  for (const code of issueCodes) {
    await details.getByText(`[${code}]`, { exact: true }).waitFor()
  }

  const firstWarning = details.locator('li').first()
  await firstWarning.getByLabel('예외 사유 (선택)').fill('mock browser acknowledgement')
  await firstWarning.getByRole('button', { name: '경고 확인' }).click()
  await firstWarning.getByText('확인됨 · mock browser acknowledgement', { exact: true }).waitFor()

  await navigate(page, '직업 데이터')
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
  await navigate(page, 'DB · 타입 작업')
  await page.getByText('VALIDATION · 1.2.420', { exact: true }).waitFor()
  await page.getByRole('button', { name: '현재 버전 검증' }).waitFor()
}

async function stopRenderer(renderer) {
  renderer.child.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => renderer.child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000))
  ])
  if (renderer.child.exitCode === null) renderer.child.kill('SIGKILL')
}

async function main() {
  const renderer = startRenderer()
  let browser
  try {
    await waitForRenderer(renderer)
    browser = await chromium.launch()
    const context = await browser.newContext()
    await installMock(context)
    const page = await context.newPage()
    page.on('pageerror', (error) => console.error('renderer page error:', error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') console.error('renderer console error:', message.text())
    })
    await verifyViewport(page, { width: 1480, height: 920 })
    await verifyViewport(page, { width: 390, height: 844 })
    console.log(
      'verified mocked job classification warnings at desktop 1480x920 and mobile 390x844'
    )
  } finally {
    await browser?.close()
    await stopRenderer(renderer)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
