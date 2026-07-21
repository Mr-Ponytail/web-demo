import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const DEFAULT_DISMISS_DISTANCE = 80;

type Options = {
  enabled: boolean;
  onClose: () => void;
  dismissDistance?: number;
  openTransition?: string;
  closeTransition?: string;
};

export function useBottomSheetDragDismiss({
  enabled,
  onClose,
  dismissDistance = DEFAULT_DISMISS_DISTANCE,
  openTransition = 'transform 250ms cubic-bezier(0.33, 1, 0.68, 1)',
  closeTransition = 'transform 280ms cubic-bezier(0.55, 0.06, 0.68, 0.19)',
}: Options) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragOffset = useRef(0);
  const dragYRef = useRef(0);

  useEffect(() => {
    dragYRef.current = dragY;
  }, [dragY]);

  useEffect(() => {
    if (enabled) {
      setDragY(0);
      setIsDragging(false);
      dragYRef.current = 0;
    }
  }, [enabled]);

  const resetDrag = useCallback(() => {
    dragYRef.current = 0;
    setDragY(0);
  }, []);

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsDragging(false);

      if (dragYRef.current > dismissDistance) {
        onClose();
        return;
      }

      resetDrag();
    },
    [dismissDistance, onClose, resetDrag],
  );

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    setIsDragging(true);
    dragStartY.current = event.clientY;
    dragOffset.current = dragYRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const next = Math.max(
      0,
      event.clientY - dragStartY.current + dragOffset.current,
    );
    dragYRef.current = next;
    setDragY(next);
  }, []);

  const panelStyle: CSSProperties = {
    transform: enabled ? `translateY(${dragY}px)` : 'translateY(100%)',
    transition: isDragging ? 'none' : enabled ? openTransition : closeTransition,
  };

  const dragBindings = {
    onPointerDown,
    onPointerMove,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
  };

  return {
    dragY,
    isDragging,
    panelStyle,
    dragBindings,
    stopScrollDragPropagation: (
      event: ReactPointerEvent<HTMLElement>,
    ) => {
      event.stopPropagation();
    },
  };
}
