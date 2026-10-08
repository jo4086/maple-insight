import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}): React.JSX.Element {
  return (
    <header className="mb-8 flex items-end justify-between gap-8">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </header>
  )
}
