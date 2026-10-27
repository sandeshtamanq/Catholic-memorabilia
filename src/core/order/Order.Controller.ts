import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../lib/decorators/Public.Decorator';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { OrderService } from './Order.Service';

@ApiTags('orders')
@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Public()
  @Post()
  createOrder(
    @CurrentUser() userId: number | null,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getOrders(@CurrentUser() userId: number, @Req() req: any) {
    return this.orderService.getOrders(userId, req.user?.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrderById(
    @CurrentUser() userId: number,
    @Req() req: any,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.getOrderById(userId, orderId, req.user?.role);
  }
}
