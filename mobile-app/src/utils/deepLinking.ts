import { Linking } from 'react-native';
import { router } from 'expo-router';

export interface DeepLinkParams {
  token?: string;
  [key: string]: string | undefined;
}

/**
 * Parse URL parameters from a deep link
 */
export function parseDeepLinkParams(url: string): DeepLinkParams {
  try {
    const urlObj = new URL(url);
    const params: DeepLinkParams = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch (error) {
    console.error('Error parsing deep link params:', error);
    return {};
  }
}

/**
 * Handle deep link navigation
 */
export function handleDeepLink(url: string): boolean {
  try {
    console.log('Handling deep link:', url);
    
    const urlObj = new URL(url);
    // For custom schemes like mobile-app://reset-password?token=xxx
    // The path part appears as the hostname, not pathname
    // So we need to check both hostname and pathname
    let path = urlObj.pathname;
    
    // If pathname is empty or just '/', use hostname as the path
    if (!path || path === '/') {
      path = '/' + urlObj.hostname;
    }
    
    console.log('Parsed path:', path);
    const params = parseDeepLinkParams(url);
    console.log('Parsed params:', params);
    
    switch (path) {
      case '/verify-email':
        if (params.token) {
          console.log('Navigating to email verification with token:', params.token);
          router.push({
            pathname: '/auth/verify-email',
            params: { token: params.token }
          });
          return true;
        }
        break;
        
      case '/reset-password':
        if (params.token) {
          console.log('Navigating to password reset with token:', params.token);
          router.push({
            pathname: '/auth/reset-password',
            params: { token: params.token }
          });
          return true;
        }
        break;
        
      default:
        console.log('Unknown deep link path:', path);
        // Navigate to home screen for unknown paths
        router.push('/');
        return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error handling deep link:', error);
    return false;
  }
}


/**
 * Wait for router to be ready and then handle deep link
 */
function handleDeepLinkWithRetry(url: string, retries = 3, delay = 500): void {
  const attempt = (): void => {
    try {
      const success = handleDeepLink(url);
      if (!success && retries > 0) {
        console.log(`Deep link navigation failed, retrying in ${delay}ms... (${retries} retries left)`);
        globalThis.setTimeout(() => {
          handleDeepLinkWithRetry(url, retries - 1, delay);
        }, delay);
      }
    } catch (error) {
      console.error('Deep link handling error:', error);
      if (retries > 0) {
        globalThis.setTimeout(() => {
          handleDeepLinkWithRetry(url, retries - 1, delay);
        }, delay);
      }
    }
  };
  attempt();
}

/**
 * Initialize deep link handling
 */
export function initializeDeepLinking(): void {
  // Handle deep links when app is already running
  Linking.addEventListener('url', (event) => {
    console.log('Deep link received while app running:', event.url);
    // Small delay to ensure navigation context is ready
    globalThis.setTimeout(() => {
      handleDeepLink(event.url);
    }, 100);
  });

  // Handle deep links when app is launched from closed state
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('Deep link received on app launch:', url);
      // Longer delay to ensure the app and router are fully initialized
      globalThis.setTimeout(() => {
        handleDeepLinkWithRetry(url, 3, 500);
      }, 1500);
    }
  }).catch((error) => {
    console.error('Error getting initial deep link URL:', error);
  });
}


/**
 * Check if a URL is a valid deep link for this app
 */
export function isValidDeepLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'mobile-app:';
  } catch {
    return false;
  }
}