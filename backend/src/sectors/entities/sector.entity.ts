import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Unidad } from '../../units/entities/unidad.entity';
import { UnidadMaterial } from '../../unit-materials/entities/unidad-material.entity';
import { InventarioItem } from '../../inventory-items/entities/inventario-item.entity';
import { Novedad } from '../../novelties/entities/novedad.entity';

@Entity('sectores')
export class Sector extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'unidad_id', type: 'bigint', unsigned: true })
  unidadId: number;

  @ManyToOne(() => Unidad, (unidad) => unidad.sectores, { nullable: false })
  @JoinColumn({ name: 'unidad_id' })
  unidad: Unidad;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @Column({ type: 'smallint', unsigned: true, default: 0 })
  orden: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => UnidadMaterial, (unidadMaterial) => unidadMaterial.sector)
  unidadMateriales: UnidadMaterial[];

  @OneToMany(() => InventarioItem, (item) => item.sector)
  inventarioItems: InventarioItem[];

  @OneToMany(() => Novedad, (novedad) => novedad.sector)
  novedades: Novedad[];
}
