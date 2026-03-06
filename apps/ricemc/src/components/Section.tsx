import React from 'react';

export function Section({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-[1080px] px-4 py-8 ${className}`}>{children}</section>;
}
