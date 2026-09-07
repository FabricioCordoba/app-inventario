import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { UnidadMaterial } from '../../unit-materials/entities/unidad-material.entity';
import { InventarioItemInstancia } from '../../inventory-item-instances/entities/inventario-item-instancia.entity';

@Entity('unidad_material_instancias')
export class UnidadMaterialInstancia extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'unidad_material_id', type: 'bigint', unsigned: true })
  unidadMaterialId: number;

  @ManyToOne(
    () => UnidadMaterial,
    (unidadMaterial) => unidadMaterial.instancias,
    { nullable: false },
  )
  @JoinColumn({ name: 'unidad_material_id' })
  unidadMaterial: UnidadMaterial;

  @Column({ type: 'varchar', length: 50 })
  identificador: string;

  @Column({ name: 'numero_serie', type: 'varchar', length: 100, nullable: true })
  numeroSerie: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(
    () => InventarioItemInstancia,
    (itemInstancia) => itemInstancia.unidadMaterialInstancia,
  )
  inventarioItemInstancias: InventarioItemInstancia[];
}
