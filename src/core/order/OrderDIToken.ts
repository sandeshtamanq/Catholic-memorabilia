import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/Order.Entity';
import { OrderItem } from './entities/OrderItem.Entity';
import { Product } from '../product/entities/Product.Entity';
import { User } from '../user/entities/User.Entity';

export class OrderDIToken {
  static readonly orderEntity = TypeOrmModule.forFeature([
    Order,
    OrderItem,
    Product,
    User,
  ]);
}
