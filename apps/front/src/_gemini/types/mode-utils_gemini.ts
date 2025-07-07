export const MODES = {
  component: 'component',
  custom: 'custom',
} as const;

export type ModeKeys = keyof typeof MODES;

interface BaseProps {
  as?: keyof React.JSX.IntrinsicElements; // 선택적
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

type UnionModeProps<Modes extends Record<string, unknown>> = {
  [K in keyof Modes]: {
    modeType: 'union';
    mode: K;
    modes: Modes[K];
  };
}[keyof Modes];

export type CreateModeSelector<Common, Modes extends Record<string, unknown>> =
  | ({ modeType: 'common'; custom: Common } & BaseProps)
  | (UnionModeProps<Modes> & BaseProps);

/**
 * Creates a discriminated union type for components with different variants.
 * This is useful when a 'mode' prop determines other available props at the top level.
 *
 * @template CommonProps - An object type for props that are common to all variants.
 * @template VariantProps - A record where keys are mode names and values are the props specific to that mode.
 */
export type CreateVariantSelector<
  CommonProps extends object,
  VariantProps extends Record<string, object>
> = CommonProps & {
  [ModeKey in keyof VariantProps]: {
    mode: ModeKey;
  } & VariantProps[ModeKey];
}[keyof VariantProps];
