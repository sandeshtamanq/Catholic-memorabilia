import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../entities/OrderStatus.Enum';

export class ChangeOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.Pending,
    description: 'New status to apply to the order',
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
