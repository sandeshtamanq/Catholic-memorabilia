import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './UserRole.Enum';
import { UserType } from './UserType.Enum';
import { Cart } from '../../cart/entities/Cart.Entity';
@Entity({ name: 'users' })
@Unique(['email'])
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  middleName?: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  contactNumber: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  addressLine1: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  addressLine2?: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  suburb: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  state: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  postcode: string;

  @ApiProperty()
  @Column({ type: 'varchar', default: UserRole.User })
  role: UserRole;

  @ApiProperty({ nullable: true, type: 'date' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date | null;

  @ApiProperty()
  @Column({ type: 'varchar', default: UserType.Regular })
  userType: UserType;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Cart, (cart) => cart.user)
  user: Cart[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  profileImageUrl: string;

  //virtual property
  @ApiProperty()
  fullName: string;
}
