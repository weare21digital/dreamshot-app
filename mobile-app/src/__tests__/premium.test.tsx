import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { PremiumScreen } from '../features/payments';
import { PremiumStatus } from '../types';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

const mockUsePayments = jest.fn();
const mockUsePremiumStatus = jest.fn();
const mockUseDevicePremiumStatus = jest.fn();
const mockUseVerifyReceipt = jest.fn();
const mockUseDeviceVerifyReceipt = jest.fn();
const mockUseRestorePurchases = jest.fn();

jest.mock('../services/payments/usePayments', () => ({
  usePayments: (...args: unknown[]) => mockUsePayments(...args),
}));

jest.mock('../features/payments/hooks/usePremiumStatus', () => ({
  usePremiumStatus: (...args: unknown[]) => mockUsePremiumStatus(...args),
}));

jest.mock('../features/payments/hooks/useDevicePremiumStatus', () => ({
  useDevicePremiumStatus: (...args: unknown[]) => mockUseDevicePremiumStatus(...args),
}));

jest.mock('../features/payments/hooks/useVerifyReceipt', () => ({
  useVerifyReceipt: (...args: unknown[]) => mockUseVerifyReceipt(...args),
}));

jest.mock('../features/payments/hooks/useDeviceVerifyReceipt', () => ({
  useDeviceVerifyReceipt: (...args: unknown[]) => mockUseDeviceVerifyReceipt(...args),
}));

jest.mock('../features/payments/hooks/useRestorePurchases', () => ({
  useRestorePurchases: (...args: unknown[]) => mockUseRestorePurchases(...args),
}));

jest.mock('../features/payments/hooks/usePendingVerifications', () => ({
  usePendingVerifications: jest.fn(),
}));

jest.mock('../contexts/ThemeContext', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        onSurfaceVariant: '#666666',
        onBackground: '#111111',
        surface: '#f7f7f7',
      },
    },
    palette: {
      successContainer: '#dcfce7',
      onSuccessContainer: '#166534',
      onSuccessContainerAlt: '#15803d',
      errorContainer: '#fee2e2',
      onErrorContainer: '#991b1b',
    },
    status: {
      success: '#16a34a',
      info: '#2563eb',
      warning: '#d97706',
      danger: '#dc2626',
    },
  }),
}));

const renderWithProvider = (ui: React.ReactElement) => render(<PaperProvider>{ui}</PaperProvider>);

describe('PremiumScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseVerifyReceipt.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    mockUseDeviceVerifyReceipt.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    mockUseRestorePurchases.mockReturnValue({
      restore: jest.fn().mockResolvedValue({ total: 0, successful: 0 }),
      isRestoring: false,
    });
    mockUseDevicePremiumStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('should render loading state initially', () => {
    mockUsePayments.mockReturnValue({
      products: [],
      subscriptions: [],
      isPurchasing: false,
      lastPurchase: null,
      error: null,
      purchaseOneTime: jest.fn(),
      purchaseSubscription: jest.fn(),
      getTrialInfo: jest.fn(() => ({ isTrialAvailable: false })),
      refreshProducts: jest.fn(),
      isLoading: true,
    });

    mockUsePremiumStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProvider(<PremiumScreen />);

    expect(screen.getByText('Loading premium options...')).toBeTruthy();
  });

  it('should render payment plans for free users', () => {
    mockUsePayments.mockReturnValue({
      products: [
        {
          id: 'com.bvg.dreamshot.lifetime',
          title: 'Lifetime Premium',
          displayPrice: '$49.99',
        },
      ],
      subscriptions: [
        {
          id: 'com.bvg.dreamshot.monthly',
          title: 'Monthly Premium',
          displayPrice: '$9.99',
        },
      ],
      isPurchasing: false,
      lastPurchase: null,
      error: null,
      purchaseOneTime: jest.fn(),
      purchaseSubscription: jest.fn(),
      getTrialInfo: jest.fn(() => ({ isTrialAvailable: false })),
      refreshProducts: jest.fn(),
      isLoading: false,
    });

    mockUsePremiumStatus.mockReturnValue({
      data: {
        hasPremium: false,
        premiumStatus: PremiumStatus.FREE,
        premiumExpiry: null,
      },
      isLoading: false,
    });

    renderWithProvider(<PremiumScreen />);

    expect(screen.getByText('Premium Plans')).toBeTruthy();
    expect(screen.getAllByText('Monthly Premium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lifetime Premium').length).toBeGreaterThan(0);
  });
});
