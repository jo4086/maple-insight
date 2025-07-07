// import type { JSX } from 'react';

interface BaseProps {
  as: keyof React.JSX.IntrinsicElements;
}

/* export type ModeSelector<CommonCustomProps, Modes extends Record<string, object>> =
  | ({ modeType: 'common'; custom: CommonCustomProps } & BaseProps)
  | ({ modeType: 'union'; modes: Modes } & BaseProps); */

/* 
type ModeSelector<CommonProps, Modes> =
  | ({ modeType: 'common'; custom: CommonProps } & BaseProps)
  | ({ modeType: 'union'; mode: keyof Modes; modes: Modes } & BaseProps);

type CreateModeSelector<Common, Modes extends Record<string, object>> =
  | { modeType: 'common'; custom: Common }
  | UnionModeProps<Modes>;

export type CreateModeSelector<CommonProps, Modes extends Record<string, object>> = ModeSelector<
  CommonProps,
  Modes
>; */

type UnionModeProps<Modes extends Record<string, unknown>> = {
  [K in keyof Modes]: {
    modeType: 'union';
    mode: K;
    modes: Pick<Modes, K>;
  };
}[keyof Modes];

export type CreateModeSelector<Common, Modes extends Record<string, unknown>> =
  | ({ modeType: 'common'; custom: Common } & Common & BaseProps)
  | (UnionModeProps<Modes> & Common & BaseProps);

/* const testCom: MyProps = {
  modeType: 'common',
  as: 'input',
  custom: {
    value: 'hello',
    onChange: (e) => console.log(e),
    label: 'Label',
    prefix: 'Prefix',
    classNames: {
      root: 'root-class',
      input: 'input-class',
      label: 'label-class',
    },
    onEnter: () => {},
  },
};

const testUnion: MyProps = {
  modeType: 'union',
  as: 'div',
  modes: {
    tailwind: {
      tailwinds: {
        root: 'root-class',
        input: 'input-class',
        label: 'label-class',
      },
    },
    style: {
      styles: {
        root: { color: 'red' },
        input: { fontSize: '16px' },
        label: { fontWeight: 'bold' },
      },
    },
  },
}; */
