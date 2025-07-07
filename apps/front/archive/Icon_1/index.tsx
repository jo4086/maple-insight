import type { IconProps } from './Icon.type';

export const Icon = (props: IconProps) => {
  const tagMap = {
    img: 'img',
    component: 'span',
    button: 'button',
    // 필요한 추가 모드들...
  } as const;

  if (props.modeType === 'union') {
    const As = tagMap[props.as]; // ✅ 타입 에러 사라짐

    if (props.modeType === 'union') {
      if (props.mode === 'img') {
        const {
          modes: { img },
          ...rest
        } = props;
        return <As {...img} {...rest} />;
      }
      if (props.mode === 'component') {
        const {
          modeType: _modeType,
          mode: _mode,
          modes: { component: _component },
          ...rest
        } = props;

        const RenderComponent = props.modes.component;
        return <RenderComponent {...rest} />;
      }
    }
  }

  return null;
};
