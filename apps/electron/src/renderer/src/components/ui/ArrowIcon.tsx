type ArrowDirection = 'right' | 'down'

export function ArrowIcon({
  direction,
  className
}: {
  direction: ArrowDirection
  className?: string
}): React.JSX.Element {
  const path = direction === 'right' ? 'M3 8h10M9 4l4 4-4 4' : 'M8 3v10M4 9l4 4 4-4'

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 16 16"
    >
      <path d={path} />
    </svg>
  )
}
