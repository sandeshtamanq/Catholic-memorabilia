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
  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  contactNumber: number;

  @ApiProperty()
  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  address: string;

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
