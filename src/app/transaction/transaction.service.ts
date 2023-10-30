import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
   FundWalletDto,
   GetTransactionsDto,
   TransactionIdDto,
   WalletTransferDto,
   WebhookDto,
} from './dto';
import { PrismaService } from '@etap-app/prisma/prisma.service';
import { PaystackEntity } from '@etap-utils/payment';
import { TransactionPayload } from '@etap-utils/payment/dto';
import { Currency, User, Wallet } from '@prisma/client';
import { Config, MOCKEXCHANGERATES } from '@etap-utils/config';
import * as argon from 'argon2';

@Injectable()
export class TransactionService {
   constructor(
      private prisma: PrismaService,
      private paystack: PaystackEntity,
   ) {}

   async getAllTransactions(userId: string, query: GetTransactionsDto) {
      const { transactionType, amountLow, amountUp } = query;
      const where = {
         userId,
         ...(transactionType && { type: transactionType }),
         ...(amountLow && {
            amount: { lte: parseFloat(amountUp), gte: parseFloat(amountLow) },
         }),
      };

      const allTxn = await this.prisma.transaction.findMany({
         where,
         orderBy: { createdAt: 'desc' },
      });
      if (allTxn.length == 0)
         return {
            message: 'User has no transactions',
         };
      return {
         message: 'Transactions fetched successfully',
         data: allTxn,
      };
   }

   async getTransactionById(userId: string, param: TransactionIdDto) {
      const user = await this.getUser({ id: userId });
      const transaction = await this.prisma.transaction.findFirst({
         where: { id: param.transactionId, userId: user.id },
         include: {
            user: true,
            wallet: true,
         },
      });

      if (!transaction)
         throw new NotFoundException(
            'Transaction does not exist or does not belong to user',
         );

      return { message: 'Transaction Gotten successfully', data: transaction };
   }

