import { IsString, IsEnum, IsOptional } from 'class-validator';
import { StorePlatform } from '../interfaces/verification.interface';

export class VerifyReceiptDto {
  @IsEnum(StorePlatform)
  platform: StorePlatform;

  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  originalTransactionId?: string;

  @IsString()
  @IsOptional()
  purchaseToken?: string;

  @IsString()
  @IsOptional()
  receiptData?: string;
}
