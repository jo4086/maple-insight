import { twMerge } from 'tailwind-merge';

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

const Container = ({ children, className, ...props }: Props) => {
  return (
    <div className={twMerge('mx-auto flex px-4', className)} {...props}>
      {children}
    </div>
  );
};

export default Container;
