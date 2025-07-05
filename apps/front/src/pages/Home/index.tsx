import React, { useState } from 'react';

import { TextField } from '../../components';

export const Home = () => {
  const [nick, setNick] = useState<string>('');

  interface HandleOnInputProps {
    e: React.FormEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>;
    maxLength: number;
  }
  const handleOnInput = ({ e, maxLength }: HandleOnInputProps) => {
    const target = e.currentTarget;
    const value = target.value;

    if (value.length > maxLength) target.value = value.substr(0, maxLength);
  };

  return (
    <>
      <TextField
        mode="tailwind"
        onInput={(e) => handleOnInput({ e, maxLength: 6 })}
        onChange={(e) => setNick(e.target.value)}
        value={nick}
        label="닉네임"
      />
    </>
  );
};

export default Home;
