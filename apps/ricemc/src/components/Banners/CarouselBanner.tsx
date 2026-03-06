import { useEffect, useMemo, useRef, useState } from 'react';

type BannerVariant = 'full' | 'contained';

export interface Slide {
  id: string;
  imageUrl: string;
  alt?: string;
  href?: string;
  // 텍스트가 있으면 Kurly처럼 컨테이너 안에 얹기
  title?: string;
  subtitle?: string;
  period?: string;
}

interface CarouselBannerProps {
  variant?: BannerVariant;
  maxWidthPx?: number; // 예시값, 기본 1080
  heightPx?: number; // 예시값, 기본 370 정도
  slides: Slide[];
  autoplayMs?: number; // 0이면 자동재생 없음

  // ✅ 전체보기 버튼 동작: 둘 중 하나만 쓰면 됨
  viewAllHref?: string; // 예: "/events" (라우팅)
  onViewAllClick?: () => void; // 예: 모달 오픈
}

export default function CarouselBanner({ variant = 'full', maxWidthPx = 1080, heightPx = 370, slides, autoplayMs = 0, viewAllHref, onViewAllClick }: CarouselBannerProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;
  const timerRef = useRef<number | null>(null);

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  const wrapperStyle = useMemo(
    () => ({
      transform: `translateX(-${index * 100}%)`,
    }),
    [index],
  );

  useEffect(() => {
    if (!autoplayMs || total <= 1) return;
    if (isPaused) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % total);
    }, autoplayMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, autoplayMs, total, isPaused]);

  // const containerClass = variant === 'contained' ? `mx-auto max-w-[${maxWidthPx}px]` : 'w-full';
  const containerClass = variant === 'contained' ? 'mx-auto w-full' : 'w-full';
  const containerStyle = variant === 'contained' ? { maxWidth: maxWidthPx } : undefined;

  const togglePause = () => setIsPaused((p) => !p);

  const handleViewAll = () => {
    if (onViewAllClick) return onViewAllClick();
    // viewAllHref는 아래에서 <a>로 처리(여기서는 아무것도 안 함)
  };

  const ViewAllButton = () => {
    // onViewAllClick이 있으면 버튼, 아니면 링크
    if (onViewAllClick) {
      return (
        <button type="button" onClick={handleViewAll} className="h-8 rounded-full bg-black/45 px-3 text-xs text-white hover:bg-black/55">
          전체보기
        </button>
      );
    }
    if (viewAllHref) {
      return (
        <a href={viewAllHref} className="inline-flex h-8 items-center rounded-full bg-black/45 px-3 text-xs text-white hover:bg-black/55">
          전체보기
        </a>
      );
    }
    return null;
  };

  return (
    <section className="w-full">
      {/* 풀 배경 레이어 */}
      <div className="w-full overflow-hidden">
        {/* ✅ 버튼 기준이 되는 1080 wrapper */}
        <div className="mx-auto relative" style={{ maxWidth: 1080, height: heightPx }}>
          {/* 슬라이드 트랙 */}
          <div className="flex h-full transition-transform duration-500 ease-out" style={wrapperStyle}>
            {slides.map((s) => {
              const SlideInner = (
                <div className="relative h-full w-full flex-shrink-0">
                  <img src={s.imageUrl} alt={s.alt ?? ''} className="h-full w-full object-cover" draggable={false} />

                  {(s.title || s.subtitle || s.period) && (
                    <div className="absolute inset-0">
                      <div className="mx-auto max-w-[1080px] px-4 h-full flex items-center">
                        <div className="text-black">
                          {s.title && <h2 className="text-4xl font-semibold">{s.title}</h2>}
                          {s.subtitle && <p className="mt-3 text-lg opacity-80">{s.subtitle}</p>}
                          {s.period && <p className="mt-10 text-sm opacity-70">{s.period}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );

              return s.href ? (
                <a key={s.id} href={s.href} className="block h-full w-full flex-shrink-0">
                  {SlideInner}
                </a>
              ) : (
                <div key={s.id} className="h-full w-full flex-shrink-0">
                  {SlideInner}
                </div>
              );
            })}
          </div>

          {/* ✅ 이제 버튼이 1080 안쪽 */}

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
            aria-label="Next slide"
          >
            ›
          </button>

          <button className="absolute left-0 top-1/2 -translate-y-1/2">‹</button>

          <button className="absolute right-0 top-1/2 -translate-y-1/2">›</button>

          {/* 컨트롤바도 동일 */}
          <div className="absolute bottom-4 right-0">
            <span>{index + 1}</span>
            <span className="opacity-70">/ {total}</span>

            <span className="mx-1 h-4 w-px bg-white/25" />

            <button
              type="button"
              onClick={togglePause}
              className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/45"
              aria-label={isPaused ? 'Play autoplay' : 'Pause autoplay'}
              title={isPaused ? '재생' : '일시정지'}
            >
              {isPaused ? '▶' : '❚❚'}
            </button>

            <ViewAllButton />
          </div>
        </div>
      </div>
    </section>

    // <section className="w-full">
    //   <div className={`${containerClass} relative overflow-hidden`} style={{ ...containerStyle, height: heightPx }}>
    //     {/* 트랙 */}
    //     <div className="flex h-full transition-transform duration-500 ease-out" style={wrapperStyle}>
    //       {slides.map((s) => {
    //         const SlideInner = (
    //           <div className="relative h-full w-full flex-shrink-0">
    //             <img src={s.imageUrl} alt={s.alt ?? ''} className="h-full w-full object-cover" draggable={false} />
    //
    //             {(s.title || s.subtitle || s.period) && (
    //               <div className="absolute inset-0">
    //                 <div className="mx-auto max-w-[1080px] px-4 h-full flex items-center">
    //                   <div className="text-black">
    //                     {s.title && <h2 className="text-4xl font-semibold">{s.title}</h2>}
    //                     {s.subtitle && <p className="mt-3 text-lg opacity-80">{s.subtitle}</p>}
    //                     {s.period && <p className="mt-10 text-sm opacity-70">{s.period}</p>}
    //                   </div>
    //                 </div>
    //               </div>
    //             )}
    //           </div>
    //         );
    //
    //         return s.href ? (
    //           <a key={s.id} href={s.href} className="block h-full w-full flex-shrink-0">
    //             {SlideInner}
    //           </a>
    //         ) : (
    //           <div key={s.id} className="h-full w-full flex-shrink-0">
    //             {SlideInner}
    //           </div>
    //         );
    //       })}
    //     </div>
    //
    //     {/* 좌/우 버튼 */}
    //     <button
    //       type="button"
    //       onClick={goPrev}
    //       className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
    //       aria-label="Previous slide"
    //     >
    //       ‹
    //     </button>
    //     <button
    //       type="button"
    //       onClick={goNext}
    //       className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
    //       aria-label="Next slide"
    //     >
    //       ›
    //     </button>
    //
    //     {/* ✅ 우하단 컨트롤 바: (현재/전체) + 일시정지 + 전체보기 */}
    //     <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-white text-sm">
    // <span>{index + 1}</span>
    // <span className="opacity-70">/ {total}</span>
    //
    // <span className="mx-1 h-4 w-px bg-white/25" />
    //
    // <button
    //   type="button"
    //   onClick={togglePause}
    //   className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/45"
    //   aria-label={isPaused ? 'Play autoplay' : 'Pause autoplay'}
    //   title={isPaused ? '재생' : '일시정지'}
    // >
    //   {isPaused ? '▶' : '❚❚'}
    // </button>
    //
    // <ViewAllButton />
    //     </div>
    //   </div>
    // </section>
  );

  return (
    <section className="w-full">
      <div className={`${containerClass} relative overflow-hidden`} style={{ height: heightPx }}>
        {/* 트랙 */}
        <div className="flex h-full transition-transform duration-500 ease-out" style={wrapperStyle}>
          {slides.map((s) => {
            const SlideInner = (
              <div className="relative h-full w-full flex-shrink-0">
                <img src={s.imageUrl} alt={s.alt ?? ''} className="h-full w-full object-cover" draggable={false} />

                {/* ✅ Kurly처럼 텍스트는 컨테이너로 가운데 정렬 */}
                {(s.title || s.subtitle || s.period) && (
                  <div className="absolute inset-0">
                    <div className="mx-auto max-w-[1080px] px-4 h-full flex items-center">
                      <div className="text-black">
                        {s.title && <h2 className="text-4xl font-semibold">{s.title}</h2>}
                        {s.subtitle && <p className="mt-3 text-lg opacity-80">{s.subtitle}</p>}
                        {s.period && <p className="mt-10 text-sm opacity-70">{s.period}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );

            return s.href ? (
              <a key={s.id} href={s.href} className="block h-full w-full flex-shrink-0">
                {SlideInner}
              </a>
            ) : (
              <div key={s.id} className="h-full w-full flex-shrink-0">
                {SlideInner}
              </div>
            );
          })}
        </div>

        {/* 좌/우 버튼 (뷰포트 기준) */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
          aria-label="Next slide"
        >
          ›
        </button>

        {/* 인디케이터 */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-white text-sm">
          <span>{index + 1}</span>
          <span className="opacity-70">/ {total}</span>
        </div>
      </div>
    </section>
  );
}
