import { Module } from '@nestjs/common';
import { CategoryController } from './Category.Controller';
import { CategoryRepository } from './Category.Repository';
import { CategoryService } from './Category.Service';
import { CategoryDIToken } from './CategoryDIToken';

@Module({
  imports: [CategoryDIToken.CategoryEntity],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
