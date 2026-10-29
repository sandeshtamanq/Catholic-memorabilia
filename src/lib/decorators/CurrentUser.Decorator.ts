import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { decode } from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const directUserId = req.user?.id ?? req.user?.user?.id;
    if (directUserId) {
      return directUserId;
    }

    const authHeader = req.headers?.authorization;
    const tokenFromHeader =
      typeof authHeader === 'string'
        ? authHeader.replace(/^Bearer\s+/i, '').trim()
        : null;
    const token =
      req.cookies?.token ??
      req.cookies?.access_token ??
      req.cookies?.jwt ??
      req.headers?.['x-auth-token'] ??
      req.headers?.['x-access-token'] ??
      tokenFromHeader;

    if (!token || typeof token !== 'string') {
      return null;
    }

    try {
      const decodedToken = decode(token) as unknown as {
        id?: number;
        sub?: string | number;
        user?: { id?: number; userId?: number };
      } | null;

      const candidateUserId =
        decodedToken?.id ??
        decodedToken?.user?.id ??
        decodedToken?.user?.userId ??
        Number(decodedToken?.sub ?? NaN);

      return Number.isFinite(Number(candidateUserId))
        ? Number(candidateUserId)
        : null;
    } catch (error) {
      return null;
    }
  },
);
