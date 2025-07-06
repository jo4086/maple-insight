import React, { useState } from 'react';

import { useSendNick } from '../../api/mutations';
import { TextField } from '../../components';

export const Home = () => {
  const [nick, setNick] = useState<string>('');
  const mutation = useSendNick();

  interface HandleOnInputProps {
    e: React.FormEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>;
    maxLength: number;
  }
  const handleOnInput = ({ e, maxLength }: HandleOnInputProps) => {
    const target = e.currentTarget;
    const value = target.value;

    if (value.length > maxLength) target.value = value.substr(0, maxLength);
  };

  const handleSubmit = () => {
    mutation.mutate(nick);
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
      <button onClick={handleSubmit}>검색 </button>

      {mutation.isPending && <p>Sending...</p>}
      {mutation.isSuccess && <p>Success!</p>}
      {mutation.isError && <p>Error: {mutation.error?.message}</p>}
    </>
  );
};

export default Home;
