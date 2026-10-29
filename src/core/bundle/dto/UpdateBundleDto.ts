import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BundleStatus } from '../entities/BundleStatus.Enum';
import { BundleItemDto } from './BundleItemDto';

export class UpdateBundleDto {
  @ApiProperty({
    example: 'Updated Holiday Essentials Bundle',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Updated description for the bundle.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 159.99, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedPrice?: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Bundle image upload file',
  })
  @IsOptional()
  @IsString()
  bundleImage?: string;

  @ApiProperty({
    example: 'https://example.com/new-bundle.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({
    enum: BundleStatus,
    example: BundleStatus.Active,
    required: false,
  })
  @IsOptional()
  @IsEnum(BundleStatus)
  status?: BundleStatus;

  @ApiProperty({
    type: [BundleItemDto],
    required: false,
    description: 'Updated products and quantities for the bundle',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items?: BundleItemDto[];
}
