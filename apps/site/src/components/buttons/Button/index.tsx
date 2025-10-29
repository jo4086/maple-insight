import cn from 'classnames';

export function Button({ className, children, ...rest }: BaseComponent<'button'>) {
  return (
    <>
      <button className={cn('button_base', className)} {...rest}>
        {children}
      </button>
    </>
  );
}
