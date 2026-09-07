import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true, nullable: true })
  usuarioId: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.auditorias, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({ type: 'varchar', length: 80 })
  accion: string;

  @Column({ type: 'varchar', length: 80 })
  entidad: string;

  @Column({ name: 'entidad_id', type: 'bigint', unsigned: true, nullable: true })
  entidadId: number | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'metadata_json', type: 'json', nullable: true })
  metadataJson: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
}
