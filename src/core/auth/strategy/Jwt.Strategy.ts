import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request as RequestType } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractToken]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  private static extractToken(req: RequestType): string | null {
    const accessToken = req?.cookies?.token;
    if (accessToken == null || accessToken.length <= 0) {
      return null;
    }

    return accessToken;
  }

  async validate(payload: any) {
    return {
      id: payload.user.id,
      email: payload.user.email,
    };
  }
}
