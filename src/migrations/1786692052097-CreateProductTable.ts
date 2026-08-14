import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTable1786692052097 implements MigrationInterface {
    name = 'CreateProductTable1786692052097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "short_description" text, "description" text, "slug" character varying(255) NOT NULL, "price" numeric(18,2) NOT NULL, "compare_at_price" numeric(18,2), "stock_quantity" integer NOT NULL DEFAULT '0', "sku" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_featured" boolean NOT NULL DEFAULT false, "has_variants" boolean NOT NULL DEFAULT false, "view_count" integer NOT NULL DEFAULT '0', "rating_average" numeric(3,2) NOT NULL DEFAULT '0', "review_count" integer NOT NULL DEFAULT '0', "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_8cfaf4a1e80806d58e3dbe69224" UNIQUE ("slug"), CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0dce9bc93c2d2c399982d04bef" ON "product"  ("category_id") `);
        await queryRunner.query(`CREATE INDEX "idx_product_featured" ON "product"  ("is_featured") WHERE "is_featured" = true AND "is_active" = true AND "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`);
        await queryRunner.query(`DROP INDEX "public"."idx_product_featured"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dce9bc93c2d2c399982d04bef"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
