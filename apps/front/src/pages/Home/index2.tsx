import React, { useState } from 'react';

import { useSendNick } from '../../api/mutations';
import { TextField, Sidebar } from '../../components';

export const Home = () => {
  const [nick, setNick] = useState<string>('');
  const [activeTab, setActiveTab] = useState('캐릭터');
  // const mutation = useSendNick();
  const { mutate, data, isPending, error, isSuccess, isError } = useSendNick();

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
    mutate(nick);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isPending) {
    return (
      <>
        <TextField
          mode="tailwind"
          onInput={(e) => handleOnInput({ e, maxLength: 6 })}
          onChange={(e) => setNick(e.target.value)}
          onEnter={handleSubmit}
          value={nick}
          label="닉네임"
        />
      </>
    );
  }

  return (
    <>
      <Sidebar activeTab="" isCollapsed={false} onTabChange={handleTabChange} />
      <TextField
        mode="tailwind"
        onInput={(e) => handleOnInput({ e, maxLength: 6 })}
        onChange={(e) => setNick(e.target.value)}
        onEnter={handleSubmit}
        value={nick}
        label="닉네임"
      />
      {/*       <button
        // onSubmit={handleSubmit}
        onClick={handleSubmit}
      >
        검색{' '}
      </button> */}

      {isError && <p>Error: {error?.message}</p>}
      {isSuccess && data && (
        <div>
          <h2>검색 결과:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </>
  );
};

export default Home;
