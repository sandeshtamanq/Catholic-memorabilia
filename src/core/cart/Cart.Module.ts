import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './Cart.Controller';
import { CartRepository } from './Cart.Repository';
import { CartService } from './Cart.Service';
import { CartDIToken } from './CartDIToken';
import { UserActivity } from '../activity/entities/UserActivity.Entity';

@Module({
  imports: [CartDIToken.cartEntity, TypeOrmModule.forFeature([UserActivity])],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
