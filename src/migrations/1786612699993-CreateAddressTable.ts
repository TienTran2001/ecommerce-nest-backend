import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAddressTable1786612699993 implements MigrationInterface {
    name = 'CreateAddressTable1786612699993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "full_name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "address_line1" character varying(255) NOT NULL, "address_line2" character varying(255), "ward" character varying(100) NOT NULL, "district" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "postal_code" character varying(20), "is_default" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_35cd6c3fafec0bb5d072e24ea2" ON "address"  ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "user_default_address" ON "address"  ("user_id") WHERE "is_default" = true AND "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20"`);
        await queryRunner.query(`DROP INDEX "public"."user_default_address"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35cd6c3fafec0bb5d072e24ea2"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}
