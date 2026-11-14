import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.resolve(appDirectory, '../../screenshots/playwright/electron')
const url = 'http://localhost:5173'

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
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  child.stdout.on('data', (chunk) => (output += chunk))
  child.stderr.on('data', (chunk) => (output += chunk))
  return { child, output: () => output }
}

async function waitForRenderer(server) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.child.exitCode !== null) throw new Error(server.output())
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // The renderer is starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Renderer did not start: ${server.output()}`)
}

async function installMock(context) {
  await context.addInitScript(() => {
    let imagesExtracted = false
    const iconData =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Y+0AAAAASUVORK5CYII='
    const advancements = [
      {
        stage: 0,
        jobId: '0',
        jobName: '모험의 기술',
        displayName: '초보자',
        requiresReview: false
      },
      { stage: 1, jobId: '100', jobName: '검사', requiresReview: false },
      { stage: 2, jobId: '110', jobName: '파이터', requiresReview: false },
      { stage: 3, jobId: '111', jobName: '크루세이더', requiresReview: false },
      { stage: 4, jobId: '112', jobName: '히어로', requiresReview: false }
    ]
    const jobs = advancements.map(({ jobId, jobName }) => ({ jobId, jobName }))
    const skills = [
      {
        skillId: '1001000',
        jobId: '100',
        skillName: '파워 스트라이크',
        skillDesc: '적을 공격한다.',
        maxLevel: 20,
        invisible: false,
        hyper: null,
        reqSkill: null,
        reqSkillLevel: null,
        reqLevel: 10
      },
      {
        skillId: '1101000',
        jobId: '110',
        skillName: '브랜디쉬',
        skillDesc: '전방의 적을 공격한다.',
        maxLevel: 20,
        invisible: false,
        hyper: null,
        reqSkill: null,
        reqSkillLevel: null,
        reqLevel: 30
      },
      {
        skillId: '1121000',
        jobId: '112',
        skillName: '메이플 용사',
        skillDesc: null,
        maxLevel: 30,
        invisible: false,
        hyper: 0,
        reqSkill: null,
        reqSkillLevel: null,
        reqLevel: 100
      },
      {
        skillId: '1121400',
        jobId: '112',
        skillName: '하이퍼 테스트 스킬',
        skillDesc: null,
        maxLevel: 1,
        invisible: false,
        hyper: 1,
        reqSkill: null,
        reqSkillLevel: null,
        reqLevel: 140
      },
      ...Array.from({ length: 12 }, (_, index) => ({
        skillId: String(1200000 + index),
        jobId: '0',
        skillName: index < 10 ? `기본 스킬 ${index}` : `길이가 다른 기본 스킬 ${index}`,
        skillDesc: null,
        maxLevel: 1,
        invisible: false,
        hyper: null,
        reqSkill: null,
        reqSkillLevel: null,
        reqLevel: 0
      }))
    ]
    const noop = () => () => {}
    window.api = {
      listRegisteredDataVersions: async () => [
        {
          version: '1.2.419',
          environment: 'production',
          status: 'ready',
          releasedOn: null,
          createdAt: '2026-11-14T00:00:00Z'
        }
      ],
      listDataVersions: async () => ['1.2.419'],
      listJobData: async () => ({
        jobs,
        jobGroups: [
          {
            classKey: 'hero',
            representativeJobId: '112',
            representativeName: '히어로',
            advancements
          }
        ],
        weaponTypes: [],
        drafts: [],
        changeSetId: null,
        editorAvailable: false
      }),
      listSkillData: async ({ jobIds }) => skills.filter((skill) => jobIds.includes(skill.jobId)),
      listSkillLevels: async ({ skillId }) =>
        skillId === '1101000' || skillId === '1121000'
          ? Array.from({ length: skillId === '1121000' ? 32 : 22 }, (_, index) => ({
              level: index + 1,
              levelDesc: `데미지 ${index + 11}%, MP 10 소비`
            }))
          : [],
      listSkillImages: async ({ identities }) =>
        identities.map((identity) => ({
          ...identity,
          icon: identity.skillId === '1001000' || imagesExtracted ? iconData : null,
          iconMouseOver: identity.skillId === '1001000' ? iconData : null,
          iconDisabled: identity.skillId === '1001000' ? iconData : null
        })),
      extractSkillImages: async () => {
        imagesExtracted = true
        return { jobs: 5, created: 12, reused: 3, missing: 0, failed: 0, missingJobs: 0 }
      },
      openRawDataDiff: async () => null,
      onDataDirectoryConversionProgress: noop,
      onDataValidationProgress: noop,
      onScreenshotCaptured: noop,
      captureScreenshot: async () => ({ path: '/mock.png', capturedAt: '' })
    }
  })
}

