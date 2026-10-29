import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/Product.Entity';
import { Bundle } from './entities/Bundle.Entity';
import { BundleItem } from './entities/BundleItem.Entity';
import { BundleStatus } from './entities/BundleStatus.Enum';
import { CreateBundleDto } from './dto/CreateBundleDto';
import { UpdateBundleDto } from './dto/UpdateBundleDto';
import { BundleItemDto } from './dto/BundleItemDto';

@Injectable()
export class BundleService {
  constructor(
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    @InjectRepository(BundleItem)
    private readonly bundleItemRepository: Repository<BundleItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createBundle(dto: CreateBundleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'A bundle must include at least one product.',
      );
    }

    await this.validateItems(dto.items);

    const bundle = await this.bundleRepository.save(
      this.bundleRepository.create({
        name: dto.name,
        description: dto.description,
        fixedPrice: dto.fixedPrice,
        imageUrl: dto.imageUrl,
        stockQuantity: dto.stockQuantity,
        status: dto.status ?? BundleStatus.Draft,
      }),
    );

    const bundleItems = dto.items.map((item) => ({
      bundleId: bundle.id,
      productId: item.productId,
      quantity: item.quantity,
    }));

    await this.bundleItemRepository.save(bundleItems);

    return this.findBundleById(bundle.id);
  }

  async findAllBundles() {
    return this.bundleRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublishedBundles() {
    return this.bundleRepository.find({
      where: { status: BundleStatus.Active },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBundleById(id: number) {
    const bundle = await this.bundleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!bundle) {
      throw new NotFoundException(`Bundle with id ${id} not found.`);
    }

    return bundle;
  }

  async updateBundle(id: number, dto: UpdateBundleDto) {
    const bundle = await this.findBundleById(id);

    const nextItems = dto.items ?? null;
    if (nextItems) {
      await this.validateItems(nextItems);
      await this.bundleItemRepository.delete({ bundleId: id });
      await this.bundleItemRepository.save(
        nextItems.map((item) => ({
          bundleId: bundle.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
    }

    const updatedBundle = await this.bundleRepository.save({
      ...bundle,
      ...dto,
      items: undefined,
    });

    return this.findBundleById(updatedBundle.id);
  }

  async addBundleItem(bundleId: number, dto: BundleItemDto) {
    const bundle = await this.findBundleById(bundleId);
    await this.validateItems([dto]);

    const existingItem = await this.bundleItemRepository.findOne({
      where: { bundleId: bundle.id, productId: dto.productId },
    });

    if (existingItem) {
      existingItem.quantity = dto.quantity;
      return this.bundleItemRepository.save(existingItem);
    }

    const item = this.bundleItemRepository.create({
      bundleId: bundle.id,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    return this.bundleItemRepository.save(item);
  }

  async updateBundleItem(
    bundleId: number,
    productId: number,
    quantity: number,
  ) {
    if (quantity < 1) {
      throw new BadRequestException('Bundle item quantity must be at least 1.');
    }

    await this.findBundleById(bundleId);

    const item = await this.bundleItemRepository.findOne({
      where: { bundleId, productId },
    });

    if (!item) {
      throw new NotFoundException(
        `Bundle item for product ${productId} not found in bundle ${bundleId}.`,
      );
    }

    item.quantity = quantity;
    return this.bundleItemRepository.save(item);
  }

  async removeBundleItem(bundleId: number, productId: number) {
    await this.findBundleById(bundleId);

    const result = await this.bundleItemRepository.delete({
      bundleId,
      productId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Bundle item for product ${productId} not found in bundle ${bundleId}.`,
      );
    }

    return { message: 'Bundle item removed successfully.' };
  }

  async updateBundleStock(bundleId: number, stockQuantity: number) {
    if (stockQuantity < 0) {
      throw new BadRequestException('Bundle stock cannot be negative.');
    }

    const bundle = await this.findBundleById(bundleId);
    bundle.stockQuantity = stockQuantity;
    return this.bundleRepository.save(bundle);
  }

  async updateBundleStatus(bundleId: number, status: BundleStatus) {
    const bundle = await this.findBundleById(bundleId);
    bundle.status = status;
    return this.bundleRepository.save(bundle);
  }

  private async validateItems(items: BundleItemDto[]) {
    if (!items || items.length === 0) {
      throw new BadRequestException(
        'A bundle must include at least one product.',
      );
    }

    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      throw new BadRequestException(
        'A bundle cannot include the same product more than once.',
      );
    }

    const products = await this.productRepository.findByIds(productIds);
    const foundIds = new Set(products.map((product) => Number(product.id)));
    const missingIds = productIds.filter((id) => !foundIds.has(Number(id)));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Invalid product IDs in bundle: ${missingIds.join(', ')}`,
      );
    }

    for (const item of items) {
      if (item.quantity < 1) {
        throw new BadRequestException(
          `Product ${item.productId} must have a quantity of at least 1.`,
        );
      }
    }
  }
}
