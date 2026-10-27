import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserType } from '../user/entities/UserType.Enum';
import { AddToCartDto } from './dto/AddToCartDto';
import { UpdateCartItemDto } from './dto/UpdateCartItemDto';
import { CartRepository } from './Cart.Repository';
import { UserActivity } from '../activity/entities/UserActivity.Entity';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  private normalizeGuestEmail(guestEmail?: string | null) {
    return guestEmail?.trim().toLowerCase() || null;
  }

  private normalizeCartToken(cartToken?: string | null) {
    return cartToken?.trim() || null;
  }

  private async resolveCartOwner(
    userId: number | null,
    guestEmail?: string | null,
    cartToken?: string | null,
  ) {
    if (typeof userId === 'number' && Number.isFinite(userId)) {
      return { type: 'user' as const, userId };
    }

    const normalizedCartToken = this.normalizeCartToken(cartToken);
    if (normalizedCartToken) {
      return { type: 'guest' as const, guestToken: normalizedCartToken };
    }

    const normalizedGuestEmail = this.normalizeGuestEmail(guestEmail);
    if (normalizedGuestEmail) {
      return { type: 'guest' as const, guestToken: normalizedGuestEmail };
    }

    return null;
  }

  async mergeGuestCartIntoUser(userId: number, cartToken?: string | null) {
    if (!userId) {
      return null;
    }

    const normalizedCartToken = this.normalizeCartToken(cartToken);
    if (!normalizedCartToken) {
      return null;
    }

    const guestCart =
      await this.cartRepository.findCartByGuestToken(normalizedCartToken);

    if (!guestCart) {
      return null;
    }

    const mergedCart = await this.cartRepository.mergeGuestCartIntoUser(
      normalizedCartToken,
      userId,
    );

    return mergedCart ?? guestCart;
  }

  async getCart(
    userId: number | null,
    guestEmail?: string | null,
    cartToken?: string | null,
  ) {
    try {
      const owner = await this.resolveCartOwner(userId, guestEmail, cartToken);
      if (!owner) {
        return null;
      }

      if (owner.type === 'user') {
        let cart = await this.cartRepository.findCartByUserId(owner.userId);

        if (!cart) {
          cart = await this.cartRepository.createCart(owner.userId);
        }

        return cart;
      }

      let cart = await this.cartRepository.findCartByGuestToken(
        owner.guestToken,
      );

      if (!cart) {
        cart = await this.cartRepository.createCartForGuest(owner.guestToken);
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
    cartToken?: string | null,
  ) {
    try {
      const owner = await this.resolveCartOwner(userId, guestEmail, cartToken);
      if (!owner) {
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

      let cart =
        owner.type === 'user'
          ? await this.cartRepository.findCartByUserId(owner.userId)
          : await this.cartRepository.findCartByGuestToken(owner.guestToken);

      if (!cart) {
        cart =
          owner.type === 'user'
            ? await this.cartRepository.createCart(owner.userId)
            : await this.cartRepository.createCartForGuest(owner.guestToken);
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
      } else {
        await this.cartRepository.saveCartItem({
          cartId: cart.id,
          productId: product.id,
          quantity: addToCartDto.quantity,
          unitPrice,
          totalPrice: Number((addToCartDto.quantity * unitPrice).toFixed(2)),
        });
      }

      await this.userActivityRepository.save({
        moduleName: 'cart',
        action: 'ADD_TO_CART',
        userId: owner.type === 'user' ? owner.userId : null,
        productId: product.id,
        description: `User added ${product.productName} to cart`,
        metadata: {
          quantity: addToCartDto.quantity,
          unitPrice,
          productName: product.productName,
          guestToken: owner.type === 'guest' ? owner.guestToken : null,
        },
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
    cartToken?: string | null,
  ) {
    try {
      const owner = await this.resolveCartOwner(
        userId,
        guestEmail ?? updateCartItemDto.guestEmail,
        cartToken,
      );
      if (!owner) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const cart = (await this.getCart(
        owner.type === 'user' ? owner.userId : null,
        null,
        owner.type === 'guest' ? owner.guestToken : null,
      )) as any;
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
    cartToken?: string | null,
  ) {
    try {
      const owner = await this.resolveCartOwner(userId, guestEmail, cartToken);
      if (!owner) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const cart = (await this.getCart(
        owner.type === 'user' ? owner.userId : null,
        null,
        owner.type === 'guest' ? owner.guestToken : null,
      )) as any;
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

  async clearCart(
    userId: number | null,
    guestEmail?: string | null,
    cartToken?: string | null,
  ) {
    try {
      const owner = await this.resolveCartOwner(userId, guestEmail, cartToken);
      if (!owner) {
        throw new BadRequestException(
          'Unable to resolve a cart owner for this guest session',
        );
      }

      const cart = (await this.getCart(
        owner.type === 'user' ? owner.userId : null,
        null,
        owner.type === 'guest' ? owner.guestToken : null,
      )) as any;
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
