import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export const TopNavBar = ({ children, className, ...props }: ComponentProps<'div'>) => {
  return (
    <div className={twMerge('mx-auto flex border', className)} {...props}>
      <svg viewBox="0 0 300 300" width="300" height="300" fill="blue" className="border">
        <circle cx="150" cy="150" r="100" />
        <path d="M50 50 L250 250 V150 H50 L50 Z" />
        <svg fill="green">
          <rect x="100" y="100" width="100" height="100" />
        </svg>
      </svg>
      {children}
    </div>
  );
};
