import type React from 'react';

// Icon.type.ts
import type { CreateModeSelector } from '../../../types/mode-utils';

/* // IconProps 생성 (필요하면 as 태그 타입 명시 가능)
export type IconProps<AsTag extends React.ElementType = 'img'> = CreateModeSelector<AsTag>; */

// modes 정의
type IconModes = {
  component: { component: React.ElementType };
  custom: React.ComponentPropsWithoutRef<'img'>; // 기본 img 태그 props
};

// 공통 props 정의 (없으면 {}로)
type CommonProps = object;
/* interface CommonProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
} */

// 타입 정의 (정상 작동)
export type IconProps = CreateModeSelector<CommonProps, IconModes>;
