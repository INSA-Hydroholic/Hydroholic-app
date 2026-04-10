import { useState, useCallback, useRef, useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { hydrationApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const SERVICE_UUID        = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const TIME_CHARACTERISTIC_UUID = 'e3223119-9445-4e96-a402-55369581a030';



export function useBLE() {
  const { user } = useAuth();
  const managerRef = useRef<BleManager | null>(null);
  const [isConnected, setIsConnected]   = useState(false);
  const [isScanning, setIsScanning]     = useState(false);
  const [weightValue, setWeightValue]   = useState<number | null>(null);
  const [statusMsg, setStatusMsg]       = useState('Deconnecte');
  const [logs, setLogs]                 = useState<string[]>([]);
  const deviceRef = useRef<Device | null>(null);
  const monitorSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!managerRef.current) {
    managerRef.current = new BleManager();
  }
  const manager = managerRef.current;

  const stopActiveScan = useCallback(() => {
    manager.stopDeviceScan();
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    setIsScanning(false);
  }, [manager]);

  const decodeBase64 = useCallback((value: string): string => {
    if (typeof global.atob === 'function') {
      return global.atob(value);
    }
    return Buffer.from(value, 'base64').toString('utf-8');
  }, []);

  const pushLog = useCallback((msg: string) => {
    const entry = `${new Date().toLocaleTimeString()} - ${msg}`;
    setLogs((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  const encodeToBase64 = useCallback((value: string): string => {
    if (typeof global.btoa === 'function') {
      return global.btoa(value);
    }
    return Buffer.from(value, 'utf-8').toString('base64');
  }, []);

  // --- Permisos Android ---
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          results['android.permission.BLUETOOTH_SCAN']  === 'granted' &&
          results['android.permission.BLUETOOTH_CONNECT'] === 'granted'
        );
      } else {
        // Android < 12
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === 'granted';
      }
    }
    return true;
  }, []);

  const sendCurrentUnixTimestamp = useCallback(async () => {
    if (!deviceRef.current) {
      setStatusMsg('Connectez l\'ESP32 avant d\'envoyer l\'heure.');
      return;
    }

    try {
      const now = Math.floor(Date.now() / 1000).toString();
      const encodedTimestamp = encodeToBase64(now);

      await deviceRef.current.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        TIME_CHARACTERISTIC_UUID,
        encodedTimestamp
      );

      setStatusMsg('Timestamp envoye: ' + now);
    } catch (e: any) {
      setStatusMsg('Erreur lors de l\'envoi du timestamp: ' + e.message);
    }
  }, [encodeToBase64]);

  const sendProtocolResponse = useCallback(async (message: 'OK' | 'ERROR') => {
    if (!deviceRef.current) {
      return;
    }

    try {
      await deviceRef.current.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        TIME_CHARACTERISTIC_UUID,
        encodeToBase64(message)
      );
    } catch (e: any) {
      setStatusMsg('Erreur envoi ACK BLE: ' + e.message);
    }
  }, [encodeToBase64]);

  const processHydrationPacket = useCallback(async (rawValue: string) => {
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(rawValue);
    } catch {
      return false;
    }

    if (!parsedJson || typeof parsedJson !== 'object') {
      return false;
    }

    const amountCandidate =
      parsedJson.amountMl ??
      parsedJson.ml ??
      parsedJson.millilitres ??
      parsedJson.milliliters ??
      parsedJson.nombreDeMililitres;
    const timeCandidate = parsedJson.time ?? parsedJson.timestamp;

    const amountMl = Number(amountCandidate);
    const time = Number(timeCandidate);
    const hasValidPacket = Number.isFinite(amountMl) && amountMl > 0 && Number.isFinite(time) && time > 0;
    if (!hasValidPacket) {
      return false;
    }

    try {
      await hydrationApi.log({
        amountMl,
        time,
        userId: user?.id,
      });

      setStatusMsg('Donnee hydratation envoyee au backend (' + amountMl + ' ml)');
      setWeightValue(amountMl / 1000);
      await sendProtocolResponse('OK');
    } catch (e: any) {
      setStatusMsg('Erreur backend hydratation: ' + e.message);
      await sendProtocolResponse('ERROR');
    }

    return true;
  }, [sendProtocolResponse, user?.id]);

  // --- Conectar a la ESP32 ---
  const connectToESP32 = useCallback(async () => {
    if (isScanning || isConnected) {
      return;
    }

    const btState = await manager.state();
    if (btState !== 'PoweredOn') {
      setStatusMsg('Bluetooth desactive. Active-le pour continuer.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission refusee', 'Vous devez activer Bluetooth pour continuer.');
      return;
    }

    setIsScanning(true);
    setStatusMsg('Recherche de l\'ESP32...');

    monitorSubscriptionRef.current?.remove();
    monitorSubscriptionRef.current = null;

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        setStatusMsg('Erreur de scan: ' + error.message);
        stopActiveScan();
        return;
      }

      // Busca por nombre o por SERVICE_UUID
      if (device && (device.name === 'ESP32_Weight' || device.serviceUUIDs?.includes(SERVICE_UUID))) {
        stopActiveScan();
        setStatusMsg('ESP32 trouvee, connexion...');

        try {
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          deviceRef.current = connected;
          setIsConnected(true);
          setStatusMsg('Connecte a ' + (connected.name ?? 'ESP32'));

          // Suscribirse a las notificaciones (NOTIFY)
          monitorSubscriptionRef.current = connected.monitorCharacteristicForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            async (err, characteristic) => {
              if (err) {
                setStatusMsg('Erreur de notification: ' + err.message);
                return;
              }
              if (characteristic?.value) {
               
                const raw = decodeBase64(characteristic.value);
                pushLog(`RX: ${raw}`);
                const wasHydrationPacket = await processHydrationPacket(raw);
                if (wasHydrationPacket) {
                  pushLog(`Processed hydration packet: ${raw}`);
                  return;
                }
                const parsed = parseFloat(raw);
                if (!isNaN(parsed)) {
                  setWeightValue(parsed);
                  pushLog(`Parsed weight: ${parsed}`);
                  await sendProtocolResponse('OK');
                }
              }
            }
          );

          // TIME_CHAR is write-only on ESP32, so we sync time from app right after connect.
          await sendCurrentUnixTimestamp();

          // Detectar desconexión
          connected.onDisconnected(() => {
            setIsConnected(false);
            setWeightValue(null);
            deviceRef.current = null;
            monitorSubscriptionRef.current?.remove();
            monitorSubscriptionRef.current = null;
            stopActiveScan();
            setStatusMsg('Deconnecte');
          });

        } catch (e: any) {
          setStatusMsg('Erreur de connexion: ' + e.message);
          setIsConnected(false);
          deviceRef.current = null;
        }
      }
    });

    // Timeout si no encuentra el dispositivo en 10s
    scanTimeoutRef.current = setTimeout(() => {
      if (!deviceRef.current) {
        stopActiveScan();
        setStatusMsg('ESP32 introuvable');
      }
    }, 10000);
  }, [decodeBase64, isConnected, isScanning, manager, processHydrationPacket, requestPermissions, sendCurrentUnixTimestamp, sendProtocolResponse, stopActiveScan]);

  // --- Desconectar ---
  const disconnect = useCallback(async () => {
    if (deviceRef.current) {
      monitorSubscriptionRef.current?.remove();
      monitorSubscriptionRef.current = null;
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
      stopActiveScan();
      setIsConnected(false);
      setWeightValue(null);
      setStatusMsg('Deconnecte');
    }
  }, [stopActiveScan]);

  useEffect(() => {
    return () => {
      stopActiveScan();
      monitorSubscriptionRef.current?.remove();
      monitorSubscriptionRef.current = null;
      if (deviceRef.current) {
        deviceRef.current.cancelConnection().catch(() => undefined);
        deviceRef.current = null;
      }
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [stopActiveScan]);

  return {
    isConnected,
    isScanning,
    weightValue,
    statusMsg,
    connectToESP32,
    disconnect,
    logs,
  };
}