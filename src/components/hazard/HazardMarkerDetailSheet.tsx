import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { IMG, TIRE_IMPACT_IMG } from '../../assets';
import {
  formatDetailDateFromKey,
  type HazardDetailEvent,
  type HazardDetailSheetContent,
} from '../../data/hazardLocationMocks';
import {
  HAZARD_MARKER_SHEET_CLOSE_DURATION_MS,
  HAZARD_MARKER_SHEET_OPEN_DURATION_MS,
} from '../../hazard/constants';
import './HazardMarkerDetailSheet.css';

const DETAIL_TAG_COLOR: Record<HazardDetailEvent['severity'], string> = {
  danger: '#FF6363',
  caution: '#F48200',
  good: '#1ED45A',
};

const TIRE_IMPACT_IMAGES: Partial<
  Record<HazardDetailEvent['severity'], string>
> = {
  danger: TIRE_IMPACT_IMG.danger,
  caution: TIRE_IMPACT_IMG.caution,
};

const SHEET_OPEN_EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';
const SHEET_CLOSE_EASING = 'cubic-bezier(0.55, 0.06, 0.68, 0.19)';

function DetailEventRow({ event }: { event: HazardDetailEvent }) {
  const tagColor = DETAIL_TAG_COLOR[event.severity];
  const impactTireImage =
    event.tagLabel === 'Impact' ? TIRE_IMPACT_IMAGES[event.severity] : undefined;

  return (
    <article className="hazard-detail-sheet__event">
      <p className="hazard-detail-sheet__event-time">{event.time}</p>
      <div className="hazard-detail-sheet__rail-row">
        <div className="hazard-detail-sheet__rail-column">
          <div className="hazard-detail-sheet__rail-line" />
        </div>
        <div
          className={
            impactTireImage
              ? 'hazard-detail-sheet__event-card hazard-detail-sheet__event-card--with-tire'
              : 'hazard-detail-sheet__event-card'
          }
        >
          <div className="hazard-detail-sheet__event-card-top">
            <div className="hazard-detail-sheet__tag-row">
              <span
                className="hazard-detail-sheet__tag-dot"
                style={{ backgroundColor: tagColor }}
              />
              <span
                className="hazard-detail-sheet__tag-label"
                style={{ color: tagColor }}
              >
                {event.tagLabel}
              </span>
            </div>
          </div>
          <div className="hazard-detail-sheet__event-card-content">
            <p className="hazard-detail-sheet__event-title">{event.title}</p>
          </div>
          <span className="hazard-detail-sheet__event-position">{event.position}</span>
          {impactTireImage ? (
            <img
              className="hazard-detail-sheet__impact-tire"
              src={impactTireImage}
              alt=""
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

type HazardMarkerDetailSheetProps = {
  visible: boolean;
  content: HazardDetailSheetContent | null;
  onClose: () => void;
  overlayTabBar?: boolean;
};

export function HazardMarkerDetailSheet({
  visible,
  content,
  onClose,
  overlayTabBar = false,
}: HazardMarkerDetailSheetProps) {
  const [renderedContent, setRenderedContent] =
    useState<HazardDetailSheetContent | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragOffset = useRef(0);
  const [dragY, setDragY] = useState(0);
  const openFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (visible && content) {
      setRenderedContent(content);
      setDragY(0);
      setIsDragging(false);
      setIsPanelOpen(false);

      openFrameRef.current = requestAnimationFrame(() => {
        openFrameRef.current = requestAnimationFrame(() => {
          setIsPanelOpen(true);
          openFrameRef.current = null;
        });
      });
    }

    return () => {
      if (openFrameRef.current != null) {
        cancelAnimationFrame(openFrameRef.current);
        openFrameRef.current = null;
      }
    };
  }, [content, visible]);

  useEffect(() => {
    if (!visible && renderedContent) {
      setIsPanelOpen(false);
      setIsDragging(false);

      const timer = window.setTimeout(() => {
        setRenderedContent(null);
        setDragY(0);
      }, HAZARD_MARKER_SHEET_CLOSE_DURATION_MS);

      return () => window.clearTimeout(timer);
    }
  }, [renderedContent, visible]);

  if (!renderedContent) {
    return null;
  }

  const panelTransform = isPanelOpen
    ? `translateY(${dragY}px)`
    : 'translateY(100%)';

  const panelTransition = isDragging
    ? 'none'
    : isPanelOpen
      ? `transform ${HAZARD_MARKER_SHEET_OPEN_DURATION_MS}ms ${SHEET_OPEN_EASING}`
      : `transform ${HAZARD_MARKER_SHEET_CLOSE_DURATION_MS}ms ${SHEET_CLOSE_EASING}`;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartY.current = event.clientY;
    dragOffset.current = dragY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const next = Math.max(0, event.clientY - dragStartY.current + dragOffset.current);
    setDragY(next);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);

    if (dragY > 80) {
      onClose();
      return;
    }

    setDragY(0);
  };

  const rootClassName = [
    'hazard-detail-sheet',
    visible ? 'hazard-detail-sheet--visible' : '',
    overlayTabBar ? 'hazard-detail-sheet--over-tabbar' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClassName}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="hazard-detail-sheet__backdrop"
        aria-label="Close marker details"
        onClick={onClose}
      />
      <div
        className="hazard-detail-sheet__panel"
        style={{
          transform: panelTransform,
          transition: panelTransition,
        }}
      >
        <div
          className="hazard-detail-sheet__top-accent"
          style={{ backgroundColor: renderedContent.accentColor }}
        />

        <div
          className="hazard-detail-sheet__drag-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div className="hazard-detail-sheet__title-row">
            <h2 className="hazard-detail-sheet__date-title">
              {formatDetailDateFromKey(renderedContent.date)}
            </h2>
            <div className="hazard-detail-sheet__emergency">
              <img src={IMG.dangerLog} alt="" width={32} height={28} />
            </div>
          </div>
          <div className="hazard-detail-sheet__location-row">
            <img src={IMG.locationSub} alt="" width={20} height={20} />
            <span>{renderedContent.location}</span>
          </div>
          <p className="hazard-detail-sheet__section-title">Tire Events</p>
        </div>

        <div className="hazard-detail-sheet__scroll">
          {renderedContent.events.map(event => (
            <DetailEventRow key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
