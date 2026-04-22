import { useCallback, useMemo, useState } from 'react';

export function useBLE() {
  const [isConnected] = useState(false);
  const [isScanning] = useState(false);
  const [weight] = useState<number | null>(null);
  const [scaleFactor] = useState<number | null>(null);

  const statusMsg = 'BLE desactive en Web (utilise Android pour tester la gourde).';

  const connectToESP32 = useCallback(async () => {
    return;
  }, []);

  const disconnect = useCallback(async () => {
    return;
  }, []);

  const tareLoadCell = useCallback(async () => {
    return;
  }, []);

  const requestScaleFactor = useCallback(async () => {
    return;
  }, []);

  const updateScaleFactor = useCallback(async (_nextScaleFactor: number) => {
    return false;
  }, []);

  const logs = useMemo(
    () => [
      `${new Date().toLocaleTimeString()} - BLE disabled on Web build.`,
    ],
    []
  );

  return {
    isConnected,
    isScanning,
    weight,
    statusMsg,
    scaleFactor,
    connectToESP32,
    disconnect,
    tareLoadCell,
    requestScaleFactor,
    updateScaleFactor,
    logs,
  };
}
