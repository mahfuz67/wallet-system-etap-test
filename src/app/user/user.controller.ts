import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   Post,
   Put,
   UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { HttpResponse } from '@etap-utils/response';
import { CreateWalletDto, PasswordDto, UpdatePinDto, WalletIdDto } from './dto';
import { JwtGuard, GetUser } from '@etap-utils/auth';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
   constructor(
      private userService: UserService,
      private response: HttpResponse,
   ) {}

   @Get('profile')
   async getProfile(@GetUser() userId: string) {
      const { message, data } = await this.userService.getProfile(userId);
      return this.response.okResponse(message, data);
   }

   @Put('profile/pin')
   async updatePin(@GetUser() userId: string, @Body() dto: UpdatePinDto) {
      const { message, data } = await this.userService.updatePin(userId, dto);
      return this.response.okResponse(message, data);
   }

   @Delete('profile/pin')
   async removePin(@GetUser() userId: string, @Body() dto: PasswordDto) {
      const { message, data } = await this.userService.removePin(userId, dto);
      return this.response.okResponse(message, data);
   }

   @Get('wallet/supported-currencies')
   async getSupportedCurrencies() {
      const { message, data } = await this.userService.getSupportedCurrencies();
      return this.response.okResponse(message, data);
   }

   @Post('wallet')
   async createWallet(@GetUser() userId: string, @Body() dto: CreateWalletDto) {
      const { message, data } = await this.userService.createWallet(
         userId,
         dto,
      );
      return this.response.createdResponse(data, message);
   }

   @Get('wallet')
   async getAllUserWallets(@GetUser() userId: string) {
      const { message, data } = await this.userService.getAllUserWallets(
         userId,
      );
      return this.response.okResponse(message, data);
   }

   @Get('wallet/:walletId')
   async getWalletDetails(
      @GetUser() userId: string,
      @Param() param: WalletIdDto,
   ) {
      const { message, data } = await this.userService.getWalletDetails(
         userId,
         param,
      );
      return this.response.okResponse(message, data);
   }

   @Get('wallet/:walletId/balance')
   async getWalletBalance(
      @GetUser() userId: string,
      @Param() param: WalletIdDto,
   ) {
      const { message, data } = await this.userService.getWalletBalance(
         userId,
         param,
      );
      return this.response.okResponse(message, data);
   }
}