async function main() {
  const server = startRenderer()
  let browser
  try {
    await waitForRenderer(server)
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 1480, height: 920 } })
    await installMock(context)
    const page = await context.newPage()
    await page.goto(url)
    await page.getByRole('button', { name: '스킬 데이터' }).click()
    await page.getByRole('button', { name: '스킬 목록', exact: true }).click()
    await page.getByText('브랜디쉬', { exact: true }).waitFor()
    await page.locator('tbody tr').first().locator('img').waitFor()
    if ((await page.locator('aside[aria-label="스킬 상세"] img').count()) !== 3)
      throw new Error('Selected skill did not show all three icon variants')
    await page.getByRole('button', { name: '이미지 추출 및 등록' }).click()
    await page.getByText('5개 전직 처리 · 새 이미지 12개').waitFor()
    await page.locator('tbody tr').nth(1).locator('img').waitFor()
    if ((await page.getByRole('row').count()) !== 11) throw new Error('Skill rows did not load')
    const headers = await page.getByRole('columnheader').allTextContents()
    if (
      headers.map((header) => header.trim()).join('|') !==
      '스킬 ID|아이콘|스킬명|차수 · 직업|타입|최대 레벨'
    )
      throw new Error('Skill columns do not match the requested order')
    const alignment = await page
      .locator('tbody tr')
      .first()
      .locator('td')
      .evaluateAll((cells) =>
        [1, 4, 5].map((index) => ({
          align: getComputedStyle(cells[index]).textAlign,
          rightPadding: getComputedStyle(cells[index]).paddingRight
        }))
      )
    if (alignment.some(({ align, rightPadding }) => align !== 'center' || rightPadding !== '0px'))
      throw new Error('Icon, type, or max level alignment changed')

    await page.locator('tbody tr').nth(1).focus()
    await page.keyboard.press('Enter')
    await page.locator('aside[aria-label="스킬 상세"] strong').first().getByText('브랜디쉬').waitFor()

    await page.getByRole('button', { name: '0차', exact: true }).click()
    await page.getByText('0차 · 초보자', { exact: true }).first().waitFor()
    const headerPositions = async () =>
      page
        .getByRole('columnheader')
        .evaluateAll((headers) =>
          headers.map((header) => Math.round(header.getBoundingClientRect().left))
        )
    const firstPagePositions = await headerPositions()
    await page.getByRole('button', { name: '다음' }).click()
    await page.getByText('길이가 다른 기본 스킬 10', { exact: true }).waitFor()
    const secondPagePositions = await headerPositions()
    if (JSON.stringify(firstPagePositions) !== JSON.stringify(secondPagePositions))
      throw new Error('Skill table columns shifted between pages')

    const heroGroup = page.getByRole('button', { name: '히어로', exact: true })
    await heroGroup.click()
    if ((await heroGroup.getAttribute('aria-expanded')) !== 'false')
      throw new Error('Selected job group did not collapse')
    if (await page.locator('#skill-job-112').isVisible())
      throw new Error('Collapsed job stages remain visible')
    await heroGroup.click()
    if ((await heroGroup.getAttribute('aria-expanded')) !== 'true')
      throw new Error('Selected job group did not expand')

    await page.getByRole('button', { name: '2차', exact: true }).click()
    await page.waitForFunction(() => document.querySelectorAll('tr').length === 2)
    if ((await page.getByRole('row').count()) !== 2) throw new Error('Stage filter did not apply')
    await page.getByRole('row', { name: /브랜디쉬/ }).locator('td').nth(1).click()
    await page.getByText('1/20 스킬 정보').waitFor()
    await page.getByRole('button', { name: '레벨 올리기' }).click()
    await page.getByText('2/20 스킬 정보').waitFor()
    if ((await page.getByText('12%', { exact: true }).count()) === 0)
      throw new Error('Changed level text was not highlighted')
    await page.getByRole('button', { name: '마스터하기' }).click()
    await page.getByText('20/20 스킬 정보').waitFor()
    await page.getByRole('button', { name: '레벨 올리기' }).click()
    await page.getByText('21/20 스킬 정보').waitFor()
    await page.getByRole('button', { name: '하이퍼', exact: true }).click()
    await page.locator('tbody').getByText('하이퍼 테스트 스킬', { exact: true }).waitFor()
    if ((await page.locator('tbody tr').count()) !== 1) throw new Error('Hyper filter included a normal skill')
    await page.getByRole('button', { name: '4차', exact: true }).click()
    await page.locator('tbody').getByText('메이플 용사', { exact: true }).waitFor()
    if ((await page.locator('tbody tr').count()) !== 1) throw new Error('Normal fourth-job filter included a hyper skill')
    await page.getByRole('button', { name: '마스터하기' }).click()
    await page.getByText('30/30 스킬 정보').waitFor()
    await page.getByRole('button', { name: '레벨 올리기' }).click()
    await page.getByText('31/30 스킬 정보').waitFor()
    await page.getByRole('button', { name: '2차', exact: true }).click()
    await page.getByRole('button', { name: '사이드바 접기' }).click()
    await page.getByRole('button', { name: '사이드바 펼치기' }).waitFor()
    await mkdir(outputDirectory, { recursive: true })
    await page.screenshot({
      path: path.join(outputDirectory, 'skill-list-collapsed.png'),
      fullPage: true
    })
    await page.getByRole('button', { name: '사이드바 펼치기' }).click()

    await page.screenshot({
      path: path.join(outputDirectory, 'skill-list-desktop.png'),
      fullPage: true
    })

    await page.setViewportSize({ width: 1920, height: 1080 })
    const columnWidths = await page
      .getByRole('columnheader')
      .evaluateAll((headers) => headers.map((header) => header.getBoundingClientRect().width))
    if (columnWidths[0] > 97 || columnWidths[3] > 171 || columnWidths[2] <= columnWidths[3])
      throw new Error(`Wide skill columns exceeded their caps: ${columnWidths.join(', ')}`)
    await page.screenshot({
      path: path.join(outputDirectory, 'skill-list-wide.png'),
      fullPage: true
    })

    await page.getByRole('button', { name: '직업 데이터' }).click()
    await page.getByRole('button', { name: '직업 정보', exact: true }).click()
    await page.getByRole('tab', { name: '스킬 정보' }).click()
    await page.getByRole('link', { name: '2차 스킬 목록' }).click()
    await page.getByRole('button', { name: '2차', exact: true }).waitFor()
    if (
      (await page
        .getByRole('button', { name: '2차', exact: true })
        .getAttribute('aria-pressed')) !== 'true'
    )
      throw new Error('Job stage link did not preserve filter')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: path.join(outputDirectory, 'skill-list-mobile.png'),
      fullPage: true
    })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    if (overflow) throw new Error('Skill list has horizontal page overflow')
    console.log('verified skill list, stage link, sidebar toggle, and desktop/mobile layout')
  } finally {
    await browser?.close()
    server.child.kill()
  }
}

await main()
