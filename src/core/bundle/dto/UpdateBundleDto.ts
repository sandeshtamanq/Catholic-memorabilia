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
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedPrice?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsEnum(BundleStatus)
  status?: BundleStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items?: BundleItemDto[];
}
