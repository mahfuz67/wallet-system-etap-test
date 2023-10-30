import {
   ExceptionFilter,
   Catch,
   ArgumentsHost,
   HttpException,
   HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getMessageFromAxiosError, isAxiosError } from './utils';
import { Config } from '@etap-utils/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
   catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      let status =
         exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

      const errorFormat = {
         error: null,
         message: null,
         statusCode: null,
      };

      errorFormat.statusCode = status;

      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
         const errors = [];
         if (exception.code === 'P2002') {
            const message = 'Unique constraint failed on the fields';
            errorFormat.message = message;
            // @ts-expect-error will set it later
            const fields = exception.meta.target.map((t: any) => t);
            for (const field of fields) {
               errors.push({
                  [field]: `${field} is already in use`,
               });
            }
            errorFormat.error = errors;
         } else {
            errorFormat.message = exception.message;
            errorFormat.error = exception.meta;
         }

         return response.status(status).json(errorFormat);
      }

      // Handle invalid key exception
      if (Config.appEnv == 'production') {
         if (exception instanceof Prisma.PrismaClientValidationError) {
            return response.status(status).json({
               message: 'Invalid invocation',
               error: {
                  description:
                     'Error could happen due ID mismatch in the database.',
               },
            });
         }
      }

      if (!exception.response) {
         console.log('error is', exception.message);
         (errorFormat.message = exception.message),
            (errorFormat.error = exception.error);
         return response.status(status).json(errorFormat);
      }

      if (isAxiosError(exception)) {
         const apiMessage = getMessageFromAxiosError(exception);
         status = exception.response.status;
         const { data } = exception.response;
         errorFormat.message = apiMessage;
         errorFormat.error = data.error;
         errorFormat.statusCode = status;

         return response.status(status).json(errorFormat);
      }

      // Handle 500-related errors
      if (status >= 500) {
         console.log('Internal server error:', exception);
         errorFormat.message = 'Internal server error';
         errorFormat.error = null;
         return response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorFormat);
      }

      console.log('error response is', exception.response);
      const data = exception.response;

      errorFormat.message = data.message;
      errorFormat.error = data.error;

      return response.status(status).json(errorFormat);
   }
}
