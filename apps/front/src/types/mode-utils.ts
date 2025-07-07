export const MODES = {
  component: 'component',
  custom: 'custom',
} as const;

export type ModeKeys = keyof typeof MODES;

/* // 2. 공통 Props
export interface BaseProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
} */

// 3. component 모드 유틸
export type ComponentModeProps = {
  mode: typeof MODES.component; // 고정값
  component: React.ElementType;
};

/* // 4. custom 모드 유틸 (제네릭 as 지원)
export type CustomModeProps<AsTag extends React.ElementType = 'img'> = {
  mode: typeof MODES.custom;
  as?: AsTag;
  modes: React.ComponentPropsWithoutRef<AsTag>;
}; */

/* // 5. 최종 CreateModeSelector 유틸 (Discriminated Union)
export type CreateModeSelector<AsTag extends React.ElementType = 'img'> =
  | (BaseProps & ComponentModeProps)
  | (BaseProps & CustomModeProps<AsTag>); */

interface BaseProps {
  as?: keyof React.JSX.IntrinsicElements; // 선택적
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

type UnionModeProps<Modes extends Record<string, unknown>> = {
  [K in keyof Modes]: {
    modeType: 'union';
    mode: K;
    modes: Modes[K]; // ✅ 여기서 modes에 타입 그대로
  };
}[keyof Modes];

export type CreateModeSelector<Common, Modes extends Record<string, unknown>> =
  | ({ modeType: 'common'; custom: Common } & BaseProps)
  | (UnionModeProps<Modes> & BaseProps);
