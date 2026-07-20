import {
  memo,
  useEffect,
  useRef,
  useCallback,
  type MutableRefObject,
} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot, type Root } from 'react-dom/client';
import { NumberedMarkerGraphic, iconKeyToColorIndex } from './NumberedMarkerGraphic';
import {
  HAZARD_CLUSTER_MAX_ZOOM,
  HAZARD_CLUSTER_RADIUS,
  HAZARD_DEFAULT_MAP_ZOOM,
  HAZARD_MAP_DIM_OPACITY,
  HAZARD_MAP_DIM_GEOJSON,
  HAZARD_MAP_STYLE,
  HAZARD_MARKER_FOCUS_ZOOM,
  HAZARD_PIN_MIN_ZOOM,
  HAZARD_ZONE_FILL_OPACITY,
  HAZARD_ZONE_LINE_OPACITY,
  buildHazardMarkersGeoJSON,
  buildHazardZoneCircleGeoJSON,
  getMarkerZoomScale,
  type HazardMapMarker,
} from '../../data/hazardLocationMocks';
import {
  HAZARD_MAP_FOCUS_DURATION_MS,
  HAZARD_MAP_RESET_DURATION_MS,
  HAZARD_MAP_PIN_SELECTION_TRANSITION_MS,
  HAZARD_MARKER_FOCUS_PADDING_TOP,
  HAZARD_MARKER_SHEET_MAX_HEIGHT_RATIO,
} from '../../hazard/constants';
import './HazardMap.css';

const CLUSTER_SOURCE_ID = 'hazard-markers-source';
const HAZARD_ZONE_SOURCE_ID = 'hazard-zone-source';
const HAZARD_DIM_SOURCE_ID = 'hazard-map-dim-source';
const HAZARD_DIM_LAYER_ID = 'hazard-map-dim-layer';
const MARKER_WIDTH = 35;
const MARKER_HEIGHT = 45;
const SELECTED_MARKER_SCALE = 1.15;
const PIN_HIDE_BUFFER = 0.5;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

type MapCameraPadding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type MapCameraTarget = {
  center: [number, number];
  zoom: number;
  padding: MapCameraPadding;
};

const cameraTransitionRef = { current: false };
let cameraTransitionGeneration = 0;
let activeCameraAnimationFrame: number | null = null;

function beginCameraTransition(): number {
  cameraTransitionRef.current = true;
  return ++cameraTransitionGeneration;
}

function finishCameraTransition(generation: number) {
  if (generation === cameraTransitionGeneration) {
    cameraTransitionRef.current = false;
  }
}

function cancelCameraAnimation() {
  if (activeCameraAnimationFrame != null) {
    cancelAnimationFrame(activeCameraAnimationFrame);
    activeCameraAnimationFrame = null;
  }
}

function readMapPadding(map: maplibregl.Map): MapCameraPadding {
  const padding = map.getPadding();
  return {
    top: padding.top ?? 0,
    bottom: padding.bottom ?? 0,
    left: padding.left ?? 0,
    right: padding.right ?? 0,
  };
}

function animateMapCamera(
  map: maplibregl.Map,
  target: MapCameraTarget,
  durationMs: number,
) {
  cancelCameraAnimation();
  const generation = beginCameraTransition();

  const start = {
    center: map.getCenter().toArray() as [number, number],
    zoom: map.getZoom(),
    padding: readMapPadding(map),
  };
  const startTime = performance.now();

  const tick = (now: number) => {
    if (generation !== cameraTransitionGeneration) {
      return;
    }

    const t = Math.min(1, (now - startTime) / durationMs);
    const eased = easeInOutCubic(t);

    map.jumpTo({
      center: [
        lerp(start.center[0], target.center[0], eased),
        lerp(start.center[1], target.center[1], eased),
      ],
      zoom: lerp(start.zoom, target.zoom, eased),
      padding: {
        top: lerp(start.padding.top, target.padding.top, eased),
        bottom: lerp(start.padding.bottom, target.padding.bottom, eased),
        left: lerp(start.padding.left, target.padding.left, eased),
        right: lerp(start.padding.right, target.padding.right, eased),
      },
    });

    if (t < 1) {
      activeCameraAnimationFrame = requestAnimationFrame(tick);
      return;
    }

    activeCameraAnimationFrame = null;
    finishCameraTransition(generation);
  };

  activeCameraAnimationFrame = requestAnimationFrame(tick);
}

type HazardMapProps = {
  center: [number, number];
  markers: HazardMapMarker[];
  selectedMarkerId: string | null;
  mapDimOpacity: number;
  dimClosing?: boolean;
  bottomPadding: number;
  onMarkerPress: (markerId: string) => void;
  onZoomChange: (zoom: number) => void;
  mapRef?: MutableRefObject<maplibregl.Map | null>;
};

