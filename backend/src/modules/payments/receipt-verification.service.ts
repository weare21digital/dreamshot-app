import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PremiumStatus, PaymentStatus, PaymentType } from '../../../generated/prisma';
import { environmentConfig } from '../../config/config';
import {
  StorePlatform,
  type VerifyReceiptRequest,
  type VerificationResult,
  type StoreVerificationResult,
  isKnownSku,
  isSubscriptionSku,
} from './interfaces/verification.interface';

@Injectable()
export class ReceiptVerificationService {
  private readonly logger = new Logger(ReceiptVerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async verifyReceipt(
    request: VerifyReceiptRequest,
  ): Promise<VerificationResult> {
    // Step 1: Validate SKU against allow-list
    if (!isKnownSku(request.productId)) {
      throw new BadRequestException(
        `Unknown product: ${request.productId}`,
      );
    }

    // Step 2: Validate platform-specific required fields
    this.validatePlatformFields(request);

    // Step 3: Check for duplicate transaction (idempotency)
    const existing = await this.checkDuplicate(request);
    if (existing) {
      this.logger.log(
        `Duplicate transaction: ${request.transactionId ?? request.purchaseToken}`,
      );
      return { isValid: true, alreadyProcessed: true, ...existing };
    }

    // Step 4: Verify with platform store
    const storeResult =
      request.platform === StorePlatform.IOS
        ? await this.verifyAppleReceipt(request)
        : await this.verifyGoogleToken(request);

    if (!storeResult.isValid) {
      throw new BadRequestException('Receipt verification failed');
    }

    // Step 5: Determine premium status (lifetime takes precedence)
    const premiumStatus = await this.resolvePremiumStatus(
      request.userId,
      storeResult,
    );

    // Step 6: Update user premium status
    await this.updatePremiumStatus(request.userId, premiumStatus, storeResult.expiryDate);

    // Step 7: Store purchase record
    await this.storePurchaseRecord(request, storeResult);

    return {
      ...storeResult,
      premiumStatus,
    };
  }

  // -- Platform field validation --

  private validatePlatformFields(request: VerifyReceiptRequest): void {
    if (request.platform === StorePlatform.IOS && !request.receiptData) {
      throw new BadRequestException(
        'receiptData is required for iOS verification',
      );
    }

    if (request.platform === StorePlatform.ANDROID && !request.purchaseToken) {
      throw new BadRequestException(
        'purchaseToken is required for Android verification',
      );
    }
  }

  // -- Duplicate detection --

  private async checkDuplicate(request: VerifyReceiptRequest) {
    const where =
      request.platform === StorePlatform.IOS
        ? { originalTransactionId: request.originalTransactionId }
        : { purchaseToken: request.purchaseToken };

    const existing = await this.prisma.payment.findFirst({
      where: { userId: request.userId, ...where },
    });

    if (!existing) return null;

    return {
      productId: existing.storeSku!,
      purchaseDate: existing.purchaseDate!,
      expiryDate: existing.expiryDate ?? undefined,
      premiumStatus:
        existing.type === PaymentType.SUBSCRIPTION
          ? PremiumStatus.PREMIUM_SUBSCRIPTION
          : PremiumStatus.PREMIUM_LIFETIME,
    };
  }

  // -- Apple verification (StoreKit 2 JWS) --

  private async verifyAppleReceipt(
    request: VerifyReceiptRequest,
  ): Promise<StoreVerificationResult> {
    const receiptData = request.receiptData!;
    const bundleId = environmentConfig.iap.appleBundleId;

    // StoreKit 2 sends a JWS (signed JWT) as receiptData.
    // Detect JWS format: three dot-separated base64url segments.
    if (this.isJWSToken(receiptData)) {
      return this.verifyAppleJWS(receiptData, bundleId, request.productId);
    }

    // Legacy base64 receipt fallback
    return this.verifyAppleLegacyReceipt(receiptData, bundleId, request.productId);
  }

  private isJWSToken(data: string): boolean {
    const parts = data.split('.');
    return parts.length === 3 && parts.every((p) => p.length > 0);
  }

  private verifyAppleJWS(
    jws: string,
    bundleId: string | undefined,
    requestedSku: string,
  ): StoreVerificationResult {
    const payload = this.decodeJWSPayload(jws);
    if (!payload) {
      this.logger.error('Failed to decode Apple JWS payload');
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    // Validate bundle ID
    if (bundleId && payload.bundleId !== bundleId) {
      this.logger.error(
        `Bundle ID mismatch: expected ${bundleId}, got ${payload.bundleId}`,
      );
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    // Validate product ID matches the requested SKU
    if (payload.productId !== requestedSku) {
      this.logger.error(
        `Product ID mismatch: expected ${requestedSku}, got ${payload.productId}`,
      );
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    // Check revocation
    if (payload.revocationDate) {
      this.logger.warn(`Transaction ${payload.transactionId} was revoked`);
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    const purchaseDate = new Date(payload.purchaseDate);
    const expiryDate = payload.expiresDate
      ? new Date(payload.expiresDate)
      : undefined;

    return { isValid: true, productId: payload.productId, purchaseDate, expiryDate };
  }

  private decodeJWSPayload(jws: string): any | null {
    try {
      const [, payloadB64] = jws.split('.');
      const decoded = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  private async verifyAppleLegacyReceipt(
    receiptData: string,
    bundleId: string | undefined,
    requestedSku: string,
  ): Promise<StoreVerificationResult> {
    const sharedSecret = environmentConfig.iap.appleSharedSecret;
    if (!sharedSecret) {
      throw new BadRequestException('Apple shared secret not configured');
    }

    // Try production first, fallback to sandbox on 21007
    let response = await this.callAppleAPI(receiptData, sharedSecret, 'production');

    // 21007 = production receipt sent to sandbox endpoint — retry sandbox
    if (response.status === 21007) {
      response = await this.callAppleAPI(receiptData, sharedSecret, 'sandbox');
    }

    // 21008 = sandbox receipt sent to production endpoint — retry sandbox
    if (response.status === 21008) {
      response = await this.callAppleAPI(receiptData, sharedSecret, 'sandbox');
    }

    if (response.status !== 0) {
      this.logger.error(`Apple verification failed with status: ${response.status}`);
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    // Validate bundle ID
    if (bundleId && response.receipt?.bundle_id !== bundleId) {
      this.logger.error(
        `Bundle ID mismatch: expected ${bundleId}, got ${response.receipt?.bundle_id}`,
      );
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    // Select the correct transaction for the requested SKU
    const latestReceipt = this.selectLatestAppleReceipt(
      response.latest_receipt_info ?? response.receipt?.in_app ?? [],
      requestedSku,
    );

    if (!latestReceipt) {
      return { isValid: false, productId: requestedSku, purchaseDate: new Date() };
    }

    const purchaseDate = new Date(parseInt(latestReceipt.purchase_date_ms));
    const expiryDate = latestReceipt.expires_date_ms
      ? new Date(parseInt(latestReceipt.expires_date_ms))
      : undefined;

    return { isValid: true, productId: latestReceipt.product_id, purchaseDate, expiryDate };
  }

  private selectLatestAppleReceipt(items: any[], sku: string) {
    const candidates = items.filter((i) => i.product_id === sku);
    candidates.sort(
      (a, b) =>
        Number(b.expires_date_ms ?? b.purchase_date_ms) -
        Number(a.expires_date_ms ?? a.purchase_date_ms),
    );
    return candidates[0] ?? null;
  }

  private async callAppleAPI(
    receiptData: string,
    sharedSecret: string,
    environment: 'production' | 'sandbox',
  ): Promise<any> {
    const url =
      environment === 'production'
        ? 'https://buy.itunes.apple.com/verifyReceipt'
        : 'https://sandbox.itunes.apple.com/verifyReceipt';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receiptData,
        password: sharedSecret,
        'exclude-old-transactions': true,
      }),
    });

    return response.json();
  }

  // -- Google verification --

  private async verifyGoogleToken(
    request: VerifyReceiptRequest,
  ): Promise<StoreVerificationResult> {
    const packageName = environmentConfig.iap.googlePackageName;
    const serviceAccountJson = environmentConfig.iap.googleServiceAccount;

    if (!packageName || !serviceAccountJson) {
      throw new BadRequestException('Google credentials not configured');
    }

    try {
      const { google } = await import('googleapis');

      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(serviceAccountJson),
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      });

      const androidPublisher = google.androidpublisher({ version: 'v3', auth });
      const isSub = isSubscriptionSku(request.productId);

      if (isSub) {
        return await this.verifyGoogleSubscription(
          androidPublisher,
          packageName,
          request,
        );
      }

      return await this.verifyGoogleProduct(
        androidPublisher,
        packageName,
        request,
      );
    } catch (error: any) {
      this.logger.error(`Google verification failed: ${error.message}`);
      return { isValid: false, productId: request.productId, purchaseDate: new Date() };
    }
  }

  private async verifyGoogleSubscription(
    androidPublisher: any,
    packageName: string,
    request: VerifyReceiptRequest,
  ): Promise<StoreVerificationResult> {
    const response = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: request.productId,
      token: request.purchaseToken!,
    });

    const data = response.data;
    const invalid: StoreVerificationResult = {
      isValid: false,
      productId: request.productId,
      purchaseDate: new Date(),
    };

    // paymentState: 0=pending, 1=received, 2=trial, 3=deferred
    // Treat undefined conservatively as invalid
    const paymentState = data.paymentState;
    if (paymentState == null || paymentState === 0 || paymentState === 3) {
      return invalid;
    }

    // Check if subscription expiry has already passed
    const expiryMs = data.expiryTimeMillis ? parseInt(data.expiryTimeMillis) : null;
    if (expiryMs && expiryMs < Date.now()) {
      this.logger.warn(
        `Subscription ${request.productId} already expired at ${new Date(expiryMs).toISOString()}`,
      );
      return invalid;
    }

    const purchaseDate = new Date(parseInt(data.startTimeMillis!));
    const expiryDate = expiryMs ? new Date(expiryMs) : undefined;

    return { isValid: true, productId: request.productId, purchaseDate, expiryDate };
  }

  private async verifyGoogleProduct(
    androidPublisher: any,
    packageName: string,
    request: VerifyReceiptRequest,
  ): Promise<StoreVerificationResult> {
    const response = await androidPublisher.purchases.products.get({
      packageName,
      productId: request.productId,
      token: request.purchaseToken!,
    });

    const data = response.data;

    // purchaseState: 0=purchased, 1=cancelled, 2=pending
    // Treat undefined conservatively as invalid
    if (data.purchaseState == null || data.purchaseState !== 0) {
      return { isValid: false, productId: request.productId, purchaseDate: new Date() };
    }

    const purchaseDate = new Date(parseInt(data.purchaseTimeMillis!));

    return { isValid: true, productId: request.productId, purchaseDate };
  }

  // -- Premium status resolution --

  private async resolvePremiumStatus(
    userId: string,
    storeResult: StoreVerificationResult,
  ): Promise<PremiumStatus> {
    const isSubscription = storeResult.expiryDate != null;

    if (!isSubscription) {
      // Lifetime purchase always takes highest precedence
      return PremiumStatus.PREMIUM_LIFETIME;
    }

    // Check if user already has lifetime — don't downgrade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { premiumStatus: true },
    });

