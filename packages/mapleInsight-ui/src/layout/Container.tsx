export function Container({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
