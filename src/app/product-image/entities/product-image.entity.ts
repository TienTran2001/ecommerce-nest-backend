import { Product } from 'src/app/product/entities/product.entity';
import { BaseUuidEntity } from 'src/config/database/base-uuid-entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('uq_primary_image_per_product', ['productId'], {
  unique: true,
  where: 'is_primary = true',
})
@Entity()
export class ProductImage extends BaseUuidEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'text', nullable: false })
  imageKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText: string | null;

  @Column({ type: 'int', nullable: false, default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  isPrimary: boolean;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
