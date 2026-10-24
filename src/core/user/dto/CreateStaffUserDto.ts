import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from './CreateUserDto';
import { UserRole } from '../entities/UserRole.Enum';

export class CreateStaffUserDto extends CreateUserDto {
  @ApiProperty({
    enum: [UserRole.User, UserRole.Staff],
    required: false,
    default: UserRole.User,
  })
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be either User or Staff',
  })
  role?: UserRole;
}
