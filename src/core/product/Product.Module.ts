import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../infra/supabase/Supabase.Module';
import { ProductController } from './Product.Controller';
import { ProductRepository } from './Product.Repository';
import { ProductService } from './Product.Service';
import { ProductDIToken } from './ProductDIToken';
import { GptModule } from '../../infra/claude/Gpt.Module';
import { CategoryDIToken } from '../category/CategoryDIToken';
import { CategoryRepository } from '../category/Category.Repository';

@Module({
  imports: [
    FirebaseModule,
    ProductDIToken.productEntity,
    CategoryDIToken.CategoryEntity,
    GptModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, CategoryRepository],
  exports: [ProductService],
})
export class ProductModule {}
