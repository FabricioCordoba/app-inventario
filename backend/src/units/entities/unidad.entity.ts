import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { EstadoUnidad } from '../../common/enums';
import { Sector } from '../../sectors/entities/sector.entity';
import { UnidadMaterial } from '../../unit-materials/entities/unidad-material.entity';
import { Inventario } from '../../inventories/entities/inventario.entity';
import { Novedad } from '../../novelties/entities/novedad.entity';

@Entity('unidades')
export class Unidad extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  numero: string;

  @Column({ type: 'varchar', length: 80 })
  tipo: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  marca: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  modelo: string | null;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  anio: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dominio: string | null;

  @Column({ type: 'enum', enum: EstadoUnidad })
  estado: EstadoUnidad;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => Sector, (sector) => sector.unidad)
  sectores: Sector[];

  @OneToMany(() => UnidadMaterial, (unidadMaterial) => unidadMaterial.unidad)
  unidadMateriales: UnidadMaterial[];

  @OneToMany(() => Inventario, (inventario) => inventario.unidad)
  inventarios: Inventario[];

  @OneToMany(() => Novedad, (novedad) => novedad.unidad)
  novedades: Novedad[];
}
