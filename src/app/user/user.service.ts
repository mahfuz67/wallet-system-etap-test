import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@etap-app/prisma/prisma.service';
import * as argon from 'argon2';
import { CreateWalletDto, PasswordDto, UpdatePinDto, WalletIdDto } from './dto';
import { SUPPORTEDCURRENCIES } from '@etap-utils/config';

@Injectable()
export class UserService {
   constructor(private prisma: PrismaService) {}

   async getProfile(userId: string) {
      const user = await this.getUser({ id: userId }, false);

      return {
         message: 'User Profile Fetch Successfully',
         data: user,
      };
   }

   async updatePin(userId: string, dto: UpdatePinDto) {
      const { id, password } = await this.getUser({ id: userId });

      const pwMatch = await argon.verify(password, dto.password);
      if (!pwMatch) throw new ForbiddenException('Password is incorrect.');

      const pin = await argon.hash(dto.pin);
      await this.prisma.user.update({
         where: { id },
         data: { transactionPin: pin },
      });

      return {
         message: 'PIN updated successfully',
         data: '',
      };
   }

   async removePin(userId: string, dto: PasswordDto) {
      try {
         const { id, password } = await this.getUser({ id: userId });
         const pwMatch = await argon.verify(password, dto.password);
         if (!pwMatch) throw new ForbiddenException('Password is incorrect.');

         await this.prisma.user.update({
            where: { id: id },
            data: { transactionPin: null },
         });

         return {
            message: 'PIN deleted successfully',
            data: '',
         };
      } catch (err) {
         console.log(err);
      }
   }

   async getSupportedCurrencies() {
      return {
         message: 'Supported currencies fetched successfully',
         data: SUPPORTEDCURRENCIES,
      };
   }

   async createWallet(userId: string, dto: CreateWalletDto) {
      const user = await this.getUser({ id: userId });

      const wallet = await this.prisma.wallet.create({
         data: {
            user: { connect: { id: user.id } },
            currency: dto.currency,
         },
      });

      return {
         message: 'Wallet created successfully',
         data: wallet,
      };
   }

   async getAllUserWallets(userId: string) {
      const user = await this.getUser({ id: userId });

      const wallets = await this.prisma.wallet.findMany({
         where: { userId: user.id },
         orderBy: { createdAt: 'desc' },
         include: { transactions: true },
      });

      if (wallets.length == 0)
         return {
            message: 'User currently has no wallet',
            data: '',
         };
      return {
         message: 'Wallets fetched successfully',
         data: wallets,
      };
   }

   async getWalletDetails(userId: string, param: WalletIdDto) {
      const { id } = await this.getUser({ id: userId });

      const wallet = await this.prisma.wallet.findFirst({
         where: { id: param.walletId, userId: id },
         include: { transactions: true },
      });

      if (!wallet)
         throw new BadRequestException(
            'Wallet id is invalid or does not belong to user',
         );

      return {
         message: 'Wallet details fetched successfully',
         data: wallet,
      };
   }

   async getWalletBalance(userId: string, param: WalletIdDto) {
      const { id } = await this.getUser({ id: userId });

      const wallet = await this.prisma.wallet.findFirst({
         where: { id: param.walletId, userId: id },
      });

      if (!wallet)
         throw new BadRequestException(
            'Wallet id is invalid or does not belong to user',
         );

      return {
         message: 'Wallet balance fetched successfully',
         data: wallet.balance,
      };
   }

   //////////////////////////////
   // Utilities
   //////////////////////////////

   private async getUser(query: Record<string, any>, withPassword = true) {
      const user = await this.prisma.user.findUnique({
         where: { ...query },
         include: { wallets: true, transactions: true },
      });
      if (!user) throw new NotFoundException('User does not exist');
      if (!withPassword) delete user.password;
      return user;
   }
}
