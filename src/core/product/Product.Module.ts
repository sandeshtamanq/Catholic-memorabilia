import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FirebaseModule } from '../../infra/supabase/Supabase.Module';
import { ProductController } from './Product.Controller';
import { ProductRepository } from './Product.Repository';
import { ProductService } from './Product.Service';
import { ProductDIToken } from './ProductDIToken';
import { GptModule } from '../../infra/claude/Gpt.Module';
import { CategoryDIToken } from '../category/CategoryDIToken';
import { CategoryRepository } from '../category/Category.Repository';
import { ProductFavorite } from './entities/ProductFavorite.Entity';
import { UserActivity } from '../activity/entities/UserActivity.Entity';

@Module({
  imports: [
    FirebaseModule,
    ProductDIToken.productEntity,
    TypeOrmModule.forFeature([ProductFavorite, UserActivity]),
    CategoryDIToken.CategoryEntity,
    GptModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CategoryRepository,
    {
      provide: 'PRODUCT_FAVORITE_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(ProductFavorite),
      inject: [DataSource],
    },
  ],
  exports: [ProductService],
})
export class ProductModule {}
