import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBundles1710000000000 implements MigrationInterface {
  name = 'CreateBundles1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bundle_status_enum') THEN
          CREATE TYPE "bundle_status_enum" AS ENUM ('draft', 'active', 'inactive');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bundles" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "fixedPrice" numeric(10,2) NOT NULL DEFAULT '0',
        "sku" character varying(120) NOT NULL,
        "imageUrl" character varying(255),
        "stockQuantity" integer NOT NULL DEFAULT '0',
        "status" "bundle_status_enum" NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_bundles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_bundles_sku" UNIQUE ("sku")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bundle_items" (
        "id" SERIAL NOT NULL,
        "bundleId" integer NOT NULL,
        "productId" integer NOT NULL,
        "quantity" integer NOT NULL DEFAULT '1',
        CONSTRAINT "PK_bundle_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_bundle_items_bundle_product" UNIQUE ("bundleId", "productId"),
        CONSTRAINT "FK_bundle_items_bundle" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bundle_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT,
        CONSTRAINT "CHK_bundle_items_quantity" CHECK ("quantity" > 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bundle_items"`);
    await queryRunner.query(`DROP TABLE "bundles"`);
    await queryRunner.query(`DROP TYPE "bundle_status_enum"`);
  }
}
