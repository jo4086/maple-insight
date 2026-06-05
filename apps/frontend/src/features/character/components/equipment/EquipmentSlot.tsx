import { twMerge } from 'tailwind-merge';

type EquipmentSlotProps = {
  icon?: string;
  label: string;
  className?: string;
  potentialOptionGrade?: string | null;
  additionalPotentialOptionGrade?: string | null;
};

const GRADE_PRIORITY = {
  legendary: 4,
  unique: 3,
  epic: 2,
  rare: 1,
  normal: 0,
} as const;

const GRADE_BORDER_CLASS = {
  legendary: 'border-green-400 bg-green-300/10',
  unique: 'border-yellow-400 bg-yellow-300/10',
  epic: 'border-purple-400 bg-purple-300/10',
  rare: 'border-blue-400 bg-blue-300/10',
  normal: 'border-gray-400 bg-gray-300/50',
} as const;

type GradeKey = keyof typeof GRADE_PRIORITY;

const normalizeGrade = (grade?: string | null): GradeKey | null => {
  if (!grade) return 'normal';

  const normalized = grade.trim().toLowerCase();

  if (normalized === '레전드리' || normalized === 'legendary') return 'legendary';
  if (normalized === '유니크' || normalized === 'unique') return 'unique';
  if (normalized === '에픽' || normalized === 'epic') return 'epic';
  if (normalized === '레어' || normalized === 'rare') return 'rare';

  return 'normal';
};

const getHigherGrade = (potentialOptionGrade?: string | null, additionalPotentialOptionGrade?: string | null): GradeKey | null => {
  const potentialGrade = normalizeGrade(potentialOptionGrade);
  const additionalGrade = normalizeGrade(additionalPotentialOptionGrade);

  if (!potentialGrade) return additionalGrade;
  if (!additionalGrade) return potentialGrade;

  return GRADE_PRIORITY[potentialGrade] >= GRADE_PRIORITY[additionalGrade] ? potentialGrade : additionalGrade;
};

export const EquipmentSlot = ({ icon, label, className, potentialOptionGrade, additionalPotentialOptionGrade }: EquipmentSlotProps) => {
  const higherGrade = getHigherGrade(potentialOptionGrade, additionalPotentialOptionGrade);
  const borderClass = higherGrade ? GRADE_BORDER_CLASS[higherGrade] : 'border-white/10';

  return (
    <div className={twMerge('flex h-full w-full items-center justify-center border rounded-md bg-white/5', borderClass, className)} title={label}>
      {icon ? (
        <div className={twMerge('flex h-12 w-12 items-center justify-center rounded-[5px] bg-black/30', borderClass)}>
          <img
            className="max-h-10 max-w-10 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] select-none"
            src={icon}
            alt={label}
            referrerPolicy="no-referrer"
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          />
        </div>
      ) : (
        <div className="h-12 w-12 border rounded-[5px] border-gray-300 bg-gray-300/50" />
      )}
    </div>
  );
};
