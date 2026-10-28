import { Module } from '@nestjs/common';
import { UserModule } from './user/User.Module';
import { AuthModule } from './auth/Auth.Module';
import { CategoryModule } from './category/Category.Module';
import { ProductModule } from './product/Product.Module';
import { CartModule } from './cart/Cart.Module';
import { OrderModule } from './order/Order.Module';
import { BannerModule } from './banner/Banner.Module';
import { ReviewModule } from './review/Review.Module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    BannerModule,
    ReviewModule,
  ],
})
export class CoreModule {}
