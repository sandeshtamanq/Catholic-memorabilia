import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.Entity';

export class UserDIToken {
  static readonly UserEntity = TypeOrmModule.forFeature([User]);
}
