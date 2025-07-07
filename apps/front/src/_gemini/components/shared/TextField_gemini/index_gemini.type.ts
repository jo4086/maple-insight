import type React from 'react';
import type { CreateVariantSelector } from '../../../types/mode-utils_gemini';

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
  onEnter?: () => void;
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

// Variants
const variants = {
    tailwind: {} as TailwindStyleProps,
    style: {} as InlineStyleProps
}

export type TextFieldProps = CreateVariantSelector<CommonProps, typeof variants> & Omit<React.ComponentProps<'input'>, 'style'>;
