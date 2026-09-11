import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../infra/firebase/FIrebase.Service';
import { ProductRepository } from './Product.Repository';
import { CreateProductDto } from './dto/CreateProductDto';
import { UpdateProductDto } from './dto/UpdateProductDto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(file: Express.Multer.File, createProductDto: CreateProductDto) {
    try {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'product-images',
      );

      const newProduct = await this.productRepository.create({
        ...createProductDto,
        productImageUrl: imageUrl,
      });

      if (!newProduct) throw new HttpException('Something went wrong', 500);

      return newProduct;
    } catch (err) {
      err;
    }
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
    try {
      const product = await this.productRepository.findOne(id);
      if (!product) throw new NotFoundException();
      if (updateProductDto.productImage) {
        product.productImageUrl = await this.firebaseService.uploadFile(
          updateProductDto.productImage,
          'product-images',
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
