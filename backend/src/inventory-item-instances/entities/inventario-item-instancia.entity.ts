import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { EstadoMaterial } from '../../common/enums';
import { InventarioItem } from '../../inventory-items/entities/inventario-item.entity';
import { UnidadMaterialInstancia } from '../../unit-material-instances/entities/unidad-material-instancia.entity';

@Entity('inventario_item_instancias')
export class InventarioItemInstancia extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'inventario_item_id', type: 'bigint', unsigned: true })
  inventarioItemId: number;

  @Column({
    name: 'unidad_material_instancia_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  unidadMaterialInstanciaId: number | null;

  @ManyToOne(() => InventarioItem, (item) => item.instancias, {
    nullable: false,
  })
  @JoinColumn({ name: 'inventario_item_id' })
  inventarioItem: InventarioItem;

  @ManyToOne(
    () => UnidadMaterialInstancia,
    (instancia) => instancia.inventarioItemInstancias,
    { nullable: true },
  )
  @JoinColumn({ name: 'unidad_material_instancia_id' })
  unidadMaterialInstancia: UnidadMaterialInstancia | null;

  @Column({ type: 'varchar', length: 50 })
  identificador: string;

  @Column({ name: 'numero_serie', type: 'varchar', length: 100, nullable: true })
  numeroSerie: string | null;

  @Column({
    name: 'valor_medido',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
  })
  valorMedido: number | null;

  @Column({ type: 'enum', enum: EstadoMaterial })
  estado: EstadoMaterial;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;
}
