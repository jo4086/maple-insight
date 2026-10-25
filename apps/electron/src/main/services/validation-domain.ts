import { basename, extname } from 'node:path'

import type { ValidationDataDomain } from '../../shared/data-validation'

export const skillValidationFileNames = [
  'ms_skill.json',
  'ms_skillH.json',
  'ms_skillCommon.json',
  'ms_skillLevel.json',
  'ms_skillPVPCommon.json'
] as const

export type SkillValidationFileName = (typeof skillValidationFileNames)[number]

const skillValidationFileNameSet = new Set<string>(skillValidationFileNames)

const domainPatterns: readonly [ValidationDataDomain, RegExp][] = [
  ['class', /^(?:ms[_-]?)?jobs?$/i],
  ['skill', /skill/i],
  ['equipment', /(?:equipment|equip|item)/i],
  ['monster', /(?:monster|mob|boss)/i]
]

export function resolveSkillValidationFileName(filePath: string): SkillValidationFileName | undefined {
  const fileName = basename(filePath)
  return skillValidationFileNameSet.has(fileName) ? (fileName as SkillValidationFileName) : undefined
}

export function resolveValidationDataDomain(filePath: string): ValidationDataDomain {
  if (resolveSkillValidationFileName(filePath)) return 'skill'

  const fileName = basename(filePath, extname(filePath))
  return domainPatterns.find(([, pattern]) => pattern.test(fileName))?.[0] ?? 'unknown'
}
