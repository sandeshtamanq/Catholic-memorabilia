import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/Product.Entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product) private readonly repository: Repository<Product>,
  ) {}

  async create(product: Partial<Product>) {
    try {
      const createdProduct = await this.repository.save(
        this.repository.create(product),
      );

      if (!createdProduct) {
        return null;
      }

      return createdProduct;
    } catch (err) {
      return null;
    }
  }

  async findAll() {
    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .getMany();
  }

  async update(product: Partial<Product>) {
    try {
      const preloaded = await this.repository.preload({ ...product });
      const updateProduct = await this.repository.save({ ...preloaded });

      if (!updateProduct) return null;
      return updateProduct;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findOne(id: number) {
    return this.repository
      .createQueryBuilder('p')
      .where('p.id = :id', { id })
      .leftJoinAndSelect('p.category', 'category')
      .getOne();
  }

  async softRemove(product: Product) {
    await this.repository.softRemove(product);
  }
}
