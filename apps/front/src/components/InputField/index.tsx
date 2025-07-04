import cn from 'classnames';
import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const InputField = ({ className, ...rest }: InputFieldProps) => {
  return (
    <>
      <input className={cn('border border-red-500 px-4 py-2 my-8', className)} {...rest} />
    </>
  );
};
