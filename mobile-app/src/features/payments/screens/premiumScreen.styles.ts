import { StyleSheet } from 'react-native';
import { APP_THEME } from '../../../config/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    marginLeft: 4,
  },
  expiryText: {
    marginTop: 8,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: APP_THEME.status.error,
  },
  errorBannerText: {
    fontSize: 14,
  },
  premiumCard: {
    marginBottom: 16,
    borderColor: APP_THEME.status.success,
    borderWidth: 2,
  },
  premiumTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  premiumDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    borderColor: APP_THEME.status.success,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  planCard: {
    marginBottom: 16,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: 'bold',
    color: APP_THEME.status.info,
  },
  trialText: {
    color: APP_THEME.status.success,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    marginBottom: 12,
  },
  featuresTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkmark: {
    color: APP_THEME.status.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featureText: {
    flex: 1,
  },
  purchaseButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  lifetimeButton: {
    backgroundColor: APP_THEME.status.success,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  restoreSection: {
    marginTop: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  restoreText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  restoreButton: {
    marginTop: 4,
  },
  disclosureSection: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  disclosureText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  linkText: {
    color: APP_THEME.status.info,
    textDecorationLine: 'underline',
  },
  retryButton: {
    marginTop: 12,
  },
});
