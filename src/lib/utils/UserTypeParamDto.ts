import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserRole } from '../../core/user/entities/UserRole.Enum';

export class UserTypeParamDto {
  @ApiProperty()
  @IsOptional()
  userType?: UserRole;
}
