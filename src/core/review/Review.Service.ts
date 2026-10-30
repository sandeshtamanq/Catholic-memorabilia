import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from '../product/Product.Repository';
import { CreateReviewDto } from './dto/CreateReviewDto';
import { UpdateReviewDto } from './dto/UpdateReviewDto';
import { ReviewRepository } from './Review.Repository';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(
    userId: number,
    productId: number,
    createReviewDto: CreateReviewDto,
  ) {
    try {
      if (!userId) {
        throw new BadRequestException('User is required');
      }

      const product = await this.productRepository.findOne(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const existingReview = await this.reviewRepository.findByUserAndProduct(
        userId,
        productId,
      );

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this product');
      }

      const review = await this.reviewRepository.create({
        ...createReviewDto,
        userId,
        productId,
      });

      return review;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async findByProduct(productId: number) {
    try {
      const product = await this.productRepository.findOne(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const reviews = await this.reviewRepository.findByProduct(productId);

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((total, review) => total + review.rating, 0) /
            reviews.length
          : 0;

      return {
        productId,
        totalReviews: reviews.length,
        averageRating: Number(averageRating.toFixed(1)),
        reviews,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async update(
    userId: number,
    productId: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    try {
      const existingReview = await this.reviewRepository.findByUserAndProduct(
        userId,
        productId,
      );

      if (!existingReview) {
        throw new NotFoundException('Review not found');
      }

      const updatedReview = await this.reviewRepository.update({
        ...existingReview,
        ...updateReviewDto,
      });

      return updatedReview;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async delete(userId: number, productId: number) {
    try {
      const existingReview = await this.reviewRepository.findByUserAndProduct(
        userId,
        productId,
      );

      if (!existingReview) {
        throw new NotFoundException('Review not found');
      }

      await this.reviewRepository.remove(existingReview);

      return { message: 'Review deleted successfully' };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new HttpException('Something went wrong', 500);
    }
  }
}
