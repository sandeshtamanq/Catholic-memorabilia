import { Module } from '@nestjs/common';
import { AuthService } from './Auth.Service';
import { AuthController } from './Auth.Controller';
import { UserModule } from '../user/User.Module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/Local.Strategy';
import { JwtStrategy } from './strategy/Jwt.Strategy';
import { MailModule } from '../../infra/mail/Mail.Module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
