import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

const normalizeStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Small', 'Medium', 'Large'],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsString({ each: true })
  sizes?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Black', 'White', 'Red'],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsString({ each: true })
  colors?: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productPrice: string;

  @ApiProperty({ type: 'number', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  netPrice?: number;

  @ApiProperty({ type: 'number' })
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ type: 'number' })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ type: 'number', required: false, default: 0 })
  @IsOptional()
  // @IsNumber()
  discountPercentage?: number;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  // @IsBoolean()
  hasDiscount?: boolean;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  // @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  // @IsBoolean()
  hasOffer?: boolean;

  @ApiProperty({ type: 'string', format: 'binary' })
  productImage: any;
}
