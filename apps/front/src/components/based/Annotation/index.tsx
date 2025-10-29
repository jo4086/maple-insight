import { cn } from '@/shared';
export const Annotation = ({ className, children, ...rest }: BaseComponentProps<'span'>) => {
  return (
    <span className={cn('annot_base', className)} {...rest}>
      {children}
    </span>
  );
};
