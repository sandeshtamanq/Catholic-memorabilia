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
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedPrice: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsEnum(BundleStatus)
  status?: BundleStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items: BundleItemDto[];
}
