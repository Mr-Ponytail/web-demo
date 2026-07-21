import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type maplibregl from 'maplibre-gl';
import { IMG } from '../assets';
import { HazardInfoCard } from '../components/hazard/HazardInfoCard';
import {
  HazardMap,
  focusMarkerOnMap,
  resetMapView,
} from '../components/hazard/HazardMap';
import { HazardMarkerDetailSheet } from '../components/hazard/HazardMarkerDetailSheet';
import { ReportToDotToast } from '../components/hazard/ReportToDotToast';
import { HazardSummaryCard } from '../components/hazard/HazardSummaryCard';
import {
  DEMO_HAZARD_MARKERS,
  HAZARD_DEFAULT_MAP_ZOOM,
  buildHazardSummaryCards,
  computeHazardMapCenter,
  markerToDetailSheetContent,
} from '../data/hazardLocationMocks';
import {
  HAZARD_BOTTOM_PANEL_DISMISS_DURATION_MS,
  HAZARD_INITIAL_MAP_PADDING_BOTTOM,
  HAZARD_MAP_FOCUS_SHIFT_DOWN,
  HAZARD_MAP_PADDING_EXTRA,
  HAZARD_MAP_RESET_DURATION_MS,
} from '../hazard/constants';
import { useBottomSheetDragDismiss } from '../hooks/useBottomSheetDragDismiss';
import { useReportToDot } from '../hazard/useReportToDot';
import './HazardLocationPage.css';

const BASE_GAUGE_RATIO = 0.2;
const BOTTOM_PANEL_DISMISS_EASING = 'cubic-bezier(0.55, 0.06, 0.68, 0.19)';

