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

  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;
    const search = opts?.search?.trim().toLowerCase();

    const query = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category');

    if (search) {
      query.where(
        'LOWER(p.productName) LIKE :search OR LOWER(p.productDescription) LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [items, total] = await query
      .orderBy('p.createdAt', 'DESC')
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

  async findNewArrivals(limit = 8) {
    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .orderBy('p.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findFeaturedProducts(limit = 8) {
    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .orderBy('p.updatedAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findOfferProducts(limit = 8) {
    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .where('p.isOffer = :isOffer OR p.discountPercentage > :minDiscount', {
        isOffer: true,
        minDiscount: 0,
      })
      .orderBy('p.discountPercentage', 'DESC')
      .take(limit)
      .getMany();
  }

  async findJustForYou(limit = 8) {
    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .orderBy('p.id', 'DESC')
      .take(limit)
      .getMany();
  }

  async findSuggestions({
    keyword,
  }: {
    type: 'product' | 'category';
    keyword: string;
  }) {
    const search = keyword.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .where('LOWER(p.productName) LIKE :search', {
        search: `%${search}%`,
      })
      .orWhere('LOWER(p.productDescription) LIKE :search', {
        search: `%${search}%`,
      })
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async findCategoryMatches({
    categoryId,
    categoryName,
  }: {
    categoryId?: number;
    categoryName?: string;
  }) {
    const query = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category');

    if (categoryId) {
      query.where('p.categoryId = :categoryId', { categoryId });
    }

    if (categoryName) {
      const lowerName = categoryName.trim().toLowerCase();
      if (categoryId) {
        query.andWhere('LOWER(category.categoryName) LIKE :categoryName', {
          categoryName: `%${lowerName}%`,
        });
      } else {
        query.where('LOWER(category.categoryName) LIKE :categoryName', {
          categoryName: `%${lowerName}%`,
        });
      }
    }

    return query.orderBy('p.createdAt', 'DESC').getMany();
  }

  async findRelatedProducts(categoryId: number, limit = 8) {
    const query = this.repository
      .createQueryBuilder('p')
      .where('p.categoryId = :categoryId', { categoryId })
      .leftJoinAndSelect('p.category', 'category');

    // if (product?.categoryId) {
    //   query.andWhere('p.categoryId = :categoryId', {
    //     categoryId: product.categoryId,
    //   });
    // }

    return query.orderBy('p.createdAt', 'DESC').take(limit).getMany();
  }

  async count(categoryId) {
    return this.repository.count({
      where: {
        category: {
          id: categoryId,
        },
      },
    });
  }
  async update(product: Partial<Product>) {
    try {
      const preloaded = await this.repository.preload({ ...product });
      const updateProduct = await this.repository.save({ ...preloaded });

      if (!updateProduct) return null;
      return updateProduct;
    } catch (err) {
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
