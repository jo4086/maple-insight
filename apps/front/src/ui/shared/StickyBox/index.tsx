import { React, cn } from '@/shared';

type CSSUnit = `${number}px` | `${number}%` | `${number}rem` | `${number}em`;

interface StickyBoxProps {
  position?: 'left' | 'right';
  children?: React.ReactNode;
  width?: number | CSSUnit;
  height?: number | CSSUnit;
}

export const StickyBox = ({ position = 'left', children }: StickyBoxProps) => {
  return (
    <aside
      className={cn('fixed top-80 z-40 hidden lg:block w-75 h-150', {
        'left-[calc((100vw-1200px)/2-344px)]': position === 'left',
        'right-[calc((100vw-1200px)/2-344px)]': position === 'right',
      })}
    >
      <div className={cn('w-full h-full rounded-md', 'bg-gray-200', 'flex items-center justify-center')}>
        {children}
      </div>
    </aside>
  );
};
