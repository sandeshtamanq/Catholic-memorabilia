import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from './Category.Repository';
import { CreateCategoryDto } from './dto/CreateCategoryDto';
import { UpdateCategoryDto } from './dto/UpdateCategoryDto';
import { ProductService } from '../product/Product.Service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productService: ProductService,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const doesCategoryExist = await this.categoryRepository.findOneBy({
        categoryName: createCategoryDto.categoryName,
      });

      if (doesCategoryExist)
        throw new BadGatewayException(
          `${createCategoryDto.categoryName} category already exists`,
        );

      const category = await this.categoryRepository.create(createCategoryDto);

      if (!category) throw new NotFoundException();

      return category;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException();
      }

      if (err instanceof BadGatewayException) {
        throw new BadGatewayException(
          `${createCategoryDto.categoryName} category already exists`,
        );
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchDetail(id: number) {
    try {
      const detail = await this.categoryRepository.findOne(id);

      if (!detail) throw new NotFoundException('Not found');
      return detail;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Category not found');
      } else throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchAll() {
    try {
      const categories = await this.categoryRepository.findAll();

      if (!categories) throw new NotFoundException();

      return categories;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne(id);
      if (!category) throw new NotFoundException();

      const updateCategory = await this.categoryRepository.update({
        ...category,
        ...updateCategoryDto,
      });
      if (!updateCategory) throw new NotFoundException();
      return updateCategory;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  //   async fetchDetail(id: number) {
  //     try {
  //       const detail = await this.categoryRepository.findOne(id);
  //       detail.bookings = 0;
  //       detail.rating = 0;
  //       detail.products.forEach((product) => {
  //         detail.bookings = detail.bookings + product.bookings;
  //       });

  //       detail.products.forEach((product, index) => {
  //         let total = 0;
  //         product.reviews.forEach((review) => {
  //           total = total + review.rating;
  //         });
  //         product.rating = +(total / product.reviews.length).toFixed(2);
  //       });

  //       detail.products.forEach((product) => {
  //         if (product.rating) detail.rating = detail.rating + product.rating;
  //       });
  //       detail.rating = +(detail.rating / detail.products.length).toFixed(2);

  //       if (!detail) throw new NotFoundException('Not found');
  //       return detail;
  //     } catch (err) {
  //       throw new HttpException('Something went wrong', 500);
  //     }
  //   }

  async delete(id: number) {
    try {
      const category = await this.categoryRepository.findOne(id);
      if (!category) throw new NotFoundException();

      const hasProducts = await this.productService.hasProducts(id);
      if (hasProducts) {
        throw new BadRequestException();
      } else {
        await this.categoryRepository.softRemove(category);
      }
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw new HttpException(
          'Cannot delete category because it has products',
          400,
        );
      }
      throw new HttpException('Something went wrong', 500);
    }
  }
}
