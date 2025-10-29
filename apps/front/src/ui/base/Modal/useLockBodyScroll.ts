import { useEffect } from 'react';

export default function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const { overflow, paddingRight } = document.body.style;
    const scrollBarw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';

    if (scrollBarw > 0) document.body.style.paddingRight = `${scrollBarw}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [lock]);
}
