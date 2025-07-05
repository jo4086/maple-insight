import type React from 'react';

type Tailwindcss = string;
type InlineStyle = React.CSSProperties;

// 공통 Props
interface CommonProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  prefix?: string;
  classNames?: {
    root?: string;
    input?: string;
    label?: string;
  };
}

// Tailwind 스타일 Props
interface TailwindStyleProps {
  tailwinds?: {
    root?: Tailwindcss;
    input?: Tailwindcss;
    label?: Tailwindcss;
  };
}

// 인라인 스타일 Props
interface InlineStyleProps {
  styles?: {
    root?: InlineStyle;
    input?: InlineStyle;
    label?: InlineStyle;
  };
}

type TailwindProps = {
  mode: 'tailwind';
} & CommonProps &
  TailwindStyleProps &
  Omit<BaseComponentProps<'input'>, 'style'>;

type StyleProps = {
  mode: 'style';
} & CommonProps &
  InlineStyleProps &
  Omit<BaseComponentProps<'input'>, 'style'>;

export type TextFieldProps = TailwindProps | StyleProps;

/*
  export type TextFieldProps<T extends StyleMode = 'tailwind'> = {
  mode: T;
} & CommonProps &
  (T extends 'style' ? InlineStyleProps : TailwindStyleProps) &
  Omit<BaseComponentProps<'input'>, 'style'>;
 */
