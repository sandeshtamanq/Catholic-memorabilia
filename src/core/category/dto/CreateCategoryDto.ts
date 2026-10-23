import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryDescription?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  categoryImage?: any;
}