type MarkerEntry = {
  marker: maplibregl.Marker;
  root: Root;
  element: HTMLButtonElement;
};

function shouldShowPinMarkers(
  mapZoom: number,
  isMapReady: boolean,
  isZoomingOut: boolean,
): boolean {
  if (!isMapReady || mapZoom < HAZARD_PIN_MIN_ZOOM) {
    return false;
  }
  if (isZoomingOut && mapZoom <= HAZARD_CLUSTER_MAX_ZOOM + PIN_HIDE_BUFFER) {
    return false;
  }
  return true;
}

function setLayerVisibility(
  map: maplibregl.Map,
  layerId: string,
  visible: boolean,
) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}

function HazardMapComponent({
  center,
  markers,
  selectedMarkerId,
  mapDimOpacity,
  dimClosing = false,
  bottomPadding,
  onMarkerPress,
  onZoomChange,
  mapRef,
}: HazardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<maplibregl.Map | null>(null);
  const markerEntriesRef = useRef<Map<string, MarkerEntry>>(new Map());
  const previousZoomRef = useRef(HAZARD_DEFAULT_MAP_ZOOM);
  const isZoomingOutRef = useRef(false);
  const isMapReadyRef = useRef(false);
  const previousBottomPaddingRef = useRef(bottomPadding);

  const markersRef = useRef(markers);
  const centerRef = useRef(center);
  const selectedMarkerIdRef = useRef(selectedMarkerId);
  const onMarkerPressRef = useRef(onMarkerPress);
  const onZoomChangeRef = useRef(onZoomChange);
  const animatedDimRef = useRef(0);
  const dimAnimationRef = useRef<number | null>(null);

  markersRef.current = markers;
  centerRef.current = center;
  selectedMarkerIdRef.current = selectedMarkerId;
  onMarkerPressRef.current = onMarkerPress;
  onZoomChangeRef.current = onZoomChange;

  const applyMapPadding = useCallback((map: maplibregl.Map, paddingBottom: number) => {
    map.setPadding({ top: 0, bottom: paddingBottom, left: 0, right: 0 });
  }, []);

  const syncHtmlMarkers = useCallback((map: maplibregl.Map, zoom: number) => {
    const currentMarkers = markersRef.current;
    const currentSelectedId = selectedMarkerIdRef.current;
    const showPins = shouldShowPinMarkers(
      zoom,
      isMapReadyRef.current,
      isZoomingOutRef.current,
    );

    setLayerVisibility(map, 'hazard-zone-fill', showPins);
    setLayerVisibility(map, 'hazard-zone-line', showPins);

    const ordered = [...currentMarkers].sort((a, b) => b.latitude - a.latitude);
    if (currentSelectedId) {
      const idx = ordered.findIndex(marker => marker.id === currentSelectedId);
      if (idx >= 0) {
        const [selected] = ordered.splice(idx, 1);
        ordered.push(selected);
      }
    }

    const activeIds = new Set<string>();

    if (showPins) {
      for (const marker of ordered) {
        activeIds.add(marker.id);
        const isSelected = currentSelectedId === marker.id;
        const isFocusActive = currentSelectedId != null;
        const isDimmed = isFocusActive && !isSelected;
        const selectionScale =
          isSelected && isFocusActive ? SELECTED_MARKER_SCALE : 1;
        const scale = getMarkerZoomScale(zoom) * selectionScale;
        const colorIndex = iconKeyToColorIndex(marker.iconKey);

        let entry = markerEntriesRef.current.get(marker.id);
        if (!entry) {
          const element = document.createElement('button');
          element.type = 'button';
          element.className = 'hazard-map__pin';
          element.setAttribute('aria-label', `Hazard marker ${marker.pinNumber}`);
          element.addEventListener('click', event => {
            event.stopPropagation();
            onMarkerPressRef.current(marker.id);
          });

          const scaled = document.createElement('div');
          scaled.className = 'hazard-map__pin-scaled';
          element.appendChild(scaled);

          const root = createRoot(scaled);
          const mapMarker = new maplibregl.Marker({
            element,
            anchor: 'bottom',
          })
            .setLngLat([marker.longitude, marker.latitude])
            .addTo(map);

          entry = { marker: mapMarker, root, element };
          markerEntriesRef.current.set(marker.id, entry);
        } else {
          entry.marker.setLngLat([marker.longitude, marker.latitude]);
        }

        entry.element.style.width = `${Math.round(MARKER_WIDTH * scale * SELECTED_MARKER_SCALE)}px`;
        entry.element.style.height = `${Math.round(MARKER_HEIGHT * scale * SELECTED_MARKER_SCALE)}px`;
        entry.root.render(
          <NumberedMarkerGraphic
            pinNumber={marker.pinNumber}
            colorIndex={colorIndex}
            width={MARKER_WIDTH}
            height={MARKER_HEIGHT}
            isDimmed={isDimmed}
          />,
        );

        const scaledEl = entry.element.firstElementChild as HTMLElement | null;
        if (scaledEl) {
          scaledEl.style.transform = `scale(${scale})`;
          scaledEl.style.transition = cameraTransitionRef.current
            ? 'none'
            : isSelected && isFocusActive
              ? `transform ${HAZARD_MAP_PIN_SELECTION_TRANSITION_MS}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`
              : 'none';
          scaledEl.className =
            isSelected && isFocusActive
              ? 'hazard-map__pin-scaled hazard-map__pin-scaled--selected'
              : 'hazard-map__pin-scaled';
        }
      }
    }

    for (const [id, entry] of markerEntriesRef.current) {
      if (!activeIds.has(id)) {
        entry.root.unmount();
        entry.marker.remove();
        markerEntriesRef.current.delete(id);
      }
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || internalMapRef.current) {
      return;
    }

    const initialCenter = centerRef.current;
    const initialMarkers = markersRef.current;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: HAZARD_MAP_STYLE,
      center: initialCenter,
      zoom: HAZARD_DEFAULT_MAP_ZOOM,
      attributionControl: false,
    });

    applyMapPadding(map, previousBottomPaddingRef.current);

    internalMapRef.current = map;
    if (mapRef) {
      mapRef.current = map;
    }

    map.on('load', () => {
      isMapReadyRef.current = true;

      map.addSource(HAZARD_ZONE_SOURCE_ID, {
        type: 'geojson',
        data: buildHazardZoneCircleGeoJSON(initialMarkers),
      });

      map.addLayer({
        id: 'hazard-zone-fill',
        source: HAZARD_ZONE_SOURCE_ID,
        type: 'fill',
        paint: {
          'fill-color': '#FF4242',
          'fill-opacity': HAZARD_ZONE_FILL_OPACITY,
        },
      });

      map.addLayer({
        id: 'hazard-zone-line',
        source: HAZARD_ZONE_SOURCE_ID,
        type: 'line',
        paint: {
          'line-color': '#FF4242',
          'line-opacity': HAZARD_ZONE_LINE_OPACITY,
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      map.addSource(CLUSTER_SOURCE_ID, {
        type: 'geojson',
        data: buildHazardMarkersGeoJSON(initialMarkers),
        cluster: true,
        clusterMaxZoom: HAZARD_CLUSTER_MAX_ZOOM,
        clusterRadius: HAZARD_CLUSTER_RADIUS,
      });

      map.addLayer({
        id: 'hazard-marker-clusters',
        source: CLUSTER_SOURCE_ID,
        type: 'circle',
        maxzoom: HAZARD_PIN_MIN_ZOOM,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FFA938',
            3,
            '#FF6363',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 3, 24],
        },
      });

      map.addLayer({
        id: 'hazard-marker-cluster-count',
        source: CLUSTER_SOURCE_ID,
        type: 'symbol',
        maxzoom: HAZARD_PIN_MIN_ZOOM,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 14,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      map.addSource(HAZARD_DIM_SOURCE_ID, {
        type: 'geojson',
        data: HAZARD_MAP_DIM_GEOJSON,
      });

      map.addLayer({
        id: HAZARD_DIM_LAYER_ID,
        source: HAZARD_DIM_SOURCE_ID,
        type: 'fill',
        paint: {
          'fill-color': '#0f0f10',
          'fill-opacity': 0,
        },
      });

      map.on('click', 'hazard-marker-clusters', async event => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') {
          return;
        }

        const clusterId = feature.properties?.cluster_id;
        if (clusterId == null) {
          return;
        }

        const source = map.getSource(CLUSTER_SOURCE_ID) as maplibregl.GeoJSONSource;
        const expansionZoom = await source.getClusterExpansionZoom(Number(clusterId));
        const [longitude, latitude] = feature.geometry.coordinates as [number, number];

        map.easeTo({
          center: [longitude, latitude],
          zoom: expansionZoom,
          duration: HAZARD_MAP_FOCUS_DURATION_MS,
          easing: easeInOutCubic,
        });
      });

      map.on('mouseenter', 'hazard-marker-clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hazard-marker-clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      map.jumpTo({
        center: centerRef.current,
        zoom: HAZARD_DEFAULT_MAP_ZOOM,
      });

      syncHtmlMarkers(map, map.getZoom());
    });

    map.on('zoom', () => {
      const zoom = map.getZoom();
      isZoomingOutRef.current = zoom < previousZoomRef.current - 0.001;
      previousZoomRef.current = zoom;
      onZoomChangeRef.current(zoom);
      syncHtmlMarkers(map, zoom);
    });

    map.on('move', () => {
      syncHtmlMarkers(map, map.getZoom());
    });

    map.on('moveend', () => {
      isZoomingOutRef.current = false;
      syncHtmlMarkers(map, map.getZoom());
    });

    return () => {
      cancelCameraAnimation();
      if (dimAnimationRef.current != null) {
        cancelAnimationFrame(dimAnimationRef.current);
      }
      for (const entry of markerEntriesRef.current.values()) {
        entry.root.unmount();
        entry.marker.remove();
      }
      markerEntriesRef.current.clear();
      map.remove();
      internalMapRef.current = null;
      isMapReadyRef.current = false;
      if (mapRef) {
        mapRef.current = null;
      }
    };
  }, [applyMapPadding, mapRef, syncHtmlMarkers]);

  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) {
      previousBottomPaddingRef.current = bottomPadding;
      return;
    }
    if (previousBottomPaddingRef.current === bottomPadding) {
      return;
    }
    previousBottomPaddingRef.current = bottomPadding;

    if (
      selectedMarkerIdRef.current ||
      cameraTransitionRef.current
    ) {
      return;
    }

    applyMapPadding(map, bottomPadding);
  }, [applyMapPadding, bottomPadding]);

  useEffect(() => {
    const map = internalMapRef.current;
    if (!map || !isMapReadyRef.current) {
      return;
    }

    const zoneSource = map.getSource(HAZARD_ZONE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    zoneSource?.setData(buildHazardZoneCircleGeoJSON(markers));

    const clusterSource = map.getSource(CLUSTER_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    clusterSource?.setData(buildHazardMarkersGeoJSON(markers));

    syncHtmlMarkers(map, map.getZoom());
  }, [markers, selectedMarkerId, syncHtmlMarkers]);

  useEffect(() => {
    const map = internalMapRef.current;
    if (!map || !isMapReadyRef.current || !map.getLayer(HAZARD_DIM_LAYER_ID)) {
      return;
    }

    const startValue = animatedDimRef.current;
    const endValue = mapDimOpacity;
    const duration = dimClosing
      ? HAZARD_MAP_RESET_DURATION_MS
      : HAZARD_MAP_FOCUS_DURATION_MS;

    if (dimAnimationRef.current != null) {
      cancelAnimationFrame(dimAnimationRef.current);
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutCubic(t);
      const value = startValue + (endValue - startValue) * eased;
      animatedDimRef.current = value;

      if (map.getLayer(HAZARD_DIM_LAYER_ID)) {
        map.setPaintProperty(
          HAZARD_DIM_LAYER_ID,
          'fill-opacity',
          value * HAZARD_MAP_DIM_OPACITY,
        );
      }

      if (t < 1) {
        dimAnimationRef.current = requestAnimationFrame(tick);
      } else {
        dimAnimationRef.current = null;
        animatedDimRef.current = endValue;
      }
    };

    dimAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (dimAnimationRef.current != null) {
        cancelAnimationFrame(dimAnimationRef.current);
        dimAnimationRef.current = null;
      }
    };
  }, [mapDimOpacity, dimClosing]);

  return (
    <div className="hazard-map">
      <div ref={containerRef} className="hazard-map__container" />
    </div>
  );
}

