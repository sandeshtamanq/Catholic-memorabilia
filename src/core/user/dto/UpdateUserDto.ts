import { ApiHideProperty, PartialType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto/SignUpDto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(SignUpDto) {
  @ApiHideProperty()
  @IsBoolean()
  @IsOptional()
  isEmailVerified: boolean;
}
