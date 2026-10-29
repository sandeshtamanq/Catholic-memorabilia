import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/Product.Entity';
import { Bundle } from './Bundle.Entity';

@Entity('bundle_items')
@Index(['bundleId', 'productId'], { unique: true })
export class BundleItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: false })
  bundleId: number;

  @ManyToOne(() => Bundle, (bundle) => bundle.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundleId' })
  bundle: Bundle;

  @ApiProperty()
  @Column({ type: 'int', nullable: false })
  productId: number;

  @ManyToOne(() => Product, (product) => product.bundleItems, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty()
  @Column({ type: 'int', nullable: false, default: 1 })
  quantity: number;
}
