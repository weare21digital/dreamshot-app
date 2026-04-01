import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReceiptVerificationService } from './receipt-verification.service';
import { StorePlatform } from './interfaces/verification.interface';
import { PremiumStatus } from '../../../generated/prisma';

@Injectable()
export class SubscriptionLifecycleService {
  private readonly logger = new Logger(SubscriptionLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: ReceiptVerificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkExpiredSubscriptions(): Promise<void> {
    this.logger.log('Starting subscription expiry check...');

    const expiredUsers = await this.prisma.user.findMany({
      where: {
        premiumStatus: PremiumStatus.PREMIUM_SUBSCRIPTION,
        premiumExpiry: { lt: new Date() },
      },
      include: {
        payments: {
          where: {
            platform: { not: null },
            expiryDate: { not: null },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    this.logger.log(`Found ${expiredUsers.length} expired subscriptions`);

    for (const user of expiredUsers) {
      try {
        const latestPayment = user.payments[0];
        if (latestPayment) {
          await this.reverifySubscription(user.id, latestPayment);
        } else {
          await this.expireSubscription(user.id);
        }
      } catch (error: any) {
        this.logger.error(
          `Failed to process expired subscription for user ${user.id}: ${error.message}`,
        );
      }
    }

    this.logger.log('Subscription expiry check completed');
  }

  private async reverifySubscription(
    userId: string,
    payment: any,
  ): Promise<void> {
    this.logger.log(`Re-verifying subscription for user ${userId}`);

    try {
      const result = await this.verificationService.verifyReceipt({
        userId,
        platform: payment.platform as StorePlatform,
        productId: payment.storeSku,
        transactionId: payment.transactionId,
        originalTransactionId: payment.originalTransactionId,
        purchaseToken: payment.purchaseToken,
        receiptData: payment.receiptData,
      });

      if (result.isValid && result.expiryDate && result.expiryDate > new Date()) {
        this.logger.log(
          `Subscription renewed for user ${userId} until ${result.expiryDate.toISOString()}`,
        );
      } else {
        await this.expireSubscription(userId);
      }
    } catch {
      this.logger.warn(
        `Re-verification failed for user ${userId}, expiring subscription`,
      );
      await this.expireSubscription(userId);
    }
  }

  private async expireSubscription(userId: string): Promise<void> {
    // Don't expire if user also has lifetime access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { premiumStatus: true },
    });

    if (user?.premiumStatus === PremiumStatus.PREMIUM_LIFETIME) {
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        premiumStatus: PremiumStatus.FREE,
        premiumExpiry: null,
      },
    });

    this.logger.log(`Expired subscription for user ${userId}`);
  }
}
