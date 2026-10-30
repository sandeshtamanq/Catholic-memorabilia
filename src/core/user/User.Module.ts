import { Module } from '@nestjs/common';
import { UserService } from './User.Service';
import { UserController } from './User.Controller';
import { UserRepository } from './User.Repository';
import { UserDIToken } from './UserDIToken';
import { FirebaseModule } from '../../infra/supabase/Supabase.Module';

@Module({
  imports: [UserDIToken.UserEntity, FirebaseModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
