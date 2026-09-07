import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { EstadoInventario } from '../../common/enums';
import { Unidad } from '../../units/entities/unidad.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { InventarioParticipante } from '../../inventory-participants/entities/inventario-participante.entity';
import { InventarioItem } from '../../inventory-items/entities/inventario-item.entity';
import { Novedad } from '../../novelties/entities/novedad.entity';

@Entity('inventarios')
export class Inventario extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'unidad_id', type: 'bigint', unsigned: true })
  unidadId: number;

  @Column({ name: 'responsable_id', type: 'bigint', unsigned: true })
  responsableId: number;

  @ManyToOne(() => Unidad, (unidad) => unidad.inventarios, { nullable: false })
  @JoinColumn({ name: 'unidad_id' })
  unidad: Unidad;

  @ManyToOne(() => Usuario, (usuario) => usuario.inventariosResponsable, {
    nullable: false,
  })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario;

  @Column({ name: 'fecha_inicio', type: 'datetime', precision: 3 })
  fechaInicio: Date;

  @Column({ name: 'fecha_cierre', type: 'datetime', precision: 3, nullable: true })
  fechaCierre: Date | null;

  @Column({ type: 'enum', enum: EstadoInventario })
  estado: EstadoInventario;

  @Column({ name: 'observaciones_generales', type: 'text', nullable: true })
  observacionesGenerales: string | null;

  @Column({ name: 'confirmado_at', type: 'datetime', precision: 3, nullable: true })
  confirmadoAt: Date | null;

  @OneToMany(() => InventarioParticipante, (participante) => participante.inventario)
  participantes: InventarioParticipante[];

  @OneToMany(() => InventarioItem, (item) => item.inventario)
  items: InventarioItem[];

  @OneToMany(() => Novedad, (novedad) => novedad.inventario)
  novedades: Novedad[];
}
