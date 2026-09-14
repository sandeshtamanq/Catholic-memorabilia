import { Module } from '@nestjs/common';
import { CartController } from './Cart.Controller';
import { CartService } from './Cart.Service';

@Module({
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
