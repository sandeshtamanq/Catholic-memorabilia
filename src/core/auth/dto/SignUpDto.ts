import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpDto {
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
  @Matches(/^(?:\+61|0)4\d{8}$/, {
    message: 'Please enter a valid mobile number.',
  })
  contactNumber: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  suburb: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/, {
    message: 'Please enter a valid Australian state.',
  })
  state: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, {
    message: 'Please enter a valid 4-digit postcode.',
  })
  postcode: string;

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
