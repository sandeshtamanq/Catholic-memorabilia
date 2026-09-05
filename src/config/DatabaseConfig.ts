import { join } from 'path';
import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN,
    entities: [join(__dirname, '../**', '*.Entity.{ts,js}')],
    migrationsTableName: 'migrations',
    synchronize: process.env.DATABASE_SYNC,
  };
});
