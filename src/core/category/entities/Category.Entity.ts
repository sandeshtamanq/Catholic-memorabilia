import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/Product.Entity';
// import { Product } from '../../product/entities/Product.Entity';

@Entity('categories')
export class Category {
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

  @OneToMany(() => Product, (product) => product.category, {
    onDelete: 'RESTRICT',
  })
  products: Product[];

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  categoryName: string;

  @BeforeInsert()
  capitalizeName(): void {
    this.categoryName =
      this.categoryName[0].toUpperCase() +
      this.categoryName.toLowerCase().slice(1);
  }
}
