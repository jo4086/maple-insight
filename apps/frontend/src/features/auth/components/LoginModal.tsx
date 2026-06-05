import { useEffect, useState, type FormEvent } from 'react';
import { FiKey, FiX } from 'react-icons/fi';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApiKeySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-6" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <button className="absolute inset-0 h-full w-full cursor-default" type="button" aria-label="로그인 모달 닫기" onClick={onClose} />

      <div className="relative w-full max-w-[420px] rounded-md bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id="login-modal-title" className="text-lg font-bold text-gray-950">
              API Key 등록
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">직접 발급한 Nexon Open API Key로 Maple Insight를 시작합니다.</p>
          </div>

          <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900" type="button" onClick={onClose} aria-label="닫기">
            <FiX className="h-5 w-5" />
          </button>
        </header>

        <div className="px-5 py-5">
          <form className="grid gap-3" onSubmit={handleApiKeySubmit}>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Nexon API Key</h3>
              <p className="mt-1 text-xs leading-5 text-gray-500">직접 발급한 Nexon Open API Key를 입력합니다.</p>
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-medium text-gray-600">Nexon API Key</span>
              <div className="flex h-11 min-w-0 items-center gap-2 rounded-md border border-gray-200 px-3 focus-within:border-blue-500">
                <FiKey className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  className="min-w-0 flex-1 text-sm outline-none"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.currentTarget.value)}
                  placeholder="API Key 입력"
                  autoComplete="off"
                />
              </div>
            </label>

            <button className="h-10 rounded-md border border-blue-600 bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!apiKey.trim()}>
              API Key로 시작하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
