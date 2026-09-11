import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

  @ApiProperty({ type: 'string', format: 'binary' })
  productImage: any;
}
