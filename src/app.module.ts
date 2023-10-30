import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@etap-app/auth/auth.module';
import { UserModule } from '@etap-app/user/user.module';
import { TransactionModule } from './app/transaction/transaction.module';
import { PrismaModule } from './app/prisma/prisma.module';
import { PaystackEntity } from './utility';
import { PrismaClient } from '@prisma/client';
import { AdminTransactionModule } from './app/admin/transaction/transaction.module';
import { HttpResponse } from '@etap-utils/response';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Config } from './utility/config';
import { JwtStrategy } from '@etap-utils/auth';

export const globalProviders = [
   PrismaClient,
   HttpResponse,
   PaystackEntity,
   JwtStrategy,
   JwtService,
];

@Global()
@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      JwtModule.register({
         secret: Config.jwt.secret,
         signOptions: { expiresIn: parseInt(Config.jwt.expiresIn) },
      }),
      AuthModule,
      UserModule,
      TransactionModule,
      PrismaModule,
      AdminTransactionModule,
   ],
   controllers: [AppController],
   providers: [AppService, ...globalProviders],
   exports: [...globalProviders],
})
export class AppModule {}
