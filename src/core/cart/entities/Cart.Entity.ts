import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/User.Entity';
import { CartItem } from './CartItem.Entity';

@Entity('carts')
export class Cart {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  userId?: number | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true, unique: true })
  guestToken?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({ type: 'number', required: false })
  get totalDiscountAmount(): number {
    if (!Array.isArray(this.items) || !this.items.length) {
      return 0;
    }

    return Number(
      this.items
        .reduce((sum, item) => sum + Number(item.discountAmount ?? 0), 0)
        .toFixed(2),
    );
  }

  @ApiProperty({ type: 'number', required: false })
  get shippingCharge(): number {
    return this.totalAmount > 0 ? 50 : 0;
  }

  @ApiProperty({ type: 'number', required: false })
  get netPayableAmount(): number {
    return Number((this.totalAmount + this.shippingCharge).toFixed(2));
  }

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
