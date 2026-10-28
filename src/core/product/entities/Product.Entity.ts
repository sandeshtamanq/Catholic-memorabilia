import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../category/entities/Category.Entity';
import { ProductReview } from '../../review/entities/ProductReview.Entity';

@Entity('products')
export class Product {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @OneToMany(() => ProductReview, (review) => review.product)
  reviews: ProductReview[];

  @ApiProperty()
  @Column({ type: 'number', nullable: false })
  categoryId: number;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  productName: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 4000, nullable: false })
  productDescription: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  productImageUrl: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Small', 'Medium', 'Large'],
  })
  @Column({ type: 'simple-array', nullable: true })
  sizes?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Black', 'White', 'Red'],
  })
  @Column({ type: 'simple-array', nullable: true })
  colors?: string[];

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  productPrice: string;

  @ApiProperty()
  @Column({ type: 'varchar', default: 0 })
  quantity: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'float', nullable: false, default: 0 })
  discountPercentage: number;

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', nullable: false, default: false })
  hasDiscount: boolean;

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', nullable: false, default: false })
  hasOffer: boolean;

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', nullable: false, default: false })
  isFeatured: boolean;
}
