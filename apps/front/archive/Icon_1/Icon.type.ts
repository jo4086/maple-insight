import type React from 'react';

import type { CreateModeSelector } from '../../../types/mode-utils';

type ComponentModeProps = React.ElementType;

interface CommonProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

// type SrcModeProps = React.ImgHTMLAttributes<HTMLImageElement>;
type ImgModeProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onClick'>;
type IconMode = {
  component: ComponentModeProps;
  img: ImgModeProps;
};

export type IconProps = CreateModeSelector<CommonProps, IconMode>;
