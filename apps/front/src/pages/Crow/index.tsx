import cn from 'classnames';

import './Crow.css';
import { useState } from 'react';

import { TextField } from '../../components';

export const Crow = () => {
  const [value, setValue] = useState<string>('');

  return (
    <Container>
      <TextField mode="style" onChange={(e) => setValue(e.target.value)} value={value} label="닉네임" />
    </Container>
  );
};

function Container({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn('crow-root', className)} {...rest}>
      {children}
    </div>
  );
}

function Title({ children, className, ...rest }: BaseComponentProps<'p'>) {
  return (
    <p className={cn('crow-title', className)} {...rest}>
      {children}
    </p>
  );
}
