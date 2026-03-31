import { useState, useCallback, useRef, useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const SERVICE_UUID        = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';



export function useBLE() {
  const managerRef = useRef<BleManager | null>(null);
  const [isConnected, setIsConnected]   = useState(false);
  const [isScanning, setIsScanning]     = useState(false);
  const [weightValue, setWeightValue]   = useState<number | null>(null);
  const [statusMsg, setStatusMsg]       = useState('Desconectado');
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

  // --- Conectar a la ESP32 ---
  const connectToESP32 = useCallback(async () => {
    if (isScanning || isConnected) {
      return;
    }

    const btState = await manager.state();
    if (btState !== 'PoweredOn') {
      setStatusMsg('Bluetooth apagado. Activalo para continuar.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permiso denegado', 'Necesitas activar Bluetooth para continuar.');
      return;
    }

    setIsScanning(true);
    setStatusMsg('Buscando ESP32...');

    monitorSubscriptionRef.current?.remove();
    monitorSubscriptionRef.current = null;

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        setStatusMsg('Error al escanear: ' + error.message);
        stopActiveScan();
        return;
      }

      // Busca por nombre o por SERVICE_UUID
      if (device && (device.name === 'ESP32_Weight' || device.serviceUUIDs?.includes(SERVICE_UUID))) {
        stopActiveScan();
        setStatusMsg('ESP32 encontrada, conectando...');

        try {
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          deviceRef.current = connected;
          setIsConnected(true);
          setStatusMsg('Conectado a ' + (connected.name ?? 'ESP32'));

          // Suscribirse a las notificaciones (NOTIFY)
          monitorSubscriptionRef.current = connected.monitorCharacteristicForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            (err, characteristic) => {
              if (err) {
                setStatusMsg('Error en notificacion: ' + err.message);
                return;
              }
              if (characteristic?.value) {
                // El valor llega en Base64, lo decodificamos
                const raw = decodeBase64(characteristic.value);
                const parsed = parseFloat(raw);
                if (!isNaN(parsed)) setWeightValue(parsed);
              }
            }
          );

          // Detectar desconexión
          connected.onDisconnected(() => {
            setIsConnected(false);
            setWeightValue(null);
            deviceRef.current = null;
            monitorSubscriptionRef.current?.remove();
            monitorSubscriptionRef.current = null;
            stopActiveScan();
            setStatusMsg('Desconectado');
          });

        } catch (e: any) {
          setStatusMsg('Error al conectar: ' + e.message);
          setIsConnected(false);
          deviceRef.current = null;
        }
      }
    });

    // Timeout si no encuentra el dispositivo en 10s
    scanTimeoutRef.current = setTimeout(() => {
      if (!deviceRef.current) {
        stopActiveScan();
        setStatusMsg('ESP32 no encontrada');
      }
    }, 10000);
  }, [decodeBase64, isConnected, isScanning, manager, requestPermissions, stopActiveScan]);

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
      setStatusMsg('Desconectado');
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

  return { isConnected, isScanning, weightValue, statusMsg, connectToESP32, disconnect };
}