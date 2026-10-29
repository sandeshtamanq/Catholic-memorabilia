import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { Public } from '../../lib/decorators/Public.Decorator';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { AddToCartDto } from './dto/AddToCartDto';
import { UpdateCartItemDto } from './dto/UpdateCartItemDto';
import { CartService } from './Cart.Service';

@ApiTags('cart')
@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getGuestEmailFromRequest(req: any): string | null {
    return (
      req?.query?.guestEmail ??
      req?.headers?.['x-guest-email'] ??
      req?.headers?.['X-GUEST-EMAIL'] ??
      null
    );
  }

  private getCartTokenFromRequest(req: any): string | null {
    return (
      req?.cookies?.cart_token ??
      req?.cookies?.cartToken ??
      req?.query?.cartToken ??
      req?.headers?.['x-cart-token'] ??
      null
    );
  }

  private ensureCartTokenCookie(
    req: any,
    res: Response,
    userId?: number | null,
  ) {
    if (userId) {
      return null;
    }

    const token = this.getCartTokenFromRequest(req);
    if (token) {
      return token;
    }

    const newToken = randomUUID();
    res.cookie('cart_token', newToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return newToken;
  }

  @Get()
  getCart(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(userId, 'hello');
    const cartToken = this.ensureCartTokenCookie(req, response, userId);
    return this.cartService.getCart(
      userId,
      this.getGuestEmailFromRequest(req),
      cartToken,
    );
  }

  @Public()
  @Post('items')
  addItem(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const cartToken = this.ensureCartTokenCookie(req, response, userId);
    return this.cartService.addItem(
      userId,
      addToCartDto,
      this.getGuestEmailFromRequest(req),
      cartToken,
    );
  }

  @Public()
  @Patch('items/:productId')
  updateItemQuantity(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const cartToken = this.ensureCartTokenCookie(req, response, userId);
    return this.cartService.updateItemQuantity(
      userId,
      productId,
      updateCartItemDto,
      this.getGuestEmailFromRequest(req) ?? updateCartItemDto.guestEmail,
      cartToken,
    );
  }

  @Public()
  @Delete('items/:productId')
  removeItem(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('guestEmail') guestEmail?: string,
  ) {
    const cartToken = this.ensureCartTokenCookie(req, response, userId);
    return this.cartService.removeItem(
      userId,
      productId,
      this.getGuestEmailFromRequest(req) ?? guestEmail,
      cartToken,
    );
  }

  @Public()
  @Delete()
  clearCart(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
    @Query('guestEmail') guestEmail?: string,
  ) {
    const cartToken = this.ensureCartTokenCookie(req, response, userId);
    return this.cartService.clearCart(
      userId,
      this.getGuestEmailFromRequest(req) ?? guestEmail,
      cartToken,
    );
  }
}
