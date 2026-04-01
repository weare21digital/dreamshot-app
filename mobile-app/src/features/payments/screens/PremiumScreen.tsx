import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, Linking, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { Text, Card, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePayments } from '../../../services/payments/usePayments';
import { paymentService } from '../../../services/payments/paymentService';
import type {
  PaymentProduct,
  PaymentSubscription,
  TrialInfo,
} from '../../../services/payments/paymentTypes';
import { usePremiumStatus, type PremiumStatusData } from '../hooks/usePremiumStatus';
import { useDevicePremiumStatus } from '../hooks/useDevicePremiumStatus';
import { useVerifyReceipt } from '../hooks/useVerifyReceipt';
import { useDeviceVerifyReceipt } from '../hooks/useDeviceVerifyReceipt';
import { useRestorePurchases } from '../hooks/useRestorePurchases';
import { IAP_CONFIG, getIAPConfig, SKU_FEATURES } from '../../../config/iap';
import { extractReceipt } from '../utils/extractReceipt';
import { mapIAPError } from '../utils/mapIAPError';
import { addPendingPurchase } from '../utils/pendingVerificationQueue';
import { usePendingVerifications } from '../hooks/usePendingVerifications';
import { PaymentErrorModal, PaymentSuccessModal } from '../components';
import { PremiumStatus } from '../../../types';
import { useAppTheme } from '../../../contexts/ThemeContext';
import type { MD3Theme } from 'react-native-paper';
import { APP_THEME } from '../../../config/theme';
import { styles } from './premiumScreen.styles';

export function PremiumScreen({ isGate = false }: { isGate?: boolean } = {}): React.JSX.Element {
  const { theme } = useAppTheme();
  const iapConfig = useMemo(() => getIAPConfig(), []);

  const {
    products, subscriptions, isPurchasing, lastPurchase, error: iapError,
    purchaseOneTime, purchaseSubscription, getTrialInfo, refreshProducts,
    isLoading: productsLoading,
  } = usePayments({
    productIds: [...iapConfig.productIds],
    subscriptionIds: [...iapConfig.subscriptionIds],
  });

  const isDeviceMode = IAP_CONFIG.paymentMode === 'device';
  const backendStatus = usePremiumStatus();
  const deviceStatus = useDevicePremiumStatus();
  const { data: premiumStatus, isLoading: statusLoading } = isDeviceMode ? deviceStatus : backendStatus;

  const backendVerify = useVerifyReceipt();
  const deviceVerify = useDeviceVerifyReceipt();
  const { mutate: verifyReceipt, isPending: isVerifying } = isDeviceMode ? deviceVerify : backendVerify;

  const { restore, isRestoring } = useRestorePurchases();

  // Process any previously queued (unverified) purchases on mount / foreground
  usePendingVerifications();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSuccessType, setLastSuccessType] = useState<'subscription' | 'one-time'>('subscription');
  const [verifiedTransactionId, setVerifiedTransactionId] = useState<string | null>(null);

  // Verify purchase with backend when a new purchase arrives
  useEffect(() => {
    if (!lastPurchase) return;

    const txId = lastPurchase.transactionId ?? null;
    if (txId === verifiedTransactionId) return;

    const receipt = extractReceipt(lastPurchase);
    verifyReceipt(receipt, {
      onSuccess: async (result) => {
        if (result.isValid || result.alreadyProcessed) {
          // Clear debug override so premium status reflects the real purchase
          await AsyncStorage.removeItem('@iap_debug_force_free');
          paymentService.finishPurchase(lastPurchase, false);
          setVerifiedTransactionId(txId);
          setLastSuccessType(result.expiryDate ? 'subscription' : 'one-time');
          setShowSuccessModal(true);
        }
      },
      onError: () => {
        // Queue for retry on next launch / connectivity restore
        addPendingPurchase(receipt);
        setErrorMessage('Verification failed. Your purchase is saved and will be retried.');
        setShowErrorModal(true);
      },
    });
  }, [lastPurchase, verifiedTransactionId, verifyReceipt]);

  // Handle IAP errors
  useEffect(() => {
    if (!iapError) return;
    const info = mapIAPError(iapError);
    if (info.message) {
      setErrorMessage(info.message);
      setShowErrorModal(true);
    }
  }, [iapError]);

  const handleSubscriptionPurchase = useCallback(async (sub: PaymentSubscription) => {
    try {
      const trial = getTrialInfo(sub);
      await purchaseSubscription(sub.id, trial.offerToken);
    } catch {
      // Errors handled by IAP listener
    }
  }, [purchaseSubscription, getTrialInfo]);

  const handleOneTimePurchase = useCallback(async (product: PaymentProduct) => {
    try {
      await purchaseOneTime(product.id);
    } catch {
      // Errors handled by IAP listener
    }
  }, [purchaseOneTime]);

  const handleRestore = useCallback(async () => {
    const result = await restore();
    if (result.total === 0) {
      setErrorMessage('No previous purchases found for this account.');
      setShowErrorModal(true);
    } else if (result.successful > 0) {
      setShowSuccessModal(true);
    } else {
      setErrorMessage('Failed to restore purchases. Please contact support.');
      setShowErrorModal(true);
    }
  }, [restore]);

  const isBusy = isPurchasing || isVerifying || isRestoring;

  if (productsLoading || statusLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading premium options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Premium Plans
          </Text>

          <StatusCard premiumStatus={premiumStatus} theme={theme} />

          {premiumStatus?.hasPremium ? (
            <PremiumActiveCard />
          ) : (
            <>
              <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                Upgrade to Premium to enjoy an ad-free experience and unlock exclusive features.
              </Text>

              {subscriptions.length > 0 && (
                <Text variant="titleMedium" style={styles.sectionTitle}>Subscriptions</Text>
              )}
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  trialInfo={getTrialInfo(sub)}
                  isBusy={isBusy}
                  onPurchase={() => handleSubscriptionPurchase(sub)}
                  theme={theme}
                />
              ))}

              {products.length > 0 && (
                <Text variant="titleMedium" style={styles.sectionTitle}>One-Time Purchase</Text>
              )}
              {products.map((prod) => (
                <OneTimeCard
                  key={prod.id}
                  product={prod}
                  isBusy={isBusy}
                  onPurchase={() => handleOneTimePurchase(prod)}
                  theme={theme}
                />
              ))}

              {subscriptions.length === 0 && products.length === 0 && (
                <ErrorBanner message="Could not load products from the store." onRetry={refreshProducts} />
              )}

              <RestoreSection isRestoring={isRestoring} onRestore={handleRestore} />
              <SubscriptionDisclosures />
            </>
          )}
        </View>
      </ScrollView>

      <PaymentErrorModal
        visible={showErrorModal}
        error={errorMessage}
        onRetry={() => setShowErrorModal(false)}
        onClose={() => { setShowErrorModal(false); setErrorMessage(null); }}
        showRetry={false}
      />
      <PaymentSuccessModal
        visible={showSuccessModal}
        isSubscription={lastSuccessType === 'subscription'}
        onClose={() => { setShowSuccessModal(false); if (!isGate) router.back(); }}
      />
    </SafeAreaView>
  );
}

