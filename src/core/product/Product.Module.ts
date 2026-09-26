import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../infra/supabase/Supabase.Module';
import { ProductController } from './Product.Controller';
import { ProductRepository } from './Product.Repository';
import { ProductService } from './Product.Service';
import { ProductDIToken } from './ProductDIToken';
import { GptModule } from '../../infra/claude/Gpt.Module';

@Module({
  imports: [FirebaseModule, ProductDIToken.productEntity, GptModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
