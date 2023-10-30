import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
   path: path.resolve(process.cwd(), './.env'),
});

export const Config = {
   appEnv: process.env.APP_ENV || 'PRODUCTION',
   appName: process.env.APP_NAME || 'Etap Assesment API',
   port: parseInt(process.env.PORT) || 5500,
   jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
   },
   dbUrl: process.env.DATABASE_URL,
   paystack: {
      base_url: process.env.PAYSTACK_BASE_URL,
      secret_key: process.env.PAYSTACK_SECRET_KEY,
   },
};
