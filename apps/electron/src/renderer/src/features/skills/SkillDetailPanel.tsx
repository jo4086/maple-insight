import type { SkillSummary } from '../../../../shared/skill-data'
import type { SkillImageData } from '../../../../shared/skill-images'

import { SkillIconGallery } from './SkillIcon'
import { SkillLevelPanel } from './SkillLevelPanel'

type SkillDetailPanelProps = {
  skill: SkillSummary | null
  images: SkillImageData | undefined
  version: string
}

export function SkillDetailPanel({
  skill,
  images,
  version
}: SkillDetailPanelProps): React.JSX.Element {
  return (
    <aside
      aria-label="스킬 상세"
      className="min-w-0 border-l border-app-border p-4 max-[1199px]:col-span-2 max-[1199px]:border-t max-[1199px]:border-l-0 max-[767px]:col-span-1"
    >
      <h2 className="m-0 border-b border-app-border pb-3 text-body font-bold">스킬 상세</h2>
      {skill ? (
        <div className="mt-4">
          <strong className="block text-[17px]">{skill.skillName}</strong>
          <span className="mt-1 block font-mono text-caption text-app-muted">{skill.skillId}</span>
          <SkillIconGallery images={images} skillName={skill.skillName} />
          <dl className="mt-5 divide-y divide-app-border text-small">
            {(
              [
                ['직업 ID', skill.jobId],
                ['최대 레벨', skill.maxLevel ?? '—'],
                ['요구 레벨', skill.reqLevel ?? '—'],
                ['선행 스킬', skill.reqSkill ?? '—'],
                ['선행 스킬 레벨', skill.reqSkillLevel ?? '—']
              ] as const
            ).map(([label, value]) => (
              <div className="grid grid-cols-[110px_1fr] py-2" key={label}>
                <dt className="text-app-muted">{label}</dt>
                <dd className="m-0 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-6 text-small font-semibold">설명</h3>
          <p className="whitespace-pre-wrap rounded-lg border border-app-border bg-app-surface p-3 text-small text-app-muted">
            {skill.skillDesc || '등록된 설명이 없습니다.'}
          </p>
          <SkillLevelPanel
            key={`${version}:${skill.skillId}`}
            maxLevel={skill.maxLevel}
            skillId={skill.skillId}
            version={version}
          />
        </div>
      ) : (
        <p className="mt-4 text-small text-app-muted">목록에서 스킬을 선택하세요.</p>
      )}
    </aside>
  )
}
