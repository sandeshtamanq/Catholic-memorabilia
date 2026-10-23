import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'api_access_logs' })
export class ApiAccessLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, nullable: false })
  method: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: false })
  path: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  route?: string;

  @ApiProperty()
  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId?: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 64, nullable: true })
  role?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  query?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  params?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  body?: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'int', nullable: true, name: 'status_code' })
  statusCode?: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: true, name: 'response_time_ms' })
  responseTimeMs?: number;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
