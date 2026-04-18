import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'ai_device_id';

const getOrCreateDeviceId = async (): Promise<string> => {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing && existing.length > 0) return existing;

  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, created);
  return created;
};

const getInstallId = async (): Promise<string> => {
  if (Platform.OS === 'ios') {
    return (await Application.getIosIdForVendorAsync()) || 'unknown-ios-install';
  }
  if (Platform.OS === 'android') {
    return (await Application.getAndroidId()) || 'unknown-android-install';
  }
  return 'unknown-install';
};

export const getAiHeaders = async (): Promise<Record<string, string>> => {
  const [deviceId, installId] = await Promise.all([getOrCreateDeviceId(), getInstallId()]);

  return {
    'X-App-Id': 'dreamshot',
    'X-Device-Id': deviceId,
    'X-Install-Id': installId,
  };
};
