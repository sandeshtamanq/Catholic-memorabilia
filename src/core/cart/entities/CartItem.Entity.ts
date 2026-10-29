import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/Product.Entity';
import { Cart } from './Cart.Entity';

@Entity('cart_items')
export class CartItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: false })
  cartId: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: false })
  productId: number;

  @ApiProperty({ type: () => Product })
  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty()
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  netPrice: number;

  @ApiProperty({ type: 'number', required: false })
  get originalPrice(): number {
    const originalProductPrice = Number(
      this.product?.productPrice ??
        this.product?.netPrice ??
        this.unitPrice ??
        0,
    );

    return Number.isFinite(originalProductPrice) ? originalProductPrice : 0;
  }

  @ApiProperty({ type: 'number', required: false })
  get discountAmount(): number {
    const originalPrice = this.originalPrice;
    const effectivePrice = Number(this.netPrice ?? this.unitPrice ?? 0);
    const quantity = Number(this.quantity ?? 1);

    return Number(
      (Math.max(originalPrice - effectivePrice, 0) * quantity).toFixed(2),
    );
  }

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;
}
