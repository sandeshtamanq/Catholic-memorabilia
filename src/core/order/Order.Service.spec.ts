import { OrderService } from './Order.Service';

describe('OrderService', () => {
  it('creates a guest user and associates the order when no user is authenticated', async () => {
    const repository = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn().mockResolvedValue(null),
      createGuestUser: jest.fn().mockResolvedValue({
        id: 99,
        firstName: 'Guest',
        lastName: 'Customer',
        email: 'guest@example.com',
        contactNumber: '123456789',
        userType: 'GUEST',
      }),
      getProductById: jest.fn().mockResolvedValue({
        id: 1,
        productPrice: '20.00',
      }),
      createOrder: jest.fn().mockResolvedValue({
        id: 1,
        userId: 99,
        guestName: 'Guest Customer',
        guestEmail: 'guest@example.com',
        guestPhone: '123456789',
        totalItems: 1,
        totalAmount: 20,
      }),
      createOrderItems: jest.fn().mockResolvedValue([]),
      findOneById: jest.fn().mockResolvedValue({
        id: 1,
        userId: 99,
        guestName: 'Guest Customer',
        guestEmail: 'guest@example.com',
        guestPhone: '123456789',
        totalItems: 1,
        totalAmount: 20,
      }),
    };

    const service = new OrderService(repository as any);

    const result = await service.createOrder({
      items: [{ productId: 1, quantity: 1 }],
      guestName: 'Guest Customer',
      guestEmail: 'guest@example.com',
      guestPhone: '123456789',
    });

    expect(repository.findUserByEmail).toHaveBeenCalledWith(
      'guest@example.com',
    );
    expect(repository.createGuestUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Guest',
        lastName: 'Customer',
        email: 'guest@example.com',
        contactNumber: '123456789',
        userType: 'GUEST',
        password: expect.any(String),
      }),
    );
    expect(result).toMatchObject({
      userId: 99,
      guestName: 'Guest Customer',
      guestEmail: 'guest@example.com',
      guestPhone: '123456789',
      totalItems: 1,
      totalAmount: 20,
    });
    expect(repository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 99,
        guestName: 'Guest Customer',
      }),
    );
  });
});
