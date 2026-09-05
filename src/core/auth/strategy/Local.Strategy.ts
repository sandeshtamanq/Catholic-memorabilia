import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../Auth.Service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  validate(username: string, password: string) {
    return this.authService.validateUser(username, password);
  }
}
