import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { S3StorageService } from '../../infra/supabase/Supabase.Service';
import { ProductRepository } from './Product.Repository';
import { CreateProductDto } from './dto/CreateProductDto';
import { UpdateProductDto } from './dto/UpdateProductDto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly supabaseService: S3StorageService,
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

  async fetchAll() {
    try {
      const products = await this.productRepository.findAll();

      if (!products) throw new NotFoundException();

      return products;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchDetail(id: number) {
    try {
      const productDetail = await this.productRepository.findOne(id);
      if (!productDetail) throw new NotFoundException();
      return productDetail;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // try {
    //   const product = await this.productRepository.findOne(id);
    //   if (!product) throw new NotFoundException();
    //   if (updateProductDto.productImage) {
    //     product.productImageUrl = await this.firebaseService.uploadFile(
    //       updateProductDto.productImage,
    //       'product-images',
    //     );
    //   }
    //   const { category, ...restProduct } = product;
    //   const newProduct = await this.productRepository.update({
    //     ...restProduct,
    //     ...updateProductDto,
    //   });
    //   if (!newProduct) throw new NotFoundException();
    //   return newProduct;
    // } catch (err) {
    //   if (err instanceof NotFoundException)
    //     throw new HttpException('Could not update the service', 400);
    //   throw new HttpException('Something went wrong', 500);
    // }
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
