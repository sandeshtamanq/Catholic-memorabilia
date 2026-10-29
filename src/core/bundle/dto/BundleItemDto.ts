import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class BundleItemDto {
  @ApiProperty({
    example: 12,
    description: 'Product ID included in the bundle',
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of this product in the bundle',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
