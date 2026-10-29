import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderNumberToOrders1750000000000 implements MigrationInterface {
  name = 'AddOrderNumberToOrders1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "orderNumber" character varying;
    `);

    await queryRunner.query(`
      UPDATE "orders"
      SET "orderNumber" = '#order' || "id"
      WHERE "orderNumber" IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "orderNumber" SET NOT NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_orders_orderNumber"
      ON "orders" ("orderNumber");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_orders_orderNumber";
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" DROP COLUMN IF EXISTS "orderNumber";
    `);
  }
}
