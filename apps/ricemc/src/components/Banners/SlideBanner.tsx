import { useEffect, useMemo, useRef, useState } from 'react';

type ImageMode = 'full' | 'contained';
type Mode = 'outside' | 'inside';

export interface Slide {
  id: string;
  imageUrl: string;
  alt?: string;
  href?: string;
  title?: string;
  subtitle?: string;
  period?: string;
  className?: string;
}

interface CarouselBannerProps {
  slides: Slide[];
  autoplayMs?: number; // 고정값 예: 5000
  heightPx?: number; // 고정값 예: 370
  maxWidthPx?: number; // 고정값 예: 1080

  imageMode?: ImageMode; // 이미지 폭: full/contained
  mode?: Mode; // 버튼 위치: outside/inside
}

export default function CarouselBanner({ slides, autoplayMs = 0, heightPx = 370, maxWidthPx = 1080, imageMode = 'full', mode = 'outside' }: CarouselBannerProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;
  const timerRef = useRef<number | null>(null);

  // Prev/Next: 연타 안정
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  const trackStyle = useMemo(() => ({ transform: `translateX(-${index * 100}%)` }), [index]);

  // autoplay: index 바뀔 때마다 타이머 재설정 => 수동 넘기면 5초 리셋
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

  // ====== 레이아웃 계산 ======
  const textWrapStyle = useMemo(() => ({ maxWidth: maxWidthPx, margin: '0 auto' }) as const, [maxWidthPx]);

  // viewport(이미지 영역) 스타일: imageMode에 따라 폭이 달라짐
  const viewportStyle = useMemo(() => {
    if (imageMode === 'contained') {
      return { maxWidth: maxWidthPx, margin: '0 auto', height: heightPx } as const;
    }
    return { width: '100%', height: heightPx } as const;
  }, [imageMode, maxWidthPx, heightPx]);

  // 버튼 위치: 1080 기준으로 inside/outside 계산
  const half = maxWidthPx / 2; // 1080 -> 540

  // outside일 때: 1080 바깥으로 56px 더 뺌(원하면 조절)
  const outsideLeft = `calc(50% - ${half}px - 56px)`;
  const outsideRight = `calc(50% + ${half}px + 56px)`;

  // inside일 때: 1080 안쪽으로 12px 넣음(원하면 조절)
  const insideLeft = `calc(50% - ${half}px + 12px)`;
  const insideRight = `calc(50% + ${half}px - 12px)`;

  const leftPos = mode === 'outside' ? outsideLeft : insideLeft;
  const rightPos = mode === 'outside' ? outsideRight : insideRight;

  return (
    <section className="w-full">
      {/* ✅ OUTER: 버튼/컨트롤바 기준 레이어 (overflow-visible) */}
      <div className="relative w-full overflow-visible">
        {/* ✅ VIEWPORT: 슬라이드만 잘라내는 영역 (여기만 overflow-hidden) */}
        <div className="overflow-hidden" style={viewportStyle}>
          <div className="flex h-full transition-transform duration-500 ease-out" style={trackStyle}>
            {slides.map((s) => {
              const Inner = (
                <div className="relative h-full w-full flex-shrink-0">
                  <img src={s.imageUrl} alt={s.alt ?? ''} className="h-full w-full object-cover" draggable={false} />

                  {/* ✅ 글씨는 항상 1080 안쪽 */}
                  {(s.title || s.subtitle || s.period) && (
                    <div className={`absolute inset-0 ${s.className}`}>
                      <div style={textWrapStyle} className="h-full px-4 flex items-center">
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
                  {Inner}
                </a>
              ) : (
                <div key={s.id} className="h-full w-full flex-shrink-0">
                  {Inner}
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ 버튼은 VIEWPORT 밖에 있어야 contained에서도 안 잘림 */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute z-20 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
          style={{ left: leftPos }}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={goNext}
          className="absolute z-20 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
          style={{ left: rightPos, transform: 'translate(-100%, -50%)' }}
          aria-label="Next slide"
        >
          ›
        </button>

        {/* ✅ 컨트롤바: 텍스트와 같은 1080 기준으로 우측 정렬 */}
        <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
          <div style={textWrapStyle} className="flex justify-end">
            <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-white text-sm">
              <span>{index + 1}</span>
              <span className="opacity-70">/ {total}</span>

              <span className="mx-1 h-4 w-px bg-white/25" />

              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/45"
                aria-label={isPaused ? 'Play autoplay' : 'Pause autoplay'}
                title={isPaused ? '재생' : '일시정지'}
              >
                {isPaused ? '▶' : '❚❚'}
              </button>

              {/* 전체보기 버튼은 여기서 추가 */}
              <button className="h-8 rounded-full bg-black/45 px-3 text-xs hover:bg-black/55">전체보기</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
