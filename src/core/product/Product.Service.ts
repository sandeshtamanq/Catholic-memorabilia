import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { S3StorageService } from '../../infra/supabase/Supabase.Service';
import { ProductRepository } from './Product.Repository';
import { CreateProductDto } from './dto/CreateProductDto';
import { UpdateProductDto } from './dto/UpdateProductDto';
import { GptService } from '../../infra/claude/Gpt.Service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly supabaseService: S3StorageService,
    private readonly gptService: GptService,
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

  async fetchAll(query?: { page?: number; limit?: number; search?: string }) {
    try {
      const page = query?.page ?? 1;
      const limit = query?.limit ?? 10;
      const search = query?.search;

      const result = await this.productRepository.findAll({
        page,
        limit,
        search,
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
