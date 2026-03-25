import { Platform } from 'react-native';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const DEVICE_NAME = 'MyESP32';

type BluetoothValue = {
  buffer?: ArrayBuffer;
};

type BluetoothCharacteristic = {
  readValue: () => Promise<BluetoothValue>;
};

type BluetoothService = {
  getCharacteristic: (uuid: string) => Promise<BluetoothCharacteristic>;
};

type BluetoothServer = {
  getPrimaryService: (uuid: string) => Promise<BluetoothService>;
};

type BluetoothDevice = {
  gatt?: {
    connect: () => Promise<BluetoothServer>;
  };
};

type BluetoothApi = {
  requestDevice: (options: {
    filters: Array<{ name: string }>;
    optionalServices: string[];
  }) => Promise<BluetoothDevice>;
};

type Result = {
  ok: boolean;
  message: string;
  payload?: string;
};

const getWebBluetooth = (): BluetoothApi | null => {
  if (Platform.OS !== 'web') return null;

  const maybeNavigator = (globalThis as { navigator?: { bluetooth?: BluetoothApi } }).navigator;
  return maybeNavigator?.bluetooth ?? null;
};

const decodeBuffer = (buffer: ArrayBuffer | undefined): string => {
  if (!buffer) return '';

  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(buffer);
  }

  return Array.from(new Uint8Array(buffer))
    .map((charCode) => String.fromCharCode(charCode))
    .join('');
};

export async function connectToHydroholicBottle(): Promise<Result> {
  const bluetooth = getWebBluetooth();

  if (!bluetooth) {
    return {
      ok: false,
      message:
        'Bluetooth Web no disponible en esta plataforma. Usa la versión web (https/localhost) o integra BLE nativo para Android/iOS.',
    };
  }

  try {
    const device = await bluetooth.requestDevice({
      filters: [{ name: DEVICE_NAME }],
      optionalServices: [SERVICE_UUID],
    });

    const server = await device.gatt?.connect();
    if (!server) {
      return { ok: false, message: 'No se pudo abrir la conexión GATT con el ESP32.' };
    }

    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
    const value = await characteristic.readValue();
    const payload = decodeBuffer(value.buffer);

    return {
      ok: true,
      message: payload ? `Donnée reçue: ${payload}` : 'Conectado, pero sin datos en la característica.',
      payload,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido al conectar por Bluetooth.';

    return {
      ok: false,
      message,
    };
  }
}