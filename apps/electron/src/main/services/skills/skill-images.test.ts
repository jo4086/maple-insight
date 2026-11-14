import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, expect, it, vi } from 'vitest'

import { listSkillImageData } from './skill-images'

vi.mock('@electron-toolkit/utils', () => ({ is: { dev: true } }))
vi.mock('electron', () => ({ app: { getAppPath: () => '' } }))

const temporaryRoots: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))
  )
})

it('reads icons only from the requested data version', async () => {
  const root = await mkdtemp(join(tmpdir(), 'maple-skill-images-'))
  temporaryRoots.push(root)
  const imageDirectory = join(root, '1.2.419', '112', '1121000')
  await mkdir(imageDirectory, { recursive: true })
  await writeFile(
    join(imageDirectory, 'icon.png'),
    Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(16)])
  )
  const identities = [{ jobId: '112', skillId: '1121000' }]

  const current = await listSkillImageData('1.2.419', identities, root)
  const other = await listSkillImageData('1.2.420', identities, root)

  expect(current[0].icon).toMatch(/^data:image\/png;base64,/)
  expect(other[0].icon).toBeNull()
})
