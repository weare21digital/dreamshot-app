import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { AiBackgroundScreen } from '../features/profile/screens/AiBackgroundScreen';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}));

jest.mock('../features/coins/hooks/useCoins', () => ({
  useCoins: () => ({ balance: 123 }),
}));

jest.mock('../contexts/ThemeContext', () => ({
  useAppTheme: () => ({
    palette: {
      background: '#ffffff',
      text: '#111111',
      textSecondary: '#666666',
      cardBackground: '#f7f7f7',
      borderVariant: '#dddddd',
      onPrimary: '#ffffff',
    },
    brand: {
      primary: '#6d28d9',
    },
  }),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true, accessPrivileges: 'all' })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true, accessPrivileges: 'all' })),
  getAlbumAsync: jest.fn(async () => null),
  getAssetsAsync: jest.fn(async () => ({ assets: [] })),
  getAssetInfoAsync: jest.fn(async () => ({ localUri: null, uri: null })),
  SortBy: { creationTime: 'creationTime' },
  MediaType: { photo: 'photo' },
}));

describe('AiBackgroundScreen', () => {
  it('renders screen content and keeps apply button disabled before image selection', async () => {
    const { getByTestId, getByText } = render(
      <PaperProvider settings={{ icon: () => null }}>
        <AiBackgroundScreen />
      </PaperProvider>
    );

    await waitFor(() => {
      expect(getByText('AI Background Changer')).toBeTruthy();
    });

    const applyButton = getByTestId('ai-bg-apply');
    expect(applyButton.props.accessibilityState?.disabled).toBe(true);
  });
});
