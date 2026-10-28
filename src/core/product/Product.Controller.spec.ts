import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './Product.Controller';
import { ProductService } from './Product.Service';

describe('ProductController', () => {
  let controller: ProductController;
  const mockProductService = {
    removeFavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    jest.clearAllMocks();
  });

  it('should remove a favorite when the user calls the delete endpoint', async () => {
    mockProductService.removeFavorite.mockResolvedValue({
      favorited: false,
      message: 'Favorite removed',
    });

    const result = await controller.deleteFavorite(1, 7);

    expect(mockProductService.removeFavorite).toHaveBeenCalledWith(1, 7);
    expect(result).toEqual({ favorited: false, message: 'Favorite removed' });
  });
});
