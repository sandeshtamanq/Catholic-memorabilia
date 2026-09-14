import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CartItem, CartService } from './Cart.Service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(['cart', 'me/cart'])
  getCart(@Req() req: Request, @Res() response: Response) {
    const guestId = this.getGuestKey(req);
    const userId = Number((req as any).user?.id);

    const cart = userId
      ? this.cartService.getUserCart(userId)
      : this.cartService.getGuestCart(guestId);

    return response.send({ cart, isGuest: !userId && !!guestId });
  }

  @Post(['cart', 'me/cart'])
  addToCart(
    @Req() req: Request,
    @Body() body: Partial<CartItem>,
    @Res() response: Response,
  ) {
    const guestId = this.getGuestKey(req);
    const userId = Number((req as any).user?.id);
    const item = {
      id: body.id ?? `${body.productId ?? 'guest'}-${Date.now()}`,
      productId: body.productId,
      name: body.name,
      price: Number(body.price ?? 0),
      quantity: Number(body.quantity ?? 1),
    };

    const cart = userId
      ? this.cartService.addItemToUserCart(userId, item)
      : this.cartService.addItemToGuestCart(guestId ?? `guest-${Date.now()}`, item);

    return response.send({ cart, isGuest: !userId });
  }

  @Delete(['cart/:id', 'me/cart/:id'])
  removeFromCart(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const guestId = this.getGuestKey(req);
    const userId = Number((req as any).user?.id);

    if (userId) {
      const cart = this.cartService
        .getUserCart(userId)
        .filter((item) => item.id !== id && item.productId !== id);
      this.cartService.setUserCart(userId, cart);
      return response.send({ cart, isGuest: false });
    }

    const cart = this.cartService
      .getGuestCart(guestId)
      .filter((item) => item.id !== id && item.productId !== id);
    this.cartService.setGuestCart(guestId ?? `guest-${Date.now()}`, cart);
    return response.send({ cart, isGuest: true });
  }

  private getGuestKey(req: Request): string | undefined {
    return (req as any)?.cookies?.guestId ?? (req as any)?.headers?.['x-guest-id'];
  }
}
