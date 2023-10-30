import { TransactionType } from '@prisma/client';
import {
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
} from 'class-validator';

export class TransactionIdDto {
   @IsString()
   @IsNotEmpty()
   transactionId: string;
}

export class WebhookDto<T> {
   @IsString()
   @IsNotEmpty()
   event: string;

   @IsNotEmpty()
   data: T;
}

export class GetTransactionsDto {
   @IsOptional()
   transactionType?: TransactionType;

   @IsOptional()
   amountUp?: string;

   @IsOptional()
   amountLow?: string;

   @IsOptional()
   date?: string;
}

export class FundWalletDto {
   @IsNumber()
   amount: number;

   @IsString()
   @IsNotEmpty()
   walletId: string;
}

export class WalletTransferDto {
   @IsNumber()
   @IsNotEmpty()
   amount: number;

   @IsString()
   @IsNotEmpty()
   fromWalletId: string;

   @IsString()
   @IsNotEmpty()
   toWalletId: string;

   @IsString()
   @IsNotEmpty()
   pin: string;
}
