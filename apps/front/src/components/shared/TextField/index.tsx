import cn from 'classnames';
import React, { useState } from 'react';

import { Box, Input } from '../../based';
import './TextField.css';

import type { TextFieldProps } from './index.type';

export function TextField(props: TextFieldProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const { value, onChange, label, prefix = 'TextField', classNames, mode, ...rest } = props;

  console.log(value);
  const shouldFloat = focused || value.length > 0;

  const rootClass = cn(
    `${prefix}-root`,
    classNames?.root,
    mode === 'tailwind' ? props.tailwinds?.root : undefined,
  );
  const rootStyle = mode === 'style' ? props.styles?.root : undefined;

  return (
    <Container
      className={cn(`${rootClass}`, 'rounded border border-blue-300', {
        'is-floating': shouldFloat,
      })}
      style={rootStyle}
    >
      <Input
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          `${prefix}-input`,
          classNames?.input,
          mode === 'tailwind' ? props.tailwinds?.input : undefined,
        )}
        style={mode === 'style' ? props.styles?.input : undefined}
        {...rest}
      />
      <Label
        className={cn(
          `${prefix}-label`,
          classNames?.label,
          mode === 'tailwind' ? props.tailwinds?.label : undefined,
        )}
        style={mode === 'style' ? props.styles?.label : undefined}
      >
        {label}
      </Label>
      <Divider className={cn(`${prefix}-divider`)}>{label}</Divider>
    </Container>
  );
}

function Container({ children, ...rest }: React.ComponentProps<'div'>) {
  return <Box {...rest}>{children}</Box>;
}

function Label({ children, ...rest }: React.ComponentProps<'div'>) {
  return <Box {...rest}>{children}</Box>;
}

function Divider({ children, ...rest }: React.ComponentProps<'div'>) {
  return <Box {...rest}>{children}</Box>;
}
