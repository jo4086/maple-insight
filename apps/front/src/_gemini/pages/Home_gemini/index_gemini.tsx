import React, { useState } from 'react';

import { useSendNick } from '../../../api/mutations';
import { TextField } from '../../../_gemini/components/shared/TextField_gemini/index_gemini';

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
        onEnter={handleSubmit}
        value={nick}
        label="닉네임"
        tailwinds={{
          root: 'bg-gray-100',
          input: 'text-blue-500',
          label: 'text-green-500',
        }}
      />
      {mutation.isPending && <p>Sending...</p>}
      {mutation.isSuccess && <p>Success!</p>}
      {mutation.isError && <p>Error: {mutation.error?.message}</p>}
    </>
  );
};

export default Home;
