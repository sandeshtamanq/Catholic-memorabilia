import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/Product.Entity';
import { User } from '../../user/entities/User.Entity';

@Entity('user_activities')
export class UserActivity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false, length: 50 })
  moduleName: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false, length: 80 })
  action: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', nullable: true })
  productId: number | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true, type: 'object' })
  @Column({ type: 'jsonb', nullable: true, default: null })
  metadata: Record<string, any> | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;
}
