import { CartService } from './Cart.Service';

describe('CartService', () => {
  it('creates a guest user cart when no authenticated user is present', async () => {
    const repository = {
      findUserByEmail: jest.fn().mockResolvedValue(null),
      createGuestUser: jest.fn().mockResolvedValue({
        id: 42,
        firstName: 'Guest',
        lastName: 'Customer',
        email: 'guest@example.com',
        contactNumber: '123456789',
        userType: 'GUEST',
      }),
      findCartByUserId: jest.fn().mockResolvedValue(null),
      createCart: jest.fn().mockResolvedValue({
        id: 10,
        userId: 42,
        totalItems: 0,
        totalAmount: 0,
      }),
      getProductById: jest.fn(),
      findCartItemByProduct: jest.fn(),
      saveCartItem: jest.fn(),
      updateCartTotals: jest.fn(),
      deleteCartItem: jest.fn(),
      clearCartItems: jest.fn(),
    };

    const service = new CartService(repository as any);

    const result = await service.getCart(null, 'guest@example.com');

    expect(repository.findUserByEmail).toHaveBeenCalledWith(
      'guest@example.com',
    );
    expect(repository.createGuestUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Guest',
        lastName: 'Customer',
        email: 'guest@example.com',
        contactNumber: '0000000000',
        userType: 'GUEST',
        password: expect.any(String),
      }),
    );
    expect(repository.createCart).toHaveBeenCalledWith(42);
    expect(result).toMatchObject({
      id: 10,
      userId: 42,
      totalItems: 0,
      totalAmount: 0,
    });
  });
});
