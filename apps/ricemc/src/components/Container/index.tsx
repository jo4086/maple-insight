import type React from 'react';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Container = ({ className, children }: Props) => {
  return <div className={`${className}`}>{children}</div>;
};