   async fundWallet(userId: string, dto: FundWalletDto) {
      const user = await this.getUser({ id: userId });

      const wallet = await this.prisma.wallet.findFirst({
         where: { id: dto.walletId, userId: user.id },
      });

      if (!wallet)
         throw new BadRequestException(
            'Wallet id is invalid or does not belong to user',
         );

      if (wallet.currency !== 'NGN')
         return await this.handleFundOtherCurrencyWallet({
            user,
            wallet,
            amount: dto.amount,
         });

      //generate metadata and reference
      const metadata = {
         plan: 'FundWallet',
         userId: user.id,
      };
      const reference = this.generateRandomReference();

      //generate payment link
      const paymentLink = await this.generatePaystackPaymentLink({
         reference: reference,
         amount: dto.amount,
         email: user.email,
         currency: wallet.currency,
         metadata: metadata,
      });

      //check if payment link was generated
      if (!paymentLink)
         throw new BadRequestException(
            'Could not generate payment links, please retry',
         );

      //create transaction record
      await this.prisma.transaction.create({
         data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: wallet.id } },
            amount: dto.amount,
            reference: reference,
            flow: 'INFLOW',
            gateway: 'PAYSTACK',
            description: 'Wallet funding',
            currency: wallet.currency,
            meta: metadata,
            type: 'WALLET_FUNDING',
         },
      });

      return {
         message: 'Funding initiated successfully',
         data: paymentLink.data,
      };
   }

   async transferToWallet(userId: string, dto: WalletTransferDto) {
      const user = await this.getUser({ id: userId });

      // get source and destination wallet
      const sourceWallet = await this.prisma.wallet.findFirst({
         where: { id: dto.fromWalletId, userId: user.id },
      });

      if (!sourceWallet)
         throw new BadRequestException(
            'Wallet id is invalid or does not belong to user',
         );

      const destinationWallet = await this.prisma.wallet.findFirst({
         where: { id: dto.toWalletId },
         include: { user: true },
      });

      if (!destinationWallet)
         throw new BadRequestException('Destination wallet id is invalid');

      // check if user has enough balance
      if (sourceWallet.balance < dto.amount)
         throw new BadRequestException('Insufficient funds');

      if (!user.transactionPin)
         throw new BadRequestException(
            'User does not have a transaction pin, please set one',
         );

      const pinMatch = await argon.verify(user.transactionPin, dto.pin);
      if (!pinMatch)
         throw new ForbiddenException('Transaction pin is incorrect.');

      // convert amount to destination currency
      const amountInDestinationCurrency = this.convertCurrency(
         dto.amount,
         sourceWallet.currency,
         destinationWallet.currency,
      );

      // check if wallet transfer is over N1000000
      const amountInNaira = this.convertCurrency(
         dto.amount,
         sourceWallet.currency,
         'NGN',
      );

      if (amountInNaira > 1000000) {
         const { sourceTrx, destTrx } = await this.handleAdminTransferApproval(
            user,
            sourceWallet,
            destinationWallet,
            dto.amount,
            amountInDestinationCurrency,
         );

         return {
            message: 'Transfer pending approval',
            data: {
               sourceTransaction: sourceTrx,
               destinationTransaction: destTrx,
            },
         };
      }

      // generate reference
      const sourceRef = this.generateRandomReference();

      // create transaction record
      const sourceTrx = await this.prisma.transaction.create({
         data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: sourceWallet.id } },
            amount: dto.amount,
            reference: sourceRef,
            flow: 'OUTFLOW',
            description: 'Wallet transfer',
            currency: sourceWallet.currency,
            gateway: 'PAYSTACK',
            type: 'TRANSFER',
            status: 'COMPLETED',
         },
      });

      // deduct from source wallet
      await this.prisma.wallet.update({
         where: { id: sourceWallet.id },
         data: {
            balance: { decrement: dto.amount },
         },
      });

      // generate reference
      const destinationRef = this.generateRandomReference();

      // create transaction record
      const destTrx = await this.prisma.transaction.create({
         data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: destinationWallet.id } },
            amount: amountInDestinationCurrency,
            reference: destinationRef,
            flow: 'INFLOW',
            description: 'Wallet transfer',
            currency: destinationWallet.currency,
            gateway: 'PAYSTACK',
            type: 'TRANSFER',
            status: 'COMPLETED',
         },
      });

      // add to destination wallet
      await this.prisma.wallet.update({
         where: { id: destinationWallet.id },
         data: {
            balance: { increment: amountInDestinationCurrency },
         },
      });

      return {
         message: 'Transfer successful',
         data: {
            sourceTransaction: sourceTrx,
            destinationTransaction: destTrx,
         },
      };
   }

   //////////////////////////////
   // Webhooks
   //////////////////////////////
   async paystackWebhook(dto: WebhookDto<any>, headers) {
      const hash = crypto
         .createHmac('sha512', Config.paystack.secret_key)
         .update(JSON.stringify(dto))
         .digest('hex');

      if (hash !== headers['x-paystack-signature']) return false;

      if (dto.event === 'charge.success') {
         switch (dto.data.metadata.plan) {
            case 'FundWallet':
               const payload = {
                  userId: dto.data.metadata.userId,
                  reference: dto.data.reference,
                  amount: dto.data.amount / 100,
               };
               await this.handleWalletFund(payload);
               break;
         }
      }

      return true;
   }

   //////////////////////////////
   // Utilities
   //////////////////////////////

   private async handleWalletFund(dto: {
      userId: string;
      reference: string;
      amount: number;
   }) {
      const txn = await this.prisma.transaction.findFirst({
         where: { reference: dto.reference },
      });

      await this.prisma.wallet.update({
         where: { id: txn.walletId },
         data: {
            balance: { increment: dto.amount },
         },
      });

      if (!txn) throw new NotFoundException('Transaction not found');

      await this.prisma.transaction.update({
         where: { id: txn.id },
         data: { status: 'COMPLETED' },
      });
      return {
         message: 'Wallet funded successfully',
      };
   }

   private async handleFundOtherCurrencyWallet(dto: {
      user: User;
      wallet: Wallet;
      amount: number;
   }) {
      const { user, wallet, amount } = dto;
      const reference = this.generateRandomReference();

      //update wallet balance
      await this.prisma.wallet.update({
         where: { id: wallet.id },
         data: {
            balance: { increment: amount },
         },
      });

      //create transaction record
      const trx = await this.prisma.transaction.create({
         data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: wallet.id } },
            amount: amount,
            reference: reference,
            flow: 'INFLOW',
            gateway: 'PAYSTACK',
            description: 'Wallet funding',
            currency: wallet.currency,
            type: 'WALLET_FUNDING',
            status: 'COMPLETED',
         },
      });

      return {
         message: 'Funding initiated successfully',
         data: trx,
      };
   }

   private async handleAdminTransferApproval(
      user: User,
      sourceWallet: Wallet,
      destinationWallet: Wallet & {
         user: User;
      },
      amount: number,
      amountInDestinationCurrency: number,
   ) {
      // generate reference
      const sourceRef = this.generateRandomReference();

      // create transaction record
      const sourceTrx = await this.prisma.transaction.create({
         data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: sourceWallet.id } },
            amount: amount,
            reference: sourceRef,
            flow: 'OUTFLOW',
            description: 'Wallet transfer',
            currency: sourceWallet.currency,
            gateway: 'PAYSTACK',
            type: 'TRANSFER',
         },
      });

      // generate reference
      const destinationRef = this.generateRandomReference();

      // create transaction record
      const destTrx = await this.prisma.transaction.create({
         data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: destinationWallet.id } },
            amount: amountInDestinationCurrency,
            reference: destinationRef,
            flow: 'INFLOW',
            description: 'Wallet transfer',
            currency: destinationWallet.currency,
            gateway: 'PAYSTACK',
            type: 'TRANSFER',
         },
      });

      // send approval request to admin
      await this.prisma.pendingTransactionApproval.create({
         data: {
            sourceTransaction: { connect: { id: sourceTrx.id } },
            destTransaction: { connect: { id: destTrx.id } },
            amount: amount,
         },
      });

      return { sourceTrx, destTrx };
   }

   private async getUser(query: Record<string, any>, withPassword = true) {
      const user = await this.prisma.user.findUnique({
         where: { ...query },
         include: { wallets: true },
      });
      if (!user) throw new NotFoundException('User does not exist');
      if (!withPassword) delete user.password;
      return user;
   }

   private generateRandomReference(length = 13) {
      return Array.from(Array(length), () =>
         Math.floor(Math.random() * 36).toString(36),
      ).join('');
   }

   private async generatePaystackPaymentLink(
      payload: {
         reference: string;
         amount: number;
         currency: string;
         email: string;
         metadata: Record<string, any>;
         callback_url?: string;
      },
      channels?: string[],
   ) {
      const paystackPayload: TransactionPayload = {
         reference: payload.reference,
         amount: payload.amount,
         email: payload.email,
         metadata: payload.metadata,
         currency: payload.currency,
         callback_url: payload.callback_url || '',
         channels: undefined,
      };

      paystackPayload.channels = channels;
      return await this.paystack.init(paystackPayload);
   }

   private convertCurrency(
      amount: number,
      fromCurrency: Currency,
      toCurrency: Currency,
   ) {
      return parseFloat(
         (amount * MOCKEXCHANGERATES[fromCurrency][toCurrency]).toFixed(2),
      );
   }
}
