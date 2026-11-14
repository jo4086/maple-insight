import type { JobGroup } from '../../../../shared/job-data'
import type { SkillSummary } from '../../../../shared/skill-data'
import type { SkillImageData } from '../../../../shared/skill-images'

import { stageLabel } from './skill-stage'
import { SkillIcon } from './SkillIcon'

type SkillTableProps = {
  skills: SkillSummary[]
  hasFilteredSkills: boolean
  selectedStage: string
  selectedGroup: JobGroup | null
  selectedSkillId: string | undefined
  images: Record<string, SkillImageData>
  onSelectSkill: (skillId: string) => void
}

export function SkillTable({
  skills,
  hasFilteredSkills,
  selectedStage,
  selectedGroup,
  selectedSkillId,
  images,
  onSelectSkill
}: SkillTableProps): React.JSX.Element {
  return (
    <div className="-mr-4 overflow-x-auto">
      <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-small">
        <colgroup>
          <col className="w-[96px]" />
          <col className="w-[64px]" />
          <col />
          <col className="w-[170px]" />
          <col className="w-[80px]" />
          <col className="w-[64px]" />
        </colgroup>
        <thead className="bg-app-surface-2 text-app-muted">
          <tr>
            <th className="px-1 py-2">스킬 ID</th>
            <th className="px-0 py-2 text-center">아이콘</th>
            <th className="px-3 py-2">스킬명</th>
            <th className="px-3 py-2">차수 · 직업</th>
            <th className="px-0 py-2 text-center">타입</th>
            <th className="px-0 py-2 text-center">최대 레벨</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => {
            const job = selectedGroup?.advancements.find(({ jobId }) => jobId === skill.jobId)
            return (
              <tr
                aria-selected={selectedSkillId === skill.skillId}
                className={`cursor-pointer border-b border-app-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-app-accent ${selectedSkillId === skill.skillId ? 'bg-app-accent-bg' : 'hover:bg-app-surface-hover'}`}
                key={skill.skillId}
                tabIndex={0}
                onClick={() => onSelectSkill(skill.skillId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectSkill(skill.skillId)
                  }
                }}
              >
                <td className="truncate px-1 py-3 font-mono text-[10px]" title={skill.skillId}>
                  {skill.skillId}
                </td>
                <td className="px-0 py-2 text-center">
                  <SkillIcon src={images[skill.skillId]?.icon} />
                </td>
                <td className="px-3 py-3 font-semibold">
                  <span className="block truncate">{skill.skillName}</span>
                </td>
                <td className="truncate px-3 py-3 text-app-muted">
                  {job
                    ? `${skill.hyper === 1 ? '하이퍼' : stageLabel(String(job.stage))} · ${job.displayName || job.jobName || selectedGroup?.representativeName}`
                    : skill.jobId}
                </td>
                <td
                  className="px-0 py-3 text-center text-app-muted"
                  title="액티브·패시브 분류 예정"
                >
                  —
                </td>
                <td className="px-0 py-3 text-center whitespace-nowrap">{skill.maxLevel ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!hasFilteredSkills && (
        <p className="py-10 text-center text-small text-app-muted">
          {selectedStage === '5'
            ? '현재 직업 데이터에는 5차 전용 jobID 연결이 없어 분류된 스킬이 없습니다.'
            : '표시할 스킬이 없습니다.'}
        </p>
      )}
    </div>
  )
}
