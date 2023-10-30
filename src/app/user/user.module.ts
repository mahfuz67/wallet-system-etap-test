import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PaystackEntity } from '@etap-utils/index';

@Module({
   providers: [UserService, PaystackEntity],
   controllers: [UserController],
   exports: [UserService],
})
export class UserModule {}
