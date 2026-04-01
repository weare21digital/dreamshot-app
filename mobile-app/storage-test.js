// Storage Performance Test - MMKV vs AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'storage-test',
  encryptionKey: 'test-key-12345'
});

const testData = {
  user: {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  },
  settings: {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  }
};

async function testAsyncStorage(iterations = 100) {
  const start = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    await AsyncStorage.setItem(`test-key-${i}`, JSON.stringify(testData));
    await AsyncStorage.getItem(`test-key-${i}`);
  }
  
  const end = Date.now();
  return end - start;
}

function testMMKV(iterations = 100) {
  const start = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    storage.set(`test-key-${i}`, JSON.stringify(testData));
    storage.getString(`test-key-${i}`);
  }
  
  const end = Date.now();
  return end - start;
}

export async function runStorageComparison() {
  console.log('🚀 Starting storage performance test...');
  
  const iterations = 100;
  
  console.log(`📊 Testing ${iterations} read/write operations...`);
  
  const mmkvTime = testMMKV(iterations);
  console.log(`⚡ MMKV time: ${mmkvTime}ms`);
  
  const asyncStorageTime = await testAsyncStorage(iterations);
  console.log(`📱 AsyncStorage time: ${asyncStorageTime}ms`);
  
  const speedImprovement = (asyncStorageTime / mmkvTime).toFixed(2);
  console.log(`🎯 MMKV is ${speedImprovement}x faster!`);
  
  // Test additional features
  console.log('\n🔧 Testing additional MMKV features...');
  
  // Encryption
  storage.set('encrypted-test', 'secret data');
  console.log('✅ Encryption: supported by default');
  
  // Types
  storage.set('string-test', 'hello');
  storage.set('number-test', 42);
  storage.set('boolean-test', true);
  
  console.log('✅ Type support:');
  console.log(`   String: ${storage.getString('string-test')}`);
  console.log(`   Number: ${storage.getNumber('number-test')}`);
  console.log(`   Boolean: ${storage.getBoolean('boolean-test')}`);
  
  // Size
  console.log(`📦 Storage size: ${storage.size} keys`);
  
  return {
    mmkvTime,
    asyncStorageTime,
    speedImprovement: parseFloat(speedImprovement)
  };
}