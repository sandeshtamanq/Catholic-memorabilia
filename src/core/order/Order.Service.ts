import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserType } from '../user/entities/UserType.Enum';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { OrderRepository } from './Order.Repository';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  private splitGuestName(fullName?: string) {
    const trimmedName = fullName?.trim() || 'Guest Customer';
    const parts = trimmedName.split(/\s+/);

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: 'Customer' };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  async createOrder(
    userIdOrDto: number | null | CreateOrderDto,
    maybeDto?: CreateOrderDto,
  ) {
    try {
      const isUserIdCall =
        typeof userIdOrDto === 'number' || userIdOrDto === null;
      const userId = isUserIdCall ? userIdOrDto : null;
      const createOrderDto = isUserIdCall ? maybeDto : userIdOrDto;

      if (!createOrderDto) {
        throw new BadRequestException('Order payload is required');
      }

      let effectiveUserId: number | null =
        (typeof userId === 'number' ? userId : null) ??
        createOrderDto.userId ??
        null;

      if (!effectiveUserId) {
        if (
          !createOrderDto.guestName ||
          !createOrderDto.guestEmail ||
          !createOrderDto.guestPhone
        ) {
          throw new BadRequestException(
            'Guest checkout requires guestName, guestEmail, and guestPhone, or a logged-in user',
          );
        }

        const guestEmail = createOrderDto.guestEmail.trim().toLowerCase();
        let guestUser = await this.orderRepository.findUserByEmail(guestEmail);

        if (!guestUser) {
          const { firstName, lastName } = this.splitGuestName(
            createOrderDto.guestName,
          );

          guestUser = await this.orderRepository.createGuestUser({
            firstName,
            lastName,
            email: guestEmail,
            contactNumber: createOrderDto.guestPhone,
            password: await bcrypt.hash(
              `guest-${Date.now()}-${guestEmail}`,
              12,
            ),
            addressLine1: createOrderDto.deliveryAddress ?? '',
            suburb: '',
            state: '',
            postcode: '',
            userType: UserType.Guest,
          });
        }

        effectiveUserId = guestUser.id;
      } else {
        const user = await this.orderRepository.findUserById(effectiveUserId);
        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

      if (!createOrderDto.items || createOrderDto.items.length === 0) {
        throw new BadRequestException('Order must contain at least one item');
      }

      let totalItems = 0;
      let totalAmount = 0;
      const orderItems: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      for (const item of createOrderDto.items) {
        const product = await this.orderRepository.getProductById(
          item.productId,
        );

        if (!product) {
          throw new NotFoundException(
            `Product with id ${item.productId} not found`,
          );
        }

        if (!item.quantity || item.quantity < 1) {
          throw new BadRequestException(
            `Quantity for product ${item.productId} must be at least 1`,
          );
        }

        const unitPrice = Number(product.productPrice);
        const totalPrice = Number((unitPrice * item.quantity).toFixed(2));

        totalItems += item.quantity;
        totalAmount += totalPrice;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });
      }

      const order = await this.orderRepository.createOrder({
        userId: effectiveUserId,
        guestName: createOrderDto.guestName ?? null,
        guestEmail: createOrderDto.guestEmail ?? null,
        guestPhone: createOrderDto.guestPhone ?? null,
        deliveryAddress: createOrderDto.deliveryAddress ?? null,
        orderStatus: 'PENDING',
        totalItems,
        totalAmount: Number(totalAmount.toFixed(2)),
      });

      await this.orderRepository.createOrderItems(
        orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      );

      const savedOrder =
        typeof this.orderRepository.findOneById === 'function'
          ? await this.orderRepository.findOneById(order.id)
          : null;

      return savedOrder ?? order;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async getOrders(userId: number) {
    return this.orderRepository.findOrdersByUser(userId);
  }

  async getOrderById(userId: number, orderId: number) {
    const order = await this.orderRepository.findOneById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId && order.userId !== userId) {
      throw new ForbiddenException('You are not allowed to view this order');
    }

    return order;
  }
}
