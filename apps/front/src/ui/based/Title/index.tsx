import { React, cn } from '@/shared';
export const Title = ({ className, children, ...rest }: BaseComponentProps<'h1'>) => {
  return (
    <p className={cn('title_base', className)} {...rest}>
      {children}
    </p>
  );
};
