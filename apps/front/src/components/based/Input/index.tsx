import cn from 'classnames';
import type { InputHTMLAttributes } from 'react';
import './Input.css';
// import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  placeholder?: string;
}

export const Input = ({ className, placeholder, ...rest }: InputProps) => {
  return (
    <>
      <input
        className={cn('Input_Base', 'border border-gray-300', className)}
        placeholder={placeholder}
        {...rest}
      />
    </>
  );
};
