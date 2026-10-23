import { Module } from '@nestjs/common';
import { OrderController } from './Order.Controller';
import { OrderRepository } from './Order.Repository';
import { OrderService } from './Order.Service';
import { OrderDIToken } from './OrderDIToken';

@Module({
  imports: [OrderDIToken.orderEntity],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
