import { validate } from 'class-validator';
import { ChangeOrderStatusDto } from './dto/ChangeOrderStatusDto';
import { OrderService } from './Order.Service';
import { OrderStatus } from './entities/OrderStatus.Enum';

describe('OrderService', () => {
  it('accepts a valid order status and rejects invalid values', async () => {
    const validDto = new ChangeOrderStatusDto();
    validDto.status = OrderStatus.Delivered;

    const validErrors = await validate(validDto);
    expect(validErrors).toHaveLength(0);

    const invalidDto = new ChangeOrderStatusDto();
    invalidDto.status = 'INVALID_STATUS' as any;

    const invalidErrors = await validate(invalidDto);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });

  it('generates an order number and sends a confirmation email after placing an order', async () => {
    const orderRepository = {
      countOrders: jest.fn().mockResolvedValue(4),
      findUserById: jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'user@example.com' }),
      getProductsByIds: jest.fn().mockResolvedValue([
        {
          id: 2,
          productPrice: 100,
          netPrice: 0,
        },
      ]),
      createOrder: jest.fn().mockResolvedValue({
        id: 5,
        orderNumber: '#order5',
        userId: 1,
        guestEmail: null,
        orderStatus: OrderStatus.Pending,
        totalItems: 1,
        totalAmount: 100,
        items: [],
      }),
      createOrderItems: jest.fn().mockResolvedValue([]),
      findOneById: jest.fn().mockResolvedValue({
        id: 5,
        orderNumber: '#order5',
        userId: 1,
        guestEmail: null,
        orderStatus: OrderStatus.Pending,
        totalItems: 1,
        totalAmount: 100,
        items: [],
      }),
      updateOrder: jest.fn(),
    };

    const userActivityRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    const mailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
      sendOrderStatusUpdate: jest.fn().mockResolvedValue(undefined),
    };

    const service = new OrderService(
      orderRepository as any,
      userActivityRepository as any,
      mailService as any,
    );

    const result = await service.createOrder(1, {
      userId: 1,
      shippingMethod: 'STANDARD',
      shippingFee: 0,
      items: [{ productId: 2, quantity: 1 }],
    } as any);

    expect(orderRepository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderNumber: '#order5',
        userId: 1,
        guestEmail: null,
      }),
    );
    expect(mailService.sendOrderConfirmation).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({
        orderNumber: '#order5',
        totalAmount: 100,
      }),
    );
    expect(result.orderNumber).toBe('#order5');
  });
});
