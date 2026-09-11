import { Module } from '@nestjs/common';
import { UserModule } from './user/User.Module';
import { AuthModule } from './auth/Auth.Module';
import { CategoryModule } from './category/Category.Module';
import { ProductModule } from './product/Product.Module';

@Module({
  imports: [AuthModule, UserModule, CategoryModule, ProductModule],
})
export class CoreModule {}
