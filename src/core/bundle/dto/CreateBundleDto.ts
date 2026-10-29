import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BundleStatus } from '../entities/BundleStatus.Enum';
import { BundleItemDto } from './BundleItemDto';

export class CreateBundleDto {
  @ApiProperty({
    example: 'Holiday Essentials Bundle',
    description: 'Bundle name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'A curated bundle of home and lifestyle essentials.',
    required: false,
    description: 'Bundle description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 149.99, description: 'Fixed bundle price' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 20, description: 'Bundle stock quantity' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({
    enum: BundleStatus,
    example: BundleStatus.Active,
    required: false,
    description: 'Bundle status',
  })
  @IsOptional()
  @IsEnum(BundleStatus)
  status?: BundleStatus;

  @ApiProperty({
    type: [BundleItemDto],
    description: 'Products included in the bundle with quantities',
  })
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items: BundleItemDto[];
}
