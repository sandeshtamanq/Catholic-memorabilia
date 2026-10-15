import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../infra/supabase/Supabase.Module';
import { CategoryController } from './Category.Controller';
import { CategoryRepository } from './Category.Repository';
import { CategoryService } from './Category.Service';
import { CategoryDIToken } from './CategoryDIToken';
import { ProductModule } from '../product/Product.Module';

@Module({
  imports: [FirebaseModule, CategoryDIToken.CategoryEntity, ProductModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
