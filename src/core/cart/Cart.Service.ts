import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/AddToCartDto';
import { UpdateCartItemDto } from './dto/UpdateCartItemDto';
import { CartRepository } from './Cart.Repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(userId: number) {
    try {
      let cart = await this.cartRepository.findCartByUserId(userId);

      if (!cart) {
        cart = await this.cartRepository.createCart(userId);
      }

      return cart;
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async addItem(userId: number, addToCartDto: AddToCartDto) {
    try {
      const product = await this.cartRepository.getProductById(
        addToCartDto.productId,
      );

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let cart = await this.cartRepository.findCartByUserId(userId);

      if (!cart) {
        cart = await this.cartRepository.createCart(userId);
      }

      const existingItem = await this.cartRepository.findCartItemByProduct(
        cart.id,
        addToCartDto.productId,
      );

      // Changing the type from string to integer
      const unitPrice = Number(product.productPrice);

      if (existingItem) {
        existingItem.quantity += addToCartDto.quantity;
        existingItem.unitPrice = unitPrice;
        existingItem.totalPrice = Number(
          (existingItem.quantity * unitPrice).toFixed(2),
        );

        await this.cartRepository.saveCartItem(existingItem);
        return this.cartRepository.updateCartTotals(cart.id);
      }

      await this.cartRepository.saveCartItem({
        cartId: cart.id,
        productId: product.id,
        quantity: addToCartDto.quantity,
        unitPrice,
        totalPrice: Number((addToCartDto.quantity * unitPrice).toFixed(2)),
      });

      return this.cartRepository.updateCartTotals(cart.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async updateItemQuantity(
    userId: number,
    productId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    try {
      const cart = (await this.getCart(userId)) as any;
      const existingItem = await this.cartRepository.findCartItemByProduct(
        cart.id,
        productId,
      );

      if (!existingItem) {
        throw new NotFoundException('Item not found in cart');
      }

      existingItem.quantity = updateCartItemDto.quantity;
      existingItem.unitPrice = Number(existingItem.unitPrice || 0);
      existingItem.totalPrice = Number(
        (existingItem.unitPrice * existingItem.quantity).toFixed(2),
      );

      await this.cartRepository.saveCartItem(existingItem);
      return this.cartRepository.updateCartTotals(cart.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async removeItem(userId: number, productId: number) {
    try {
      const cart = (await this.getCart(userId)) as any;
      const existingItem = await this.cartRepository.findCartItemByProduct(
        cart.id,
        productId,
      );

      if (!existingItem) {
        throw new NotFoundException('Item not found in cart');
      }

      await this.cartRepository.deleteCartItem(cart.id, productId);
      return this.cartRepository.updateCartTotals(cart.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async clearCart(userId: number) {
    try {
      const cart = (await this.getCart(userId)) as any;
      await this.cartRepository.clearCartItems(cart.id);
      return this.cartRepository.updateCartTotals(cart.id);
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }
}
