import { useState, type KeyboardEvent } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type CharacterSearchInputProps = {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

export const CharacterSearchInput = ({ className, inputClassName, buttonClassName }: CharacterSearchInputProps) => {
  const [nick, setNick] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    const trimmedNick = nick.trim();
    if (!trimmedNick) return;

    navigate(`/character?nick=${encodeURIComponent(trimmedNick)}`);
    setNick('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={twMerge('flex max-w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-1', className)}>
      <FiSearch className="h-4 w-4 shrink-0 text-gray-400" />
      <input
        className={twMerge('min-w-0 flex-1 p-1 text-sm outline-none', inputClassName)}
        value={nick}
        onChange={(e) => setNick(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="닉네임 검색"
      />

      <button className={twMerge('h-8 max-w-full rounded-md border border-gray-300 px-4 text-sm font-medium transition-colors hover:bg-gray-50', buttonClassName)} type="button" onClick={handleSubmit}>
        검색
      </button>
    </div>
  );
};
