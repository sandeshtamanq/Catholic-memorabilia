import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../product/entities/Product.Entity';
import { Bundle } from './entities/Bundle.Entity';
import { BundleItem } from './entities/BundleItem.Entity';
import { BundleStatus } from './entities/BundleStatus.Enum';
import { BundleService } from './Bundle.Service';

describe('BundleService', () => {
  let service: BundleService;

  const bundleRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const bundleItemRepository = {
    save: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };

  const productRepository = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundleService,
        {
          provide: getRepositoryToken(Bundle),
          useValue: bundleRepository,
        },
        {
          provide: getRepositoryToken(BundleItem),
          useValue: bundleItemRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
      ],
    }).compile();

    service = module.get<BundleService>(BundleService);
    jest.clearAllMocks();
  });

  it('should reject duplicate product IDs within a bundle', async () => {
    productRepository.findByIds.mockResolvedValue([{ id: 1 }]);

    await expect(
      service.createBundle({
        name: 'Weekend Bundle',
        sku: 'WB-100',
        fixedPrice: 49.99,
        stockQuantity: 10,
        status: BundleStatus.Active,
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 2 },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject product IDs that do not exist', async () => {
    productRepository.findByIds.mockResolvedValue([{ id: 2 }]);

    await expect(
      service.createBundle({
        name: 'Weekend Bundle',
        sku: 'WB-101',
        fixedPrice: 49.99,
        stockQuantity: 10,
        status: BundleStatus.Active,
        items: [{ productId: 99, quantity: 2 }],
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
