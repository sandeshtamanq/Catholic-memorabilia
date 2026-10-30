import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReview } from './entities/ProductReview.Entity';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(ProductReview)
    private readonly repository: Repository<ProductReview>,
  ) {}

  async create(review: Partial<ProductReview>) {
    const createdReview = await this.repository.save(
      this.repository.create(review),
    );

    return this.findOne(createdReview.id);
  }

  async findOne(id: number) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.id = :id', { id })
      .getOne();
  }

  async findByProduct(productId: number) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  async findByUserAndProduct(userId: number, productId: number) {
    return this.repository.findOne({
      where: { userId, productId },
    });
  }

  async update(review: Partial<ProductReview>) {
    const savedReview = await this.repository.save({
      ...review,
    });

    return this.findOne(savedReview.id);
  }

  async remove(review: ProductReview) {
    await this.repository.remove(review);
  }
}
