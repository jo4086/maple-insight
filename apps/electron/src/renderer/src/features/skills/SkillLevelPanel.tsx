import { useEffect, useState } from 'react'

import type { SkillLevel } from '../../../../shared/skill-data'
import { getErrorMessage } from '../../shared/lib/error-message'

import { highlightChangedTokens } from './skill-level-text'

type SkillLevelPanelProps = {
  version: string
  skillId: string
  maxLevel: number | null
}

export function SkillLevelPanel({
  version,
  skillId,
  maxLevel
}: SkillLevelPanelProps): React.JSX.Element {
  const [levels, setLevels] = useState<SkillLevel[] | null>(null)
  const [currentLevel, setCurrentLevel] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLevels(null)
    setCurrentLevel(null)
    setError('')
    void window.api.listSkillLevels({ version, skillId }).then(
      (result) => {
        if (!active) return
        const ordered = result.filter(({ level }) => level > 0).sort((a, b) => a.level - b.level)
        setLevels(ordered)
        setCurrentLevel(ordered[0]?.level ?? null)
      },
      (reason: unknown) => {
        if (active) setError(getErrorMessage(reason))
      }
    )
    return () => {
      active = false
    }
  }, [version, skillId])

  const currentIndex = levels?.findIndex(({ level }) => level === currentLevel) ?? -1
  const current = levels?.[currentIndex]
  const masterLevel = maxLevel && maxLevel > 0 ? maxLevel : levels?.at(-1)?.level
  const masterTarget = levels?.filter(({ level }) => level <= (masterLevel ?? 0)).at(-1)?.level
  const comparison = currentIndex > 0 ? levels?.[currentIndex - 1] : levels?.[1]
  const currentDescription = current?.levelDesc?.replace(/\\n/g, '\n')
  const comparisonDescription = comparison?.levelDesc?.replace(/\\n/g, '\n') ?? null

  return (
    <section aria-label="레벨별 스킬 정보" className="mt-6 border-t border-app-border pt-4">
      <h3 className="m-0 text-small font-semibold">레벨별 스킬 정보</h3>
      {error && (
        <p className="mt-3 text-small text-app-danger" role="alert">
          {error}
        </p>
      )}
      {!levels && !error && (
        <p className="mt-3 text-small text-app-muted">레벨 정보를 불러오는 중입니다.</p>
      )}
      {levels?.length === 0 && (
        <p className="mt-3 text-small text-app-muted">등록된 레벨 정보가 없습니다.</p>
      )}
      {current && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <strong className="mr-auto text-small">
              {current.level}/{masterLevel} 스킬 정보
            </strong>
            <button
              aria-label="레벨 내리기"
              className="action-secondary"
              disabled={currentIndex === 0}
              type="button"
              onClick={() => setCurrentLevel(levels?.[currentIndex - 1]?.level ?? current.level)}
            >
              −
            </button>
            <button
              aria-label="레벨 올리기"
              className="action-secondary"
              disabled={currentIndex === (levels?.length ?? 0) - 1}
              type="button"
              onClick={() => setCurrentLevel(levels?.[currentIndex + 1]?.level ?? current.level)}
            >
              +
            </button>
            <button
              className="action-secondary"
              disabled={!masterTarget || current.level === masterTarget}
              type="button"
              onClick={() => setCurrentLevel(masterTarget ?? current.level)}
            >
              마스터하기
            </button>
          </div>
          {masterLevel && current.level > masterLevel && (
            <p className="mt-2 text-caption text-app-muted">
              기본 최대 레벨을 초과한 레벨 정보입니다.
            </p>
          )}
          <p className="mt-3 whitespace-pre-wrap rounded-lg border border-app-border bg-app-surface p-3 text-small text-app-muted">
            {currentDescription
              ? highlightChangedTokens(currentDescription, comparisonDescription).map(
                  ({ text, changed }, index) =>
                    changed ? (
                      <span className="font-semibold text-app-accent" key={index}>
                        {text}
                      </span>
                    ) : (
                      text
                    )
                )
              : '등록된 레벨 설명이 없습니다.'}
          </p>
        </>
      )}
    </section>
  )
}
