import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';

export interface Slide {
  id: string;
  imageUrl?: string;
  alt?: string;
  href?: string;
}

interface SlideBannerProps {
  slides: Slide[];

  /**
   * ms당 이동 픽셀(= pxPerMs)로 해석합니다.
   * 예: 0.08이면 1초에 80px 이동
   */
  speedMs?: number; // ✅ 예시값: 0.06 ~ 0.15

  heightPx?: number;
  maxWidthPx?: number;

  imageMode?: 'full' | 'contained';
  children?: React.ReactNode;

  /** 아이템 간격(px) */
  gapPx?: number;
}

export function SlideBanner(props: SlideBannerProps) {
  const {
    children,
    slides,
    speedMs = 0.08, // ✅ 예시값 (ms당 px)
    heightPx = 80, // ✅ 예시값
    maxWidthPx,
    imageMode = 'contained',
    gapPx = 24, // ✅ 예시값
  } = props;

  const trackRef = useRef<HTMLDivElement>(null);
  const posX = useRef(0); // ✅ 고정: number
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // slides 2번 이어붙이기 (끊김 방지)
  const loopSlides = useMemo(() => {
    if (!slides || slides.length === 0) return [];
    return [...slides, ...slides];
  }, [slides]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (loopSlides.length === 0) return;

    const animate = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current; // 지난 프레임과의 시간(ms)
      lastTsRef.current = ts;

      // speedMs = pxPerMs (ms당 px)
      posX.current -= speedMs * dt;

      // 트랙 절반 너비만큼 이동하면 원점으로(무한 루프)
      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0 && Math.abs(posX.current) >= halfWidth) {
        // "나머지"를 유지하면 더 부드러움
        posX.current = posX.current % halfWidth;
      }

      el.style.transform = `translate3d(${posX.current}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
    // loopSlides가 바뀌면 트랙 너비도 달라질 수 있어서 의존성 포함
  }, [loopSlides, speedMs]);

  const fitClass = imageMode === 'full' ? 'object-cover' : 'object-contain';

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        height: heightPx, // ✅ 고정값 아님(프롭)
        maxWidth: maxWidthPx, // ✅ 고정값 아님(프롭)
      }}
    >
      {/* children이 배너 위에 오길 원하면 여기, 아래에 오길 원하면 맨 아래로 옮기면 됨 */}
      {children}

      <div className="relative h-full">
        <div
          ref={trackRef}
          className="flex h-full whitespace-nowrap will-change-transform"
          style={{ gap: gapPx }} // ✅ 예시값(프롭)
        >
          {loopSlides.map((s, idx) => {
            const content = (
              <div key={`${s.id}-${idx}`} className="flex h-full items-center justify-center">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.alt ?? ''} className={`h-full w-auto ${fitClass}`} draggable={false} />
                ) : (
                  <div className="h-full w-[160px] rounded bg-gray-200" />
                )}
              </div>
            );

            return s.href ? (
              <a key={`${s.id}-${idx}`} href={s.href} className="block h-full" aria-label={s.alt ?? 'slide link'}>
                {content}
              </a>
            ) : (
              content
            );
          })}
        </div>
      </div>
    </div>
  );
}
