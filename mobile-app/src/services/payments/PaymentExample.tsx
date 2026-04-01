import React from 'react';
import { ActivityIndicator, Button, ScrollView, Text, View } from 'react-native';
import { usePayments } from './usePayments';

const paymentConfig = {
  productIds: ['quicknutrition_unlock'],
  subscriptionIds: ['womenshealth_pro_monthly', 'womenshealth_pro_yearly'],
  consumableProductIds: [],
  iosSharedSecret: undefined,
  enableSandbox: __DEV__,
};

export const PaymentExample = () => {
  const {
    isConnected,
    isLoading,
    isPurchasing,
    isRestoring,
    products,
    subscriptions,
    purchases,
    error,
    lastValidation,
    purchaseOneTime,
    purchaseSubscription,
    restorePurchases,
    getTrialInfo,
  } = usePayments(paymentConfig);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 8 }}>
        Payments Example
      </Text>
      <Text style={{ marginBottom: 12 }}>Connected: {String(isConnected)}</Text>

      {(isLoading || isPurchasing || isRestoring) && (
        <View style={{ marginBottom: 12 }}>
          <ActivityIndicator />
          <Text>
            {isLoading && 'Loading products...'}
            {isPurchasing && 'Processing purchase...'}
            {isRestoring && 'Restoring purchases...'}
          </Text>
        </View>
      )}

      {error && (
        <Text style={{ color: 'red', marginBottom: 12 }}>
          Error: {error.message ?? 'Unknown payment error'}
        </Text>
      )}

      {lastValidation && !lastValidation.isValid && (
        <Text style={{ color: 'red', marginBottom: 12 }}>
          Receipt validation failed: {lastValidation.reason ?? 'Unknown reason'}
        </Text>
      )}

      <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 8 }}>
        One-time purchases
      </Text>
      {products.map((product) => (
        <View key={product.id} style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '600' }}>{product.title}</Text>
          <Text>{product.description}</Text>
          <Text>{product.displayPrice}</Text>
          <Button
            title={`Buy ${product.displayPrice}`}
            onPress={() => purchaseOneTime(product.id)}
          />
        </View>
      ))}

      <Text style={{ fontSize: 18, fontWeight: '500', marginVertical: 8 }}>
        Subscriptions
      </Text>
      {subscriptions.map((subscription) => {
        const trialInfo = getTrialInfo(subscription);
        return (
          <View key={subscription.id} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: '600' }}>{subscription.title}</Text>
            <Text>{subscription.description}</Text>
            <Text>{subscription.displayPrice}</Text>
            {trialInfo.isTrialAvailable && (
              <Text>
                Trial: {trialInfo.trialPeriod ?? 'limited'} ({trialInfo.trialPrice ?? 'free'})
              </Text>
            )}
            <Button
              title={`Subscribe ${subscription.displayPrice}`}
              onPress={() => purchaseSubscription(subscription.id, trialInfo.offerToken)}
            />
          </View>
        );
      })}

      <View style={{ marginTop: 16 }}>
        <Button title="Restore Purchases" onPress={restorePurchases} />
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>Active Purchases</Text>
        {purchases.map((purchase) => (
          <Text key={purchase.transactionId ?? purchase.productId}>
            {purchase.productId ?? 'Unknown product'}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};
