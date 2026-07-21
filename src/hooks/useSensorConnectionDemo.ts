import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEMO_BLE_DEVICE_POOL,
  type BleDevice,
} from '../data/bleMocks';
import {
  connectedDeviceIdsFromMap,
  connectedTiresFromMap,
  loadTireDeviceMap,
  saveTireDeviceMap,
} from '../data/sensorConnectionStorage';
import type { TireKey } from '../data/tireMocks';

const CONNECT_DELAY_MS = 900;
const SCAN_POPULATE_DELAY_MS = 600;
const REFRESH_SPINNER_MS = 3000;

function devicesForIds(ids: string[]): BleDevice[] {
  return ids
    .map(id => DEMO_BLE_DEVICE_POOL.find(d => d.id === id))
    .filter((d): d is BleDevice => d != null);
}

function clearTireSlotForDevice(
  map: Partial<Record<TireKey, string>>,
  deviceId: string,
): Partial<Record<TireKey, string>> {
  const next = { ...map };
  for (const key of Object.keys(next) as TireKey[]) {
    if (next[key] === deviceId) delete next[key];
  }
  return next;
}

export function useSensorConnectionDemo() {
  const [tireDeviceMap, setTireDeviceMap] = useState<
    Partial<Record<TireKey, string>>
  >(() => loadTireDeviceMap());
  const [sheetTireKey, setSheetTireKey] = useState<TireKey | null>(null);
  const [scannedDevices, setScannedDevices] = useState<BleDevice[]>(() =>
    devicesForIds(connectedDeviceIdsFromMap(loadTireDeviceMap())),
  );
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(
    null,
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const connectedTires = useMemo(
    () => connectedTiresFromMap(tireDeviceMap),
    [tireDeviceMap],
  );
  const connectedDeviceIds = useMemo(
    () => connectedDeviceIdsFromMap(tireDeviceMap),
    [tireDeviceMap],
  );

  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const connectedIdsRef = useRef(connectedDeviceIds);
  connectedIdsRef.current = connectedDeviceIds;

  useEffect(() => {
    saveTireDeviceMap(tireDeviceMap);
  }, [tireDeviceMap]);

  const clearScanTimer = useCallback(() => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = undefined;
    }
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = undefined;
    }
  }, []);

  const runScan = useCallback(
    (connectedIds: string[]) => {
      clearScanTimer();
      setIsScanning(true);
      setScannedDevices(prev => prev.filter(d => connectedIds.includes(d.id)));

      scanTimerRef.current = setTimeout(() => {
        setScannedDevices(prev => {
          const seen = new Set(prev.map(d => d.id));
          const additions = DEMO_BLE_DEVICE_POOL.filter(
            d => !connectedIds.includes(d.id) && !seen.has(d.id),
          );
          return [...prev, ...additions];
        });
        setIsScanning(false);
      }, SCAN_POPULATE_DELAY_MS);
    },
    [clearScanTimer],
  );

  const openSheet = useCallback((tireKey: TireKey) => {
    setSheetTireKey(tireKey);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetTireKey(null);
    clearScanTimer();
    clearRefreshTimer();
    setIsScanning(false);
    setIsRefreshing(false);
  }, [clearScanTimer, clearRefreshTimer]);

  useEffect(() => {
    if (!sheetTireKey) {
      clearScanTimer();
      setIsScanning(false);
      return;
    }

    const slotId = tireDeviceMap[sheetTireKey];
    const alreadyConnected =
      slotId != null && connectedIdsRef.current.includes(slotId);

    if (!alreadyConnected) {
      runScan(connectedIdsRef.current);
    }

    return clearScanTimer;
  }, [sheetTireKey, tireDeviceMap, runScan, clearScanTimer]);

  useEffect(
    () => () => {
      clearScanTimer();
      clearRefreshTimer();
    },
    [clearScanTimer, clearRefreshTimer],
  );

  const handleRefresh = useCallback(() => {
    clearRefreshTimer();
    setIsRefreshing(true);
    runScan(connectedIdsRef.current);
    refreshTimerRef.current = setTimeout(() => {
      setIsRefreshing(false);
    }, REFRESH_SPINNER_MS);
  }, [clearRefreshTimer, runScan]);

  const connectDevice = useCallback(
    async (deviceId: string) => {
      if (!sheetTireKey || connectingDeviceId) return;

      setConnectingDeviceId(deviceId);
      await new Promise(resolve => setTimeout(resolve, CONNECT_DELAY_MS));
      setConnectingDeviceId(null);

      const tireKey = sheetTireKey;
      setTireDeviceMap(prev => ({
        ...clearTireSlotForDevice(prev, deviceId),
        [tireKey]: deviceId,
      }));
      setScannedDevices(prev => {
        const device =
          prev.find(d => d.id === deviceId) ??
          DEMO_BLE_DEVICE_POOL.find(d => d.id === deviceId);
        if (!device) return prev;
        if (prev.some(d => d.id === deviceId)) return prev;
        return [...prev, device];
      });
      setIsScanning(false);
      clearScanTimer();
    },
    [sheetTireKey, connectingDeviceId, clearScanTimer],
  );

  const disconnectDevice = useCallback((deviceId: string) => {
    setTireDeviceMap(prev => clearTireSlotForDevice(prev, deviceId));
  }, []);

  const sheetConnectedDeviceId =
    sheetTireKey && tireDeviceMap[sheetTireKey]
      ? connectedDeviceIds.includes(tireDeviceMap[sheetTireKey]!)
        ? tireDeviceMap[sheetTireKey]!
        : null
      : null;

  const sheetConnectedDevice = sheetConnectedDeviceId
    ? (scannedDevices.find(d => d.id === sheetConnectedDeviceId) ?? {
        id: sheetConnectedDeviceId,
        name: 'iSensor',
        rssi: 0,
      })
    : null;

  const availableDevices = scannedDevices.filter(
    d => !connectedDeviceIds.includes(d.id),
  );

  const disconnectTire = useCallback(
    (tireKey: TireKey) => {
      const deviceId = tireDeviceMap[tireKey];
      if (deviceId) {
        disconnectDevice(deviceId);
      }
    },
    [tireDeviceMap, disconnectDevice],
  );

  return {
    tireDeviceMap,
    scannedDevices,
    connectedDeviceIds,
    connectedTires,
    sheetTireKey,
    openSheet,
    closeSheet,
    isScanning,
    isRefreshing,
    connectingDeviceId,
    sheetConnectedDevice,
    sheetConnectedDeviceId,
    availableDevices,
    connectDevice,
    disconnectDevice,
    disconnectTire,
    handleRefresh,
  };
}
