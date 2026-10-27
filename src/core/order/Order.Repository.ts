import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/Product.Entity';
import { User } from '../user/entities/User.Entity';
import { UserRole } from '../user/entities/UserRole.Enum';
import { UserType } from '../user/entities/UserType.Enum';
import { Order } from './entities/Order.Entity';
import { OrderItem } from './entities/OrderItem.Entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserById(userId: number) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async createGuestUser(userData: Partial<User>) {
    const guestUser = this.userRepository.create({
      ...userData,
      role: UserRole.User,
      userType: userData.userType ?? UserType.Guest,
      isEmailVerified: false,
    });

    return this.userRepository.save(guestUser);
  }

  async getProductById(productId: number) {
    return this.productRepository.findOne({ where: { id: productId } });
  }

  async createOrder(orderData: Partial<Order>) {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async createOrderItems(items: Partial<OrderItem>[]) {
    const orderItems = this.orderItemRepository.create(items);
    return this.orderItemRepository.save(orderItems);
  }

  async findAllOrders() {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrdersByUser(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(orderId: number) {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });
  }

  async deleteOrderItem(orderId: number) {
    const items = await this.orderItemRepository.find({ where: { orderId } });
    if (items.length === 0) {
      return true;
    }

    await this.orderItemRepository.remove(items);
    return true;
  }
}
