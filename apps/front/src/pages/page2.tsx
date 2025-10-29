import { cn } from '@/shared';
import React, { useEffect, useRef } from 'react';

/**
 * BaseComponentProps is assumed to be a globally available type,
 * similar to its usage in 'src/pages/page.tsx'.
 */

// 1. React.forwardRef를 사용하여 AdBanner 컴포넌트가 ref를 받을 수 있도록 수정합니다.
const AdBanner = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <aside className="w-[300px] max-w-[300px] flex-shrink-0">
      {/* 2. 이 div가 실제로 sticky 동작을 하므로, 여기에 ref를 연결합니다. */}
      <div
        ref={ref}
        className="max-w-[300px] sticky top-16 flex h-[600px] items-center justify-center rounded-md bg-gray-200 w-full"
      >
        <span className="text-gray-500">Ad Banner (300x600)</span>
      </div>
    </aside>
  );
});

AdBanner.displayName = 'AdBanner';

const Box = ({ className }: { className?: string }) => {
  return <div className={cn('h-87 w-full rounded-lg bg-gray-100', className)}></div>;
};

function Section({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <section className={cn('w-full', className)} {...rest}>
      {children}
    </section>
  );
}

export const Page2 = () => {
  // 3. 광고 배너와 감지 지점을 위한 ref를 생성합니다.
  const leftAdRef = useRef<HTMLDivElement>(null);
  const rightAdRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adElements = [leftAdRef.current, rightAdRef.current];
    const sentinel = sentinelRef.current;

    if (!sentinel || !adElements.every(Boolean)) {
      return;
    }

    // 4. Intersection Observer 콜백 함수를 정의합니다.
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const sentinelEntry = entries[0];

      adElements.forEach((ad) => {
        if (!ad) return;
        // 부모 <aside> 요소를 찾습니다.
        const parentAside = ad.parentElement as HTMLElement;
        if (!parentAside) return;

        // 5. 감지 지점이 화면에 보이면 (콘텐츠 끝에 도달하면)
        if (sentinelEntry.isIntersecting) {
          const rect = ad.getBoundingClientRect();
          const top = rect.top;

          ad.style.position = 'fixed';
          ad.style.top = `${top}px`;
          ad.style.bottom = 'auto';

          // 광고 배너를 부모(<aside>)의 맨 아래에 고정시킵니다.
          // parentAside.style.position = 'relative';
          // ad.style.position = 'absolute';
          // ad.style.top = 'auto';
          // ad.style.bottom = '0';
        } else {
          ad.style.position = 'sticky';
          ad.style.top = '64px'; // Tailwind 'top-8'
          ad.style.bottom = 'auto';

          // 6. 감지 지점이 화면 밖으로 나가면 (아직 콘텐츠 중간이면)
          // 원래의 sticky 상태로 되돌립니다.
          // parentAside.style.position = ''; // 기본값으로 복원
          // ad.style.position = 'sticky';
          // ad.style.top = '32px'; // Tailwind 'top-8'에 해당하는 값
          // ad.style.bottom = 'auto';
        }
      });
    };

    // 7. Observer를 생성하고 감지를 시작합니다.
    const observer = new IntersectionObserver(observerCallback);
    observer.observe(sentinel);

    // 8. 컴포넌트가 언마운트될 때 observer를 정리합니다.
    return () => {
      observer.disconnect();
    };
  }, []); // 빈 배열로 이펙트가 한 번만 실행되도록 합니다.

  return (
    <div className="flex flex-row justify-center gap-x-8 py-8 w-full">
      <main className="w-full max-w-[1200px]">
        <div className="grid grid-cols-2 grid-rows-2 gap-6">
          <Box />
          <Box />
          <Box />
          <Box />
          {/* 추가적인 콘텐츠 박스들... */}
          <Box />
          <Box />
          <Box />
          <Box />
        </div>
        {/* 9. 콘텐츠의 맨 아래에 감지 지점(sentinel) 요소를 추가합니다. */}
        <div ref={sentinelRef} style={{ height: '1px' }}></div>
      </main>
    </div>
  );
};

/*
const AdBanner = () => {
  return (
    <aside className="w-[300px] flex-shrink-0">
      <div className="sticky top-16 flex h-[600px] items-center justify-center bg-gray-200 rounded-md">
        <span className="text-gray-500">Ad Banner (300x600)</span>
      </div>
    </aside>
  );
};

const Box = ({ className }: { className?: string }) => {
  return <div className={cn('h-87 w- border rounded-lg bg-gray-100', className)}></div>;
};

function Section({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <section className={cn('w-full', className)} {...rest}>
      {children}
    </section>
  );
}

export const Page2 = () => {
  return (
    <div className="flex flex-row justify-center gap-x-8 py-8 w-full h-[2000px]">
      <AdBanner />
      <main className="w-full max-w-[1200px]">
        <Section>
          <div className="bg-orange-100 w-full p-6 grid gap-6 grid-cols-2 grid-rows-2">
            <Box />
            <Box />
            <Box />
            <Box />
          </div>
        </Section>
      </main>
      <AdBanner />
    </div>
  );
};
*/