    if (user?.premiumStatus === PremiumStatus.PREMIUM_LIFETIME) {
      return PremiumStatus.PREMIUM_LIFETIME;
    }

    return PremiumStatus.PREMIUM_SUBSCRIPTION;
  }

  // -- Database updates --

  private async updatePremiumStatus(
    userId: string,
    premiumStatus: PremiumStatus,
    expiryDate?: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        premiumStatus,
        premiumExpiry: expiryDate ?? null,
      },
    });

    this.logger.log(
      `Updated premium status for user ${userId}: ${premiumStatus}` +
        (expiryDate ? ` (expires: ${expiryDate.toISOString()})` : ''),
    );
  }

  private async storePurchaseRecord(
    request: VerifyReceiptRequest,
    result: StoreVerificationResult,
  ): Promise<void> {
    await this.prisma.payment.create({
      data: {
        userId: request.userId,
        platform: request.platform,
        storeSku: request.productId,
        transactionId: request.transactionId ?? null,
        originalTransactionId: request.originalTransactionId ?? null,
        purchaseToken: request.purchaseToken ?? null,
        receiptData: request.receiptData ?? null,
        purchaseDate: result.purchaseDate,
        expiryDate: result.expiryDate ?? null,
        type: result.expiryDate ? PaymentType.SUBSCRIPTION : PaymentType.ONE_TIME,
        status: PaymentStatus.COMPLETED,
        amount: 0,
        currency: 'USD',
      },
    });

    this.logger.log(
      `Stored purchase record: ${request.productId} for user ${request.userId}`,
    );
  }
}