export const HazardMap = memo(HazardMapComponent);

function markerFocusPaddingBottom() {
  if (typeof window === 'undefined') {
    return 320;
  }
  return window.innerHeight * HAZARD_MARKER_SHEET_MAX_HEIGHT_RATIO - 32;
}

export function focusMarkerOnMap(
  map: maplibregl.Map | null,
  marker: HazardMapMarker,
) {
  if (!map) {
    return;
  }

  const run = () => {
    animateMapCamera(
      map,
      {
        center: [marker.longitude, marker.latitude],
        zoom: HAZARD_MARKER_FOCUS_ZOOM,
        padding: {
          top: HAZARD_MARKER_FOCUS_PADDING_TOP,
          bottom: markerFocusPaddingBottom(),
          left: 32,
          right: 32,
        },
      },
      HAZARD_MAP_FOCUS_DURATION_MS,
    );
  };

  if (!map.isStyleLoaded()) {
    map.once('load', run);
    return;
  }

  run();
}

export function resetMapView(
  map: maplibregl.Map | null,
  center: [number, number],
  bottomPadding: number,
) {
  if (!map) {
    return;
  }

  const run = () => {
    animateMapCamera(
      map,
      {
        center,
        zoom: HAZARD_DEFAULT_MAP_ZOOM,
        padding: { top: 0, bottom: bottomPadding, left: 0, right: 0 },
      },
      HAZARD_MAP_RESET_DURATION_MS,
    );
  };

  if (!map.isStyleLoaded()) {
    map.once('load', run);
    return;
  }

  run();
}
