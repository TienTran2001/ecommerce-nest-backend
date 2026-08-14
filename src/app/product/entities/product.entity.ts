import { Category } from "src/app/category/entities/category.entity";
import { BaseUuidEntity } from "src/config/database/base-uuid-entity";
import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { decimalColumn, nullableDecimalColumn } from "src/shared/utils/decimal-column.transformer";

@Entity()
@Index('idx_product_featured', ['isFeatured'], { 
  where: '"is_featured" = true AND "is_active" = true AND "deleted_at" IS NULL' 
})
export class Product extends BaseUuidEntity {
  @Index()
  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column(decimalColumn)
  price: number;

  @Column(nullableDecimalColumn)
  compareAtPrice: number | null;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  hasVariants: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAverage: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
  
  // Relations
  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

}
