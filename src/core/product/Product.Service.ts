import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { S3StorageService } from '../../infra/supabase/Supabase.Service';
import { ProductRepository } from './Product.Repository';
import { CreateProductDto } from './dto/CreateProductDto';
import { UpdateProductDto } from './dto/UpdateProductDto';
import { GptService } from '../../infra/claude/Gpt.Service';
import { CategoryRepository } from '../category/Category.Repository';
import { ProductFavorite } from './entities/ProductFavorite.Entity';

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'alphabet' | 'name' | 'price';
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly supabaseService: S3StorageService,
    private readonly gptService: GptService,
    @Inject('PRODUCT_FAVORITE_REPOSITORY')
    private readonly favoriteRepository: Repository<ProductFavorite>,
  ) {}

  async create(file: Express.Multer.File, createProductDto: CreateProductDto) {
    try {
      const path = `products/${Date.now()}-${file.originalname}`;
      const imageUrl = await this.supabaseService.uploadFile(
        'proj',
        path,
        file,
      );

      const newProduct = await this.productRepository.create({
        ...createProductDto,
        productImageUrl: imageUrl,
      });

      if (!newProduct) throw new HttpException('Something went wrong', 500);

      return newProduct;
    } catch (err) {}
  }

  async fetchAll(query?: ProductListQuery) {
    try {
      const page = query?.page ?? 1;
      const limit = query?.limit ?? 10;
      const search = query?.search;
      const minPrice = query?.minPrice;
      const maxPrice = query?.maxPrice;
      const sortBy = query?.sortBy;
      const sortOrder = query?.sortOrder;

      const result = await this.productRepository.findAll({
        page,
        limit,
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      });

      if (!result) throw new NotFoundException();

      return result;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchNewArrivals(limit = 8) {
    return this.productRepository.findNewArrivals(limit);
  }

  async fetchFeaturedProducts(limit = 8) {
    return this.productRepository.findFeaturedProducts(limit);
  }

  async fetchOfferProducts(limit = 8) {
    return this.productRepository.findOfferProducts(limit);
  }

  async fetchJustForYou(limit = 8) {
    return this.productRepository.findJustForYou(limit);
  }

  async suggest(type?: string, keyword?: string) {
    const normalizedType = type?.trim().toLowerCase();
    const normalizedKeyword = keyword?.trim();

    if (normalizedType === 'product') {
      return this.productRepository.findSuggestions({
        type: normalizedType,
        keyword: normalizedKeyword,
      });
    }

    if (normalizedType === 'category') {
      return this.categoryRepository.findSuggestions(normalizedKeyword);
    }

    return this.productRepository.findAll();
  }

  async searchByCategory({
    categoryId,
    categoryName,
  }: {
    categoryId?: number;
    categoryName?: string;
  }) {
    return this.productRepository.findCategoryMatches({
      categoryId,
      categoryName,
    });
  }

  async fetchRelatedProducts(categoryId: number, limit = 8) {
    return this.productRepository.findRelatedProducts(categoryId, limit);
  }

  async hasProducts(categoryId: number): Promise<boolean> {
    const count = await this.productRepository.count(categoryId);

    return count > 0;
  }

  async fetchDetail(id: number) {
    try {
      const productDetail = await this.productRepository.findOne(id);
      if (!productDetail) throw new NotFoundException();
      return productDetail;
    } catch (err) {
      if (err instanceof NotFoundException) {
        return new NotFoundException();
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async generateFromImage(file: Express.Multer.File) {
    const gptResponse = await this.gptService.generateFromImage(file);
    return gptResponse;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOne(id);
      if (!product) throw new NotFoundException();
      if (updateProductDto.productImage) {
        const path = `products/${Date.now()}-${updateProductDto.productImage.originalname}`;

        product.productImageUrl = await await this.supabaseService.uploadFile(
          'proj',
          path,
          updateProductDto.productImage,
        );
      }
      const { category, ...restProduct } = product;
      const newProduct = await this.productRepository.update({
        ...restProduct,
        ...updateProductDto,
      });
      if (!newProduct) throw new NotFoundException();
      return newProduct;
    } catch (err) {
      if (err instanceof NotFoundException)
        throw new HttpException('Could not update the service', 400);
      throw new HttpException('Something went wrong', 500);
    }
  }

  async toggleFavorite(userId: number, productId: number) {
    if (!userId || !productId) {
      throw new BadRequestException('User and product are required');
    }

    const product = await this.productRepository.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existingFavorite) {
      await this.favoriteRepository.remove(existingFavorite);
      return {
        favorited: false,
        favorite: existingFavorite,
      };
    }

    const favorite = await this.favoriteRepository.save({
      userId,
      productId,
    });

    return {
      favorited: true,
      favorite,
    };
  }

  async getFavorites(userId: number) {
    if (!userId) {
      throw new BadRequestException('User is required');
    }

    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((favorite) => favorite.product);
  }

  async delete(id: number) {
    try {
      const product = await this.productRepository.findOne(id);
      if (!product) throw new NotFoundException();
      await this.productRepository.softRemove(product);
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }
}
