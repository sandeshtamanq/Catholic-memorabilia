import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/Product.Entity';

export class ProductDIToken {
  static readonly productEntity = TypeOrmModule.forFeature([Product]);
}
