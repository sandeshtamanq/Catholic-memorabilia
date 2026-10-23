import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  suburb?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/, {
    message: 'Please enter a valid Australian state.',
  })
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Please enter a valid 4-digit postcode.',
  })
  postcode?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
