const colors = {
  done: 'bg-app-accent shadow-[0_0_10px_#55e6b070]',
  progress: 'bg-app-warning',
  waiting: 'bg-app-dim'
} as const

export function StatusDot({ state }: { state: keyof typeof colors }): React.JSX.Element {
  return <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${colors[state]}`} />
}
