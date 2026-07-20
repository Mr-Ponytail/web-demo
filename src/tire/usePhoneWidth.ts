import { useLayoutEffect, useState } from 'react';

/** Width of the `.phone` frame (matches app window width for detail card math). */
export function usePhoneWidth(): number {
  const [width, setWidth] = useState(() =>
    Math.min(430, typeof window !== 'undefined' ? window.innerWidth : 390),
  );

  useLayoutEffect(() => {
    const el = document.querySelector('.phone');
    if (!el) return;

    const update = () => setWidth(el.clientWidth || 390);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return width;
}
