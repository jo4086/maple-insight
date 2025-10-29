import React from 'react';

import type { IconProps } from './Icon.type';

/* export function Icon<AsTag extends React.ElementType = 'img'>(props: IconProps) {
  const { className, onClick } = props;

  if (props.mode === 'component') {
    const Component = props.component;
    return <Component className={className} onClick={onClick} />;
  }

  // custom 모드
  const Tag = props.as || 'img';
  return <Tag {...props.modes} className={className} onClick={onClick} />;
} */

export function Icon(props: IconProps) {
  const { className, onClick } = props;

  if (props.modeType === 'union') {
    if (props.mode === 'component') {
      const Component = props.modes.component; // ✅ 정상
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
}
