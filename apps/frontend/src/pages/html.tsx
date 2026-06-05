import { useState } from 'react';

import { LinkButton } from '@/components';
import { LoginModal } from '@/features/auth';
import { CharacterSearchInput } from '@/features/character';

const notices = [
  { type: '게임 공지', title: '업데이트 공지 연동 준비 중', date: 'API 연결 예정' },
  { type: '게임 공지', title: '이벤트 공지 연동 준비 중', date: 'API 연결 예정' },
  { type: '서비스 공지', title: 'Maple Insight 개인 공지 영역입니다.', date: '관리자 작성 예정' },
];

export const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <section className="mx-auto flex min-h-[calc(100lvh-80px)] w-full max-w-full flex-col overflow-x-hidden px-3 py-4 sm:max-w-[1180px] sm:px-4 sm:py-6">
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-950 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">MI</div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-gray-950 sm:text-base">Maple Insight</h1>
              <p className="mt-0.5 text-xs leading-5 text-gray-500">캐릭터와 게임 데이터를 한 곳에서 확인합니다.</p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <LinkButton to="/admin" size="sm" variant="secondary" className="w-full sm:w-auto">
              관리자
            </LinkButton>
            <button className="inline-flex h-8 w-full items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto" type="button" onClick={() => setIsLoginModalOpen(true)}>
              로그인
            </button>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col justify-center gap-8 py-10 sm:gap-10 sm:py-12">
          <div className="mx-auto flex w-full max-w-[760px] min-w-0 flex-col items-center text-center">
            <p className="text-sm font-medium text-blue-600">Character Search</p>
            <h2 className="mt-3 max-w-full break-keep text-3xl font-bold leading-tight tracking-normal text-gray-950 sm:text-4xl lg:text-5xl">캐릭터 정보를 빠르게 조회하세요</h2>
            <p className="mt-4 max-w-[560px] text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
              닉네임으로 캐릭터 정보를 검색하고, 장비와 주요 성장 데이터를 확인할 수 있습니다.
            </p>

            <CharacterSearchInput
              className="mt-7 h-auto w-full flex-col items-stretch rounded-md border-gray-200 px-3 py-3 shadow-sm min-[420px]:h-14 min-[420px]:flex-row min-[420px]:items-center min-[420px]:px-4 min-[420px]:py-1 sm:mt-8"
              inputClassName="text-sm min-[420px]:text-base"
              buttonClassName="h-10 w-full border-blue-600 bg-blue-600 px-5 text-white hover:bg-blue-700 min-[420px]:w-auto"
            />
          </div>

          <section className="mx-auto w-full max-w-[760px] min-w-0 rounded-md border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-950">공지사항</h3>
                <p className="mt-1 text-xs text-gray-500">게임 API 공지와 서비스 공지를 함께 보여줄 영역입니다.</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <button
                  key={`${notice.type}-${notice.title}`}
                  className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-gray-50 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-4 sm:px-5"
                  type="button"
                >
                  <div className="min-w-0 max-w-full">
                    <span className="text-xs font-medium text-blue-600">{notice.type}</span>
                    <p className="mt-1 truncate text-sm font-medium text-gray-950">{notice.title}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{notice.date}</span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </section>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Home;
