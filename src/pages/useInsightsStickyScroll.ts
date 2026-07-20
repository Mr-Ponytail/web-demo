import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  INSIGHTS_TITLE_COLLAPSE_DISTANCE,
  insightsGaugeFillOpacity,
  insightsStickyClipHeight,
  insightsStickyShiftY,
  insightsTitleOpacity,
} from './insightsScrollConstants';

export function useInsightsStickyScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRowRef = useRef<HTMLDivElement>(null);
  const stickyBodyRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [titleRowHeight, setTitleRowHeight] = useState(0);
  const [stickyBodyHeight, setStickyBodyHeight] = useState(0);

  const measure = useCallback(() => {
    if (titleRowRef.current) {
      setTitleRowHeight(titleRowRef.current.offsetHeight);
    }
    if (stickyBodyRef.current) {
      setStickyBodyHeight(stickyBodyRef.current.offsetHeight);
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (titleRowRef.current) observer.observe(titleRowRef.current);
    if (stickyBodyRef.current) observer.observe(stickyBodyRef.current);
    return () => observer.disconnect();
  }, [measure]);

  const onScroll = useCallback(() => {
    setScrollY(scrollRef.current?.scrollTop ?? 0);
  }, []);

  const collapseDistance =
    titleRowHeight > 0 ? titleRowHeight : INSIGHTS_TITLE_COLLAPSE_DISTANCE;
  const collapsedStickyHeight =
    stickyBodyHeight > 0 && titleRowHeight > 0
      ? stickyBodyHeight - titleRowHeight
      : 0;
  const stickyMeasured = collapsedStickyHeight > 0;

  const gaugeFillOpacity = insightsGaugeFillOpacity(scrollY);
  const titleOpacity = insightsTitleOpacity(scrollY, collapseDistance);
  const stickyShiftY = insightsStickyShiftY(
    scrollY,
    collapseDistance,
    titleRowHeight,
  );
  const stickyClipHeight = stickyMeasured
    ? insightsStickyClipHeight(
        scrollY,
        collapseDistance,
        stickyBodyHeight,
        titleRowHeight,
      )
    : stickyBodyHeight;

  const bodyPaddingTop = stickyMeasured
    ? `calc(var(--safe-t) + ${collapsedStickyHeight}px)`
    : 'var(--safe-t)';

  return {
    scrollRef,
    titleRowRef,
    stickyBodyRef,
    onScroll,
    scrollY,
    titleRowHeight,
    stickyMeasured,
    stickyBodyHeight,
    gaugeFillOpacity,
    titleOpacity,
    stickyShiftY,
    stickyClipHeight,
    bodyPaddingTop,
  };
}