export function HazardLocationPage() {
  const navigate = useNavigate();
  const mapRef = useRef<maplibregl.Map | null>(null);
  const cardListRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const gaugeFillRef = useRef<HTMLDivElement>(null);
  const bottomPanelWidthRef = useRef(0);
  const idleBottomPaddingRef = useRef(HAZARD_INITIAL_MAP_PADDING_BOTTOM);
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [mapBottomPadding, setMapBottomPadding] = useState(
    HAZARD_INITIAL_MAP_PADDING_BOTTOM,
  );
  const [isBottomPanelClosing, setIsBottomPanelClosing] = useState(false);
  const [mapDimOpacity, setMapDimOpacity] = useState(0);
  const [dimClosing, setDimClosing] = useState(false);
  const [isMarkerScaleActive, setIsMarkerScaleActive] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markerSheetVisible, setMarkerSheetVisible] = useState(false);

  const {
    isReportToastVisible,
    undoSecondsLeft,
    reportProgress,
    handleReportToDot,
    dismissReportToast,
  } = useReportToDot();

  const markers = DEMO_HAZARD_MARKERS;
  const mapCenter = useMemo(() => computeHazardMapCenter(markers), [markers]);
  const summaryCards = useMemo(() => buildHazardSummaryCards(markers), [markers]);
  const selectedMarker = useMemo(
    () => markers.find(marker => marker.id === selectedMarkerId) ?? null,
    [markers, selectedMarkerId],
  );
  const selectedSheetContent = useMemo(
    () =>
      selectedMarker
        ? markerToDetailSheetContent(selectedMarker, 'Gangnam-daero, Seoul')
        : null,
    [selectedMarker],
  );
  const gaugeFillRatio = BASE_GAUGE_RATIO;

  const handleMapZoomChange = useCallback(
    (zoom: number) => {
      if (
        isMarkerScaleActive &&
        !markerSheetVisible &&
        zoom <= HAZARD_DEFAULT_MAP_ZOOM + 0.05
      ) {
        setIsMarkerScaleActive(false);
      }
    },
    [isMarkerScaleActive, markerSheetVisible],
  );

  const updateGaugeFill = useCallback((ratio: number) => {
    const fill = gaugeFillRef.current;
    if (!fill) {
      return;
    }
    const panelWidth = bottomPanelWidthRef.current;
    const gaugeRatio = BASE_GAUGE_RATIO + ratio * (1 - BASE_GAUGE_RATIO);
    fill.style.width =
      panelWidth > 0
        ? `${panelWidth * gaugeRatio}px`
        : `${gaugeRatio * 100}%`;
  }, []);

  useEffect(() => {
    if (!bottomPanelVisible) {
      idleBottomPaddingRef.current = HAZARD_INITIAL_MAP_PADDING_BOTTOM;
      setMapBottomPadding(HAZARD_INITIAL_MAP_PADDING_BOTTOM);
      return;
    }

    if (markerSheetVisible) {
      return;
    }

    const panel = bottomPanelRef.current;
    if (!panel) {
      return;
    }

    const updatePadding = () => {
      const rect = panel.getBoundingClientRect();
      bottomPanelWidthRef.current = rect.width;
      updateGaugeFill(0);
      const next = Math.round(
        rect.height + HAZARD_MAP_PADDING_EXTRA - HAZARD_MAP_FOCUS_SHIFT_DOWN,
      );
      idleBottomPaddingRef.current = next;
      setMapBottomPadding(prev => (prev === next ? prev : next));
    };

    updatePadding();
    const observer = new ResizeObserver(updatePadding);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [bottomPanelVisible, markerSheetVisible, updateGaugeFill]);

  const handleMarkerPress = useCallback(
    (markerId: string) => {
      const marker = markers.find(item => item.id === markerId);
      if (!marker) {
        return;
      }
      setSelectedMarkerId(markerId);
      setMarkerSheetVisible(true);
      setDimClosing(false);
      setIsMarkerScaleActive(true);
      setMapDimOpacity(1);
      focusMarkerOnMap(mapRef.current, marker);
    },
    [markers],
  );

  const handleCloseMarkerSheet = useCallback(() => {
    setDimClosing(true);
    setMarkerSheetVisible(false);
    setSelectedMarkerId(null);
    setMapDimOpacity(0);
    setIsMarkerScaleActive(true);
    resetMapView(
      mapRef.current,
      mapCenter,
      idleBottomPaddingRef.current,
    );
    window.setTimeout(() => setDimClosing(false), HAZARD_MAP_RESET_DURATION_MS);
  }, [mapCenter]);

  const handleDismissBottomPanel = useCallback(() => {
    if (isBottomPanelClosing) {
      return;
    }

    setIsBottomPanelClosing(true);
    idleBottomPaddingRef.current = HAZARD_INITIAL_MAP_PADDING_BOTTOM;
    resetMapView(mapRef.current, mapCenter, HAZARD_INITIAL_MAP_PADDING_BOTTOM);
  }, [isBottomPanelClosing, mapCenter]);

  const bottomPanelOpen =
    bottomPanelVisible && !markerSheetVisible && !isBottomPanelClosing;
  const {
    panelStyle: bottomPanelDragStyle,
    dragBindings,
    stopScrollDragPropagation,
  } = useBottomSheetDragDismiss({
    enabled: bottomPanelOpen,
    onClose: handleDismissBottomPanel,
    dismissDistance: 80,
    openTransition: 'none',
    closeTransition: `transform ${HAZARD_BOTTOM_PANEL_DISMISS_DURATION_MS}ms ${BOTTOM_PANEL_DISMISS_EASING}`,
  });

  const handleBottomPanelTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (
        event.propertyName !== 'transform' ||
        event.target !== event.currentTarget ||
        !isBottomPanelClosing
      ) {
        return;
      }

      setBottomPanelVisible(false);
      setIsBottomPanelClosing(false);
      setMapBottomPadding(HAZARD_INITIAL_MAP_PADDING_BOTTOM);
    },
    [isBottomPanelClosing],
  );

  const handleCardsScroll = useCallback(() => {
    const list = cardListRef.current;
    if (!list) {
      return;
    }
    const maxScrollableOffset = Math.max(0, list.scrollWidth - list.clientWidth);
    const ratio =
      maxScrollableOffset === 0
        ? 1
        : Math.max(0, Math.min(1, list.scrollLeft / maxScrollableOffset));
    updateGaugeFill(ratio);
  }, [updateGaugeFill]);

  return (
    <div className="hazard-location screen">
      <div className="hazard-location__map-stage">
        <HazardMap
          center={mapCenter}
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          mapDimOpacity={mapDimOpacity}
          dimClosing={dimClosing}
          bottomPadding={mapBottomPadding}
          onMarkerPress={handleMarkerPress}
          onZoomChange={handleMapZoomChange}
          mapRef={mapRef}
        />
      </div>

      <header className="hazard-location__header">
        <button
          type="button"
          className="hazard-location__back"
          aria-label="Back"
          onClick={() => navigate('/app/tire-log')}
        >
          <img src={IMG.back} alt="" width={42} height={42} />
        </button>
        <h1 className="hazard-location__title">Hazard location</h1>
        <span className="hazard-location__title-spacer" aria-hidden />
      </header>

      {!markerSheetVisible ? (
        <>
          <div className="hazard-location__location-pill">
            <img src={IMG.locationSub} alt="" width={16} height={16} />
            <span>Gangnam-daero, Seoul</span>
          </div>
          <HazardInfoCard />
        </>
      ) : null}

      {bottomPanelVisible && !markerSheetVisible ? (
        <div
          ref={bottomPanelRef}
          className="hazard-location__bottom"
          style={{
            transform: isBottomPanelClosing
              ? 'translateY(100%)'
              : bottomPanelDragStyle.transform,
            transition: bottomPanelDragStyle.transition,
          }}
          onTransitionEnd={handleBottomPanelTransitionEnd}
          {...dragBindings}
        >
          <div className="hazard-location__bottom-gradient" aria-hidden />
          <div className="hazard-location__gauge-track">
            <div
              ref={gaugeFillRef}
              className="hazard-location__gauge-fill"
              style={{
                width:
                  bottomPanelWidthRef.current > 0
                    ? `${bottomPanelWidthRef.current * gaugeFillRatio}px`
                    : `${gaugeFillRatio * 100}%`,
              }}
            />
          </div>

          <div
            ref={cardListRef}
            className="hazard-location__cards"
            onScroll={handleCardsScroll}
            onPointerDown={stopScrollDragPropagation}
          >
            {summaryCards.map(card => (
              <HazardSummaryCard
                key={card.id}
                item={card}
                onPress={() => handleMarkerPress(card.id)}
              />
            ))}
          </div>

          <div className="hazard-location__actions">
            <div className="hazard-location__action-buttons">
              <button
                type="button"
                className={
                  isReportToastVisible
                    ? 'hazard-location__report hazard-location__report--off'
                    : 'hazard-location__report'
                }
                disabled={isReportToastVisible}
                onClick={handleReportToDot}
              >
                <img src={IMG.send} alt="" width={24} height={24} />
                {isReportToastVisible ? 'Reported' : 'Report to DOT'}
              </button>
              <button
                type="button"
                className={
                  isReportToastVisible
                    ? 'hazard-location__dismiss hazard-location__dismiss--off'
                    : 'hazard-location__dismiss'
                }
                disabled={isReportToastVisible}
                onClick={handleDismissBottomPanel}
              >
                Dismiss
              </button>
            </div>

            <ReportToDotToast
              visible={isReportToastVisible}
              secondsLeft={undoSecondsLeft}
              progress={reportProgress}
              onUndo={dismissReportToast}
            />
          </div>
        </div>
      ) : null}

      <HazardMarkerDetailSheet
        visible={markerSheetVisible}
        content={selectedSheetContent}
        onClose={handleCloseMarkerSheet}
      />
    </div>
  );
}
