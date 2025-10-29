import cn from 'classnames';
import './Container.css';

export const Container = ({ children, className, ...rest }: BaseComponentProps<'div'>) => {
  return (
    <div className={cn('container_base', className)} {...rest}>
      {children}
    </div>
  );
};
