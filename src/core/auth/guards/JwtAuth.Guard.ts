import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request as RequestType } from 'express';

import { ExtractJwt } from 'passport-jwt';
import { decode, verify } from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../../../lib/decorators/Public.Decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const token = ExtractJwt.fromExtractors([JwtAuthGuard.extractToken])(req);
    if (!token) return false;

    await super.canActivate(context);

    try {
      verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedException('Invalid Username/Password!');
    }

    const details = decode(token);

    if (!details) return false;

    return true;
  }

  private static extractToken(req: RequestType): string | null {
    const accessToken = req?.cookies?.token;
    if (accessToken == null || accessToken.length <= 0) {
      return null;
    }
    return accessToken;
  }
}
