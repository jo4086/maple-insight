import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CharacterSearchInput = () => {
  const [nick, setNick] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    const trimmedNick = nick.trim();
    if (!trimmedNick) return;

    navigate(`/character?nick=${encodeURIComponent(trimmedNick)}`);
    setNick('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex border border-gray-300 rounded-lg w-fit px-2 py-1 gap-4">
      <input className="p-1 text-sm outline-none" value={nick} onChange={(e) => setNick(e.currentTarget.value)} onKeyDown={handleKeyDown} placeholder="닉네임 검색" />

      <button className="px-4 text-sm border rounded-md border-gray-300 cursor-pointer" type="button" onClick={handleSubmit}>
        검색
      </button>
    </div>
  );
};
