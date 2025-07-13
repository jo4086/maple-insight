import { React, cn } from '@/shared';
export const Typography = ({ className, children, ...rest }: BaseComponentProps<'p'>) => {
  return (
    <p className={cn('typo_base', className)} {...rest}>
      {children}
    </p>
  );
};
