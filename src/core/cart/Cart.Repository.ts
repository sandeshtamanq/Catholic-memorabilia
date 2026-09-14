import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/Product.Entity';
import { Cart } from './entities/Cart.Entity';
import { CartItem } from './entities/CartItem.Entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProductById(productId: number) {
    return this.productRepository.findOne({ where: { id: productId } });
  }

  async findCartByUserId(userId: number) {
    return this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('cart.userId = :userId', { userId })
      .orderBy('items.id', 'ASC')
      .getOne();
  }

  async createCart(userId: number) {
    const cart = this.cartRepository.create({
      userId,
      totalItems: 0,
      totalAmount: 0,
    });

    return this.cartRepository.save(cart);
  }

  async findCartItemByProduct(cartId: number, productId: number) {
    return this.cartItemRepository
      .createQueryBuilder('item')
      .where('item.cartId = :cartId', { cartId })
      .andWhere('item.productId = :productId', { productId })
      .getOne();
  }

  async saveCartItem(item: Partial<CartItem>) {
    const cartItem = this.cartItemRepository.create(item);
    return this.cartItemRepository.save(cartItem);
  }

  async deleteCartItem(cartId: number, productId: number) {
    const cartItem = await this.findCartItemByProduct(cartId, productId);
    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(cartItem);
    return true;
  }

  async clearCartItems(cartId: number) {
    await this.cartItemRepository.delete({ cartId });
  }

  async updateCartTotals(cartId: number) {
    const items = await this.cartItemRepository.find({ where: { cartId } });
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      return null;
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.totalPrice || 0),
      0,
    );

    cart.totalItems = totalItems;
    cart.totalAmount = Number(totalAmount.toFixed(2));

    return this.cartRepository.save(cart);
  }
}
