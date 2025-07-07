import type { IconProps } from './Icon.type';

export const Icon = (props: IconProps) => {
  if (props.modeType === 'union') {
    if (props.mode === 'component') {
      const {
        modes: { component },
        ...rest
      } = props;
      const Render = component;

      return <Render {...rest} />;
    } else if (props.mode === 'img') {
      const {
        modeType: _modeType,
        mode: _mode,
        modes: { img },
        as: As,
        ...rest
      } = props;
      return <As {...img} {...rest} />;
    }
  }

  /*   if (props.modeType === 'union') {
    const mode = 'component'; // 또는 동적으로 결정

    if (mode === 'component') {
      return <>{props.modes.component.component}</>;
    } else if (mode === 'src') {
      return <img {...props.modes.src} />;
    }
  } */

  return <></>;
};
