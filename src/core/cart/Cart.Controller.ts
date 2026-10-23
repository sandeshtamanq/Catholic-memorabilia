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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

  @Public()
  @Get()
  getCart(@CurrentUser() userId: number | null, @Req() req: any) {
    return this.cartService.getCart(userId, this.getGuestEmailFromRequest(req));
  }

  @Public()
  @Post('items')
  addItem(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addItem(
      userId,
      addToCartDto,
      this.getGuestEmailFromRequest(req) ?? addToCartDto.guestEmail,
    );
  }

  @Public()
  @Patch('items/:productId')
  updateItemQuantity(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(
      userId,
      productId,
      updateCartItemDto,
      this.getGuestEmailFromRequest(req) ?? updateCartItemDto.guestEmail,
    );
  }

  @Public()
  @Delete('items/:productId')
  removeItem(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('guestEmail') guestEmail?: string,
  ) {
    return this.cartService.removeItem(
      userId,
      productId,
      this.getGuestEmailFromRequest(req) ?? guestEmail,
    );
  }

  @Public()
  @Delete()
  clearCart(
    @CurrentUser() userId: number | null,
    @Req() req: any,
    @Query('guestEmail') guestEmail?: string,
  ) {
    return this.cartService.clearCart(
      userId,
      this.getGuestEmailFromRequest(req) ?? guestEmail,
    );
  }
}
