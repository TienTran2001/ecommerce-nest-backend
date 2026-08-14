import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductImage1786703850632 implements MigrationInterface {
    name = 'CreateProductImage1786703850632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_image" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product_id" uuid NOT NULL, "image_key" text NOT NULL, "alt_text" character varying(255), "display_order" integer NOT NULL DEFAULT '0', "is_primary" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_99d98a80f57857d51b5f63c8240" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dbc7d9aa7ed42c9141b968a9ed" ON "product_image"  ("product_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_primary_image_per_product" ON "product_image"  ("product_id") WHERE is_primary = true`);
        await queryRunner.query(`ALTER TABLE "product_image" ADD CONSTRAINT "FK_dbc7d9aa7ed42c9141b968a9ed3" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_image" DROP CONSTRAINT "FK_dbc7d9aa7ed42c9141b968a9ed3"`);
        await queryRunner.query(`DROP INDEX "public"."uq_primary_image_per_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dbc7d9aa7ed42c9141b968a9ed"`);
        await queryRunner.query(`DROP TABLE "product_image"`);
    }

}
