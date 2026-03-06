import type { InputHTMLAttributes } from 'react';
import type React from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Input = (props: Props) => {
  return (
    <>
      <input {...props} />
    </>
  );
};
