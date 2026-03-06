import { useEffect, useMemo, useRef, useState } from 'react';

type ImageMode = 'full' | 'contained';
type ControlsMode = 'outside' | 'inside';

export interface Slide {
  id: string;
  imageUrl: string;
  alt?: string;
  href?: string;
  title?: string;
  subtitle?: string;
  period?: string;
}

interface CarouselBannerProps {
  slides: Slide[];
  autoplayMs?: number; // 예: 5000 (고정값)
  heightPx?: number; // 예: 370 (고정값)
  maxWidthPx?: number; // 예: 1080 (고정값)

  imageMode?: ImageMode; // ✅ 이미지/배경 폭
  controlsMode?: ControlsMode; // ✅ 버튼 위치 옵션
}

export default function CarouselBanner({ slides, autoplayMs = 0, heightPx = 370, maxWidthPx = 1080, imageMode = 'full', controlsMode = 'outside' }: CarouselBannerProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;
  const timerRef = useRef<number | null>(null);

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  const trackStyle = useMemo(() => ({ transform: `translateX(-${index * 100}%)` }), [index]);

  // ✅ 수동 이동 후에도 5초 리셋되는 autoplay (timeout)
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

  // ✅ 1080 기준 계산
  const half = maxWidthPx / 2; // 1080이면 540
  const outsideLeft = `calc(50% - ${half}px - 56px)`; // 버튼을 1080 바깥으로 조금(56px) 더 빼기
  const outsideRight = `calc(50% + ${half}px + 56px)`; // 오른쪽도 동일
  const insideLeft = `calc(50% - ${half}px + 12px)`; // 1080 안쪽 여백
  const insideRight = `calc(50% + ${half}px - 12px)`;

  const leftPos = controlsMode === 'outside' ? outsideLeft : insideLeft;
  const rightPos = controlsMode === 'outside' ? outsideRight : insideRight;

  // ✅ imageMode에 따라 “이미지 트랙을 감싸는 뷰포트” 폭 결정
  // - full: 화면 전체
  // - contained: 1080
  const viewportClass = 'relative overflow-hidden w-full';
  const viewportStyle = imageMode === 'contained' ? ({ maxWidth: maxWidthPx, margin: '0 auto', height: heightPx } as const) : ({ height: heightPx } as const);

  // ✅ 텍스트는 항상 1080 안쪽
  const textWrapStyle = { maxWidth: maxWidthPx, margin: '0 auto' } as const;

  return (
    <section className="w-full">
      {/* 뷰포트(이미지 폭을 결정) */}
      <div className={viewportClass} style={viewportStyle}>
        {/* 트랙 */}
        <div className="flex h-full transition-transform duration-500 ease-out" style={trackStyle}>
          {slides.map((s) => {
            const Inner = (
              <div className="relative h-full w-full flex-shrink-0">
                <img src={s.imageUrl} alt={s.alt ?? ''} className="h-full w-full object-cover" draggable={false} />

                {/* ✅ 글씨는 항상 1080 안쪽 */}
                {(s.title || s.subtitle || s.period) && (
                  <div className="absolute inset-0">
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

        {/* ✅ 버튼 레이어: “화면 기준”으로 배치하되, 1080 기준으로 바깥/안쪽 계산 */}
        {/* imageMode=contained여도 버튼은 화면(섹션) 기준으로 밖에 둘 수 있음 */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
          style={{ left: leftPos }}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={goNext}
          className="absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/30"
          style={{ left: rightPos, transform: 'translate(-100%, -50%)' }}
          aria-label="Next slide"
        >
          ›
        </button>

        {/* ✅ 컨트롤바도 “텍스트와 같은 1080 안쪽”에 두는 게 보통 예쁨 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
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

              {/* 전체보기는 여기에 버튼/링크로 추가하면 됨 */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
