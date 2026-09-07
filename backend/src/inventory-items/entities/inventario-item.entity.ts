import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import {
  EstadoMaterial,
  TipoControl,
  UnidadMedida,
} from '../../common/enums';
import { Inventario } from '../../inventories/entities/inventario.entity';
import { UnidadMaterial } from '../../unit-materials/entities/unidad-material.entity';
import { Material } from '../../materials/entities/material.entity';
import { Sector } from '../../sectors/entities/sector.entity';
import { InventarioItemInstancia } from '../../inventory-item-instances/entities/inventario-item-instancia.entity';

@Entity('inventario_items')
export class InventarioItem extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'inventario_id', type: 'bigint', unsigned: true })
  inventarioId: number;

  @Column({ name: 'unidad_material_id', type: 'bigint', unsigned: true, nullable: true })
  unidadMaterialId: number | null;

  @Column({ name: 'material_id', type: 'bigint', unsigned: true })
  materialId: number;

  @Column({ name: 'sector_id', type: 'bigint', unsigned: true })
  sectorId: number;

  @ManyToOne(() => Inventario, (inventario) => inventario.items, {
    nullable: false,
  })
  @JoinColumn({ name: 'inventario_id' })
  inventario: Inventario;

  @ManyToOne(() => UnidadMaterial, (unidadMaterial) => unidadMaterial.inventarioItems, {
    nullable: true,
  })
  @JoinColumn({ name: 'unidad_material_id' })
  unidadMaterial: UnidadMaterial | null;

  @ManyToOne(() => Material, (material) => material.inventarioItems, {
    nullable: false,
  })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @ManyToOne(() => Sector, (sector) => sector.inventarioItems, {
    nullable: false,
  })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @Column({ name: 'material_nombre', type: 'varchar', length: 150 })
  materialNombre: string;

  @Column({ name: 'sector_nombre', type: 'varchar', length: 100 })
  sectorNombre: string;

  @Column({ name: 'tipo_control', type: 'enum', enum: TipoControl })
  tipoControl: TipoControl;

  @Column({
    name: 'cantidad_requerida',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cantidadRequerida: number | null;

  @Column({
    name: 'cantidad_encontrada',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cantidadEncontrada: number | null;

  @Column({
    name: 'valor_nominal',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
  })
  valorNominal: number | null;

  @Column({
    name: 'valor_medido',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
  })
  valorMedido: number | null;

  @Column({
    name: 'valor_minimo',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
  })
  valorMinimo: number | null;

  @Column({ name: 'unidad_medida', type: 'enum', enum: UnidadMedida })
  unidadMedida: UnidadMedida;

  @Column({ type: 'enum', enum: EstadoMaterial })
  estado: EstadoMaterial;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @OneToMany(() => InventarioItemInstancia, (instancia) => instancia.inventarioItem)
  instancias: InventarioItemInstancia[];
}
