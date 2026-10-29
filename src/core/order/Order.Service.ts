import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserType } from '../user/entities/UserType.Enum';
import { UserRole } from '../user/entities/UserRole.Enum';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { OrderRepository } from './Order.Repository';
import { OrderStatus } from './entities/OrderStatus.Enum';
import { UserActivity } from '../activity/entities/UserActivity.Entity';
import {
  getShippingFee,
  roundMoney,
  ShippingMethod,
} from '../cart/ShippingPolicy';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

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

  private formatDeliveryAddress(data: {
    addressLine1?: string;
    addressLine2?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fallback?: string;
  }) {
    const addressLine1 = data.addressLine1?.trim();
    const addressLine2 = data.addressLine2?.trim();
    const suburb = data.suburb?.trim();
    const state = data.state?.trim();
    const postcode = data.postcode?.trim();
    const fallback = data.fallback?.trim();

    const parts = [
      addressLine1,
      addressLine2,
      suburb,
      state && postcode ? `${state} ${postcode}` : state || postcode,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(', ');
    }

    return fallback || '';
  }

  private getProductPriceSnapshot(product: any, quantity: number) {
    const originalPrice = Number(product?.productPrice ?? 0);
    const discountedPrice = Number(product?.netPrice ?? 0);
    const priceAfterDiscount =
      discountedPrice > 0 ? discountedPrice : originalPrice;
    const discountAmount = Math.max(originalPrice - priceAfterDiscount, 0);
    const totalPrice = Number((priceAfterDiscount * quantity).toFixed(2));

    return {
      originalPrice: Number(originalPrice.toFixed(2)),
      priceAfterDiscount: Number(priceAfterDiscount.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      totalPrice,
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

      const shippingAddress = this.formatDeliveryAddress({
        addressLine1: createOrderDto.shippingAddressLine1,
        addressLine2: createOrderDto.shippingAddressLine2,
        suburb: createOrderDto.shippingSuburb,
        state: createOrderDto.shippingState,
        postcode: createOrderDto.shippingPostcode,
        fallback: createOrderDto.shippingAddress,
      });

      const deliveryAddress = this.formatDeliveryAddress({
        addressLine1: createOrderDto.deliveryAddressLine1,
        addressLine2: createOrderDto.deliveryAddressLine2,
        suburb: createOrderDto.deliverySuburb,
        state: createOrderDto.deliveryState,
        postcode: createOrderDto.deliveryPostcode,
        fallback: createOrderDto.deliveryAddress,
      });

      const finalShippingAddress = shippingAddress || deliveryAddress || '';
      const finalDeliveryAddress =
        deliveryAddress || shippingAddress || finalShippingAddress;

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
        const { firstName, lastName } = this.splitGuestName(
          createOrderDto.guestName,
        );

        createOrderDto.guestName = `${firstName} ${lastName}`.trim();
        createOrderDto.guestEmail = guestEmail;
        effectiveUserId = null;
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
        originalPrice: number;
        unitPrice: number;
        priceAfterDiscount: number;
        discountAmount: number;
        totalPrice: number;
      }> = [];
      const shippingMethod =
        createOrderDto.shippingMethod ?? ShippingMethod.Standard;

      const productIds = [
        ...new Set(createOrderDto.items.map((item) => item.productId)),
      ];
      const products = await this.orderRepository.getProductsByIds(productIds);
      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      for (const item of createOrderDto.items) {
        const product = productMap.get(item.productId);

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

        const pricing = this.getProductPriceSnapshot(product, item.quantity);

        totalItems += item.quantity;
        totalAmount += pricing.totalPrice;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          originalPrice: pricing.originalPrice,
          unitPrice: pricing.priceAfterDiscount,
          priceAfterDiscount: pricing.priceAfterDiscount,
          discountAmount: pricing.discountAmount,
          totalPrice: pricing.totalPrice,
        });
      }

      const shippingFee = roundMoney(
        getShippingFee(totalAmount, shippingMethod),
      );

      if (
        createOrderDto.shippingFee !== undefined &&
        Number(createOrderDto.shippingFee) !== shippingFee
      ) {
        throw new BadRequestException(
          `Shipping fee mismatch. Expected ${shippingFee.toFixed(2)} but received ${Number(createOrderDto.shippingFee).toFixed(2)}.`,
        );
      }

      const order = await this.orderRepository.createOrder({
        userId: effectiveUserId,
        guestName: createOrderDto.guestName ?? null,
        guestEmail: createOrderDto.guestEmail ?? null,
        guestPhone: createOrderDto.guestPhone ?? null,
        shippingAddress: finalShippingAddress || null,
        deliveryAddress: finalDeliveryAddress || null,
        shippingMethod,
        shippingFee,
        orderStatus: OrderStatus.Pending,
        totalItems,
        totalAmount: Number(totalAmount.toFixed(2)),
      });

      await this.orderRepository.createOrderItems(
        orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      );

      await this.userActivityRepository.save({
        moduleName: 'order',
        action: 'BUY_PRODUCT',
        userId: effectiveUserId,
        productId: orderItems[0]?.productId ?? null,
        description: `User placed order #${order.id}`,
        metadata: {
          orderId: order.id,
          itemCount: orderItems.length,
          totalItems,
          totalAmount: Number(totalAmount.toFixed(2)),
          productIds: orderItems.map((item) => item.productId),
        },
      });

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

  async getOrders(userId: number, userRole?: UserRole) {
    if (userRole === UserRole.Admin) {
      return this.orderRepository.findAllOrders();
    }

    return this.orderRepository.findOrdersByUser(userId);
  }

  async getOrderById(userId: number, orderId: number, userRole?: UserRole) {
    const order = await this.orderRepository.findOneById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isOwner = order.userId === userId;
    const isAdmin = userRole === UserRole.Admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to view this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOneById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException(
        `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
      );
    }

    order.orderStatus = status;
    return this.orderRepository.updateOrder(order);
  }
}
