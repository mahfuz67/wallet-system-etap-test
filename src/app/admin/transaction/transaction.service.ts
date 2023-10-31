import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@etap-app/prisma/prisma.service';
import { PendingApprovalIdDto } from './dto';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionService {
   constructor(private prisma: PrismaService) {}

   async transactionsDash() {
      //get monthly transaction summaries
      const allTransactions = await this.prisma.transaction.findMany({
         where: {
            status: 'COMPLETED',
         },
         orderBy: {
            createdAt: 'desc',
         },
         include: {
            wallet: true,
         },
      });

      const monthlySummaryInit: Record<string, Transaction[]> = {};

      allTransactions.forEach((trx) => {
         const createdAt = new Date(trx.createdAt);
         const year = createdAt.getFullYear();
         const month = createdAt.getMonth() + 1;

         const key = `${year}-${month}`;

         if (monthlySummaryInit[key]) {
            monthlySummaryInit[key].push(trx);
         } else {
            monthlySummaryInit[key] = [trx];
         }
      });

      let monthlySummary = {};

      monthlySummary = Object.entries(monthlySummaryInit).map(
         ([key, value]) => {
            const transactions = value;

            const walletFundingTransactions = transactions.filter(
               (trx) => trx.type === 'WALLET_FUNDING',
            );

            const walletFundingNairaAmount = walletFundingTransactions
               .filter((trx) => trx.currency === 'NGN')
               .reduce((acc, trx) => acc + trx.amount, 0);

            const walletFundingDollarAmount = walletFundingTransactions
               .filter((trx) => trx.currency === 'USD')
               .reduce((acc, trx) => acc + trx.amount, 0);

            const walletFundingPoundAmount = walletFundingTransactions
               .filter((trx) => trx.currency === 'GBP')
               .reduce((acc, trx) => acc + trx.amount, 0);

            const walletFundingEuroAmount = walletFundingTransactions
               .filter((trx) => trx.currency === 'EUR')
               .reduce((acc, trx) => acc + trx.amount, 0);

            const creditWalletTransferTransactions = transactions.filter(
               (trx) => trx.type === 'TRANSFER' && trx.flow === 'INFLOW',
            );

            const creditWalletTransferNairaAmount =
               creditWalletTransferTransactions
                  .filter((trx) => trx.currency === 'NGN')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const creditWalletTransferDollarAmount =
               creditWalletTransferTransactions
                  .filter((trx) => trx.currency === 'USD')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const creditWalletTransferPoundAmount =
               creditWalletTransferTransactions
                  .filter((trx) => trx.currency === 'GBP')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const creditWalletTransferEuroAmount =
               creditWalletTransferTransactions
                  .filter((trx) => trx.currency === 'EUR')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const debitWalletTransferTransactions = transactions.filter(
               (trx) => trx.type === 'TRANSFER' && trx.flow === 'OUTFLOW',
            );

            const debitWalletTransferNairaAmount =
               debitWalletTransferTransactions
                  .filter((trx) => trx.currency === 'NGN')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const debitWalletTransferDollarAmount =
               debitWalletTransferTransactions
                  .filter((trx) => trx.currency === 'USD')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const debitWalletTransferPoundAmount =
               debitWalletTransferTransactions
                  .filter((trx) => trx.currency === 'GBP')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            const debitWalletTransferEuroAmount =
               debitWalletTransferTransactions
                  .filter((trx) => trx.currency === 'EUR')
                  .reduce((acc, trx) => acc + trx.amount, 0);

            return {
               [key]: {
                  walletFunding: {
                     data: walletFundingTransactions,
                     amount: {
                        naira: walletFundingNairaAmount,
                        dollar: walletFundingDollarAmount,
                        pound: walletFundingPoundAmount,
                        euro: walletFundingEuroAmount,
                     },
                     count: walletFundingTransactions.length,
                  },
                  walletTransfer: {
                     credit: {
                        data: creditWalletTransferTransactions,
                        amount: {
                           naira: creditWalletTransferNairaAmount,
                           dollar: creditWalletTransferDollarAmount,
                           pound: creditWalletTransferPoundAmount,
                           euro: creditWalletTransferEuroAmount,
                        },
                        count: creditWalletTransferTransactions.length,
                     },
                     debit: {
                        data: debitWalletTransferTransactions,
                        amount: {
                           naira: debitWalletTransferNairaAmount,
                           dollar: debitWalletTransferDollarAmount,
                           pound: debitWalletTransferPoundAmount,
                           euro: debitWalletTransferEuroAmount,
                        },
                        count: debitWalletTransferTransactions.length,
                     },
                  },
               },
            };
         },
      );

      return {
         message: 'Transaction dashboard data fetched successfully',
         data: monthlySummary,
      };
   }

   async getAllPendingApprovalTransactions() {
      const transactions =
         await this.prisma.pendingTransactionApproval.findMany({
            where: {
               status: 'PENDING',
            },
            include: {
               sourceTransaction: true,
               destTransaction: true,
            },
         });

      return {
         message: 'Pending approval transactions fetched successfully',
         data: transactions,
      };
   }

   async getPendingApprovalTransaction(param: PendingApprovalIdDto) {
      const transaction =
         await this.prisma.pendingTransactionApproval.findUnique({
            where: {
               id: param.pendingApprovalId,
            },
            include: {
               sourceTransaction: true,
               destTransaction: true,
            },
         });

      if (!transaction)
         throw new NotFoundException('Pending approval transaction not found');

      return {
         message: 'Pending approval transaction fetched successfully',
         data: transaction,
      };
   }

   async approvePendingApprovalTransaction(param: PendingApprovalIdDto) {
      const transaction =
         await this.prisma.pendingTransactionApproval.findUnique({
            where: {
               id: param.pendingApprovalId,
            },
            include: {
               sourceTransaction: true,
               destTransaction: true,
            },
         });

      if (!transaction)
         throw new NotFoundException('Pending approval transaction not found');

      if (transaction.status !== 'PENDING')
         throw new BadRequestException(
            'Pending approval transaction has already been approved or rejected',
         );

      const { sourceTransaction, destTransaction } = transaction;

      // Update source wallet
      await this.prisma.wallet.update({
         where: {
            id: sourceTransaction.walletId,
         },
         data: {
            balance: {
               decrement: sourceTransaction.amount,
            },
         },
      });

      // Update source transaction
      const sourceTrx = await this.prisma.transaction.update({
         where: {
            id: sourceTransaction.id,
         },
         data: {
            status: 'COMPLETED',
         },
      });

      // Update destination wallet
      await this.prisma.wallet.update({
         where: {
            id: destTransaction.walletId,
         },
         data: {
            balance: {
               increment: destTransaction.amount,
            },
         },
      });

      // Update destination transaction
      const destTrx = await this.prisma.transaction.update({
         where: {
            id: destTransaction.id,
         },
         data: {
            status: 'COMPLETED',
         },
      });

      // Update pending approval transaction
      await this.prisma.pendingTransactionApproval.update({
         where: {
            id: transaction.id,
         },
         data: {
            status: 'APPROVED',
         },
      });

      return {
         message: 'Pending approval transaction approved successfully',
         data: {
            sourceTransaction: sourceTrx,
            destTransaction: destTrx,
         },
      };
   }

   async rejectPendingApprovalTransaction(param: PendingApprovalIdDto) {
      const transaction =
         await this.prisma.pendingTransactionApproval.findUnique({
            where: {
               id: param.pendingApprovalId,
            },
            include: {
               sourceTransaction: true,
               destTransaction: true,
            },
         });

      if (!transaction)
         throw new NotFoundException('Pending approval transaction not found');

      if (transaction.status !== 'PENDING')
         throw new BadRequestException(
            'Pending approval transaction has already been approved or rejected',
         );

      // Update source transaction
      const sourceTrx = await this.prisma.transaction.update({
         where: {
            id: transaction.sourceTransaction.id,
         },
         data: {
            status: 'FAILED',
         },
      });

      // Update destination transaction
      const destTrx = await this.prisma.transaction.update({
         where: {
            id: transaction.destTransaction.id,
         },
         data: {
            status: 'FAILED',
         },
      });

      // Update pending approval transaction
      await this.prisma.pendingTransactionApproval.update({
         where: {
            id: transaction.id,
         },
         data: {
            status: 'DECLINED',
         },
      });

      return {
         message: 'Pending approval transaction rejected successfully',
         data: {
            sourceTransaction: sourceTrx,
            destTransaction: destTrx,
         },
      };
   }
}
