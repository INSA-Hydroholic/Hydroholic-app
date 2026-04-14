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
  const [weight, setWeight]             = useState<number | null>(null);
  const [statusMsg, setStatusMsg]       = useState('Deconnecte');
  const [logs, setLogs]                 = useState<string[]>([]);
  const deviceRef = useRef<Device | null>(null);
  const monitorSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  type HydrationPacket = {
    weight: number;
    time: number;
  };

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

  const writeCommand = useCallback(async (message: string, errorPrefix: string): Promise<boolean> => {
    if (!deviceRef.current) {
      setStatusMsg('Connectez l\'ESP32 avant d\'envoyer une commande.');
      return false;
    }

    try {
      await deviceRef.current.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        TIME_CHARACTERISTIC_UUID,
        encodeToBase64(message)
      );
      return true;
    } catch (e: any) {
      setStatusMsg(errorPrefix + e.message);
      return false;
    }
  }, [encodeToBase64]);

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
    const now = Math.floor(Date.now() / 1000).toString();
    if (await writeCommand(now, 'Erreur lors de l\'envoi du timestamp: ')) {
      setStatusMsg('Timestamp envoye: ' + now);
    }
  }, [writeCommand]);

  const sendProtocolResponse = useCallback(async (message: 'OK' | 'ERROR') => {
    await writeCommand(message, 'Erreur envoi ACK BLE: ');
  }, [writeCommand]);

  const tareLoadCell = useCallback(async () => {
    const sent = await writeCommand('TARE', 'Erreur lors de la tare: ');
    if (sent) {
      setStatusMsg('Commande tare envoyée à l\'ESP32.');
      pushLog('Commande BLE envoyée: TARE');
    }
  }, [pushLog, writeCommand]);

  const parseHydrationPacket = useCallback((rawValue: string): HydrationPacket | null => {
    // Packet's expected format: "HIST:timestamp,weight"
    if (!rawValue.startsWith('HIST:')) {
      return null;
    }

    const [timestamp, weight] = rawValue.slice(5).split(',');
    if (!timestamp || !weight) {
      return null;
    }

    const time = Number(timestamp);
    const num_weight = Number(weight);

    if (!Number.isFinite(time) || !Number.isFinite(num_weight) || time <= 0 || num_weight <= 0) {
      return null;
    }

    return {
      weight: num_weight,
      time
    };
  }, []);

  const pushHydrationPacketToBackend = useCallback(async (packet: HydrationPacket): Promise<boolean> => {
    const userId = String(user?.id ?? '');

    if (!userId) {
      setStatusMsg('Utilisateur non connecte: impossible d\'envoyer l\'hydratation.');
      await sendProtocolResponse('ERROR');
      return false;
    }

    pushLog(`Envoi du packet d'hydratation au backend: ${JSON.stringify(packet)}`);
    try {
      await hydrationApi.pushMeasurement({
        userId,
        weight: packet.weight
      });

      pushLog('Packet d\'hydratation envoye avec succes au backend.');
      setStatusMsg('Donnee hydratation envoyee au backend (' + packet.weight + ' g)');
      setWeight(packet.weight / 1000);
      await sendProtocolResponse('OK');
      return true;
    } catch (e: any) {
      setStatusMsg('Erreur backend hydratation: ' + e.message);
      await sendProtocolResponse('ERROR');
      return false;
    }
  }, [sendProtocolResponse, user?.id]);

  const handleIncomingBleMessage = useCallback(async (raw: string) => {
    pushLog(`RX: ${raw}`);

    const hydrationPacket = parseHydrationPacket(raw);
    if (hydrationPacket) {
      pushLog(`Hydration packet parsed: ${JSON.stringify(hydrationPacket)}`);
      await pushHydrationPacketToBackend(hydrationPacket);
      return;
    }

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      setWeight(parsed);
      pushLog(`Parsed weight: ${parsed}`);
      await sendProtocolResponse('OK');
      return;
    }

    pushLog(`Unrecognized BLE payload ignored: ${raw}`);
  }, [parseHydrationPacket, pushHydrationPacketToBackend, pushLog, sendProtocolResponse]);

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
                await handleIncomingBleMessage(raw);
              }
            }
          );

          // TIME_CHAR is write-only on ESP32, so we sync time from app right after connect.
          await sendCurrentUnixTimestamp();

          // Detectar desconexión
          connected.onDisconnected(() => {
            setIsConnected(false);
            setWeight(null);
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
  }, [decodeBase64, handleIncomingBleMessage, isConnected, isScanning, manager, requestPermissions, sendCurrentUnixTimestamp, stopActiveScan]);

  // --- Desconectar ---
  const disconnect = useCallback(async () => {
    if (deviceRef.current) {
      monitorSubscriptionRef.current?.remove();
      monitorSubscriptionRef.current = null;
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
      stopActiveScan();
      setIsConnected(false);
      setWeight(null);
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
    weight,
    statusMsg,
    connectToESP32,
    disconnect,
    tareLoadCell,
    logs,
  };
}