import { Module } from '@nestjs/common';
import { CategoryDIToken } from '../category/CategoryDIToken';
import { OrderDIToken } from '../order/OrderDIToken';
import { ProductDIToken } from '../product/ProductDIToken';
import { DashboardController } from './Dashboard.Controller';
import { DashboardService } from './Dashboard.Service';

@Module({
  imports: [
    ProductDIToken.productEntity,
    CategoryDIToken.CategoryEntity,
    OrderDIToken.orderEntity,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
