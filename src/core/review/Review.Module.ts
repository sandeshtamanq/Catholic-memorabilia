import { Module } from '@nestjs/common';
import { ReviewController } from './Review.Controller';
import { ReviewRepository } from './Review.Repository';
import { ReviewService } from './Review.Service';
import { ReviewDIToken } from './ReviewDIToken';
import { ProductDIToken } from '../product/ProductDIToken';
import { ProductRepository } from '../product/Product.Repository';

@Module({
  imports: [ReviewDIToken.reviewEntity, ProductDIToken.productEntity],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, ProductRepository],
  exports: [ReviewService],
})
export class ReviewModule {}
