import type React from 'react';

declare global {
  type BaseComponentProps<T extends keyof JSX.IntrinsicElements> = React.ComponentProps<T>;
}

export {};

