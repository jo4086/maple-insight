import cn from 'classnames';
import './Box.css';

export const Box = ({ children, className, ...rest }: BaseComponentProps<'div'>) => {
  return (
    <div className={cn('Box_base', className)} {...rest}>
      {children}
    </div>
  );
};
