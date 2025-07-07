import cn from 'classnames';
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import { Box, Input } from '../../../components/based';
import { Icon } from '../../../components/based/Icon_gemini/index_gemini';
import './TextField.css';

import type { TextFieldProps } from './index_gemini.type';

export function TextField(props: TextFieldProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const {
    value,
    onChange,
    label,
    prefix = 'TextField',
    classNames,
    mode,
    onEnter,
    ...rest
  } = props;

  const shouldFloat = focused || value.length > 0;

  const rootClass = cn(
    `${prefix}-root`,
    classNames?.root,
    mode === 'tailwind' && props.tailwinds?.root,
  );
  const rootStyle = mode === 'style' ? props.styles?.root : undefined;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnter?.();
    }
  };

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
        onKeyDown={handleKeyDown}
        className={cn(
          `${prefix}-input`,
          classNames?.input,
          mode === 'tailwind' && props.tailwinds?.input,
        )}
        style={mode === 'style' ? props.styles?.input : undefined}
        {...rest}
      />
      <Label
        className={cn(
          `${prefix}-label`,
          classNames?.label,
          mode === 'tailwind' && props.tailwinds?.label,
        )}
        style={mode === 'style' ? props.styles?.label : undefined}
      >
        {label}
      </Label>
      <Divider className={cn(`${prefix}-divider`)}>{label}</Divider>
      <Icon
        modeType="union"
        mode="custom"
        modes={{
          src: 'search-line.svg',
          alt: '검색버튼',
        }}
        as="img"
        onClick={onEnter}
      />
      <Icon
        modeType="union"
        mode="component"
        modes={{
          component: FaSearch, // 삽입할 컴포넌트
        }}
        onClick={onEnter}
      />
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
