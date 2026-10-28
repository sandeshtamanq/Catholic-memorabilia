import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { CreateReviewDto } from './dto/CreateReviewDto';
import { UpdateReviewDto } from './dto/UpdateReviewDto';
import { ReviewService } from './Review.Service';

@ApiTags('reviews')
@Controller('api/products')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':productId/reviews')
  getReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.findByProduct(productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':productId/reviews')
  createReview(
    @CurrentUser() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(userId, productId, createReviewDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':productId/reviews/me')
  updateMyReview(
    @CurrentUser() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(userId, productId, updateReviewDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':productId/reviews/me')
  deleteMyReview(
    @CurrentUser() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewService.delete(userId, productId);
  }
}
