import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productPrice: string;

  @ApiProperty({ type: 'number' })
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ type: 'number', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  hasDiscount?: boolean;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;

  @ApiProperty({ type: 'string', format: 'binary' })
  productImage: any;
}
