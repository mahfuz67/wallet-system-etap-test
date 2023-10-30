import { Currency } from '@prisma/client';
import {
   IsEnum,
   IsNotEmpty,
   IsString,
   MaxLength,
   MinLength,
} from 'class-validator';

export class CreateWalletDto {
   @IsEnum(Currency)
   @IsNotEmpty()
   currency: Currency;
}

export class UpdatePinDto {
   @IsNotEmpty()
   @IsString()
   password: string;

   @IsNotEmpty()
   @IsString()
   @MinLength(4)
   @MaxLength(4)
   pin: string;
}

export class PasswordDto {
   @IsNotEmpty()
   @IsString()
   password: string;
}

export class WalletIdDto {
   @IsNotEmpty()
   @IsString()
   walletId: string;
}
