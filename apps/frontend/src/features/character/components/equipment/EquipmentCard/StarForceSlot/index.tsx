const STARFORCE_ROW_SIZE = 15;
const STARFORCE_GROUP_SIZE = 5;

const StarForceRow = ({ limit, filled }: { limit: number; filled: number }) => {
  const visibleCount = Math.min(limit, STARFORCE_ROW_SIZE);
  const filledCount = Math.min(filled, visibleCount);
  const leadingHiddenCount = Math.floor((STARFORCE_ROW_SIZE - visibleCount) / 2);
  const trailingHiddenCount = STARFORCE_ROW_SIZE - visibleCount - leadingHiddenCount;

  const slots = [
    ...Array.from({ length: leadingHiddenCount }, (_, index) => ({
      key: `pad-left-${index}`,
      type: 'hidden' as const,
      visibleOrder: null,
    })),
    ...Array.from({ length: visibleCount }, (_, index) => ({
      key: `star-${index}`,
      type: index < filledCount ? ('filled' as const) : ('empty' as const),
      visibleOrder: index + 1,
    })),
    ...Array.from({ length: trailingHiddenCount }, (_, index) => ({
      key: `pad-right-${index}`,
      type: 'hidden' as const,
      visibleOrder: null,
    })),
  ];

  return (
    <div className="flex w-[240px] items-center justify-center gap-x-px">
      {slots.map((slot) => {
        const needsGroupGap = slot.visibleOrder !== null && slot.visibleOrder < visibleCount && slot.visibleOrder % STARFORCE_GROUP_SIZE === 0;
        const gapClass = needsGroupGap ? 'mr-2' : '';

        if (slot.type === 'hidden') {
          return <span key={slot.key} className={`block h-3 w-3 ${gapClass}`} aria-hidden="true" />;
        }

        const isFilled = slot.type === 'filled';
        const starClassName = isFilled ? 'fill-yellow-300 stroke-white/30' : 'fill-gray-500';

        return (
          <span key={slot.key} className={gapClass}>
            <svg viewBox="0 0 24 24" className={isFilled ? 'size-3' : 'size-3 drop-shadow-[0_0_2px_rgba(150,150,150,0.2)]'}>
              <path
                d="M12 2.5l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 16.8 6.4 19.7l1.1-6.2L3
  9.1l6.2-.9L12 2.5z"
                className={starClassName}
                strokeWidth={isFilled ? '1' : '0'}
              />
            </svg>
          </span>
        );

        return (
          <span key={slot.key} className={gapClass}>
            <svg viewBox="0 0 24 24" className="size-3">
              <path
                d="M12 2.5l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 16.8 6.4 19.7l1.1-6.2L3
  9.1l6.2-.9L12 2.5z"
                className={slot.type === 'filled' ? 'fill-yellow-300 stroke-white/30' : 'fill-gray-800 stroke-white/1'}
                strokeWidth="1"
              />
            </svg>
          </span>
        );
      })}
    </div>
  );
};

export const StarForceSlot = ({ starforce, starforceLimit }: { starforce: number; starforceLimit: number }) => {
  const normalizedLimit = Math.max(0, Math.min(starforceLimit, STARFORCE_ROW_SIZE * 2));
  const normalizedStarforce = Math.max(0, Math.min(starforce, normalizedLimit));

  if (normalizedLimit <= STARFORCE_ROW_SIZE) {
    return <StarForceRow limit={normalizedLimit} filled={normalizedStarforce} />;
  }

  const topLimit = STARFORCE_ROW_SIZE;
  const bottomLimit = normalizedLimit - STARFORCE_ROW_SIZE;
  const topFilled = Math.min(normalizedStarforce, STARFORCE_ROW_SIZE);
  const bottomFilled = Math.max(0, normalizedStarforce - STARFORCE_ROW_SIZE);

  return (
    <div className="flex flex-col items-center gap-px">
      <StarForceRow limit={topLimit} filled={topFilled} />
      <StarForceRow limit={bottomLimit} filled={bottomFilled} />
    </div>
  );
};