// --- Sub-components extracted for readability ---

function StatusCard({ premiumStatus, theme }: {
  premiumStatus: PremiumStatusData | undefined;
  theme: MD3Theme;
}): React.JSX.Element | null {
  if (!premiumStatus) return null;

  const labels: Record<string, string> = {
    [PremiumStatus.PREMIUM_LIFETIME]: 'Premium (Lifetime)',
    [PremiumStatus.PREMIUM_SUBSCRIPTION]: 'Premium (Subscription)',
  };
  const colors: Record<string, string> = {
    [PremiumStatus.PREMIUM_LIFETIME]: APP_THEME.status.success,
    [PremiumStatus.PREMIUM_SUBSCRIPTION]: APP_THEME.status.info,
  };

  return (
    <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.statusRow}>
          <Text variant="titleMedium">Current Status</Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: colors[premiumStatus.premiumStatus] ?? APP_THEME.status.neutral }]}
            textStyle={{ color: 'white' }}
          >
            {labels[premiumStatus.premiumStatus] ?? 'Free'}
          </Chip>
        </View>
        {premiumStatus.premiumExpiry && (
          <Text variant="bodyMedium" style={styles.expiryText}>
            Expires: {new Date(premiumStatus.premiumExpiry).toLocaleDateString()}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

function PremiumActiveCard(): React.JSX.Element {
  const { palette } = useAppTheme();
  const queryClient = useQueryClient();

  const handleResetPremium = () => {
    Alert.alert(
      'Reset Premium',
      'Clear local premium status for testing. Use "Restore Purchases" to get it back.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('@iap_debug_force_free', 'true');
            await AsyncStorage.removeItem('@iap_device_premium_status');
            queryClient.invalidateQueries({ queryKey: ['payments', 'status'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['ads', 'shouldShow'] });
          },
        },
      ],
    );
  };

  return (
    <Card style={[styles.premiumCard, { backgroundColor: palette.successContainer }]}>
      <Card.Content>
        <Text variant="titleLarge" style={[styles.premiumTitle, { color: palette.onSuccessContainer }]}>You have Premium Access!</Text>
        <Text variant="bodyMedium" style={[styles.premiumDescription, { color: palette.onSuccessContainerAlt }]}>
          Enjoy your ad-free experience and premium features.
        </Text>
        <Button mode="outlined" onPress={() => router.back()} style={styles.backButton}>
          Back to Profile
        </Button>
        {__DEV__ && IAP_CONFIG.paymentMode === 'device' && (
          <Button
            mode="text"
            onPress={handleResetPremium}
            textColor={palette.onErrorContainer}
            style={{ marginTop: 12 }}
          >
            🔧 Reset Premium (Debug)
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

function SubscriptionCard({ subscription, trialInfo, isBusy, onPurchase, theme }: {
  subscription: PaymentSubscription;
  trialInfo: TrialInfo;
  isBusy: boolean;
  onPurchase: () => void;
  theme: MD3Theme;
}): React.JSX.Element {
  const features = SKU_FEATURES[subscription.id] ?? [subscription.title];

  return (
    <Card style={[styles.planCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.planHeader}>
          <Text variant="titleLarge" style={styles.planTitle}>{subscription.title}</Text>
          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.price}>{subscription.displayPrice}</Text>
            {trialInfo.isTrialAvailable && (
              <Text style={styles.trialText}>Free trial: {trialInfo.trialPeriod}</Text>
            )}
          </View>
        </View>
        <Divider style={styles.divider} />
        {features.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text variant="bodyMedium" style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        <Button
          mode="contained"
          onPress={onPurchase}
          loading={isBusy}
          disabled={isBusy}
          style={styles.purchaseButton}
          contentStyle={styles.buttonContent}
        >
          Subscribe Now
        </Button>
      </Card.Content>
    </Card>
  );
}

function OneTimeCard({ product, isBusy, onPurchase, theme }: {
  product: PaymentProduct;
  isBusy: boolean;
  onPurchase: () => void;
  theme: MD3Theme;
}): React.JSX.Element {
  const features = SKU_FEATURES[product.id] ?? [product.title];

  return (
    <Card style={[styles.planCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.planHeader}>
          <Text variant="titleLarge" style={styles.planTitle}>{product.title}</Text>
          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.price}>{product.displayPrice}</Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        {features.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text variant="bodyMedium" style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        <Button
          mode="contained"
          onPress={onPurchase}
          loading={isBusy}
          disabled={isBusy}
          style={[styles.purchaseButton, styles.lifetimeButton]}
          contentStyle={styles.buttonContent}
        >
          Buy Lifetime Access
        </Button>
      </Card.Content>
    </Card>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }): React.JSX.Element {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.errorBanner, { backgroundColor: palette.errorContainer }]}>
      <Text style={[styles.errorBannerText, { color: palette.onErrorContainer }]}>{message}</Text>
      <Button mode="text" onPress={onRetry} style={styles.retryButton}>Retry</Button>
    </View>
  );
}

function RestoreSection({ isRestoring, onRestore }: {
  isRestoring: boolean;
  onRestore: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.restoreSection}>
      <Text variant="bodySmall" style={styles.restoreText}>
        Already purchased? Restore your purchases to regain access.
      </Text>
      <Button mode="outlined" onPress={onRestore} loading={isRestoring} disabled={isRestoring} style={styles.restoreButton}>
        Restore Purchases
      </Button>
    </View>
  );
}

function SubscriptionDisclosures(): React.JSX.Element {
  return (
    <View style={styles.disclosureSection}>
      <Text style={styles.disclosureText}>
        Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
        Your account will be charged for renewal within 24 hours prior to the end of the current period.
      </Text>
      <Text style={styles.disclosureText}>
        <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/privacy')}>
          Privacy Policy
        </Text>
        {' | '}
        <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/terms')}>
          Terms of Use
        </Text>
        {' | '}
        <Text
          style={styles.linkText}
          onPress={() => {
            const url = Platform.select({
              ios: 'https://apps.apple.com/account/subscriptions',
              android: 'https://play.google.com/store/account/subscriptions',
              default: '',
            });
            if (url) Linking.openURL(url);
          }}
        >
          Manage Subscriptions
        </Text>
      </Text>
    </View>
  );
}
