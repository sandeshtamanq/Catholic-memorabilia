import { CanActivate, Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/UserRole.Enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const { user } = request;

    if (!user || !user.role) {
      return false;
    }

    if (user.role === UserRole.Staff) {
      const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      if (writeMethods.includes(request.method?.toUpperCase())) {
        return false;
      }
    }

    return requiredRoles.indexOf(user.role) > -1;
  }
}
