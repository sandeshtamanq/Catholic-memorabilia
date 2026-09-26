import { ApiProperty } from '@nestjs/swagger';

export class GeneratedProductDto {
  title: string;
  description: string;
  category: string;
  tags?: string[];
}

export class GenerateProductDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  productImage: File;
}
