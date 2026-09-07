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
import { Sector } from '../../sectors/entities/sector.entity';
import { Material } from '../../materials/entities/material.entity';
import { UnidadMaterialInstancia } from '../../unit-material-instances/entities/unidad-material-instancia.entity';
import { InventarioItem } from '../../inventory-items/entities/inventario-item.entity';

@Entity('unidad_materiales')
export class UnidadMaterial extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'unidad_id', type: 'bigint', unsigned: true })
  unidadId: number;

  @Column({ name: 'material_id', type: 'bigint', unsigned: true })
  materialId: number;

  @Column({ name: 'sector_id', type: 'bigint', unsigned: true })
  sectorId: number;

  @ManyToOne(() => Unidad, (unidad) => unidad.unidadMateriales, {
    nullable: false,
  })
  @JoinColumn({ name: 'unidad_id' })
  unidad: Unidad;

  @ManyToOne(() => Material, (material) => material.unidadMateriales, {
    nullable: false,
  })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @ManyToOne(() => Sector, (sector) => sector.unidadMateriales, {
    nullable: false,
  })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @Column({
    name: 'cantidad_requerida',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  cantidadRequerida: number;

  @Column({
    name: 'valor_nominal',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
  })
  valorNominal: number | null;

  @Column({
    name: 'valor_minimo',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
  })
  valorMinimo: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(
    () => UnidadMaterialInstancia,
    (instancia) => instancia.unidadMaterial,
  )
  instancias: UnidadMaterialInstancia[];

  @OneToMany(() => InventarioItem, (item) => item.unidadMaterial)
  inventarioItems: InventarioItem[];
}
