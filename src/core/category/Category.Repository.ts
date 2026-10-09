import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/Category.Entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async create(category: Partial<Category>) {
    try {
      const createdCategory = await this.repository.save(
        this.repository.create(category),
      );

      if (!this.create) return null;

      return this.findOne(createdCategory.id);
    } catch (err) {
      return null;
    }
  }

  async findOne(id: number) {
    return (
      this.repository
        .createQueryBuilder('c')
        .where('c.id = :id', { id })
        // .leftJoinAndSelect('c.products', 'products')

        .getOne()
    );
  }

  async findOneBy(by: { categoryName: string }) {
    return this.repository
      .createQueryBuilder('c')
      .where('c.categoryName = :categoryName', {
        categoryName: by.categoryName,
      })
      .getOne();
  }

  async findSuggestions(keyword: string) {
    const search = keyword.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return this.repository
      .createQueryBuilder('c')
      .where('LOWER(c.categoryName) LIKE :search', {
        search: `%${search}%`,
      })
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;
    const search = opts?.search?.trim().toLowerCase();

    const query = this.repository.createQueryBuilder('c');

    if (search) {
      query.where('LOWER(c.categoryName) LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(category: Partial<Category>) {
    try {
      const preloaded = await this.repository.preload({ ...category });
      const updateCategory = await this.repository.save({ ...preloaded });
      if (!updateCategory) {
        return null;
      }

      return this.findOne(updateCategory.id);
    } catch (err) {
      return null;
    }
  }

  async softRemove(category: Category) {
    await this.repository.delete(category.id);
  }
}
