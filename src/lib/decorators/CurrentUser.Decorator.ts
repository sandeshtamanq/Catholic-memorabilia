import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { decode } from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    if (req.user?.id) {
      return req.user.id;
    }

    const authHeader = req.headers?.authorization;
    const tokenFromHeader =
      typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;
    const token = req.cookies?.token ?? tokenFromHeader;

    if (!token) {
      return null;
    }

    try {
      const decodedToken = decode(token) as unknown as {
        id?: number;
        sub?: string | number;
      } | null;

      const userId = decodedToken?.id ?? Number(decodedToken?.sub ?? NaN);
      return Number.isFinite(userId) ? userId : null;
    } catch (error) {
      return null;
    }
  },
);
