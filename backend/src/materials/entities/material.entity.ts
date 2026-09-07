import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { TipoControl, UnidadMedida } from '../../common/enums';
import { UnidadMaterial } from '../../unit-materials/entities/unidad-material.entity';
import { InventarioItem } from '../../inventory-items/entities/inventario-item.entity';
import { Novedad } from '../../novelties/entities/novedad.entity';

@Entity('materiales')
export class Material extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'tipo_control', type: 'enum', enum: TipoControl })
  tipoControl: TipoControl;

  @Column({ name: 'unidad_medida', type: 'enum', enum: UnidadMedida })
  unidadMedida: UnidadMedida;

  @Column({ name: 'requiere_instancias', type: 'boolean', default: false })
  requiereInstancias: boolean;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => UnidadMaterial, (unidadMaterial) => unidadMaterial.material)
  unidadMateriales: UnidadMaterial[];

  @OneToMany(() => InventarioItem, (item) => item.material)
  inventarioItems: InventarioItem[];

  @OneToMany(() => Novedad, (novedad) => novedad.material)
  novedades: Novedad[];
}
