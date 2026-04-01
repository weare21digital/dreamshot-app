// Storage Utility - MMKV wrapper with AsyncStorage migration
import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'your-encryption-key-here' // TODO: Generate from device ID or keychain
});

// Helper wrapper that provides AsyncStorage-like API but uses MMKV
export const AppStorage = {
  // String methods
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  
  getItem: (key) => {
    const value = storage.getString(key);
    return Promise.resolve(value || null);
  },
  
  removeItem: (key) => {
    storage.delete(key);
    return Promise.resolve();
  },
  
  clear: () => {
    storage.clearAll();
    return Promise.resolve();
  },
  
  // Enhanced methods (MMKV-specific)
  setObject: (key, object) => {
    storage.set(key, JSON.stringify(object));
  },
  
  getObject: (key) => {
    const value = storage.getString(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return null;
    }
  },
  
  setNumber: (key, number) => {
    storage.set(key, number);
  },
  
  getNumber: (key) => {
    return storage.getNumber(key);
  },
  
  setBoolean: (key, boolean) => {
    storage.set(key, boolean);
  },
  
  getBoolean: (key) => {
    return storage.getBoolean(key);
  },
  
  // Utility methods
  exists: (key) => {
    return storage.contains(key);
  },
  
  getAllKeys: () => {
    return storage.getAllKeys();
  },
  
  size: () => {
    return storage.size;
  }
};

// Migration helper
export async function migrateFromAsyncStorage() {
  console.log('📦 Starting AsyncStorage to MMKV migration...');
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    
    if (keys.length === 0) {
      console.log('✅ No data to migrate');
      return;
    }
    
    console.log(`📊 Migrating ${keys.length} items...`);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        storage.set(key, value);
      }
    }
    
    // Optionally clear AsyncStorage after successful migration
    // await AsyncStorage.clear();
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  APP_SETTINGS: 'app_settings',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME: 'theme',
  // Add more keys as needed
};

export default AppStorage;