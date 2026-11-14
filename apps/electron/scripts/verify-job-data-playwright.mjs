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
      { jobId: '0', jobName: '초보자' },
      { jobId: '100', jobName: '검사' },
      { jobId: '110', jobName: '파이터' },
      { jobId: '111', jobName: '크루세이더' },
      { jobId: '112', jobName: '검성' },
      { jobId: '114', jobName: '히어로' },
      { jobId: '120', jobName: '페이지' },
      { jobId: '121', jobName: '나이트' },
      { jobId: '122', jobName: '팔라딘' },
      { jobId: '124', jobName: '팔라딘' },
      { jobId: '130', jobName: '스피어맨' },
      { jobId: '131', jobName: '버서커' },
      { jobId: '132', jobName: '다크나이트' },
      { jobId: '134', jobName: '다크나이트' },
      { jobId: '200', jobName: '매지션' },
      { jobId: '210', jobName: '위자드(불,독)' },
      { jobId: '211', jobName: '메이지(불,독)' },
      { jobId: '212', jobName: '대마도사(불,독)' },
      { jobId: '214', jobName: '아크메이지(불,독)' },
      { jobId: '5000', jobName: '미하일' },
      { jobId: '5100', jobName: '미하일' },
      { jobId: '5110', jobName: '미하일' },
      { jobId: '5111', jobName: '미하일' },
      { jobId: '5112', jobName: '미하일' },
      { jobId: '5114', jobName: '미하일' },
      { jobId: '3000', jobName: '시티즌' },
      { jobId: '3200', jobName: '배틀메이지' },
      { jobId: '3210', jobName: '배틀메이지' },
      { jobId: '3211', jobName: '배틀메이지' },
      { jobId: '3212', jobName: '최상급 흑마법' },
      { jobId: '3214', jobName: '배틀메이지' },
      { jobId: '3600', jobName: '제논' },
      { jobId: '3610', jobName: '제논' },
      { jobId: '3611', jobName: '제논' },
      { jobId: '3612', jobName: '제논' },
      { jobId: '3614', jobName: '제논' },
      { jobId: '400', jobName: '나이트로드' },
      ...Array.from({ length: 24 }, (_, index) => ({
        jobId: String(1000 + index),
        jobName: `테스트 직업 ${String(index + 1).padStart(2, '0')}`
      }))
    ]
    const advancement = (stage, jobId, jobName) => ({
      stage,
      jobId,
      jobName,
      requiresReview: false
    })
    const jobGroups = [
      {
        classKey: 'hero',
        representativeJobId: '112',
        representativeName: '히어로',
        advancements: [
          advancement(0, '0', '초보자'),
          advancement(1, '100', '검사'),
          advancement(2, '110', '파이터'),
          advancement(3, '111', '크루세이더'),
          advancement(4, '112', '검성'),
          advancement(6, '114', '히어로')
        ]
      },
      {
        classKey: 'paladin',
        representativeJobId: '122',
        representativeName: '팔라딘',
        advancements: [
          advancement(0, '0', '초보자'),
          advancement(1, '100', '검사'),
          advancement(2, '120', '페이지'),
          advancement(3, '121', '나이트'),
          advancement(4, '122', '팔라딘'),
          advancement(6, '124', '팔라딘')
        ]
      },
      {
        classKey: 'dark-knight',
        representativeJobId: '132',
        representativeName: '다크나이트',
        advancements: [
          advancement(0, '0', '초보자'),
          advancement(1, '100', '검사'),
          advancement(2, '130', '스피어맨'),
          advancement(3, '131', '버서커'),
          advancement(4, '132', '다크나이트'),
          advancement(6, '134', '다크나이트')
        ]
      },
      {
        classKey: 'arch-mage-fire-poison',
        representativeJobId: '212',
        representativeName: '아크메이지(불,독)',
        advancements: [
          advancement(0, '0', '초보자'),
          advancement(1, '200', '매지션'),
          advancement(2, '210', '위자드(불,독)'),
          advancement(3, '211', '메이지(불,독)'),
          advancement(4, '212', '대마도사(불,독)'),
          advancement(6, '214', '아크메이지(불,독)')
        ]
      },
      {
        classKey: 'mikhail',
        representativeJobId: '5112',
        representativeName: '미하일',
        advancements: [
          advancement(0, '5000', '미하일'),
          advancement(1, '5100', '미하일'),
          advancement(2, '5110', '미하일'),
          advancement(3, '5111', '미하일'),
          advancement(4, '5112', '미하일'),
          advancement(6, '5114', '미하일')
        ]
      },
      {
        classKey: 'battle-mage',
        representativeJobId: '3212',
        representativeName: '배틀메이지',
        advancements: [
          advancement(0, '3000', '시티즌'),
          advancement(1, '3200', '배틀메이지'),
          advancement(2, '3210', '배틀메이지'),
          advancement(3, '3211', '배틀메이지'),
          advancement(4, '3212', '최상급 흑마법'),
          advancement(6, '3214', '배틀메이지')
        ]
      },
      {
        classKey: 'xenon',
        representativeJobId: '3612',
        representativeName: '제논',
        advancements: [
          advancement(0, '3000', '시티즌'),
          advancement(1, '3600', '제논'),
          advancement(2, '3610', '제논'),
          advancement(3, '3611', '제논'),
          advancement(4, '3612', '제논'),
          advancement(6, '3614', '제논')
        ]
      }
    ]
    const initialDrafts = [
      {
        jobId: '112',
        jobName: '검성',
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
        jobId: '100',
        jobName: '레거시 히어로 초안',
        englishName: 'Legacy Hero',
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
        jobId: '212',
        jobName: '대마도사(불,독)',
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
        jobId: '200',
        jobName: '레거시 아크메이지 초안',
        englishName: 'Legacy Arch Mage',
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
        jobId: '5112',
        jobName: '미하일',
        englishName: 'Mikhail',
        classGroup: '전사',
        affiliation: '노바',
        mainStat: 'STR',
        subStat: 'DEX',
        primaryWeapons: ['sword'],
        secondaryWeapons: [],
        newWeaponTypes: [],
        revision: 1
      },
      {
        jobId: '3212',
        jobName: '최상급 흑마법',
        englishName: 'Battle Mage',
        classGroup: '마법사',
        affiliation: '레지스탕스',
        mainStat: 'INT',
        subStat: 'LUK',
        primaryWeapons: ['staff'],
        secondaryWeapons: [],
        newWeaponTypes: [],
        revision: 1
      },
      {
        jobId: '3612',
        jobName: '제논',
        englishName: 'Xenon',
        classGroup: '도적',
        affiliation: '레지스탕스',
        mainStat: 'STR, DEX, LUK',
        subStat: '',
        primaryWeapons: [],
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
    const changeSetIds = Object.fromEntries(
      versions.map((version, index) => [version, `${index + 1}1111111-1111-4111-8111-111111111111`])
    )
    const readStore = () =>
      JSON.parse(localStorage.getItem(storageKey) || 'null') ||
      Object.fromEntries(versions.map((version) => [version, structuredClone(initialDrafts)]))
    const writeStore = (store) => localStorage.setItem(storageKey, JSON.stringify(store))
    if (!localStorage.getItem(storageKey)) writeStore(readStore())
    const recoveryPreview = {
      recoveryId: '123e4567-e89b-42d3-a456-426614174099',
      sourceSha256: 'a'.repeat(64),
      drafts: [
        {
          jobId: '112',
          jobName: '복구 검성',
          revision: 7,
          proposedAfter: {
            englishName: 'Recovered Hero',
            classGroup: '전사',
            affiliation: '모험가',
            mainStat: 'STR',
            subStat: 'DEX',
            primaryWeapons: ['sword'],
            secondaryWeapons: ['medallion']
          },
          excluded: {
            jobName: '복구 검성',
            newWeaponTypes: [],
            advancementJobIds: { present: true, value: ['0', '100', '110', '111', '112', '114'] }
          },
          blockedForCopy: false,
          blockingNewWeaponTypeKeys: []
        },
        {
          jobId: '212',
          jobName: '복구 대마도사',
          revision: 8,
          proposedAfter: {
            englishName: 'Recovered Arch Mage',
            classGroup: '마법사',
            affiliation: '모험가',
            mainStat: 'INT',
            subStat: 'LUK',
            primaryWeapons: ['recovery-wand'],
            secondaryWeapons: []
          },
          excluded: {
            jobName: '복구 대마도사',
            newWeaponTypes: [
              {
                key: 'recovery-wand',
                category: 'weapon',
                part: '복구 완드',
                classGroupKeys: ['mage'],
                handType: 'oneHanded',
                weaponConstant: '1.2'
              }
            ],
            advancementJobIds: { present: true, value: ['200', '210', '211', '212', '214'] }
          },
          blockedForCopy: true,
          blockingNewWeaponTypeKeys: ['recovery-wand']
        }
      ]
    }
    const control = (window.__jobMock = {
      failVersion: '',
      failNextSave: false,
      staleNextSave: false,
      unavailableVersion: '',
      failRecoveryVersion: '',
      emptyRecoveryVersion: '',
      nextRecoveryDelay: 0,
      nextSaveDelay: 0,
      copyFailureMode: '',
      recoverySourceSha256: 'a'.repeat(64),
      previewCallCount: 0,
      copyCallCount: 0,
      copyRequests: [],
      saveCallCount: 0,
      saveRequests: [],
      databaseCallCount: 0,
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
        const editorAvailable = control.unavailableVersion !== version
        return {
          jobs,
          jobGroups,
          weaponTypes,
          drafts: editorAvailable ? readStore()[version] || [] : [],
          changeSetId: editorAvailable ? changeSetIds[version] : null,
          editorAvailable
        }
      },
      previewJobDraftRecovery: async (version) => {
        control.previewCallCount += 1
        if (control.nextRecoveryDelay) {
          const delay = control.nextRecoveryDelay
          control.nextRecoveryDelay = 0
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
        if (control.failRecoveryVersion === version) {
          throw new Error('Mock recovery preview failure')
        }
        if (control.emptyRecoveryVersion === version) {
          return { recoveryId: null, sourceSha256: null, drafts: [] }
        }
        return structuredClone({
          ...recoveryPreview,
          sourceSha256: control.recoverySourceSha256
        })
      },
      copySelectedJobDraftRecovery: async (request) => {
        control.copyCallCount += 1
        control.copyRequests.push(structuredClone(request))
        const failures = {
          stale: 'Recovery source does not match request: recoveryId',
          hash: 'Recovery source does not match request: sourceSha256',
          'missing-ready': 'Validation workspace is not ready'
        }
        if (control.copyFailureMode) throw new Error(failures[control.copyFailureMode])
        const source = recoveryPreview.drafts.find((draft) => draft.jobId === request.jobId)
        const databaseJob = jobs.find((job) => job.jobId === request.jobId)
        const store = readStore()
        store[request.version] = [
          ...(store[request.version] || []).filter((draft) => draft.jobId !== request.jobId),
          {
            jobId: request.jobId,
            jobName: databaseJob.jobName,
            ...source.proposedAfter,
            newWeaponTypes: [],
            revision: 1
          }
        ]
        writeStore(store)
        return {
          changeSetId: changeSetIds[request.version],
          recordId: '22222222-2222-4222-8222-222222222222',
          revision: 1
        }
      },
      saveJobDraft: async ({ version, expectedChangeSetId, draft }) => {
        control.saveCallCount += 1
        control.saveRequests.push(structuredClone({ version, expectedChangeSetId, draft }))
        if (
          ![
            draft.jobName,
            draft.englishName,
            draft.classGroup,
            draft.affiliation,
            draft.mainStat
          ].every((value) => typeof value === 'string' && value.trim())
        ) {
          throw new Error('Mock invalid job draft')
        }
        if (control.nextSaveDelay) {
          const delay = control.nextSaveDelay
          control.nextSaveDelay = 0
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
        if (control.failNextSave) {
          control.failNextSave = false
          throw new Error('Mock draft save failure')
        }
        if (control.staleNextSave) {
          control.staleNextSave = false
          throw new Error('Stale job metadata changeSetId')
        }
        if (expectedChangeSetId !== changeSetIds[version])
          throw new Error('Stale job metadata changeSetId')
        if (control.unavailableVersion === version)
          throw new Error('Validation workspace is not ready')
        if (!jobs.some((job) => job.jobId === draft.jobId))
          throw new Error('Job draft must reference an existing DB job')
        if (draft.newWeaponTypes.length || draft.advancementJobIds !== undefined)
          throw new Error('Excluded metadata field')
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

async function selectedStats(group) {
  const buttons = await group.getByRole('button', { name: /제거$/ }).all()
  return Promise.all(
    buttons.map(
      async (button) =>
        (await button.getAttribute('aria-label')).match(/ (STR|LUK|INT|DEX) 제거$/)[1]
    )
  )
}

async function assertStats(group, expected, message) {
  const actual = await selectedStats(group)
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: ${actual.join(', ')}`)
  for (const stat of expected) {
    assert((await group.innerText()).includes(stat), `${message}: ${stat} text missing.`)
    assert(
      (await group.getByRole('button', { name: `${stat} 추가` }).count()) === 0,
      `${message}: duplicate ${stat} remained available.`
    )
  }
}

function detailValue(page, label) {
  return page
    .locator('dt', { hasText: new RegExp(`^${label}$`) })
    .locator('..')
    .locator('dd')
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
  await page.getByRole('button', { name: theme === 'light' ? /^☀ 라이트$/ : /^☾ 다크$/ }).click()
  await page.waitForFunction(
    (expectedTheme) => document.documentElement.dataset.theme === expectedTheme,
    theme
  )
}

async function verifyRepresentativeStageAccent(page, size, theme) {
  const representatives = page.getByRole('region', { name: '대표 직업' })
  await representatives.getByRole('button', { name: /미하일\s*5112/ }).click()
  await page.getByRole('heading', { name: '미하일', level: 1 }).waitFor()
  await page.getByRole('tab', { name: '전직 정보' }).click()

  const advancement = page.getByRole('region', { name: '전직 정보' })
  const thirdStage = advancement.locator('code', { hasText: /^5111$/ }).locator('..')
  const fourthStage = advancement.locator('code', { hasText: /^5112$/ }).locator('..')
  const thirdStageTextBox = await thirdStage.locator('strong').boundingBox()
  const fourthStageTextBox = await fourthStage.locator('strong').boundingBox()
  assert(
    thirdStageTextBox &&
      fourthStageTextBox &&
      Math.abs(thirdStageTextBox.x - fourthStageTextBox.x) < 0.5,
    `Representative accent offset stage text at ${size.width}px ${theme}.`
  )

  const accent = await fourthStage.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--color-app-accent)'
    document.body.append(probe)
    const accentColor = getComputedStyle(probe).color
    probe.remove()
    return {
      accentColor,
      boxShadow: getComputedStyle(element).boxShadow
    }
  })
  const expectedColor = theme === 'dark' ? 'rgb(85, 230, 176)' : 'rgb(8, 127, 91)'
  assert(
    accent.accentColor === expectedColor &&
      accent.boxShadow.includes(expectedColor) &&
      accent.boxShadow.includes('inset'),
    `Representative accent shadow mismatch at ${size.width}px ${theme}: ${accent.boxShadow}; expected ${expectedColor}.`
  )
}

async function verifyJobFlow(page) {
  await navigate(page, '직업 정보')
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()

  const representatives = page.getByRole('region', { name: '대표 직업' })
  const fallback = page.getByRole('region', { name: '기타 · 복구 초안' })
  const representativeLabels = (await representatives.getByRole('button').allInnerTexts()).map(
    (text) => text.replace(/\s+/g, ' ').trim()
  )
  assert(
    JSON.stringify(representativeLabels) ===
      JSON.stringify([
        '히어로 112',
        '팔라딘 122',
        '다크나이트 132',
        '아크메이지(불,독) 212',
        '미하일 5112',
        '배틀메이지 3212',
        '제논 3612'
      ]),
    `Unexpected primary group list: ${representativeLabels.join(', ')}`
  )
  assert(
    (await representatives.getByRole('button', { name: /제논\s*3612/ }).count()) === 1 &&
      (await representatives.getByRole('button', { name: /제논\s*3614/ }).count()) === 0,
    'Xenon representative did not use the fourth-advancement ID.'
  )
  for (const name of ['초보자', '검사', '파이터', '크루세이더', '매지션']) {
    assert(
      (await representatives.getByRole('button', { name: new RegExp(name) }).count()) === 0,
      `${name} appeared as a separate primary button.`
    )
  }
  await fallback.getByRole('button', { name: /레거시 히어로 초안\s*100/ }).waitFor()
  await fallback.getByRole('button', { name: /레거시 아크메이지 초안\s*200/ }).waitFor()
  await fallback.getByRole('button', { name: /나이트로드\s*400/ }).waitFor()
  assert(
    (await representatives.getByRole('button', { name: /배틀메이지\s*3212/ }).count()) === 1,
    'Canonical Battle Mage name missing from representative list.'
  )
  assert(
    (await representatives.getByRole('button', { name: /최상급 흑마법/ }).count()) === 0,
    'Raw Battle Mage name appeared in representative list.'
  )

  assert(
    (await detailValue(page, '종족').innerText()) === '미등록',
    'Missing race was not shown as unregistered.'
  )
  assert(
    (await detailValue(page, '주무기').innerText()) === '한손검',
    'Hero primary weapon label missing.'
  )
  assert(
    (await detailValue(page, '보조무기').innerText()) === '메달',
    'Hero secondary weapon label missing.'
  )
  await representatives.getByRole('button', { name: /제논\s*3612/ }).click()
  assert(
    (await detailValue(page, '주무기').innerText()) === '미입력',
    'Empty primary weapon state missing.'
  )
  assert(
    (await detailValue(page, '보조무기').innerText()) === '미입력',
    'Empty secondary weapon state missing.'
  )

  await representatives.getByRole('button', { name: /배틀메이지\s*3212/ }).click()
  await page.getByRole('heading', { name: '배틀메이지', level: 1 }).waitFor()
  const rawNameValue = page
    .locator('dt', { hasText: /^원본 직업 이름$/ })
    .locator('..')
    .locator('dd')
  assert((await rawNameValue.innerText()) === '최상급 흑마법', 'Raw Battle Mage name not shown.')
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  await page.getByLabel('영문 이름').fill('Battle Mage Applied')
  await page.getByRole('button', { name: '작업본에 적용' }).click()
  await page.getByText('Battle Mage Applied', { exact: true }).waitFor()
  assert((await rawNameValue.innerText()) === '최상급 흑마법', 'Inline save changed raw name.')
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()
  await representatives.getByRole('button', { name: /배틀메이지\s*3212/ }).click()
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  assert(
    (await rawNameValue.innerText()) === '최상급 흑마법',
    'Reopened inline edit changed raw name.'
  )
  await page.getByRole('button', { name: '편집 취소' }).click()
  await page.getByRole('tab', { name: '전직 정보' }).click()
  const battleMageAdvancement = page
    .getByRole('region', { name: '전직 정보' })
    .locator('code', { hasText: /^3212$/ })
    .locator('..')
  const battleMageAdvancementText = (await battleMageAdvancement.innerText()).replace(/\s+/g, ' ')
  const battleMageAdvancementClass = (await battleMageAdvancement.getAttribute('class')) ?? ''
  assert(
    battleMageAdvancementClass.includes('shadow-[inset_2px_0_0_var(--color-app-accent)]'),
    'Representative stage-4 row lost its accent shadow.'
  )
  assert(
    (await battleMageAdvancement.getByText('대표 이름', { exact: true }).count()) === 0,
    'Representative stage-4 row duplicated the representative name.'
  )
  assert(
    /원본 이름\s*최상급 흑마법/.test(battleMageAdvancementText),
    `Battle Mage advancement omitted raw name: ${battleMageAdvancementText}`
  )
  await page.getByRole('tab', { name: '기본 정보' }).click()
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()

  const jobList = representatives.locator('..')
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
  const cygnusFilter = affiliationFilter.getByRole('checkbox', { name: '시그너스 기사단' })
  const mageFilter = classFilter.getByRole('checkbox', { name: '마법사' })
  const adventurerFilter = affiliationFilter.getByRole('checkbox', { name: '모험가' })
  await cygnusFilter.check()
  await representatives.getByRole('button', { name: /미하일\s*5112/ }).click()
  await page.getByRole('heading', { name: '미하일', level: 1 }).waitFor()
  assert(
    (await representatives.getByRole('button', { name: /히어로\s*112/ }).count()) === 0 &&
      (await representatives.getByRole('button', { name: /배틀메이지\s*3212/ }).count()) === 0,
    'Cygnus filter kept a non-Cygnus representative.'
  )
  await cygnusFilter.uncheck()
  await representatives.getByRole('button', { name: /미하일\s*5112/ }).waitFor()
  await representatives.getByRole('button', { name: /히어로\s*112/ }).waitFor()
  assert(!(await cygnusFilter.isChecked()), 'Cygnus filter did not clear.')
  await mageFilter.check()
  await adventurerFilter.check()
  await representatives.getByRole('button', { name: /아크메이지\(불,독\)\s*212/ }).waitFor()
  assert(
    (await representatives.getByRole('button', { name: /히어로\s*112/ }).count()) === 0,
    'Multi-filter kept non-matching job.'
  )
  await page.getByRole('button', { name: '초기화' }).click()
  assert(!(await mageFilter.isChecked()) && !(await adventurerFilter.isChecked()), 'Reset failed.')
  await representatives.getByRole('button', { name: /히어로\s*112/ }).waitFor()
  await fallback.getByRole('button', { name: /나이트로드\s*400/ }).waitFor()
  await page.getByPlaceholder('직업명 검색...').fill('fire poison')
  await representatives.getByRole('button', { name: /아크메이지\(불,독\)\s*212/ }).click()
  await page.getByRole('heading', { name: '아크메이지(불,독)', level: 1 }).waitFor()
  await page.getByPlaceholder('직업명 검색...').fill('')
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()

  const detail = page.locator('main section').first()
  const beforeHeights = await detail
    .locator('dl > div')
    .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
  assert(
    beforeHeights.length === 10 && beforeHeights.every((height) => height >= 44),
    `Unexpected basic-info rows: ${beforeHeights.join(',')}`
  )
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  assert(
    (await page.getByLabel('직업군').boundingBox()).width <= 200 &&
      (await page.getByLabel('소속').boundingBox()).width <= 240,
    'Inline dropdowns stretched beyond their content widths.'
  )
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
      assert((await detail.locator('dl').count()) === 0, `${name} retained basic information.`)
    if (name === '전직 정보') {
      const advancement = page.getByRole('region', { name: '전직 정보' })
      const rows = (await advancement.locator(':scope > div > div').allInnerTexts())
        .slice(1)
        .map((text) => text.replace(/\s+/g, ' ').trim())
      assert(
        JSON.stringify(rows) ===
          JSON.stringify([
            '0차 0 원본 이름초보자',
            '1차 100 원본 이름검사',
            '2차 110 원본 이름파이터',
            '3차 111 원본 이름크루세이더',
            '4차 대표 4차 전직 112 원본 이름검성',
            '6차 114 원본 이름히어로'
          ]),
        `Unexpected advancement rows: ${rows.join(', ')}`
      )
      await advancement.getByText('5차 전직은 별도 jobID가 없습니다.', { exact: true }).waitFor()
    }
  }
  await tabs.getByRole('tab', { name: '기본 정보' }).click()
  await representatives.getByRole('button', { name: /아크메이지\(불,독\)\s*212/ }).click()
  await page.getByRole('heading', { name: '아크메이지(불,독)', level: 1 }).waitFor()

  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  await page.getByLabel('영문 이름').fill('Unsaved Mage')
  page.once('dialog', (dialog) => dialog.dismiss())
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()
  await page.getByRole('heading', { name: '아크메이지(불,독)', level: 1 }).waitFor()
  page.once('dialog', (dialog) => dialog.accept())
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()

  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  await page.getByLabel('영문 이름').fill('Hero Applied')
  const inlineMainStat = page.getByRole('group', { name: '주스탯' })
  const inlineSubStat = page.getByRole('group', { name: '부스탯' })
  await assertStats(inlineMainStat, ['STR'], 'Inline main stat did not load.')
  await assertStats(inlineSubStat, ['DEX'], 'Inline secondary stat did not load.')
  await inlineMainStat.getByRole('button', { name: 'DEX 추가' }).click()
  await inlineSubStat.getByRole('button', { name: 'STR 추가' }).click()
  await assertStats(inlineMainStat, ['STR', 'DEX'], 'Inline multi-main selection failed.')
  await assertStats(inlineSubStat, ['DEX', 'STR'], 'Inline multi-secondary selection failed.')
  await page.getByRole('button', { name: '작업본에 적용' }).click()
  await page.getByText('Hero Applied', { exact: true }).waitFor()
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  await assertStats(
    page.getByRole('group', { name: '주스탯' }),
    ['STR', 'DEX'],
    'Saved inline main stats did not reopen.'
  )
  await assertStats(
    page.getByRole('group', { name: '부스탯' }),
    ['DEX', 'STR'],
    'Saved inline secondary stats did not reopen.'
  )
  await page.getByRole('button', { name: '편집 취소' }).click()

  await page.getByRole('button', { name: '히어로 전체 편집' }).click()
  await page.getByText(/저장됨 · revision/).waitFor()
  const primary = page.getByRole('heading', { name: '주무기' }).locator('..')
  const secondary = page.getByRole('heading', { name: '보조무기' }).locator('..')
  await primary.getByRole('button', { name: 'sword 제거' }).click()
  await primary.getByRole('button', { name: 'sword 제거' }).waitFor({ state: 'detached' })
  await primary.getByRole('button', { name: '추가하기' }).click()
  const primaryChooser = primary.getByRole('combobox', { name: '주무기 추가' })
  await primaryChooser.waitFor()
  const immediatePrimaryOptions = await primary.getByRole('option').allInnerTexts()
  assert(
    immediatePrimaryOptions.includes('한손검') &&
      immediatePrimaryOptions.includes('스태프') &&
      immediatePrimaryOptions.every((text) => text !== '메달'),
    `Primary chooser did not immediately show category-filtered sword/staff options: ${immediatePrimaryOptions.join(', ')}`
  )
  await primaryChooser.fill('staff')
  assert(
    (await primary.getByRole('option', { name: '스태프' }).count()) === 1 &&
      (await primary.getByRole('option', { name: '한손검' }).count()) === 0,
    'Primary weapon query did not filter options.'
  )
  await primary.getByRole('option', { name: '스태프' }).click()
  await primary.getByRole('button', { name: 'staff 제거' }).waitFor()
  await primary.getByRole('button', { name: '추가하기' }).waitFor()
  await primary.getByRole('button', { name: '추가하기' }).click()
  await primary.getByRole('combobox', { name: '주무기 추가' }).fill('missing weapon')
  await primary.getByText('검색 결과가 없습니다.', { exact: true }).waitFor()
  await primary.getByRole('combobox', { name: '주무기 추가' }).press('Escape')
  await primary.getByRole('button', { name: '추가하기' }).waitFor()
  await primary.getByRole('button', { name: '추가하기' }).click()
  await primary.getByRole('option', { name: '한손검' }).click()
  await primary.getByRole('button', { name: 'sword 제거' }).waitFor()

  await secondary.getByRole('button', { name: 'medallion 제거' }).click()
  await secondary.getByRole('button', { name: '추가하기' }).click()
  assert(
    (await secondary.getByRole('option', { name: '메달' }).count()) === 1 &&
      (await secondary.getByRole('option').count()) === 1,
    'Secondary chooser did not immediately filter by category.'
  )
  await secondary.getByRole('combobox', { name: '보조무기 추가' }).fill('med')
  await secondary.getByRole('option', { name: '메달' }).click()
  await secondary.getByRole('button', { name: 'medallion 제거' }).waitFor()
  await secondary.getByRole('button', { name: '추가하기' }).waitFor()
  await secondary.getByRole('button', { name: 'medallion 제거' }).click()
  await secondary.getByRole('button', { name: '추가하기' }).waitFor()

  await page
    .getByText('새 무기 후보 등록은 현재 metadata 편집 대상에서 제외됩니다.', { exact: false })
    .waitFor()
  assert(
    (await primary.getByRole('button', { name: /새 무기 등록/ }).count()) === 0,
    'Excluded new weapon editor remained available.'
  )
  await page.getByText(/저장됨 · revision [2-9]/).waitFor({ timeout: 5_000 })

  await page.evaluate(() => {
    window.__jobMock.failNextSave = true
  })
  await page.getByLabel('직업 영문명').fill('Hero Retry')
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
  await page
    .getByText('아직 DB에 없는 직업은 편집 작업본에 저장할 수 없습니다.', { exact: true })
    .waitFor()
  assert(
    (await page.getByRole('button', { name: 'ID와 이름으로 편집 시작' }).count()) === 0,
    'Non-DB job exposed editor action.'
  )

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

async function openRecoveryPreview(page) {
  const recovery = page.locator('section[aria-labelledby="recovery-review-heading"]')
  const disclosure = recovery.getByText('복구 초안 검토', { exact: true })
  if (!(await recovery.locator('details').evaluate((details) => details.open))) {
    await disclosure.click()
  }
  await recovery.getByText('a'.repeat(64), { exact: true }).waitFor()
  return recovery
}

async function assertRecoveryPreview(recovery, size) {
  await recovery.getByText('123e4567-e89b-42d3-a456-426614174099', { exact: true }).waitFor()
  const draftNames = await recovery.locator('h3').allInnerTexts()
  assert(
    JSON.stringify(draftNames) === JSON.stringify(['복구 검성', '복구 대마도사']),
    `Unexpected recovery drafts at ${size.width}px: ${draftNames.join(', ')}`
  )
  await recovery.getByText('DB publish는 실행하지 않습니다.', { exact: false }).waitFor()
  await recovery.getByText('제외된 원본 직업명', { exact: true }).first().waitFor()
  await recovery.getByText('제외된 전직 연결', { exact: true }).first().waitFor()
  const blockedDraft = recovery.locator('li').filter({ hasText: '복구 대마도사' }).first()
  await blockedDraft.getByText('복사 불가', { exact: true }).first().waitFor()
  await blockedDraft.getByText('복구 완드 / weapon · key', { exact: false }).waitFor()
  await blockedDraft.getByText('복사 차단 참조 key:', { exact: false }).waitFor()
  const safeDraft = recovery.locator('li').filter({ hasText: '복구 검성' }).first()
  const safeCopy = safeDraft.getByRole('button', { name: /복사/ })
  assert((await safeCopy.count()) === 1, 'Safe recovery draft lacked an explicit copy action.')
  const blockedCopy = blockedDraft.getByRole('button', { name: /복사/ })
  assert(
    (await blockedCopy.count()) === 0 || (await blockedCopy.isDisabled()),
    'Blocked recovery draft exposed an enabled copy action.'
  )
  assert(
    await recovery.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    `Recovery preview overflowed at ${size.width}px.`
  )
}

async function verifyRecoveryCopyFlow(page, recovery, size) {
  await page.evaluate(() => {
    Object.assign(window.__jobMock, {
      copyFailureMode: '',
      recoverySourceSha256: 'a'.repeat(64),
      copyCallCount: 0,
      copyRequests: []
    })
  })
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await recovery.getByText('a'.repeat(64), { exact: true }).waitFor()

  const safeDraft = recovery.locator('li').filter({ hasText: '복구 검성' }).first()
  const copyButton = safeDraft.getByRole('button', { name: /복사/ })
  const callsBeforeCancel = await page.evaluate(() => window.__jobMock.copyCallCount)
  page.once('dialog', (dialog) => dialog.dismiss())
  await copyButton.click()
  await page.waitForTimeout(50)
  assert(
    (await page.evaluate(() => window.__jobMock.copyCallCount)) === callsBeforeCancel,
    `Cancelled recovery copy called API at ${size.width}px.`
  )

  await page.evaluate(() => {
    window.__jobMock.copyFailureMode = 'stale'
  })
  const previewsBeforeFailure = await page.evaluate(() => window.__jobMock.previewCallCount)
  const acceptFailure = (dialog) => dialog.accept()
  page.on('dialog', acceptFailure)
  await copyButton.dblclick()
  page.off('dialog', acceptFailure)
  await recovery
    .getByRole('alert')
    .filter({ hasText: '복구 원본이 미리보기 이후 변경되었습니다.' })
    .waitFor()
  const failedState = await page.evaluate(() => ({
    copies: window.__jobMock.copyCallCount,
    previews: window.__jobMock.previewCallCount
  }))
  assert(failedState.copies === 1, `Double click was not guarded at ${size.width}px.`)
  assert(
    failedState.previews === previewsBeforeFailure,
    `Stale copy refreshed preview without user action at ${size.width}px.`
  )
  assert(
    (await recovery.getByText('11111111-1111-4111-8111-111111111111', { exact: true }).count()) ===
      0,
    `Stale copy displayed success at ${size.width}px.`
  )

  await page.waitForTimeout(50)
  assert(
    (await page.evaluate(() => window.__jobMock.copyCallCount)) === 1,
    `Stale copy retried without user action at ${size.width}px.`
  )
  await page.evaluate(() => {
    window.__jobMock.copyFailureMode = ''
    window.__jobMock.recoverySourceSha256 = 'b'.repeat(64)
  })
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await recovery.getByText('b'.repeat(64), { exact: true }).waitFor()

  const acceptSuccess = (dialog) => dialog.accept()
  page.on('dialog', acceptSuccess)
  await safeDraft.getByRole('button', { name: /복사/ }).dblclick()
  page.off('dialog', acceptSuccess)
  await recovery.getByText('11111111-1111-4111-8111-111111111111', { exact: true }).waitFor()
  await recovery.getByText('22222222-2222-4222-8222-222222222222', { exact: true }).waitFor()
  await page
    .getByRole('region', { name: '1.2.420 최종 전직 대표' })
    .getByRole('button', { name: /히어로\s+hero\s+112\s+Recovered Hero · revision 1/ })
    .waitFor()
  const copyState = await page.evaluate(() => ({
    calls: window.__jobMock.copyCallCount,
    requests: window.__jobMock.copyRequests,
    saves: window.__jobMock.saveCallCount,
    databaseCalls: window.__jobMock.databaseCallCount
  }))
  assert(copyState.calls === 2, `Confirmed recovery copy was not single-flight at ${size.width}px.`)
  assert(
    JSON.stringify(copyState.requests) ===
      JSON.stringify([
        {
          version: '1.2.420',
          recoveryId: '123e4567-e89b-42d3-a456-426614174099',
          sourceSha256: 'a'.repeat(64),
          jobId: '112'
        },
        {
          version: '1.2.420',
          recoveryId: '123e4567-e89b-42d3-a456-426614174099',
          sourceSha256: 'b'.repeat(64),
          jobId: '112'
        }
      ]),
    `Recovery copy request mismatch at ${size.width}px: ${JSON.stringify(copyState.requests)}`
  )
  assert(copyState.saves === 0, `Recovery copy called saveJobDraft at ${size.width}px.`)
  assert(copyState.databaseCalls === 0, `Recovery copy called a DB API at ${size.width}px.`)

  await page.getByLabel('현재 버전').first().selectOption('1.2.419')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
  assert(
    (await page
      .getByRole('region', { name: '1.2.419 최종 전직 대표' })
      .getByRole('button')
      .count()) === 7,
    `Version navigation changed editor list at ${size.width}px.`
  )
  assert(
    (await page.getByText('11111111-1111-4111-8111-111111111111', { exact: true }).count()) === 0,
    `Version navigation retained stale copy result at ${size.width}px.`
  )
  await page.evaluate(() => {
    window.__jobMock.recoverySourceSha256 = 'a'.repeat(64)
  })
  await page.getByLabel('현재 버전').first().selectOption('1.2.420')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
  assert(
    (await page
      .getByRole('region', { name: '1.2.420 최종 전직 대표' })
      .getByRole('button')
      .count()) === 7,
    `Returning from version route changed editor list at ${size.width}px.`
  )
  await openRecoveryPreview(page)
}

async function verifyRecoveryPreview(page) {
  const callsBefore = await page.evaluate(() => window.__jobMock.saveCallCount)
  for (const { size, filename } of [
    { size: { width: 1480, height: 920 }, filename: 'job-recovery-preview-e2e-desktop.png' },
    { size: { width: 390, height: 844 }, filename: 'job-recovery-preview-e2e-mobile.png' }
  ]) {
    await page.setViewportSize(size)
    await navigate(page, '에디터')
    await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
    const recovery = await openRecoveryPreview(page)
    await assertRecoveryPreview(recovery, size)
    await verifyRecoveryCopyFlow(page, recovery, size)
    await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: true })
  }

  await page.setViewportSize({ width: 1480, height: 920 })
  let recovery = page.locator('section[aria-labelledby="recovery-review-heading"]')
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await recovery.getByText('a'.repeat(64), { exact: true }).waitFor()

  await page.evaluate(() => {
    window.__jobMock.failRecoveryVersion = '1.2.420'
  })
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await recovery.getByRole('alert').filter({ hasText: 'Mock recovery preview failure' }).waitFor()
  await page.evaluate(() => {
    window.__jobMock.failRecoveryVersion = ''
  })
  await recovery.getByRole('button', { name: '다시 불러오기' }).click()
  await recovery.getByText('a'.repeat(64), { exact: true }).waitFor()

  await page.evaluate(() => {
    window.__jobMock.emptyRecoveryVersion = '1.2.420'
  })
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await recovery.getByText('검토할 복구 초안이 없습니다.', { exact: true }).waitFor()
  await page.evaluate(() => {
    window.__jobMock.emptyRecoveryVersion = ''
  })
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await recovery.getByText('a'.repeat(64), { exact: true }).waitFor()

  await page.evaluate(() => {
    window.__jobMock.nextRecoveryDelay = 250
  })
  await recovery.getByRole('button', { name: '새로고침', exact: true }).click()
  await page.getByLabel('현재 버전').first().selectOption('1.2.419')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
  await page.waitForTimeout(300)
  recovery = page.locator('section[aria-labelledby="recovery-review-heading"]')
  assert(
    (await recovery.getByText('a'.repeat(64), { exact: true }).count()) === 0,
    'Stale recovery preview remained after version switch.'
  )
  recovery = await openRecoveryPreview(page)
  await assertRecoveryPreview(recovery, { width: 1480, height: 920 })
  await page.getByLabel('현재 버전').first().selectOption('1.2.420')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()

  const representatives = page.getByRole('region', { name: '1.2.420 최종 전직 대표' })
  await representatives.getByRole('button', { name: /히어로\s+hero\s+112/ }).click()
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
  await navigate(page, '에디터')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
  assert(
    (await page
      .getByRole('region', { name: '1.2.420 최종 전직 대표' })
      .getByRole('button')
      .count()) === 7,
    'Editor list changed after opening job details and returning.'
  )
  recovery = await openRecoveryPreview(page)
  await assertRecoveryPreview(recovery, { width: 1480, height: 920 })
  assert(
    (await page.evaluate(() => window.__jobMock.saveCallCount)) === callsBefore,
    'Recovery preview called saveJobDraft.'
  )
}

async function verifyEditorPicker(page) {
  await navigate(page, '에디터')
  await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
  const representatives = page.getByRole('region', { name: '1.2.420 최종 전직 대표' })
  const fallback = page.getByRole('region', { name: '미분류 · 기존 작업본' })
  const representativeLabels = (await representatives.getByRole('button').allInnerTexts()).map(
    (text) => text.replace(/\s+/g, ' ').trim()
  )
  assert(
    JSON.stringify(representativeLabels) ===
      JSON.stringify([
        '히어로 hero 112 Recovered Hero · revision 1',
        '팔라딘 paladin 122',
        '다크나이트 dark-knight 132',
        '아크메이지(불,독) arch-mage-fire-poison 212 Arch Mage Fire Poison · revision 1',
        '미하일 mikhail 5112 Mikhail · revision 1',
        '배틀메이지 battle-mage 3212 Battle Mage · revision 1',
        '제논 xenon 3612 Xenon · revision 1'
      ]),
    `Unexpected editor representatives: ${representativeLabels.join(', ')}`
  )
  const editorSearch = page.getByPlaceholder('대표 직업 ID 또는 이름 검색')
  const editorSearchBox = await editorSearch.boundingBox()
  assert(editorSearchBox && editorSearchBox.width <= 560, 'Editor search was not width bounded.')
  await editorSearch.fill('battle-mage')
  assert(
    (await representatives.getByRole('button').allInnerTexts()).length === 1,
    'Editor class-key search did not filter representatives.'
  )
  await editorSearch.fill('')
  for (const name of ['초보자', '검사', '파이터', '크루세이더', '매지션']) {
    assert(
      (await representatives.getByRole('button', { name: new RegExp(name) }).count()) === 0,
      `${name} appeared as a representative editor button.`
    )
  }
  await representatives.getByRole('button', { name: /배틀메이지\s+battle-mage\s+3212/ }).click()
  await page.getByRole('heading', { name: '배틀메이지', level: 1 }).waitFor()
  for (const [label, maximumWidth] of [
    ['직업군', 200],
    ['소속', 240]
  ]) {
    const select = page.getByLabel(label)
    const selectBox = await select.boundingBox()
    const arrowBox = await select.locator('..').locator('svg').boundingBox()
    assert(selectBox && selectBox.width <= maximumWidth, `${label} select was not compact.`)
    assert(
      selectBox &&
        arrowBox &&
        selectBox.x + selectBox.width - arrowBox.x >= 20 &&
        selectBox.x + selectBox.width - arrowBox.x <= 32,
      `${label} chevron was not inset at the right edge.`
    )
  }
  const basicFields = page.locator('main section').first()
  const fieldLabels = await basicFields.locator(':scope > * > .field-label').allInnerTexts()
  assert(
    JSON.stringify(fieldLabels) ===
      JSON.stringify([
        'jobID',
        '직업명',
        '원본 직업명',
        '직업 영문명',
        '직업군',
        '소속',
        '주스탯',
        '부스탯'
      ]),
    `Unexpected editor field order: ${fieldLabels.join(', ')}`
  )
  const fieldRows = await basicFields.locator(':scope > *').evaluateAll((rows) =>
    rows.map((row) => {
      const label = row.firstElementChild.getBoundingClientRect()
      const control = row.lastElementChild.getBoundingClientRect()
      return { labelX: label.x, controlX: control.x, top: row.getBoundingClientRect().top }
    })
  )
  assert(
    fieldRows.every(
      (row, index) => row.controlX > row.labelX && (!index || row.top > fieldRows[index - 1].top)
    ),
    'Editor fields were not stacked label-left/control-right rows.'
  )
  const compactControlHeights = await basicFields
    .locator('input, select')
    .evaluateAll((controls) => controls.map((control) => control.getBoundingClientRect().height))
  assert(
    compactControlHeights.every((height) => height <= 32),
    `Editor controls exceeded 32px: ${compactControlHeights.join(', ')}`
  )
  for (const label of ['원본 직업명', '직업 영문명']) {
    const box = await page.getByLabel(label).boundingBox()
    assert(box && box.width <= 320, `${label} exceeded 320px.`)
  }

  await page
    .getByText('전직 연결은 현재 metadata 편집 대상에서 제외됩니다.', { exact: false })
    .waitFor()
  const rawBattleMageName = page.getByLabel('원본 직업명')
  const englishBattleMageName = page.getByLabel('직업 영문명')
  assert(
    (await rawBattleMageName.inputValue()) === '최상급 흑마법' &&
      !(await rawBattleMageName.isEditable()),
    'Excluded DB job name remained editable.'
  )
  assert(
    !(await page.getByLabel('직업명', { exact: true }).isEditable()),
    'Display job name was editable.'
  )

  const saveButton = page.getByRole('button', { name: '저장하기' })
  const noOpBaseline = await page.evaluate(() => ({
    calls: window.__jobMock.saveCallCount,
    revision: JSON.parse(localStorage.getItem('job-playwright-drafts'))['1.2.420'].find(
      (draft) => draft.jobId === '3212'
    ).revision
  }))
  assert(await saveButton.isDisabled(), 'Initial unchanged save button was enabled.')
  await navigate(page, '에디터')
  await representatives.getByRole('button', { name: /배틀메이지\s+battle-mage\s+3212/ }).click()
  assert(await saveButton.isDisabled(), 'Reopened unchanged save button was enabled.')
  await englishBattleMageName.fill('Battle Mage Reverted')
  assert(await saveButton.isEnabled(), 'Edited draft did not enable save button.')
  await englishBattleMageName.fill('Battle Mage')
  assert(await saveButton.isDisabled(), 'Reverted draft did not disable save button.')
  await page.waitForTimeout(800)
  const noOpResult = await page.evaluate(() => ({
    calls: window.__jobMock.saveCallCount,
    revision: JSON.parse(localStorage.getItem('job-playwright-drafts'))['1.2.420'].find(
      (draft) => draft.jobId === '3212'
    ).revision
  }))
  assert(
    JSON.stringify(noOpResult) === JSON.stringify(noOpBaseline),
    `No-op changed save state: ${JSON.stringify(noOpBaseline)} -> ${JSON.stringify(noOpResult)}`
  )

  await page.evaluate(() => {
    window.__jobMock.nextSaveDelay = 600
  })
  await englishBattleMageName.fill('Battle Mage Auto')
  assert(await saveButton.isEnabled(), 'Auto-save edit did not enable save button.')
  await page.getByRole('button', { name: '저장 중...' }).waitFor({ timeout: 2_000 })
  assert(
    await page.getByRole('button', { name: '저장 중...' }).isDisabled(),
    'Save button stayed enabled during auto-save.'
  )
  await page.getByText('저장됨 · revision 2', { exact: true }).waitFor({ timeout: 2_000 })
  assert(await saveButton.isDisabled(), 'Auto-save success did not disable save button.')

  await englishBattleMageName.fill('Battle Mage Manual')
  assert(await saveButton.isEnabled(), 'Manual edit did not enable save button.')
  const callsBeforeManualSave = await page.evaluate(() => window.__jobMock.saveCallCount)
  await page.evaluate(() => {
    window.__jobMock.nextSaveDelay = 900
  })
  await saveButton.click()
  await page.getByRole('button', { name: '저장 중...' }).waitFor()
  assert(
    await page.getByRole('button', { name: '저장 중...' }).isDisabled(),
    'Save button stayed enabled during manual save.'
  )
  await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
  assert(await saveButton.isDisabled(), 'Manual save success did not disable save button.')
  assert(
    (await page.evaluate(() => window.__jobMock.saveCallCount)) === callsBeforeManualSave + 1,
    'Manual save also queued a duplicate auto-save.'
  )

  await page.evaluate(() => {
    window.__jobMock.failNextSave = true
  })
  await englishBattleMageName.fill('Battle Mage Retry')
  await saveButton.click()
  await page.getByRole('alert').filter({ hasText: 'Mock draft save failure' }).waitFor()
  assert(await saveButton.isEnabled(), 'Failed save could not be retried.')
  await saveButton.click()
  await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
  assert(await saveButton.isDisabled(), 'Retry success did not disable save button.')

  await navigate(page, '에디터')
  await representatives.getByRole('button', { name: /팔라딘\s+paladin\s+122/ }).click()
  await page.getByRole('heading', { name: '팔라딘', level: 1 }).waitFor()
  assert(
    (await page.getByLabel('직업 영문명').inputValue()) === 'Paladin',
    'Unsaved representative did not derive English from its class key.'
  )

  await navigate(page, '에디터')
  await representatives.getByRole('button', { name: /제논\s+xenon\s+3612/ }).click()
  await page.getByRole('heading', { name: '제논', level: 1 }).waitFor()
  const xenonMainStat = page.getByRole('group', { name: '주스탯' })
  const xenonSubStat = page.getByRole('group', { name: '부스탯' })
  await assertStats(
    xenonMainStat,
    ['STR', 'DEX', 'LUK'],
    'Xenon three-stat main value did not load.'
  )
  await assertStats(xenonSubStat, [], 'Xenon empty secondary value did not load.')
  await page.getByLabel('직업 영문명').fill('Xenon Applied')
  await page.getByRole('button', { name: '저장하기' }).click()
  await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
  await page.reload()
  await navigate(page, '에디터')
  await page
    .getByRole('region', { name: '1.2.420 최종 전직 대표' })
    .getByRole('button', { name: /제논\s+xenon\s+3612/ })
    .click()
  await page.getByRole('heading', { name: '제논', level: 1 }).waitFor()
  const persistedMainStat = page.getByRole('group', { name: '주스탯' })
  const persistedSubStat = page.getByRole('group', { name: '부스탯' })
  await assertStats(
    persistedMainStat,
    ['STR', 'DEX', 'LUK'],
    'Xenon three-stat main value did not persist.'
  )
  await assertStats(persistedSubStat, [], 'Xenon empty secondary value did not persist.')
  await persistedMainStat.getByRole('button', { name: 'DEX 제거' }).click()
  await assertStats(persistedMainStat, ['STR', 'LUK'], 'Xenon stat removal failed.')
  await page.getByRole('button', { name: '저장하기' }).click()
  await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
  await persistedMainStat.getByRole('button', { name: 'DEX 추가' }).click()
  await assertStats(persistedMainStat, ['STR', 'LUK', 'DEX'], 'Xenon stat restore failed.')
  await page.getByRole('button', { name: '저장하기' }).click()
  await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
  await navigate(page, '에디터')
  await fallback.getByRole('button', { name: /검사\s*100/ }).waitFor()
  await fallback.getByRole('button', { name: /매지션\s*200/ }).waitFor()
  await fallback.getByRole('button', { name: /나이트로드\s*400/ }).waitFor()
  await fallback.getByRole('button', { name: /검사\s*100/ }).click()
  await page.getByRole('heading', { name: '레거시 히어로 초안', level: 1 }).waitFor()
  assert(
    (await page.getByLabel('직업 영문명').inputValue()) === 'Legacy Hero',
    'Legacy draft did not reopen.'
  )
  await navigate(page, '에디터')

  await page
    .getByRole('region', { name: '1.2.420 최종 전직 대표' })
    .getByRole('button', { name: /히어로\s+hero\s+112/ })
    .click()
  await page
    .getByText('전직 연결은 현재 metadata 편집 대상에서 제외됩니다.', { exact: false })
    .waitFor()
  assert(
    (await page.getByRole('button', { name: '전직 ID 연결' }).count()) === 0,
    'Excluded advancement editor remained available.'
  )

  await page.getByRole('button', { name: '목록으로' }).click()
  await page.getByRole('button', { name: '기본 정보 수정' }).waitFor()
}

async function verifyFullEditorSaveGuards(page) {
  await navigate(page, '에디터')
  const representatives = page.getByRole('region', {
    name: '1.2.420 최종 전직 대표'
  })
  await representatives.getByRole('button', { name: /히어로\s+hero\s+112/ }).click()
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
  const callsBeforeDelayedSave = await page.evaluate(() => window.__jobMock.saveCallCount)
  await page.evaluate(() => {
    window.__jobMock.nextSaveDelay = 1_200
  })
  await page.getByLabel('직업 영문명').fill('Hero Delayed Route Save')
  await page.getByRole('button', { name: '저장하기' }).click()
  await page.getByRole('button', { name: '저장 중...' }).waitFor()

  const acceptEditorExit = (dialog) => dialog.accept()
  page.on('dialog', acceptEditorExit)
  try {
    await page.getByRole('button', { name: '목록으로' }).evaluate((button) => {
      const propsKey = Object.keys(button).find((key) => key.startsWith('__reactProps$'))
      button[propsKey]?.onClick()
    })
    await page.getByRole('button', { name: '기본 정보 수정' }).waitFor()
  } finally {
    page.off('dialog', acceptEditorExit)
  }
  await navigate(page, '에디터')
  const delayedSaveState = await page.evaluate(() => ({
    calls: window.__jobMock.saveCallCount,
    englishName: JSON.parse(localStorage.getItem('job-playwright-drafts'))['1.2.420'].find(
      (draft) => draft.jobId === '112'
    )?.englishName
  }))
  assert(
    delayedSaveState.calls === callsBeforeDelayedSave + 1 &&
      delayedSaveState.englishName !== 'Hero Delayed Route Save',
    `Hero save did not remain pending before opening Paladin: ${JSON.stringify(delayedSaveState)}`
  )
  await representatives.getByRole('button', { name: /팔라딘\s+paladin\s+122/ }).click()
  await page.getByRole('heading', { name: '팔라딘', level: 1 }).waitFor()
  const paladinName = page.getByLabel('직업 영문명')
  const baseline = await page.evaluate(() => ({
    calls: window.__jobMock.saveCallCount,
    revision:
      JSON.parse(localStorage.getItem('job-playwright-drafts'))['1.2.420'].find(
        (draft) => draft.jobId === '122'
      )?.revision ?? 0
  }))
  await paladinName.fill('')
  await page
    .getByRole('alert')
    .filter({ hasText: '영문 이름을 입력하세요.' })
    .waitFor({ timeout: 2_000 })
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem('job-playwright-drafts'))['1.2.420'].find(
        (draft) => draft.jobId === '112'
      )?.englishName === 'Hero Delayed Route Save'
  )
  const result = await page.evaluate(() => ({
    calls: window.__jobMock.saveCallCount,
    revision:
      JSON.parse(localStorage.getItem('job-playwright-drafts'))['1.2.420'].find(
        (draft) => draft.jobId === '122'
      )?.revision ?? 0
  }))
  assert(
    (await paladinName.inputValue()) === '',
    'Delayed prior save overwrote current editor input.'
  )
  assert(
    JSON.stringify(result) === JSON.stringify(baseline),
    `Invalid autosave persisted or changed revision: ${JSON.stringify(baseline)} -> ${JSON.stringify(result)}`
  )
  await page.getByText('자동 저장 대기', { exact: true }).waitFor()
  assert(
    (await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).count()) === 0,
    'Delayed prior save displayed obsolete success.'
  )
  await page.getByRole('alert').filter({ hasText: '영문 이름을 입력하세요.' }).waitFor()

  const acceptCleanup = (dialog) => dialog.accept()
  page.on('dialog', acceptCleanup)
  try {
    await navigate(page, '대시보드')
  } finally {
    page.off('dialog', acceptCleanup)
  }
}

async function verifyInlineContextGuards(page) {
  await page.setViewportSize({ width: 1480, height: 920 })
  await navigate(page, '직업 정보')
  const representatives = page.getByRole('region', { name: '대표 직업' })
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  const delayedHeroName = 'Hero Delayed Inline Context'
  await page.getByLabel('영문 이름').fill(delayedHeroName)
  await page.evaluate(() => {
    window.__jobMock.nextSaveDelay = 700
  })
  await page.getByRole('button', { name: '작업본에 적용' }).click()
  await page.getByRole('button', { name: '저장 중...' }).waitFor()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByLabel('현재 버전').first().selectOption('1.2.419')
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
  await representatives.getByRole('button', { name: /배틀메이지\s*3212/ }).click()
  await page.getByRole('heading', { name: '배틀메이지', level: 1 }).waitFor()
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  const currentBattleMageName = 'Battle Mage Current Context'
  await page.getByLabel('영문 이름').fill(currentBattleMageName)
  await page.waitForFunction(
    ({ version, jobId, englishName }) =>
      JSON.parse(localStorage.getItem('job-playwright-drafts'))[version].find(
        (draft) => draft.jobId === jobId
      )?.englishName === englishName,
    { version: '1.2.420', jobId: '112', englishName: delayedHeroName }
  )
  assert(
    (await page.getByRole('heading', { name: '배틀메이지', level: 1 }).count()) === 1 &&
      (await page.getByLabel('영문 이름').inputValue()) === currentBattleMageName,
    'Delayed inline save replaced current version/job state.'
  )
  assert(
    await page.getByRole('button', { name: '작업본에 적용' }).isEnabled(),
    'Delayed stale inline response left current context saving.'
  )

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByLabel('현재 버전').first().selectOption('1.2.420')
  await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
  await representatives.getByRole('button', { name: /배틀메이지\s*3212/ }).click()
  await page.getByRole('button', { name: '기본 정보 수정' }).click()
  const retryValue = 'Battle Mage No Latest Retry'
  await page.getByLabel('영문 이름').fill(retryValue)
  await page.evaluate(() => {
    window.__jobMock.staleNextSave = true
  })
  await page.getByRole('button', { name: '작업본에 적용' }).click()
  await page
    .getByRole('alert')
    .filter({ hasText: '다른 변경으로 작업본 기준이 바뀌었습니다.' })
    .waitFor()
  const requestsBeforeRetry = await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('job-playwright-drafts'))
    store['1.2.420'] = store['1.2.420'].filter((draft) => draft.jobId !== '3212')
    localStorage.setItem('job-playwright-drafts', JSON.stringify(store))
    return window.__jobMock.saveRequests.length
  })
  await page.getByRole('button', { name: '최신 기준으로 재시도' }).click()
  await page.getByText(retryValue, { exact: true }).waitFor()
  const retryRequest = await page.evaluate(
    (index) => window.__jobMock.saveRequests[index],
    requestsBeforeRetry
  )
  assert(
    retryRequest?.draft.jobName === '최상급 흑마법',
    `No-latest retry used display name instead of DB name: ${retryRequest?.draft.jobName}`
  )
}

async function verifyWorkbenchGuardPaths(page) {
  for (const size of [
    { width: 1480, height: 920 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(size)
    await page.evaluate(() => {
      Object.assign(window.__jobMock, {
        failNextSave: false,
        staleNextSave: false,
        nextSaveDelay: 0,
        unavailableVersion: ''
      })
    })
    await navigate(page, '에디터')
    const representatives = page.getByRole('region', {
      name: '1.2.420 최종 전직 대표'
    })
    await representatives.getByRole('button', { name: /팔라딘\s+paladin\s+122/ }).click()
    const fullEditorName = page.getByLabel('직업 영문명')
    const classGroup = page.getByLabel('직업군')
    const affiliation = page.getByLabel('소속')
    if (!(await classGroup.inputValue())) await classGroup.selectOption({ label: '전사' })
    if (!(await affiliation.inputValue())) await affiliation.selectOption({ label: '모험가' })
    const mainStat = page.getByRole('group', { name: '주스탯' })
    const addStrength = mainStat.getByRole('button', { name: 'STR 추가' })
    if (await addStrength.count()) await addStrength.click()
    const prepareSave = page.getByRole('button', { name: '저장하기' })
    if (await prepareSave.isEnabled()) {
      await prepareSave.click()
      await page.getByRole('status').filter({ hasText: '작업본을 저장했습니다.' }).waitFor()
    }

    const staleFullValue = `Paladin Stale ${size.width}`
    const callsBeforeFullStale = await page.evaluate(() => {
      window.__jobMock.staleNextSave = true
      return window.__jobMock.saveCallCount
    })
    await fullEditorName.fill(staleFullValue)
    await page.waitForFunction(
      (calls) => window.__jobMock.saveCallCount === calls + 1,
      callsBeforeFullStale,
      { timeout: 3_000 }
    )
    await page
      .getByRole('alert')
      .filter({ hasText: '다른 변경으로 작업본 기준이 바뀌었습니다.' })
      .waitFor({ timeout: 3_000 })
    assert(
      (await fullEditorName.inputValue()) === staleFullValue,
      `Full editor lost stale local input at ${size.width}px.`
    )
    const callsAfterFullStale = await page.evaluate(() => window.__jobMock.saveCallCount)
    await page.waitForTimeout(900)
    assert(
      (await page.evaluate(() => window.__jobMock.saveCallCount)) === callsAfterFullStale,
      `Full editor retried stale save without user action at ${size.width}px.`
    )
    await page.getByRole('button', { name: '최신 기준으로 재시도' }).click()
    await page
      .getByRole('status')
      .filter({ hasText: '최신 기준으로 작업본을 저장했습니다.' })
      .waitFor()
    assert(
      (await fullEditorName.inputValue()) === staleFullValue,
      `Full editor retry lost local input at ${size.width}px.`
    )

    await page.getByRole('button', { name: '목록으로' }).click()
    await page.getByRole('button', { name: '기본 정보 수정' }).click()
    const inlineName = page.getByLabel('영문 이름')
    const staleInlineValue = `Hero Inline Stale ${size.width}`
    await page.evaluate(() => {
      window.__jobMock.staleNextSave = true
    })
    await inlineName.fill(staleInlineValue)
    await page.getByRole('button', { name: '작업본에 적용' }).click()
    await page
      .getByRole('alert')
      .filter({ hasText: '다른 변경으로 작업본 기준이 바뀌었습니다.' })
      .waitFor()
    assert(
      (await inlineName.inputValue()) === staleInlineValue,
      `Inline editor lost stale local input at ${size.width}px.`
    )
    const callsAfterInlineStale = await page.evaluate(() => window.__jobMock.saveCallCount)
    await page.waitForTimeout(900)
    assert(
      (await page.evaluate(() => window.__jobMock.saveCallCount)) === callsAfterInlineStale,
      `Inline editor retried stale save without user action at ${size.width}px.`
    )
    await page.getByRole('button', { name: '최신 기준으로 재시도' }).click()
    await page.getByText(staleInlineValue, { exact: true }).waitFor()

    await page.evaluate(() => {
      window.__jobMock.unavailableVersion = '1.2.420'
    })
    await navigate(page, '대시보드')
    await navigate(page, '직업 정보')
    await page
      .getByText('DB 직업 데이터는 볼 수 있지만 저장할 수 없습니다.', { exact: false })
      .waitFor()
    await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
    assert(
      await page.getByRole('button', { name: '기본 정보 수정' }).isDisabled(),
      `Unavailable inline editor stayed enabled at ${size.width}px.`
    )
    assert(
      await page.getByRole('button', { name: '히어로 전체 편집' }).isDisabled(),
      `Unavailable full editor route stayed enabled at ${size.width}px.`
    )

    await navigate(page, '에디터')
    await page
      .getByText('DB 직업 목록은 볼 수 있지만 편집 화면을 열거나 저장할 수 없습니다.', {
        exact: false
      })
      .waitFor()
    const unavailableRepresentatives = page.getByRole('region', {
      name: '1.2.420 최종 전직 대표'
    })
    assert(
      await unavailableRepresentatives
        .getByRole('button', { name: /히어로\s+hero\s+112/ })
        .isDisabled(),
      `Unavailable editor index button stayed enabled at ${size.width}px.`
    )
    const recovery = await openRecoveryPreview(page)
    assert(
      await recovery
        .locator('li')
        .filter({ hasText: '복구 검성' })
        .getByRole('button', { name: /복사/ })
        .isDisabled(),
      `Unavailable recovery copy stayed enabled at ${size.width}px.`
    )
    await page.evaluate(() => {
      window.__jobMock.unavailableVersion = ''
    })
    await navigate(page, '대시보드')
  }
}

async function assertWorkbenchSaveRequests(page) {
  const requests = await page.evaluate(() => window.__jobMock.saveRequests)
  assert(requests.length > 0, 'No workbench save request was recorded.')
  for (const request of requests) {
    assert(
      request.expectedChangeSetId === '11111111-1111-4111-8111-111111111111',
      `Save used wrong changeSetId: ${request.expectedChangeSetId}`
    )
    assert(
      !Object.hasOwn(request.draft, 'advancementJobIds'),
      `Save included advancementJobIds: ${JSON.stringify(request.draft)}`
    )
    assert(
      request.draft.newWeaponTypes.length === 0,
      `Save included newWeaponTypes: ${JSON.stringify(request.draft)}`
    )
  }
}

async function verifyAdjacentWeaponRoutes(page) {
  await navigate(page, '직업 정보')
  const representatives = page.getByRole('region', { name: '대표 직업' })
  await representatives.getByRole('button', { name: /히어로\s*112/ }).click()
  const detailPrimary = await detailValue(page, '주무기').innerText()
  const detailSecondary = await detailValue(page, '보조무기').innerText()
  await page.getByRole('button', { name: '히어로 전체 편집' }).click()
  const primary = page.getByRole('heading', { name: '주무기' }).locator('..')
  const secondary = page.getByRole('heading', { name: '보조무기' }).locator('..')
  const editorPrimary = await primary.innerText()
  const editorSecondary = await secondary.innerText()
  assert(
    detailPrimary.split(', ').every((name) => editorPrimary.includes(name)),
    `Primary weapons differed across adjacent routes: ${detailPrimary} / ${editorPrimary}`
  )
  assert(
    detailSecondary === '미입력' ||
      detailSecondary.split(', ').every((name) => editorSecondary.includes(name)),
    `Secondary weapons differed across adjacent routes: ${detailSecondary} / ${editorSecondary}`
  )
  await page.getByRole('button', { name: '목록으로' }).click()
  assert(
    (await detailValue(page, '주무기').innerText()) === detailPrimary,
    'Primary weapon changed on return.'
  )
  assert(
    (await detailValue(page, '보조무기').innerText()) === detailSecondary,
    'Secondary weapon changed on return.'
  )
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
  const timestamps = await center.locator('time').allInnerTexts()
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
      await verifyRepresentativeStageAccent(page, size, theme)
      await navigate(page, '에디터')
      await page.getByRole('heading', { name: '직업 에디터', level: 1 }).waitFor()
      await page.getByRole('button', { name: /히어로\s+hero\s+112/ }).click()
      await page.getByRole('heading', { name: '히어로', level: 1 }).waitFor()
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `Editor overflowed at ${size.width}px.`
      )
      const classGroupSelect = page.getByLabel('직업군')
      const classGroupBox = await classGroupSelect.boundingBox()
      const classGroupArrowBox = await classGroupSelect.locator('..').locator('svg').boundingBox()
      assert(
        classGroupBox &&
          classGroupBox.width <= 200 &&
          (await page.getByRole('group', { name: '주스탯' }).boundingBox()).width <=
            (await page.locator('main').boundingBox()).width,
        `Editor stat picker expanded beyond its container at ${size.width}px.`
      )
      assert(
        classGroupBox &&
          classGroupArrowBox &&
          classGroupBox.x + classGroupBox.width - classGroupArrowBox.x >= 20 &&
          classGroupBox.x + classGroupBox.width - classGroupArrowBox.x <= 32,
        `Editor select chevron was not inset at ${size.width}px.`
      )
      await page
        .getByText('전직 연결은 현재 metadata 편집 대상에서 제외됩니다.', { exact: false })
        .waitFor()
      assert(
        (await page.getByRole('button', { name: '전직 ID 연결' }).count()) === 0,
        'Excluded advancement control appeared.'
      )
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
    await verifyRecoveryPreview(page)
    await verifyEditorPicker(page)
    await verifyFullEditorSaveGuards(page)
    await verifyScreenshotNotifications(page)
    await verifyJobFlow(page)
    await verifyInlineContextGuards(page)
    await verifyWorkbenchGuardPaths(page)
    await verifyAdjacentWeaponRoutes(page)
    await verifyRouteRegression(page)
    await verifyRelatedRoutes(page)
    await assertWorkbenchSaveRequests(page)
    await page.setViewportSize({ width: 1480, height: 920 })
    await setTheme(page, 'dark')
    await navigate(page, '직업 정보')
    await page.screenshot({
      path: path.join(outputDirectory, 'job-data-e2e-desktop.png'),
      fullPage: true
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await setTheme(page, 'light')
    await navigate(page, '직업 정보')
    await page.getByRole('heading', { name: /히어로|렌/, level: 1 }).waitFor()
    await page.screenshot({
      path: path.join(outputDirectory, 'job-data-e2e-mobile.png'),
      fullPage: true
    })
    for (const { size, theme, filename } of [
      {
        size: { width: 1480, height: 920 },
        theme: 'dark',
        filename: 'job-editor-e2e-desktop.png'
      },
      {
        size: { width: 390, height: 844 },
        theme: 'light',
        filename: 'job-editor-e2e-mobile.png'
      }
    ]) {
      await page.setViewportSize(size)
      await setTheme(page, theme)
      await navigate(page, '에디터')
      await page.getByRole('button', { name: /제논\s+xenon\s+3612/ }).click()
      await page.getByRole('heading', { name: '제논', level: 1 }).waitFor()
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `Editor screenshot overflowed at ${size.width}px.`
      )
      await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: true })
    }
    console.log(
      'verified mocked job renderer stat and weapon pickers, English defaults, stage-4 row, persistence, routes, and screenshots at desktop 1480x920 and mobile 390x844'
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
