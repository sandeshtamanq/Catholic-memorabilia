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

  @ApiProperty({
    required: false,
    description: 'Shipping address used for billing/shipping details',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({
    required: false,
    description: 'Delivery address for the actual product drop-off',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shippingAddressLine1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shippingAddressLine2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shippingSuburb?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/, {
    message: 'Please enter a valid Australian state.',
  })
  shippingState?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Please enter a valid 4-digit postcode.',
  })
  shippingPostcode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deliveryAddressLine1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deliveryAddressLine2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deliverySuburb?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/, {
    message: 'Please enter a valid Australian state.',
  })
  deliveryState?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Please enter a valid 4-digit postcode.',
  })
  deliveryPostcode?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
