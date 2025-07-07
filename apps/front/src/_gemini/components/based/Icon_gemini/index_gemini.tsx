import React from 'react';

import type { IconProps } from './Icon_gemini.type';

export function Icon(props: IconProps) {
  const { className, onClick } = props;

  if (props.modeType === 'union') {
    if (props.mode === 'component') {
      const Component = props.modes.component;
      return <Component className={className} onClick={onClick} />;
    }

    if (props.mode === 'custom') {
      const Tag = props.as || 'img';
      return (
        <Tag
          {...(props.modes as Record<string, unknown>)}
          className={props.className}
          onClick={props.onClick as unknown as React.MouseEventHandler<Element>}
        />
      );
    }
  }
  return null;
}
