export function EmptyState({
  symbol,
  title,
  description
}: {
  symbol: string
  title: string
  description: string
}): React.JSX.Element {
  return (
    <section className="mt-4 flex min-h-[270px] flex-col items-center justify-center rounded-[10px] border border-dashed border-app-border-strong bg-app-surface text-center">
      <div className="mb-3.5 grid h-11 min-w-11 place-items-center rounded-[10px] bg-app-accent-bg px-2 text-small text-app-accent">
        {symbol}
      </div>
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
    </section>
  )
}
