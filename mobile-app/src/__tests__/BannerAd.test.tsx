import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BannerAd } from '../features/ads';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AdType } from '../features/ads/types';
import { useAdManager } from '../features/ads/hooks';

jest.mock('../features/ads/hooks', () => ({
  useAdManager: jest.fn(),
}));

const mockUseAdManager = useAdManager as jest.MockedFunction<typeof useAdManager>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};

const Wrapper = createWrapper();

const baseAdConfig = {
  id: '1',
  adType: AdType.BANNER,
  adNetworkId: 'test-network',
  displayFrequency: 1,
};

const setupAdManagerMock = (overrides?: Partial<ReturnType<typeof useAdManager>>) => {
  mockUseAdManager.mockReturnValue({
    isLoading: false,
    adConfig: baseAdConfig,
    error: null,
    shouldShow: true,
    trackImpression: jest.fn(),
    trackClick: jest.fn(),
    trackClose: jest.fn(),
    trackError: jest.fn(),
    ...overrides,
  });
};

describe('BannerAd', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    setupAdManagerMock({ isLoading: true });

    const { getByText } = render(
      <Wrapper>
        <BannerAd />
      </Wrapper>
    );

    expect(getByText('Loading ad...')).toBeTruthy();
  });

  it('should render ad content when loaded', () => {
    setupAdManagerMock();

    const { getByText } = render(
      <Wrapper>
        <BannerAd />
      </Wrapper>
    );

    expect(getByText('Advertisement')).toBeTruthy();
    expect(getByText('Sample Banner Ad - Network: test-network')).toBeTruthy();
    expect(getByText('Tap to learn more')).toBeTruthy();
  });

  it('should not render when user should not see ads', () => {
    setupAdManagerMock({ shouldShow: false, adConfig: null });

    const { queryByText } = render(
      <Wrapper>
        <BannerAd />
      </Wrapper>
    );

    expect(queryByText('Advertisement')).toBeNull();
  });

  it('should call onAdLoaded callback when ad loads successfully', async () => {
    setupAdManagerMock();
    const onAdLoaded = jest.fn();

    render(
      <Wrapper>
        <BannerAd onAdLoaded={onAdLoaded} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(onAdLoaded).toHaveBeenCalledTimes(1);
    });
  });

  it('should track impression when ad is displayed', async () => {
    const trackImpression = jest.fn();
    setupAdManagerMock({ trackImpression });

    render(
      <Wrapper>
        <BannerAd />
      </Wrapper>
    );

    await waitFor(() => {
      expect(trackImpression).toHaveBeenCalledTimes(1);
    });
  });

  it('should track click when ad is pressed', () => {
    const trackClick = jest.fn();
    setupAdManagerMock({ trackClick });

    const { getByText } = render(
      <Wrapper>
        <BannerAd />
      </Wrapper>
    );

    fireEvent.press(getByText('Tap to learn more'));

    expect(trackClick).toHaveBeenCalledTimes(1);
  });

  it('should call onAdError when error is present', async () => {
    setupAdManagerMock({ error: 'Ad failed to load', shouldShow: false, adConfig: null });
    const onAdError = jest.fn();

    render(
      <Wrapper>
        <BannerAd onAdError={onAdError} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(onAdError).toHaveBeenCalledWith('Ad failed to load');
    });
  });
});
