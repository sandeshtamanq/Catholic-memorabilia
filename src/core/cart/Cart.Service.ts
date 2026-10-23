import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserType } from '../user/entities/UserType.Enum';
import { AddToCartDto } from './dto/AddToCartDto';
import { UpdateCartItemDto } from './dto/UpdateCartItemDto';
import { CartRepository } from './Cart.Repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  private normalizeGuestEmail(guestEmail?: string | null) {
    return guestEmail?.trim().toLowerCase() || null;
  }

  private async ensureGuestUser(guestEmail?: string | null) {
    const normalizedEmail =
      this.normalizeGuestEmail(guestEmail) ??
      `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@guest.local`;

    let guestUser = await this.cartRepository.findUserByEmail(normalizedEmail);

    if (!guestUser) {
      guestUser = await this.cartRepository.createGuestUser({
        firstName: 'Guest',
        lastName: 'Customer',
        email: normalizedEmail,
        contactNumber: '0000000000',
        password: await bcrypt.hash(
          `guest-${Date.now()}-${normalizedEmail}`,
          12,
        ),
        addressLine1: '',
        suburb: '',
        state: '',
        postcode: '',
        userType: UserType.Guest,
      });
    }

    return guestUser;
  }

  private async resolveUserId(
    userId: number | null,
    guestEmail?: string | null,
  ): Promise<number | null> {
    if (typeof userId === 'number' && Number.isFinite(userId)) {
      return userId;
    }

    const guestUser = await this.ensureGuestUser(guestEmail);
    return guestUser.id;
  }

  async getCart(userId: number | null, guestEmail?: string | null) {
    try {
      const resolvedUserId = await this.resolveUserId(userId, guestEmail);
      if (!resolvedUserId) {
        return null;
      }

      let cart = await this.cartRepository.findCartByUserId(resolvedUserId);

      if (!cart) {
        cart = await this.cartRepository.createCart(resolvedUserId);
      }

      return cart;
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async addItem(
    userId: number | null,
    addToCartDto: AddToCartDto,
    guestEmail?: string | null,
  ) {
    try {
      const resolvedUserId = await this.resolveUserId(userId, guestEmail);
      if (!resolvedUserId) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const product = await this.cartRepository.getProductById(
        addToCartDto.productId,
      );

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let cart = await this.cartRepository.findCartByUserId(resolvedUserId);

      if (!cart) {
        cart = await this.cartRepository.createCart(resolvedUserId);
      }

      const existingItem = await this.cartRepository.findCartItemByProduct(
        cart.id,
        addToCartDto.productId,
      );

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async updateItemQuantity(
    userId: number | null,
    productId: number,
    updateCartItemDto: UpdateCartItemDto,
    guestEmail?: string | null,
  ) {
    try {
      const resolvedUserId = await this.resolveUserId(
        userId,
        guestEmail ?? updateCartItemDto.guestEmail,
      );
      if (!resolvedUserId) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const cart = (await this.getCart(resolvedUserId)) as any;
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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async removeItem(
    userId: number | null,
    productId: number,
    guestEmail?: string | null,
  ) {
    try {
      const resolvedUserId = await this.resolveUserId(userId, guestEmail);
      if (!resolvedUserId) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const cart = (await this.getCart(resolvedUserId)) as any;
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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async clearCart(userId: number | null, guestEmail?: string | null) {
    try {
      const resolvedUserId = await this.resolveUserId(userId, guestEmail);
      if (!resolvedUserId) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const cart = (await this.getCart(resolvedUserId)) as any;
      await this.cartRepository.clearCartItems(cart.id);
      return this.cartRepository.updateCartTotals(cart.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }
}
