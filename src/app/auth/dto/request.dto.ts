import { Role } from '@prisma/client';
import {
   IsEmail,
   IsNotEmpty,
   IsString,
   MinLength,
   MaxLength,
   IsEnum,
} from 'class-validator';

export class AccountCreateDto {
   @IsString()
   @IsNotEmpty()
   firstName: string;

   @IsString()
   @IsNotEmpty()
   lastName: string;

   @IsEmail()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   phone: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(6)
   @MaxLength(20)
   password: string;

   @IsEnum(Role)
   @IsNotEmpty()
   role: Role;
}

export class AccountLoginDto {
   @IsString()
   @IsNotEmpty()
   phone: string;

   @IsString()
   @IsNotEmpty()
   password: string;
}
