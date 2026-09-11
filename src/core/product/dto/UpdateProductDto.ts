import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateProductDto } from './CreateProductDto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty()
  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @ApiProperty()
  @IsOptional()
  bookings?: number;
}
