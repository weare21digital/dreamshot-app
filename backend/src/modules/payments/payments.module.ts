import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ReceiptVerificationService } from './receipt-verification.service';
import { SubscriptionLifecycleService } from './subscription-lifecycle.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    ReceiptVerificationService,
    SubscriptionLifecycleService,
  ],
  exports: [PaymentsService, ReceiptVerificationService],
})
export class PaymentsModule {}
