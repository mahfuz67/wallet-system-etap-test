import {
   BadRequestException,
   ForbiddenException,
   Injectable,
} from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Config } from '@etap-utils/config';
import { AccountCreateDto, AccountLoginDto } from './dto';
import { PrismaService } from '@etap-app/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable({})
export class AuthService {
   constructor(private jwt: JwtService, private prisma: PrismaService) {}

   async create(data: AccountCreateDto) {
      const password = await argon.hash(data.password);

      await this.verifyUniqueCredential({
         email: data.email,
         phone: data.phone,
      });

      const user = await this.prisma.user.create({
         data: {
            ...data,
            password,
            email: data.email.toLowerCase(),
            isEmailVerified: true,
            isPhoneVerified: true,
         },
      });

      delete user.password;

      if (!user)
         throw new BadRequestException(
            'Account could not be created, please retry',
         );

      const filteredUser = this.filterUser(user);

      return {
         message: 'Account created successfully',
         data: filteredUser,
      };
   }

   async login(data: AccountLoginDto) {
      // fetch user
      const user = await this.prisma.user.findFirst({
         where: {
            phone: data.phone,
         },
      });

      // Check if user exists
      if (!user) throw new ForbiddenException('Email or phone incorrect.');

      // Compare password
      const pwMatch = await argon.verify(user.password, data.password);
      if (!pwMatch) throw new ForbiddenException('Password incorrect.');

      // Sign token
      const token = await this.signToken(user.id);

      const filteredUser = this.filterUser(user);
      return {
         message: 'Login successful',
         data: {
            user: filteredUser,
            token,
         },
      };
   }

   //////////////////////////////
   // Utilities
   //////////////////////////////

   private async verifyUniqueCredential({ email, phone }) {
      const phoneExist = await this.prisma.user.findFirst({
         where: { phone: phone },
      });

      if (phoneExist)
         throw new BadRequestException(
            'Account with this phone already exists, please login',
         );

      const emailExist = await this.prisma.user.findFirst({
         where: { email: email.toLowerCase() },
      });

      if (emailExist)
         throw new BadRequestException(
            'Account with this email already exists, please login',
         );
   }

   private async signToken(userId: string): Promise<string> {
      return this.jwt.signAsync(
         { userId },
         {
            expiresIn: Config.jwt.expiresIn,
            secret: Config.jwt.secret,
         },
      );
   }

   private filterUser(user: User) {
      //return very limited user details
      return {
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email,
         phone: user.phone,
         role: user.role,
      };
   }
}
