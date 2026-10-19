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
import { OrderItem } from './OrderItem.Entity';

@Entity('orders')
export class Order {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  userId?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  guestName?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  guestEmail?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  guestPhone?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  deliveryAddress?: string;

  @ApiProperty()
  @Column({ type: 'varchar', default: 'PENDING' })
  orderStatus: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty()
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

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
