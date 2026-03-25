import { PermissionsAndroid, Platform } from 'react-native';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const DEVICE_NAME = 'MyESP32';
const SCAN_TIMEOUT_MS = 15000;

type Result = {
  ok: boolean;
  message: string;
  payload?: string;
};

type ScannedDevice = {
  id: string;
  name: string | null;
  localName: string | null;
  connect: () => Promise<ScannedDevice>;
  discoverAllServicesAndCharacteristics: () => Promise<ScannedDevice>;
  readCharacteristicForService: (
    serviceUuid: string,
    characteristicUuid: string
  ) => Promise<{ value: string | null }>;
};

type BleManagerLike = {
  state: () => Promise<string>;
  enable: () => Promise<void>;
  startDeviceScan: (
    uuids: string[] | null,
    options: Record<string, unknown> | null,
    listener: (error: { message?: string } | null, device: ScannedDevice | null) => void
  ) => void;
  stopDeviceScan: () => void;
  onStateChange: (listener: (state: string) => void, emitCurrentState: boolean) => { remove: () => void };
  destroy: () => void;
};

const ensureAndroidPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const locationStatus = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return locationStatus === PermissionsAndroid.RESULTS.GRANTED;
};

const waitForPoweredOn = async (manager: BleManagerLike): Promise<void> => {
  const currentState = await manager.state();
  if (currentState === 'PoweredOn') return;

  if (Platform.OS === 'android' && currentState === 'PoweredOff') {
    await manager.enable();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error('Bluetooth non activé. Active le Bluetooth puis réessaie.'));
    }, 10000);

    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        clearTimeout(timeout);
        subscription.remove();
        resolve();
      }
    }, true);
  });
};

const scanForTargetDevice = (manager: BleManagerLike): Promise<ScannedDevice> => {
  return new Promise<ScannedDevice>((resolve, reject) => {
    let done = false;

    const finish = (callback: () => void) => {
      if (done) return;
      done = true;
      manager.stopDeviceScan();
      clearTimeout(timeout);
      callback();
    };

    const timeout = setTimeout(() => {
      finish(() => reject(new Error('Aucun appareil MyESP32 trouvé à proximité.')));
    }, SCAN_TIMEOUT_MS);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        finish(() => reject(new Error(error.message ?? 'Erreur de scan BLE.')));
        return;
      }

      if (!device) return;

      const deviceName = device.name ?? device.localName;
      if (deviceName === DEVICE_NAME) {
        finish(() => resolve(device));
      }
    });
  });
};

const decodeBase64Payload = (value: string | null): string => {
  if (!value) return '';

  const maybeAtob = (globalThis as { atob?: (encoded: string) => string }).atob;
  if (maybeAtob) {
    try {
      return maybeAtob(value);
    } catch {
      return value;
    }
  }

  return value;
};

const createManager = (): BleManagerLike | null => {
  try {
    const bleModule = require('react-native-ble-plx') as { BleManager?: new () => BleManagerLike };

    if (!bleModule.BleManager) return null;
    return new bleModule.BleManager();
  } catch {
    return null;
  }
};

export async function connectToHydroholicBottle(): Promise<Result> {
  const permissionsOk = await ensureAndroidPermissions();
  if (!permissionsOk) {
    return {
      ok: false,
      message: 'Permissions Bluetooth refusées. Autorise-les dans les réglages puis réessaie.',
    };
  }

  const manager = createManager();
  if (!manager) {
    return {
      ok: false,
      message:
        'react-native-ble-plx non installé. Exécute: npm install react-native-ble-plx puis rebuild natif (npx expo run:android / run:ios).',
    };
  }

  try {
    await waitForPoweredOn(manager);
    const device = await scanForTargetDevice(manager);
    const connected = await device.connect();
    const ready = await connected.discoverAllServicesAndCharacteristics();
    const characteristic = await ready.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID);
    const payload = decodeBase64Payload(characteristic.value);

    return {
      ok: true,
      message: payload ? `Donnée reçue: ${payload}` : 'Connexion BLE réussie, mais la caractéristique est vide.',
      payload,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Erreur BLE inconnue.',
    };
  } finally {
    manager.stopDeviceScan();
    manager.destroy();
  }
}