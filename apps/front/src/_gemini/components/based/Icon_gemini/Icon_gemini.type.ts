import type React from 'react';
import type { CreateModeSelector } from '../../../types/mode-utils_gemini';

type IconModes = {
  component: { component: React.ElementType };
  custom: React.ComponentPropsWithoutRef<'img'>;
};

type CommonProps = object;

export type IconProps = CreateModeSelector<CommonProps, IconModes>;
