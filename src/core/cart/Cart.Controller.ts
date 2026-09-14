import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { AddToCartDto } from './dto/AddToCartDto';
import { UpdateCartItemDto } from './dto/UpdateCartItemDto';
import { CartService } from './Cart.Service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@CurrentUser() userId: number) {
    return this.cartService.getCart(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('items')
  addItem(@CurrentUser() userId: number, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(userId, addToCartDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('items/:productId')
  updateItemQuantity(
    @CurrentUser() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(
      userId,
      productId,
      updateCartItemDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('items/:productId')
  removeItem(
    @CurrentUser() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  clearCart(@CurrentUser() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
