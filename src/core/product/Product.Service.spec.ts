import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './Product.Service';
import { ProductRepository } from './Product.Repository';
import { CategoryRepository } from '../category/Category.Repository';
import { S3StorageService } from '../../infra/supabase/Supabase.Service';
import { GptService } from '../../infra/claude/Gpt.Service';

describe('ProductService favorites', () => {
  let service: ProductService;
  let favoriteRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    favoriteRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 7, productName: 'Cross Hoodie' }),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {},
        },
        {
          provide: S3StorageService,
          useValue: {},
        },
        {
          provide: GptService,
          useValue: {},
        },
        {
          provide: 'PRODUCT_FAVORITE_REPOSITORY',
          useValue: favoriteRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should add a product to favorites when it is not already saved', async () => {
    favoriteRepository.findOne.mockResolvedValue(null);
    favoriteRepository.save.mockResolvedValue({
      id: 1,
      userId: 2,
      productId: 7,
    });

    const result = await service.toggleFavorite(2, 7);

    expect(result).toEqual({
      favorited: true,
      favorite: { id: 1, userId: 2, productId: 7 },
    });
    expect(favoriteRepository.save).toHaveBeenCalledWith({
      userId: 2,
      productId: 7,
    });
  });

  it('should remove a product from favorites when it already exists', async () => {
    const existingFavorite = { id: 10, userId: 2, productId: 7 };
    favoriteRepository.findOne.mockResolvedValue(existingFavorite);
    favoriteRepository.remove.mockResolvedValue(existingFavorite);

    const result = await service.toggleFavorite(2, 7);

    expect(result).toEqual({ favorited: false, favorite: existingFavorite });
    expect(favoriteRepository.remove).toHaveBeenCalledWith(existingFavorite);
  });
});
