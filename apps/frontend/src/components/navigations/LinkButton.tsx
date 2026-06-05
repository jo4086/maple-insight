import { forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import type { Size, Variant } from '@/types/theme';

type LinkButtonProps = LinkProps & {
  variant?: Variant;
  size?: Size;
};

const variantClassName: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClassName: Record<Size, string> = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(({ variant = 'primary', size = 'md', className, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      className={twMerge('inline-flex items-center justify-center rounded-md font-medium transition-colors', variantClassName[variant], sizeClassName[size], className)}
      {...props}
    />
  );
});

LinkButton.displayName = 'LinkButton';
