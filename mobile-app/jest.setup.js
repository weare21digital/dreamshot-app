
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-iap', () => {
  const noopSubscription = {
    remove: jest.fn(),
  };

  return {
    initConnection: jest.fn(async () => true),
    endConnection: jest.fn(async () => true),
    fetchProducts: jest.fn(async () => []),
    requestPurchase: jest.fn(async () => undefined),
    finishTransaction: jest.fn(async () => undefined),
    getAvailablePurchases: jest.fn(async () => []),
    purchaseUpdatedListener: jest.fn(() => noopSubscription),
    purchaseErrorListener: jest.fn(() => noopSubscription),
    verifyPurchase: jest.fn(async () => ({ isValid: true })),
  };
});
