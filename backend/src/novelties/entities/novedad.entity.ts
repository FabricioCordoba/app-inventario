import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { EstadoNovedad } from '../../common/enums';
import { Inventario } from '../../inventories/entities/inventario.entity';
import { Unidad } from '../../units/entities/unidad.entity';
import { Sector } from '../../sectors/entities/sector.entity';
import { Material } from '../../materials/entities/material.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('novedades')
export class Novedad extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'inventario_id', type: 'bigint', unsigned: true, nullable: true })
  inventarioId: number | null;

  @Column({ name: 'unidad_id', type: 'bigint', unsigned: true })
  unidadId: number;

  @Column({ name: 'sector_id', type: 'bigint', unsigned: true, nullable: true })
  sectorId: number | null;

  @Column({ name: 'material_id', type: 'bigint', unsigned: true, nullable: true })
  materialId: number | null;

  @ManyToOne(() => Inventario, (inventario) => inventario.novedades, {
    nullable: true,
  })
  @JoinColumn({ name: 'inventario_id' })
  inventario: Inventario | null;

  @ManyToOne(() => Unidad, (unidad) => unidad.novedades, { nullable: false })
  @JoinColumn({ name: 'unidad_id' })
  unidad: Unidad;

  @ManyToOne(() => Sector, (sector) => sector.novedades, { nullable: true })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector | null;

  @ManyToOne(() => Material, (material) => material.novedades, { nullable: true })
  @JoinColumn({ name: 'material_id' })
  material: Material | null;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'registrado_por_id', type: 'bigint', unsigned: true })
  registradoPorId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.novedadesRegistradas, {
    nullable: false,
  })
  @JoinColumn({ name: 'registrado_por_id' })
  registradoPor: Usuario;

  @Column({ type: 'enum', enum: EstadoNovedad })
  estado: EstadoNovedad;

  @Column({ name: 'fecha_registro', type: 'datetime', precision: 3 })
  fechaRegistro: Date;

  @Column({ name: 'fecha_resolucion', type: 'datetime', precision: 3, nullable: true })
  fechaResolucion: Date | null;

  @Column({ name: 'resuelto_por_id', type: 'bigint', unsigned: true, nullable: true })
  resueltoPorId: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.novedadesResueltas, {
    nullable: true,
  })
  @JoinColumn({ name: 'resuelto_por_id' })
  resueltoPor: Usuario | null;

  @Column({ name: 'observacion_resolucion', type: 'text', nullable: true })
  observacionResolucion: string | null;
}
