import { Controller, UseGuards, Get, Param } from '@nestjs/common';
import { HttpResponse } from 'src/utility/response';
import { TransactionService } from './transaction.service';
import { Roles, RolesGuard, JwtGuard } from '@etap-utils/auth';
import { PendingApprovalIdDto } from './dto';

@Controller('admin/transactions')
@Roles('ADMIN')
@UseGuards(JwtGuard, RolesGuard)
export class TransactionController {
   constructor(
      private transactionService: TransactionService,
      private response: HttpResponse,
   ) {}

   @Get('dashboard')
   async transactionsDash() {
      const { message, data } =
         await this.transactionService.transactionsDash();
      return this.response.okResponse(message, data);
   }

   @Get('pending-approval/all')
   async getAllPendingApprovalTransactions() {
      const { message, data } =
         await this.transactionService.getAllPendingApprovalTransactions();
      return this.response.okResponse(message, data);
   }

   @Get('pending-approval/:pendingApprovalId')
   async getPendingApprovalTransaction(@Param() param: PendingApprovalIdDto) {
      const { message, data } =
         await this.transactionService.getPendingApprovalTransaction(param);
      return this.response.okResponse(message, data);
   }

   @Get('pending-approval/:pendingApprovalId/approve')
   async approvePendingApprovalTransaction(
      @Param() param: PendingApprovalIdDto,
   ) {
      const { message, data } =
         await this.transactionService.approvePendingApprovalTransaction(param);
      return this.response.okResponse(message, data);
   }

   @Get('pending-approval/:pendingApprovalId/reject')
   async rejectPendingApprovalTransaction(
      @Param() param: PendingApprovalIdDto,
   ) {
      const { message, data } =
         await this.transactionService.rejectPendingApprovalTransaction(param);
      return this.response.okResponse(message, data);
   }
}
