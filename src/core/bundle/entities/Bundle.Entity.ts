import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BundleItem } from './BundleItem.Entity';
import { BundleStatus } from './BundleStatus.Enum';

@Entity('bundles')
export class Bundle {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fixedPrice: number;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @ApiProperty({ enum: BundleStatus, default: BundleStatus.Draft })
  @Column({
    type: 'enum',
    enum: BundleStatus,
    default: BundleStatus.Draft,
  })
  status: BundleStatus;

  @ApiProperty({ type: () => [BundleItem] })
  @OneToMany(() => BundleItem, (bundleItem) => bundleItem.bundle, {
    cascade: true,
    eager: true,
  })
  items: BundleItem[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
