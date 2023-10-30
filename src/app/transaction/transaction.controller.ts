import {
   Body,
   Headers,
   Controller,
   Post,
   UseGuards,
   Get,
   Query,
   Param,
} from '@nestjs/common';
import { HttpResponse } from 'src/utility/response';
import {
   WebhookDto,
   WalletTransferDto,
   FundWalletDto,
   GetTransactionsDto,
   TransactionIdDto,
} from './dto';
import { TransactionService } from './transaction.service';
import { GetUser, JwtGuard } from '@etap-utils/auth';

@Controller('transactions')
export class TransactionController {
   constructor(
      private transactionService: TransactionService,
      private response: HttpResponse,
   ) {}

   @Get('all')
   @UseGuards(JwtGuard)
   async getAllTransactions(
      @GetUser() userId: string,
      @Query()
      query: GetTransactionsDto,
   ) {
      const { message, data } =
         await this.transactionService.getAllTransactions(userId, query);
      return this.response.okResponse(message, data);
   }

   @Get('/:transactionId')
   @UseGuards(JwtGuard)
   async getTransactionById(
      @GetUser() userId: string,
      @Param() param: TransactionIdDto,
   ) {
      const { message, data } =
         await this.transactionService.getTransactionById(userId, param);
      return this.response.okResponse(message, data);
   }

   @Post('wallet/fund')
   @UseGuards(JwtGuard)
   async fundWallet(@GetUser() userId: string, @Body() dto: FundWalletDto) {
      const { message, data } = await this.transactionService.fundWallet(
         userId,
         dto,
      );
      return this.response.okResponse(message, data);
   }

   @Post('wallet/transfer')
   @UseGuards(JwtGuard)
   async transferToWallet(
      @GetUser() userId: string,
      @Body() dto: WalletTransferDto,
   ) {
      const { message, data } = await this.transactionService.transferToWallet(
         userId,
         dto,
      );
      return this.response.okResponse(message, data);
   }

   @Post('paystack/webhook')
   async paystackWebhook(
      @Body() dto: WebhookDto<any>,
      @Headers() headers: Record<string, any>,
   ) {
      const checked = await this.transactionService.paystackWebhook(
         dto,
         headers,
      );
      if (checked) {
         return this.response.okResponse('webhook checked!');
      }
   }
}
