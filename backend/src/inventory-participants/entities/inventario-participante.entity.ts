import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inventario } from '../../inventories/entities/inventario.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('inventario_participantes')
export class InventarioParticipante {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'inventario_id', type: 'bigint', unsigned: true })
  inventarioId: number;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true })
  usuarioId: number;

  @ManyToOne(() => Inventario, (inventario) => inventario.participantes, {
    nullable: false,
  })
  @JoinColumn({ name: 'inventario_id' })
  inventario: Inventario;

  @ManyToOne(() => Usuario, (usuario) => usuario.participacionesInventario, {
    nullable: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'es_responsable', type: 'boolean', default: false })
  esResponsable: boolean;

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;
}
