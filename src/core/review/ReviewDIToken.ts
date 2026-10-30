import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from './entities/ProductReview.Entity';

export class ReviewDIToken {
  static readonly reviewEntity = TypeOrmModule.forFeature([ProductReview]);
}
