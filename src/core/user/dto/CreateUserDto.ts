import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    { message: 'Password weak.' },
  )
  password: string;
}
