import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/Category.Entity';

export class CategoryDIToken {
  static readonly CategoryEntity = TypeOrmModule.forFeature([Category]);
}
