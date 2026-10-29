import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/Category.Entity';
import { Order } from '../order/entities/Order.Entity';
import { Product } from '../product/entities/Product.Entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getSummary() {
    const [totalProducts, totalCategories, totalOrders] = await Promise.all([
      this.productRepository.count(),
      this.categoryRepository.count(),
      this.orderRepository.count(),
    ]);

    return {
      totalProducts,
      totalCategories,
      totalOrders,
    };
  }
}
