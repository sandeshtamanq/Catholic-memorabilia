import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/Product.Entity';
import { User } from '../user/entities/User.Entity';
import { Cart } from './entities/Cart.Entity';
import { CartItem } from './entities/CartItem.Entity';

export class CartDIToken {
  static readonly cartEntity = TypeOrmModule.forFeature([
    Cart,
    CartItem,
    Product,
    User,
  ]);
}
