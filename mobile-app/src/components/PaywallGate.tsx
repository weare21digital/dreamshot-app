import React from 'react';
import { IAP_CONFIG } from '../config/iap';
import { useDevicePremiumStatus } from '../features/payments/hooks/useDevicePremiumStatus';
import { usePremiumStatus } from '../features/payments/hooks/usePremiumStatus';
import { PremiumScreen } from '../features/payments/screens/PremiumScreen';

/**
 * Wraps children with a paywall gate.
 * - 'freemium': no gate, renders children immediately
 * - 'unlocked': no gate, everything accessible (paid App Store download)
 * - 'paid': blocks all content until user has premium via IAP
 */
export function PaywallGate({ children }: { children: React.ReactNode }): React.JSX.Element {
  const isDeviceMode = IAP_CONFIG.paymentMode === 'device';
  const accessMode = IAP_CONFIG.accessMode;

  const deviceStatus = useDevicePremiumStatus();
  const backendStatus = usePremiumStatus();
  const { data: premiumStatus } = isDeviceMode ? deviceStatus : backendStatus;

  // Freemium or unlocked — no gate
  if (accessMode !== 'paid') {
    return <>{children}</>;
  }

  // Paid mode — check if user has premium
  const hasPremium = premiumStatus?.hasPremium ?? false;

  if (hasPremium) {
    return <>{children}</>;
  }

  // Show paywall — full screen, no navigation escape
  return <PremiumScreen isGate />;
}
