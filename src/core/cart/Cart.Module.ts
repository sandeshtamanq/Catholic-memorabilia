import { Module } from '@nestjs/common';
import { CartController } from './Cart.Controller';
import { CartRepository } from './Cart.Repository';
import { CartService } from './Cart.Service';
import { CartDIToken } from './CartDIToken';

@Module({
  imports: [CartDIToken.cartEntity],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
