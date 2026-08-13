import { BaseUuidEntity } from "src/config/database/base-uuid-entity";
import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Category extends BaseUuidEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  imageKey: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: false, default: 0 })
  displayOrder: number;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
  
  // Relations
  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];


}
