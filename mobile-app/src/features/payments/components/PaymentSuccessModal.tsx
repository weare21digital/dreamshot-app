import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Card, Text, Button } from 'react-native-paper';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';

interface PaymentSuccessModalProps {
  visible: boolean;
  isSubscription: boolean;
  onClose: () => void;
}

export default function PaymentSuccessModal({
  visible,
  isSubscription,
  onClose,
}: PaymentSuccessModalProps): React.JSX.Element {
  const { palette, status } = useAppTheme();

  const title = isSubscription ? 'Subscription Activated!' : 'Purchase Successful!';
  const message = isSubscription
    ? 'Your monthly premium subscription has been activated. You now have access to all premium features and an ad-free experience.'
    : 'Your lifetime premium access has been activated. You now have permanent access to all premium features and an ad-free experience.';

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>🎉</Text>
            </View>

            <Text variant="headlineSmall" style={[styles.title, { color: status.success }]}>
              {title}
            </Text>

            <Text variant="bodyMedium" style={[styles.message, { color: palette.textSecondary }]}>
              {message}
            </Text>

            <View style={styles.featuresList}>
              <Text variant="titleMedium" style={styles.featuresTitle}>
                You now have access to:
              </Text>
              <View style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text variant="bodyMedium">Ad-free experience</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text variant="bodyMedium">Premium features</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text variant="bodyMedium">Priority support</Text>
              </View>
              {!isSubscription && (
                <View style={styles.featureRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text variant="bodyMedium">Lifetime access</Text>
                </View>
              )}
            </View>

            <Button
              mode="contained"
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: status.success }]}
              contentStyle={styles.buttonContent}
            >
              Continue
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
  },
  card: {
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 24,
  },
  featuresTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  checkmark: {
    color: APP_THEME.status.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  closeButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
