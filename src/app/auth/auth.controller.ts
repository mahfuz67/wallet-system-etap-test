import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpResponse } from 'src/utility/response';
import { AccountCreateDto, AccountLoginDto } from './dto';

@Controller('auth')
export class AuthController {
   constructor(
      private authService: AuthService,
      private response: HttpResponse,
   ) {}

   // Sign up
   @Post('signup')
   async signup(@Body() dto: AccountCreateDto) {
      const { message, data } = await this.authService.create(dto);
      return this.response.createdResponse(data, message);
   }

   // Signin
   @Post('signin')
   async signin(@Body() dto: AccountLoginDto) {
      const { message, data } = await this.authService.login(dto);

      return this.response.okResponse(message, data);
   }
}
