import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './Order.Controller';
import { OrderRepository } from './Order.Repository';
import { OrderService } from './Order.Service';
import { OrderDIToken } from './OrderDIToken';
import { UserActivity } from '../activity/entities/UserActivity.Entity';

@Module({
  imports: [OrderDIToken.orderEntity, TypeOrmModule.forFeature([UserActivity])],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
