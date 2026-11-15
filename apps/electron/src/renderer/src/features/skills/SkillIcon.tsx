import { Image as ImageIcon } from 'lucide-react'

import type { SkillImageData } from '../../../../shared/skill-images'

type SkillIconProps = {
  src: string | null | undefined
  alt?: string
  size?: 'table' | 'detail'
}

export function SkillIcon({ src, alt = '', size = 'table' }: SkillIconProps): React.JSX.Element {
  if (src) {
    return (
      <img
        alt={alt}
        className={size === 'table' ? 'mx-auto h-7 w-7 object-contain' : 'h-8 w-8 object-contain'}
        src={src}
        title={size === 'table' ? '등록된 스킬 이미지' : undefined}
      />
    )
  }

  if (size === 'detail') {
    return <ImageIcon aria-hidden="true" className="text-app-muted" size={18} />
  }

  return (
    <span
      aria-label="스킬 이미지 미등록"
      className="mx-auto grid h-7 w-7 place-items-center rounded border border-app-border-strong bg-app-surface-2 text-app-muted"
    >
      <ImageIcon aria-hidden="true" size={15} />
    </span>
  )
}

type SkillIconGalleryProps = {
  skillName: string
  images: SkillImageData | undefined
}

export function SkillIconGallery({ skillName, images }: SkillIconGalleryProps): React.JSX.Element {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2" aria-label="스킬 아이콘">
      {(
        [
          ['icon', '기본'],
          ['iconMouseOver', '마우스 오버'],
          ['iconDisabled', '비활성화']
        ] as const
      ).map(([variant, label]) => (
        <div
          className="rounded border border-app-border bg-app-surface p-2 text-center"
          key={variant}
        >
          <div className="mx-auto grid h-10 w-10 place-items-center">
            <SkillIcon alt={`${skillName} ${label} 아이콘`} size="detail" src={images?.[variant]} />
          </div>
          <span className="text-caption text-app-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}
