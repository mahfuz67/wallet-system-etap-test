import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@etap-app/prisma/prisma.service';
import { ROLES_KEY } from '../decorator/get-role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(
      private reflector: Reflector,
      private prisma: PrismaService,
      private jwt: JwtService,
   ) {}

   async canActivate(context: ExecutionContext) {
      const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);

      if (!roles) {
         return true;
      }
      const request = context.switchToHttp().getRequest();
      let user = request.user;

      if (!user) {
         const [_, token] = request.headers.authorization.split(' ');
         user = await this.jwt.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
         });
      }

      user = await this.prisma.user.findUnique({
         where: {
            id: user['userId'],
         },
      });

      if (roles.some((role) => user.role === role)) {
         return true;
      } else {
         return false;
      }
   }
}
