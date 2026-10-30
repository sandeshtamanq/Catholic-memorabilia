import { join } from 'path';
import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => {
  const databasePort = Number(process.env.DATABASE_PORT ?? 5432);
  const migrationsRun =
    (process.env.DATABASE_MIGRATIONS_RUN ?? 'false').toLowerCase() === 'true';
  const synchronize =
    (process.env.DATABASE_SYNC ?? 'false').toLowerCase() === 'true';

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: databasePort,
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'postgres',
    migrationsRun,
    entities: [join(__dirname, '../**', '*.Entity.{ts,js}')],
    migrations: [join(__dirname, '../migrations/*.{ts,js}')],
    migrationsTableName: 'migrations',
    synchronize,
  };
});
