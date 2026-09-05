import { Module } from '@nestjs/common';
import { UserModule } from './user/User.Module';
import { AuthModule } from './auth/Auth.Module';

@Module({
  imports: [AuthModule, UserModule],
})
export class CoreModule {}
